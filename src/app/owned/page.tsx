'use client';

import { Navigation } from '@/components/Navigation';
import { ViewTicketModal } from '@/components/ViewTicketModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { useGetTicketsByAddress } from '@/lib/solana';
import { toast } from 'react-hot-toast';

interface TicketInfo {
  eventId: bigint;
  eventName: string;
  eventDescription: string;
  eventDate: bigint;
  isActive: boolean;
  price: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
}

export default function OwnedTickets() {
  const { connected, publicKey } = useWallet();
  const address = publicKey?.toBase58();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getTicketsByAddress } = useGetTicketsByAddress();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!address) return;
      
      try {
        const fetchedTickets = await getTicketsByAddress(address);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to fetch tickets');
      } finally {
        setIsLoading(false);
      }
    };

    if (connected && address) {
      fetchTickets();
    }
  }, [connected, address, getTicketsByAddress]);

  const handleViewClick = (ticket: TicketInfo) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  if (!connected) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please connect your wallet to view your tickets</h2>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Loading your tickets...</h2>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
              <p className="mt-2 text-sm text-gray-500">You haven't purchased any tickets yet.</p>
            </div>
          ) : (
            tickets.map((ticket, index) => (
              <div key={`${ticket.eventId}-${index}`} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">{ticket.eventName}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Date: {new Date(Number(ticket.eventDate) * 1000).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Status: {ticket.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Price: {Number(ticket.price) / 1e9} SOL
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Tickets Sold: {Number(ticket.ticketsSold)} / {Number(ticket.maxTickets)}
                  </p>
                  <button 
                    onClick={() => handleViewClick(ticket)}
                    className="mt-4 w-full bg-[#e50914] text-white py-2 px-4 rounded-md hover:bg-[#b8070f]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedTicket && (
        <ViewTicketModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTicket(null);
          }}
          eventName={selectedTicket.eventName}
          date={new Date(Number(selectedTicket.eventDate) * 1000).toLocaleString()}
          location="Event Location" // You might want to add this to the contract
          description={selectedTicket.eventDescription}
          quantity={1}
          ticketId={Number(selectedTicket.eventId).toString()}
        />
      )}
    </main>
  );
} 