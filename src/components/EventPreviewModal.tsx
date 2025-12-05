'use client';

// Removed formatEther - using SOL now
import { BuyTicketsModal } from './BuyTicketsModal';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getEventImage } from '@/lib/pinata';
import Image from 'next/image';

interface Event {
  id: number;
  name: string;
  description: string;
  price: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
  eventDate: bigint;
  isActive: boolean;
  creator: string;
  location: string;
  category: string;
  imageCID: string;
}

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onBuyTicket: (quantity: number) => Promise<void>;
  isBuying: boolean;
}

export function EventPreviewModal({ isOpen, onClose, event, onBuyTicket, isBuying }: EventPreviewModalProps) {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);

  useEffect(() => {
    const loadEventImage = async () => {
      try {
        if (event.imageCID) {
          const imageUrl = await getEventImage(event.imageCID);
          setEventImage(imageUrl);
        }
      } catch (error) {
        console.error('Error loading event image:', error);
      }
    };

    if (isOpen && event.imageCID) {
      loadEventImage();
    }
  }, [isOpen, event.imageCID]);

  const handleBuyClick = () => {
    if (!event || !event.price) {
      console.error('Invalid event data:', event);
      toast.error('Invalid event data');
      return;
    }
    setIsBuyModalOpen(true);
  };

  const isPastEvent = Number(event.eventDate) * 1000 <= Date.now();
  const availableTickets = Number(event.maxTickets - event.ticketsSold);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{event.name}</h2>
              <p className="mt-2 text-gray-500">{event.category}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          {eventImage && (
            <div className="relative h-80 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={eventImage}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {event.price ? Number(event.price) / 1e9 : '0'} SOL
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 text-base font-medium text-gray-900">{event.location}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="mt-1 text-base font-medium text-gray-900">{Number(event.maxTickets)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
                <p className="mt-1 text-base font-medium text-gray-900">{Number(event.ticketsSold)}</p>
              </div>
              {!isPastEvent && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Available Tickets</p>
                  <p className="mt-1 text-base font-medium text-gray-900">{availableTickets}</p>
                </div>
              )}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {isPastEvent ? 'Past Event' : 'Upcoming Event'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-gray-500">Event Creator</p>
              <p className="mt-1 text-base font-medium text-gray-900">{event.creator}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-base font-medium transition-colors"
            >
              Close
            </button>
            {!isPastEvent && (
              <button
                onClick={handleBuyClick}
                disabled={isBuying || availableTickets === 0}
                className="px-6 py-2.5 bg-[#e50914] text-white rounded-lg hover:bg-[#b8070f] text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {isBuying ? 'Processing...' : 'Buy Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isPastEvent && (
        <BuyTicketsModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          ticketPrice={Number(event.price) / 1e9}
          eventName={event.name}
          onConfirm={onBuyTicket}
          isLoading={isBuying}
        />
      )}
    </>
  );
} 