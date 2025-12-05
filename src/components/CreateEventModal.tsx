'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useCreateEvent } from '@/lib/solana';
import { uploadEventImage, uploadEventMetadata, EventMetadata } from '@/lib/pinata';
import { toast } from 'react-hot-toast';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  ticketCount: z.number().optional(),
  price: z.number().min(0.001, 'Price must be at least 0.001 SOL'),
  date: z.string().optional(),
  time: z.string().optional(),
  category: z.string().optional(),
  image: z.any().optional(),
  additionalInfo: z.record(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { createEvent } = useCreateEvent();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsUploading(true);

      // Provide defaults for optional fields
      const description = data.description || 'No description provided';
      const location = data.location || 'TBA';
      const category = data.category || 'General';
      const ticketCount = data.ticketCount || 100;
      
      // Convert date and time to Unix timestamp
      // Default to 7 days from now if not provided
      let timestamp: number;
      if (data.date && data.time) {
        const eventDate = new Date(`${data.date}T${data.time}`);
        timestamp = Math.floor(eventDate.getTime() / 1000);
      } else {
        timestamp = Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
      }

      // Upload image first (skip for now due to Pinata SDK issues in Node.js)
      let imageCID = 'placeholder-image-cid';
      // if (data.image?.[0]) {
      //   const imageFile = data.image[0];
      //   imageCID = await uploadEventImage(imageFile, {
      //     name: data.name,
      //     description,
      //     location,
      //     category,
      //     eventDate: timestamp,
      //     price: data.price,
      //     maxTickets: ticketCount,
      //   });
      // }

      // Upload metadata (skip for now due to Pinata SDK issues in Node.js)
      const metadataCID = 'placeholder-metadata-cid';
      // const metadata: EventMetadata = {
      //   name: data.name,
      //   description,
      //   location,
      //   category,
      //   eventDate: timestamp,
      //   price: data.price,
      //   maxTickets: ticketCount,
      //   additionalInfo: data.additionalInfo,
      // };
      // const metadataCID = await uploadEventMetadata(metadata);

      // Create event on blockchain
      await createEvent(
        data.name,
        description,
        data.price,
        ticketCount,
        timestamp,
        location,
        category,
        imageCID,
        metadataCID
      );

      toast.success('Event created successfully!');
      await onSuccess();
      reset();
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              placeholder="e.g., Summer Music Festival"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              rows={3}
              placeholder="Tell people about your event..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location <span className="text-gray-400 text-xs">(optional, defaults to "TBA")</span>
            </label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              placeholder="e.g., Central Park, New York"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-gray-400 text-xs">(optional, defaults to "General")</span>
            </label>
            <input
              type="text"
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              placeholder="e.g., Music, Technology, Food"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-gray-400 text-xs">(optional, defaults to 7 days from now)</span>
              </label>
              <input
                type="date"
                {...register('date')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="time"
                {...register('time')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price (SOL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                {...register('price', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
                placeholder="0.5"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Tickets <span className="text-gray-400 text-xs">(optional, defaults to 100)</span>
              </label>
              <input
                type="number"
                {...register('ticketCount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ffe5e7]0 focus:ring-[#ffe5e7]0 text-black"
                placeholder="100"
              />
              {errors.ticketCount && <p className="text-red-500 text-sm mt-1">{errors.ticketCount.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Image <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image')}
              onChange={handleImageChange}
              className="mt-1 block w-full"
            />
            {previewUrl && (
              <div className="mt-2 relative h-48 w-full">
                <Image
                  src={previewUrl}
                  alt="Event preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#e50914] border border-transparent rounded-md hover:bg-[#b8070f] disabled:opacity-50"
            >
              {isUploading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 