/**
 * Script to create example events on Solana devnet for testing
 * 
 * Usage: npx tsx scripts/create-example-events.ts
 * 
 * Make sure you have:
 * - Solana CLI installed and configured
 * - Wallet with SOL on devnet (~/.config/solana/id.json)
 * - NEXT_PUBLIC_PROGRAM_ID set in .env.local
 */

import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'J6KqCUoCbR48LMqgLGGy5JCwRUQ8UN4pdco1ypjb6tDc'
);

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Example events data
const exampleEvents = [
  {
    name: 'Summer Music Festival 2024',
    description: 'Join us for an amazing summer music festival featuring top artists from around the world. Experience live performances, food trucks, and an unforgettable atmosphere.',
    price: 0.5, // SOL
    maxTickets: 1000,
    eventDate: new Date('2024-07-15T18:00:00'),
    location: 'Central Park, New York',
    category: 'Music',
    imageCID: 'QmExample1',
    metadataCID: 'QmMetadata1',
  },
  {
    name: 'Tech Conference 2024',
    description: 'The premier technology conference bringing together developers, entrepreneurs, and innovators. Featuring keynote speakers, workshops, and networking opportunities.',
    price: 1.0, // SOL
    maxTickets: 500,
    eventDate: new Date('2024-08-20T09:00:00'),
    location: 'Convention Center, San Francisco',
    category: 'Technology',
    imageCID: 'QmExample2',
    metadataCID: 'QmMetadata2',
  },
  {
    name: 'Food & Wine Festival',
    description: 'Indulge in the finest cuisine and wines from renowned chefs and wineries. A culinary journey you won\'t forget.',
    price: 0.75, // SOL
    maxTickets: 300,
    eventDate: new Date('2024-09-05T17:00:00'),
    location: 'Riverside Garden, Chicago',
    category: 'Food & Drink',
    imageCID: 'QmExample3',
    metadataCID: 'QmMetadata3',
  },
  {
    name: 'Blockchain Developer Workshop',
    description: 'Learn Solana development from industry experts. Hands-on workshops covering smart contracts, DeFi, and NFT development.',
    price: 0.25, // SOL
    maxTickets: 100,
    eventDate: new Date('2024-10-10T10:00:00'),
    location: 'Tech Hub, Austin',
    category: 'Education',
    imageCID: 'QmExample4',
    metadataCID: 'QmMetadata4',
  },
  {
    name: 'Comedy Night Special',
    description: 'An evening of laughter with top comedians. Perfect for a night out with friends.',
    price: 0.3, // SOL
    maxTickets: 200,
    eventDate: new Date('2024-11-20T20:00:00'),
    location: 'Comedy Club, Los Angeles',
    category: 'Entertainment',
    imageCID: 'QmExample5',
    metadataCID: 'QmMetadata5',
  },
];

// Helper to find Event PDA
function findEventPDA(creator: PublicKey, timestamp: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('event'),
      creator.toBuffer(),
      Buffer.from(new BN(timestamp).toArray('le', 8)),
    ],
    PROGRAM_ID
  );
}

// Helper to serialize string (simplified Anchor serialization)
function serializeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lengthBuffer, strBuffer]);
}

// Build create_event instruction
function buildCreateEventInstruction(
  eventPDA: PublicKey,
  creator: PublicKey,
  name: string,
  description: string,
  price: BN,
  maxTickets: BN,
  eventDate: BN,
  location: string,
  category: string,
  imageCID: string,
  metadataCID: string
): anchor.web3.TransactionInstruction {
  // Use Anchor's instruction coder
  const coder = new anchor.BorshInstructionCoder({
    idl: {
      version: '0.1.0',
      name: 'event_tickets',
      instructions: [
        {
          name: 'create_event',
          accounts: [
            { name: 'event', isMut: true, isSigner: false },
            { name: 'creator', isMut: true, isSigner: true },
            { name: 'systemProgram', isMut: false, isSigner: false },
          ],
          args: [
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'price', type: 'u64' },
            { name: 'max_tickets', type: 'u64' },
            { name: 'event_date', type: 'i64' },
            { name: 'location', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'image_cid', type: 'string' },
            { name: 'metadata_cid', type: 'string' },
          ],
        },
      ],
    } as any,
  });

  try {
    const data = coder.encode('create_event', {
      name,
      description,
      price,
      max_tickets: maxTickets,
      event_date: eventDate,
      location,
      category,
      image_cid: imageCID,
      metadata_cid: metadataCID,
    });

    return new anchor.web3.TransactionInstruction({
      keys: [
        { pubkey: eventPDA, isSigner: false, isWritable: true },
        { pubkey: creator, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: data || Buffer.alloc(0),
    });
  } catch (error) {
    console.error('Error encoding instruction:', error);
    throw error;
  }
}

async function createExampleEvents() {
  console.log('🚀 Creating example events on Solana devnet...\n');

  // Load wallet
  const walletPath = path.join(process.env.HOME || '', '.config/solana/id.json');
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet not found at ${walletPath}`);
  }

  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );

  console.log(`👛 Wallet: ${walletKeypair.publicKey.toBase58()}\n`);

  // Connect to devnet
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = new Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL\n`);

  if (balance < 0.1e9) {
    console.warn('⚠️  Warning: Low balance. You may need more SOL for transactions.');
    console.log('   Get devnet SOL: https://faucet.solana.com/\n');
  }

  // Create events
  for (let i = 0; i < exampleEvents.length; i++) {
    const event = exampleEvents[i];
    console.log(`Creating event ${i + 1}/${exampleEvents.length}: ${event.name}`);

    try {
      const timestamp = Math.floor(Date.now() / 1000) + i; // Unique timestamp for each event
      const [eventPDA] = findEventPDA(walletKeypair.publicKey, timestamp);

      const priceLamports = new BN(Math.floor(event.price * 1e9));
      const maxTickets = new BN(event.maxTickets);
      const eventDate = new BN(Math.floor(event.eventDate.getTime() / 1000));

      const instruction = buildCreateEventInstruction(
        eventPDA,
        walletKeypair.publicKey,
        event.name,
        event.description,
        priceLamports,
        maxTickets,
        eventDate,
        event.location,
        event.category,
        event.imageCID,
        event.metadataCID
      );

      const transaction = new Transaction().add(instruction);
      const signature = await provider.sendAndConfirm(transaction);

      console.log(`✅ Created! Transaction: ${signature}`);
      console.log(`   Event PDA: ${eventPDA.toBase58()}`);
      console.log(`   Price: ${event.price} SOL | Tickets: ${event.maxTickets}\n`);
    } catch (error) {
      console.error(`❌ Error creating event: ${error}`);
      console.error(`   Event: ${event.name}\n`);
    }

    // Small delay between transactions
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('✨ Done! Refresh your app to see the events.');
}

// Run the script
createExampleEvents().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

