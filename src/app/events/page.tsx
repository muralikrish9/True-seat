'use client';

import { Navigation } from '@/components/Navigation';
import { CreateEventModal } from '@/components/CreateEventModal';
import { BuyTicketsModal } from '@/components/BuyTicketsModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { useGetEvents, useBuyTicket } from '@/lib/solana';
import { toast } from 'react-hot-toast';
import { EventPreviewModal } from '@/components/EventPreviewModal';
import Image from 'next/image';
import { getEventImage } from '@/lib/pinata';

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

export default function Events() {
  const { connected } = useWallet();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getEvents } = useGetEvents();
  const { buyTicket, isLoading: isBuying } = useBuyTicket();
  const [eventImages, setEventImages] = useState<{ [key: number]: string }>({});

  // Separate events into upcoming and past
  const upcomingEvents = events.filter(event => Number(event.eventDate) * 1000 > Date.now());
  const pastEvents = events.filter(event => Number(event.eventDate) * 1000 <= Date.now());

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await getEvents();
      console.log('Fetched events:', fetchedEvents);
      
      // Map the events to include their IDs and validate data
      const mappedEvents = fetchedEvents.map((event: any, index: number) => {
        // Ensure all required fields are present and valid
        if (!event || typeof event !== 'object') {
          console.error('Invalid event data:', event);
          return null;
        }

        return {
          id: index,
          name: event.name || 'Unnamed Event',
          description: event.description || 'No description available',
          price: event.price || BigInt(0),
          maxTickets: event.maxTickets || BigInt(0),
          ticketsSold: event.ticketsSold || BigInt(0),
          eventDate: event.eventDate || BigInt(0),
          isActive: event.isActive ?? true,
          creator: event.creator || 'Unknown',
          location: event.location || 'Unknown',
          category: event.category || 'Unknown',
          imageCID: event.imageCID || ''
        };
      }).filter(Boolean); // Remove any null entries

      console.log('Mapped events:', mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events only when the page is first visited
  useEffect(() => {
    if (connected) {
      fetchEvents();
    }
  }, [connected]); // Only run when connected changes

  useEffect(() => {
    const loadEventImages = async () => {
      const imagePromises = events.map(async (event) => {
        if (event.imageCID) {
          try {
            const imageUrl = await getEventImage(event.imageCID);
            setEventImages(prev => ({ ...prev, [event.id]: imageUrl }));
          } catch (error) {
            console.error(`Error loading image for event ${event.id}:`, error);
          }
        }
      });
      await Promise.all(imagePromises);
    };

    if (events.length > 0) {
      loadEventImages();
    }
  }, [events]);

  const handlePreviewClick = (event: Event) => {
    setSelectedEvent(event);
    setIsPreviewModalOpen(true);
  };

  const handleBuyClick = (event: Event) => {
    if (!event || !event.price) {
      console.error('Invalid event data:', event);
      toast.error('Invalid event data');
      return;
    }
    setSelectedEvent(event);
    setIsBuyModalOpen(true);
  };

  const handleBuyTicket = async (quantity: number) => {
    if (!selectedEvent || !selectedEvent.price) {
      console.error('Invalid selected event:', selectedEvent);
      toast.error('Invalid event data');
      return;
    }
    
    try {
      // Convert from lamports (1e9) to SOL
      const priceInSol = Number(selectedEvent.price) / 1e9;
      const totalPrice = priceInSol * quantity;
      console.log("Buying ticket:", {
        eventId: selectedEvent.id,
        totalPrice,
        quantity,
        eventData: selectedEvent
      });
      
      // Use event PDA (stored in event.pda or use id as fallback)
      const eventPDA = (selectedEvent as any).pda || selectedEvent.id;
      await buyTicket(eventPDA, priceInSol, quantity);
      toast.success('Ticket purchased successfully!');
      setIsBuyModalOpen(false);
      setSelectedEvent(null);
      
      // Refresh events after purchase
      await fetchEvents();
    } catch (error) {
      console.error('Error buying ticket:', error);
      toast.error('Failed to purchase ticket. Please try again.');
    }
  };

  const handleCreateEventSuccess = async () => {
    setIsCreateModalOpen(false);
    await fetchEvents(); // Refresh events after creating a new one
  };

  if (!connected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#ffccce] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#e50914]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To view and participate in events, please connect your Web3 wallet. This will allow you to create events, purchase tickets, and manage your transactions securely.
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Events</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Explore exciting events, book tickets, and create your own memorable experiences. All transactions are secure and transparent on the blockchain.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 md:mt-0 px-6 py-3 bg-gradient-to-r from-[#e50914] to-[#b8070f] text-white rounded-xl hover:from-[#b8070f] hover:to-[#8a0509] transition-all shadow-md hover:shadow-lg flex items-center space-x-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Create New Event</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e50914]"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Error Loading Events</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  <p className="text-gray-600 mt-1">Don't miss out on these exciting events</p>
                </div>
                <span className="px-4 py-2 bg-[#ffe5e7] text-[#b8070f] rounded-full text-sm font-medium">
                  {upcomingEvents.length} events
                </span>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-[#ffe5e7] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#e50914]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500 mb-4">Be the first to create an event and start selling tickets!</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#e50914] text-white rounded-lg hover:bg-[#b8070f] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Event
                    </button>
                  </div>
                ) : (
                  upcomingEvents.map((event: Event) => (
                    <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                      {eventImages[event.id] && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={eventImages[event.id]}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900">
                              {event.category}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <h3 className="text-xl font-semibold text-white mb-1">{event.name}</h3>
                            <p className="text-white/90 text-sm line-clamp-1">{event.description}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(Number(event.eventDate) * 1000).toLocaleDateString()}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                              {Number(event.maxTickets - event.ticketsSold)} tickets left
                            </div>
                            <div className="font-medium text-[#e50914]">
                              {Number(event.price) / 1e9} SOL
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handlePreviewClick(event)}
                            className="flex-1 bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            Preview Event
                          </button>
                          <button 
                            onClick={() => handleBuyClick(event)}
                            disabled={isBuying || Number(event.maxTickets - event.ticketsSold) === 0}
                            className="flex-1 bg-gradient-to-r from-[#e50914] to-[#b8070f] text-white py-2.5 px-4 rounded-xl hover:from-[#b8070f] hover:to-[#8a0509] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            {isBuying ? 'Processing...' : 'Buy Ticket'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Past Events Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Past Events</h2>
                  <p className="text-gray-600 mt-1">Browse through our event history</p>
                </div>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {pastEvents.length} events
                </span>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Past Events</h3>
                    <p className="text-gray-500">Check back later to see event history</p>
                  </div>
                ) : (
                  pastEvents.map((event: Event) => (
                    <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                      {eventImages[event.id] && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={eventImages[event.id]}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900">
                              {event.category}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-medium text-lg">Past Event</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <h3 className="text-xl font-semibold text-white mb-1">{event.name}</h3>
                            <p className="text-white/90 text-sm line-clamp-1">{event.description}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(Number(event.eventDate) * 1000).toLocaleDateString()}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ffe5e7]0" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                              {Number(event.maxTickets)} total tickets
                            </div>
                            <div className="font-medium text-[#e50914]">
                              {Number(event.price) / 1e9} SOL
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handlePreviewClick(event)}
                          className="w-full bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
                        >
                          View Event Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateEventSuccess}
      />
      {selectedEvent && (
        <>
          <EventPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            onBuyTicket={handleBuyTicket}
            isBuying={isBuying}
          />
          <BuyTicketsModal
            isOpen={isBuyModalOpen}
            onClose={() => {
              setIsBuyModalOpen(false);
              setSelectedEvent(null);
            }}
            ticketPrice={Number(selectedEvent.price) / 1e9}
            eventName={selectedEvent.name}
            onConfirm={handleBuyTicket}
            isLoading={isBuying}
          />
        </>
      )}
    </main>
  );
} 