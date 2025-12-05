'use client';

import { useState } from 'react';

interface BuyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  eventName: string;
  onConfirm: (quantity: number) => Promise<void>;
  isLoading: boolean;
}

export function BuyTicketsModal({ isOpen, onClose, ticketPrice, eventName, onConfirm, isLoading }: BuyTicketsModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const totalPrice = ticketPrice * quantity;

  const handleConfirm = () => {
    onConfirm(quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Buy Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{eventName}</h3>
            <p className="text-sm text-gray-500">Price per ticket: {ticketPrice} SOL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-gray-900 px-3 py-2"
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-lg font-medium text-gray-900">
              Total: {totalPrice.toFixed(4)} SOL
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-[#e50914] text-white rounded-md hover:bg-[#b8070f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
} 