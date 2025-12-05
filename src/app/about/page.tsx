'use client';

import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-space-grotesk">
              About True Seat
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionizing event ticketing through blockchain technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk">Our Mission</h2>
              <p className="text-gray-600">
                [Placeholder for mission statement]
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk">Our Vision</h2>
              <p className="text-gray-600">
                [Placeholder for vision statement]
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk">Our Story</h2>
              <p className="text-gray-600">
                [Placeholder for company story]
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk">Our Values</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#ffccce] rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">[Value 1]</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#ffccce] rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">[Value 2]</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#ffccce] rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">[Value 3]</span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk">Our Team</h2>
              <p className="text-gray-600">
                [Placeholder for team information]
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
} 