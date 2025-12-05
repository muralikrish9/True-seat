'use client';

import { 
    Connection, 
    PublicKey, 
    SystemProgram, 
    Transaction,
    TransactionInstruction,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    AccountInfo
} from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { 
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

// Program ID - Update this after deployment
export const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID || 'wEeoKNhaFsCPYLsscNUy5PpXxNs81vF6CfEArCxLmmr'
);

// Network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
    (SOLANA_NETWORK === 'devnet' 
        ? 'https://api.devnet.solana.com' 
        : 'https://api.mainnet-beta.solana.com');

// Event account structure (matches Rust struct)
export interface EventAccount {
    creator: PublicKey;
    eventId: string;      // NEW: unique event identifier
    name: string;
    description: string;
    price: bigint;
    maxTickets: bigint;
    ticketsSold: bigint;
    eventDate: bigint;
    isActive: boolean;
    location: string;
    category: string;
    imageCid: string;
    metadataCid: string;
    createdAt: bigint;
}

// Helper to find event PDA
// Uses deterministic event_id as seed
export function findEventPDA(
    creator: PublicKey,
    eventId: string
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('event'),
            creator.toBuffer(),
            Buffer.from(eventId),
        ],
        PROGRAM_ID
    );
}

// Helper to serialize strings for instruction data
function serializeString(str: string): Buffer {
    const buf = Buffer.alloc(4 + str.length);
    buf.writeUInt32LE(str.length, 0);
    buf.write(str, 4);
    return buf;
}

// Helper to deserialize strings from account data
function deserializeString(data: Buffer, offset: number): { value: string; newOffset: number } {
    const length = data.readUInt32LE(offset);
    const value = data.slice(offset + 4, offset + 4 + length).toString('utf-8');
    return { value, newOffset: offset + 4 + length };
}

// Decode Event account from raw data
function decodeEventAccount(data: Buffer, pubkey: PublicKey): EventAccount | null {
    try {
        // Skip discriminator (8 bytes)
        let offset = 8;
        
        // Creator (32 bytes)
        const creator = new PublicKey(data.slice(offset, offset + 32));
        offset += 32;
        
        // Event ID (NEW)
        const eventIdData = deserializeString(data, offset);
        offset = eventIdData.newOffset;
        
        // Name (4 bytes length + string)
        const nameData = deserializeString(data, offset);
        offset = nameData.newOffset;
        
        // Description
        const descData = deserializeString(data, offset);
        offset = descData.newOffset;
        
        // Price (u64 = 8 bytes)
        const price = data.readBigUInt64LE(offset);
        offset += 8;
        
        // Max tickets (u64)
        const maxTickets = data.readBigUInt64LE(offset);
        offset += 8;
        
        // Tickets sold (u64)
        const ticketsSold = data.readBigUInt64LE(offset);
        offset += 8;
        
        // Event date (i64 = 8 bytes)
        const eventDate = data.readBigInt64LE(offset);
        offset += 8;
        
        // Is active (bool = 1 byte)
        const isActive = data[offset] === 1;
        offset += 1;
        
        // Location
        const locData = deserializeString(data, offset);
        offset = locData.newOffset;
        
        // Category
        const catData = deserializeString(data, offset);
        offset = catData.newOffset;
        
        // Image CID
        const imgData = deserializeString(data, offset);
        offset = imgData.newOffset;
        
        // Metadata CID
        const metaData = deserializeString(data, offset);
        offset = metaData.newOffset;
        
        // Created at (i64)
        const createdAt = data.readBigInt64LE(offset);
        
        return {
            creator,
            eventId: eventIdData.value,  // NEW: include event_id
            name: nameData.value,
            description: descData.value,
            price,
            maxTickets,
            ticketsSold,
            eventDate,
            isActive,
            location: locData.value,
            category: catData.value,
            imageCid: imgData.value,
            metadataCid: metaData.value,
            createdAt
        };
    } catch (e) {
        console.error('Error decoding event account:', e);
        return null;
    }
}

// Helper to serialize u64 (little-endian) - browser compatible
function serializeU64(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    // Manual little-endian encoding for bigint (handles full 64-bit range)
    let val = value;
    for (let i = 0; i < 8; i++) {
        buffer[i] = Number(val & 0xFFn);
        val = val >> 8n;
    }
    return buffer;
}

// Helper to serialize i64 (little-endian) - browser compatible
function serializeI64(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    // Manual little-endian encoding for signed 64-bit bigint
    let val = value;
    // Handle negative numbers using two's complement
    if (val < 0n) {
        val = (1n << 64n) + val; // Convert to unsigned representation
    }
    for (let i = 0; i < 8; i++) {
        buffer[i] = Number(val & 0xFFn);
        val = val >> 8n;
    }
    return buffer;
}

