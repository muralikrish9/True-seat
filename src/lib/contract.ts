import { BrowserProvider, Contract, parseEther } from 'ethers';
import EventTicketsABI from '../../contracts/artifacts/contracts/EventTickets.sol/EventTickets.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}


export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F';

export function useCreateEvent() {
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
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, EventTicketsABI.abi, signer);

      const tx = await contract.createEvent(
        name,
        description,
        parseEther(price.toString()),
        maxTickets,
        eventDate,
        location,
        category,
        imageCID,
        metadataCID
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  return {
    createEvent,
    isLoading: false,
    isSuccess: false,
  };
}

export function useGetEvents() {
  const getEvents = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, EventTicketsABI.abi, provider);
      
      const events = await contract.getActiveEvents();
      return events;
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  };

  return {
    getEvents,
    isLoading: false,
    error: null,
  };
}

export function useBuyTicket() {
  const buyTicket = async (eventId: number, price: number, quantity: number = 1) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, EventTicketsABI.abi, signer);

      const tx = await contract.buyTicket(eventId, quantity, {
        value: parseEther(price.toString())
      });
      
      await tx.wait();
      return true;
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

export function useGetTicketsByAddress() {
  const getTicketsByAddress = async (address: string) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, EventTicketsABI.abi, provider);
      
      const tickets = await contract.getTicketsByAddress(address);
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