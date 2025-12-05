'use client';

import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ffe5e7] via-white to-[#ffe5e7]">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-[#e50914] rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#e50914] rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="font-space-grotesk text-6xl md:text-7xl font-bold text-[#e50914] mb-4 tracking-tight">
                  True Seat
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  The Future of Event Ticketing
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-space-grotesk">
                  Decentralized Event Ticketing
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Experience the future of event ticketing with blockchain technology. Secure, transparent, and hassle-free.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-x-4"
              >
                <Link 
                  href="/events" 
                  className="inline-block bg-[#e50914] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#b8070f] transition-colors font-space-grotesk shadow-lg hover:shadow-xl"
                >
                  Explore Events
                </Link>
                <Link 
                  href="/about" 
                  className="inline-block bg-white text-[#e50914] px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors font-space-grotesk border-2 border-[#e50914]"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Event ticketing" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose True Seat?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the benefits of blockchain-powered ticketing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-[#ffccce] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#e50914] transition-colors">
                  <div className="w-6 h-6 text-[#e50914] group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-[#ffe5e7] via-white to-[#ffe5e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to create and manage your event tickets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-[#e50914] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:bg-[#b8070f] transition-colors shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover exciting events happening right now
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.date}</p>
                  <p className="text-gray-600 mb-4">{event.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#e50914] font-medium">{event.price} ETH</span>
                    <Link 
                      href="/events" 
                      className="text-[#e50914] hover:text-[#b8070f] font-medium group-hover:translate-x-1 transition-transform"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#ffe5e7] via-white to-[#ffe5e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the future of event ticketing. Create, buy, and manage tickets with ease.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="space-x-4"
            >
              <Link 
                href="/events" 
                className="inline-block bg-[#e50914] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#b8070f] transition-colors font-space-grotesk shadow-lg hover:shadow-xl"
              >
                Start Exploring
              </Link>
              <Link 
                href="/contact" 
                className="inline-block bg-white text-[#e50914] px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors font-space-grotesk border-2 border-[#e50914]"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    title: 'Secure & Transparent',
    description: 'Every transaction is recorded on the blockchain, ensuring authenticity and preventing fraud.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Easy to Use',
    description: 'Simple and intuitive interface for creating, buying, and managing tickets.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'No Middleman',
    description: 'Direct peer-to-peer transactions eliminate unnecessary fees and intermediaries.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet to get started with True Seat.',
  },
  {
    title: 'Create Event',
    description: 'Set up your event details, ticket prices, and available quantity.',
  },
  {
    title: 'Share & Sell',
    description: 'Share your event link and start selling tickets to your audience.',
  },
  {
    title: 'Manage Tickets',
    description: 'Track sales, manage attendees, and handle ticket transfers easily.',
  },
];

const featuredEvents = [
  {
    title: 'Summer Music Festival',
    date: 'July 15, 2024',
    location: 'Central Park, New York',
    price: '0.1',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Tech Conference 2024',
    date: 'August 20, 2024',
    location: 'Convention Center, San Francisco',
    price: '0.2',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Food & Wine Festival',
    date: 'September 5, 2024',
    location: 'Riverside Gardens, Chicago',
    price: '0.15',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
];