// Build create_event instruction using Anchor's instruction format
// Anchor uses: 8-byte discriminator + serialized args (Borsh format)
function buildCreateEventInstruction(
    eventPDA: PublicKey,
    creator: PublicKey,
    eventId: string,  // Add event_id parameter
    name: string,
    description: string,
    price: bigint,
    maxTickets: bigint,
    eventDate: bigint,
    location: string,
    category: string,
    imageCid: string,
    metadataCid: string
): TransactionInstruction {
    // Calculate discriminator: first 8 bytes of sha256("global:create_event")
    // Anchor uses: sha256("global:<instruction_name>")[0..8]
    // Correct discriminator: 0x31, 0xdb, 0x1d, 0xcb, 0x16, 0x62, 0x64, 0x57
    const discriminator = Buffer.from([0x31, 0xdb, 0x1d, 0xcb, 0x16, 0x62, 0x64, 0x57]);
    
    // Serialize all arguments in Borsh format (order matters!)
    // Borsh format: length-prefixed strings, little-endian numbers
    const parts: Buffer[] = [
        discriminator,                    // 8 bytes: instruction discriminator
        serializeString(eventId),          // NEW: event_id comes first
        serializeString(name),             // 4 bytes length + string bytes
        serializeString(description),      // 4 bytes length + string bytes
        serializeU64(price),               // 8 bytes: u64
        serializeU64(maxTickets),          // 8 bytes: u64
        serializeI64(eventDate),           // 8 bytes: i64
        serializeString(location),        // 4 bytes length + string bytes
        serializeString(category),         // 4 bytes length + string bytes
        serializeString(imageCid),         // 4 bytes length + string bytes
        serializeString(metadataCid),      // 4 bytes length + string bytes
    ];
    
    const data = Buffer.concat(parts);
    
    return new TransactionInstruction({
        keys: [
            { pubkey: eventPDA, isSigner: false, isWritable: true },
            { pubkey: creator, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
    });
}

// Create Event Hook
export function useCreateEvent() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const createEvent = async (
        name: string,
        description: string,
        price: number,
        maxTickets: number,
        eventDate: number,
        location: string,
        category: string,
        imageCID: string,
        metadataCID: string
    ) => {
        if (!wallet.publicKey || !wallet.sendTransaction) {
            throw new Error('Wallet not connected');
        }

        try {
            // Generate unique event ID (deterministic seed for PDA)
            // Use name + creator + timestamp to ensure uniqueness
            const eventId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`.slice(0, 32);
            console.log('Generated event ID:', eventId);
            
            const [eventPDA] = findEventPDA(wallet.publicKey, eventId);
            
            const priceLamports = BigInt(Math.floor(price * LAMPORTS_PER_SOL));
            const maxTicketsBig = BigInt(maxTickets);
            const eventDateBig = BigInt(eventDate);
            
            const instruction = buildCreateEventInstruction(
                eventPDA,
                wallet.publicKey,
                eventId,  // Add event_id as first parameter
                name,
                description,
                priceLamports,
                maxTicketsBig,
                eventDateBig,
                location,
                category,
                imageCID,
                metadataCID
            );
            
            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            
            // Log transaction details for debugging
            console.log('Transaction details:', {
                eventPDA: eventPDA.toBase58(),
                creator: wallet.publicKey.toBase58(),
                programId: PROGRAM_ID.toBase58(),
                eventId: eventId,
                instructionDataLength: instruction.data.length,
                instructionDataHex: instruction.data.toString('hex').substring(0, 32) + '...',
            });
            
            const transaction = new Transaction({
                feePayer: wallet.publicKey,
                recentBlockhash: blockhash,
            }).add(instruction);
            
            // Check wallet balance first
            const balance = await connection.getBalance(wallet.publicKey);
            console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
            
            if (balance < 0.01 * LAMPORTS_PER_SOL) {
                throw new Error('Insufficient SOL balance. You need at least 0.01 SOL for rent and fees. Get devnet SOL from https://faucet.solana.com');
            }
            
            // Simulate transaction first to get better error messages
            try {
                const simulation = await connection.simulateTransaction(transaction);
                
                console.log('Transaction simulation:', {
                    err: simulation.value.err,
                    logs: simulation.value.logs,
                    unitsConsumed: simulation.value.unitsConsumed,
                });
                
                if (simulation.value.err) {
                    console.error('Simulation failed with error:', simulation.value.err);
                    if (simulation.value.logs) {
                        console.error('Program logs:', simulation.value.logs);
                    }
                    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}\n\nLogs: ${simulation.value.logs?.join('\n')}`);
                }
                
                console.log('✅ Simulation passed! Sending transaction...');
            } catch (simError: any) {
                console.error('Simulation error:', simError);
                throw simError;
            }
            
            // Send transaction (skip preflight since we already simulated)
            console.log('Requesting wallet approval...');
            const signature = await wallet.sendTransaction(transaction, connection, {
                skipPreflight: true, // We already simulated
                maxRetries: 3,
            });
            
            console.log('Transaction sent:', signature);
            
            // Wait for confirmation
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            }, 'confirmed');
            
            console.log('Transaction confirmed:', signature);
            return signature;
        } catch (error: any) {
            console.error('Error creating event:', error);
            // Log more details about the error
            if (error.message) {
                console.error('Error message:', error.message);
            }
            if (error.logs) {
                console.error('Program logs:', error.logs);
            }
            if (error.stack) {
                console.error('Error stack:', error.stack);
            }
            throw new Error(error.message || 'Failed to create event');
        }
    };

    return {
        createEvent,
        isLoading: false,
        isSuccess: false,
    };
}

