'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCreateEvent } from '@/lib/solana';
import { toast } from 'react-hot-toast';
import { Navigation } from '@/components/Navigation';

const exampleEvents = [
  {
    name: 'Summer Music Festival 2024',
    description: 'Join us for an amazing summer music festival featuring top artists from around the world. Experience live performances, food trucks, and an unforgettable atmosphere.',
    price: 0.5,
    maxTickets: 1000,
    eventDate: new Date('2024-07-15T18:00:00'),
    location: 'Central Park, New York',
    category: 'Music',
  },
  {
    name: 'Tech Conference 2024',
    description: 'The premier technology conference bringing together developers, entrepreneurs, and innovators. Featuring keynote speakers, workshops, and networking opportunities.',
    price: 1.0,
    maxTickets: 500,
    eventDate: new Date('2024-08-20T09:00:00'),
    location: 'Convention Center, San Francisco',
    category: 'Technology',
  },
  {
    name: 'Food & Wine Festival',
    description: 'Indulge in the finest cuisine and wines from renowned chefs and wineries. A culinary journey you won\'t forget.',
    price: 0.75,
    maxTickets: 300,
    eventDate: new Date('2024-09-05T17:00:00'),
    location: 'Riverside Garden, Chicago',
    category: 'Food & Drink',
  },
  {
    name: 'Blockchain Developer Workshop',
    description: 'Learn Solana development from industry experts. Hands-on workshops covering smart contracts, DeFi, and NFT development.',
    price: 0.25,
    maxTickets: 100,
    eventDate: new Date('2024-10-10T10:00:00'),
    location: 'Tech Hub, Austin',
    category: 'Education',
  },
  {
    name: 'Comedy Night Special',
    description: 'An evening of laughter with top comedians. Perfect for a night out with friends.',
    price: 0.3,
    maxTickets: 200,
    eventDate: new Date('2024-11-20T20:00:00'),
    location: 'Comedy Club, Los Angeles',
    category: 'Entertainment',
  },
];

export default function TestEventsPage() {
  const { connected, publicKey } = useWallet();
  const { createEvent } = useCreateEvent();
  const [isCreating, setIsCreating] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<string[]>([]);

  const handleCreateAll = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    const signatures: string[] = [];

    try {
      for (const event of exampleEvents) {
        try {
          const timestamp = Math.floor(event.eventDate.getTime() / 1000);
          
          // Use placeholder CIDs for testing
          const imageCID = `test-image-${event.name.replace(/\s+/g, '-').toLowerCase()}`;
          const metadataCID = `test-metadata-${event.name.replace(/\s+/g, '-').toLowerCase()}`;

          const signature = await createEvent(
            event.name,
            event.description,
            event.price,
            event.maxTickets,
            timestamp,
            event.location,
            event.category,
            imageCID,
            metadataCID
          );

          signatures.push(signature);
          toast.success(`Created: ${event.name}`);
          
          // Small delay between transactions
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error creating ${event.name}:`, error);
          toast.error(`Failed to create ${event.name}`);
        }
      }

      setCreatedEvents(signatures);
      toast.success(`Successfully created ${signatures.length} events!`);
    } catch (error) {
      console.error('Error creating events:', error);
      toast.error('Failed to create some events');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSingle = async (event: typeof exampleEvents[0]) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    try {
      const timestamp = Math.floor(event.eventDate.getTime() / 1000);
      const imageCID = `test-image-${event.name.replace(/\s+/g, '-').toLowerCase()}`;
      const metadataCID = `test-metadata-${event.name.replace(/\s+/g, '-').toLowerCase()}`;

      const signature = await createEvent(
        event.name,
        event.description,
        event.price,
        event.maxTickets,
        timestamp,
        event.location,
        event.category,
        imageCID,
        metadataCID
      );

      setCreatedEvents([...createdEvents, signature]);
      toast.success(`Created: ${event.name}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  if (!connected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-lg text-gray-600">
              Please connect your Phantom wallet to create test events.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Test Events</h1>
          <p className="text-lg text-gray-600">
            Quickly create example events to test your Solana transactions.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={handleCreateAll}
            disabled={isCreating}
            className="px-6 py-3 bg-gradient-to-r from-[#e50914] to-[#b8070f] text-white rounded-xl hover:from-[#b8070f] hover:to-[#8a0509] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Events...' : 'Create All Example Events'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {exampleEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#e50914]">{event.price} SOL</div>
                  <div className="text-sm text-gray-500">{event.maxTickets} tickets</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <div>{event.location}</div>
                  <div>{event.eventDate.toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleCreateSingle(event)}
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#e50914] text-white rounded-lg hover:bg-[#b8070f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create This Event
                </button>
              </div>
            </div>
          ))}
        </div>

        {createdEvents.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              ✅ Created {createdEvents.length} Event(s)
            </h3>
            <div className="space-y-2">
              {createdEvents.map((sig, i) => (
                <div key={i} className="text-sm">
                  <a
                    href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e50914] hover:underline"
                  >
                    Transaction {i + 1}: {sig.slice(0, 8)}...{sig.slice(-8)}
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Go to <a href="/events" className="text-[#e50914] hover:underline">/events</a> to see your events!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

