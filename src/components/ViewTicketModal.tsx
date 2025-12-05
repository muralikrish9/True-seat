'use client';

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  date: string;
  location: string;
  description: string;
  quantity: number;
  ticketId: string;
}

export function ViewTicketModal({ 
  isOpen, 
  onClose, 
  eventName, 
  date, 
  location, 
  description, 
  quantity,
  ticketId 
}: ViewTicketModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{eventName}</h3>
            <p className="text-sm text-gray-500 mt-1">Ticket ID: {ticketId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-base text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-base text-gray-900">{location}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-base text-gray-900 mt-1">{description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Quantity</p>
            <p className="text-base text-gray-900 mt-1">{quantity} tickets</p>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#e50914] text-white rounded-md hover:bg-[#b8070f] text-base font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 