// Get Events Hook
export function useGetEvents() {
    const { connection } = useConnection();

    const getEvents = async (): Promise<any[]> => {
        try {
            const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);
            const events: any[] = [];
            
            for (const account of programAccounts) {
                const eventData = decodeEventAccount(account.account.data, account.pubkey);
                if (eventData && eventData.isActive) {
                    events.push({
                        id: account.pubkey.toBase58(),
                        name: eventData.name,
                        description: eventData.description,
                        price: eventData.price,
                        maxTickets: eventData.maxTickets,
                        ticketsSold: eventData.ticketsSold,
                        eventDate: eventData.eventDate,
                        isActive: eventData.isActive,
                        creator: eventData.creator.toBase58(),
                        location: eventData.location,
                        category: eventData.category,
                        imageCID: eventData.imageCid,
                        metadataCID: eventData.metadataCid,
                        pda: account.pubkey.toBase58(),
                    });
                }
            }
            
            return events.sort((a, b) => Number(a.eventDate) - Number(b.eventDate));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    };

    return {
        getEvents,
        isLoading: false,
        error: null,
    };
}

// Buy Ticket Hook - simplified version using SystemProgram transfer
export function useBuyTicket() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const buyTicket = async (
        eventPDAString: string | PublicKey,
        price: number,
        quantity: number = 1
    ) => {
        if (!wallet.publicKey || !wallet.sendTransaction) {
            throw new Error('Wallet not connected');
        }

        try {
            const eventPDA = typeof eventPDAString === 'string' 
                ? new PublicKey(eventPDAString) 
                : eventPDAString;
            
            // Fetch event account
            const eventAccount = await connection.getAccountInfo(eventPDA);
            if (!eventAccount) {
                throw new Error('Event not found');
            }
            
            const eventData = decodeEventAccount(eventAccount.data, eventPDA);
            if (!eventData) {
                throw new Error('Invalid event data');
            }
            
            if (!eventData.isActive) {
                throw new Error('Event is not active');
            }
            
            const totalCost = BigInt(Math.floor(price * quantity * LAMPORTS_PER_SOL));
            
            // For now, transfer SOL directly to creator
            // In production, you'd call the buy_ticket instruction
            const transferInstruction = SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: eventData.creator,
                lamports: Number(totalCost),
            });
            
            const transaction = new Transaction().add(transferInstruction);
            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            
            return signature;
        } catch (error) {
            console.error('Error buying ticket:', error);
            throw error;
        }
    };

    return {
        buyTicket,
        isLoading: false,
        isSuccess: false,
    };
}

// Get Tickets by Address Hook
export function useGetTicketsByAddress() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const getTicketsByAddress = async (address?: string) => {
        try {
            const publicKey = address 
                ? new PublicKey(address) 
                : wallet.publicKey;
            
            if (!publicKey) {
                throw new Error('No address provided');
            }

            // Get all program accounts and filter by creator
            const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);
            const tickets: any[] = [];
            
            for (const account of programAccounts) {
                const eventData = decodeEventAccount(account.account.data, account.pubkey);
                if (eventData && eventData.creator.equals(publicKey)) {
                    tickets.push({
                        eventId: account.pubkey.toBase58(),
                        eventName: eventData.name,
                        eventDescription: eventData.description,
                        eventDate: eventData.eventDate,
                        isActive: eventData.isActive,
                        price: eventData.price,
                        maxTickets: eventData.maxTickets,
                        ticketsSold: eventData.ticketsSold,
                    });
                }
            }
            
            return tickets;
        } catch (error) {
            console.error('Error getting tickets:', error);
            throw error;
        }
    };

    return {
        getTicketsByAddress,
        isLoading: false,
        error: null,
    };
}
