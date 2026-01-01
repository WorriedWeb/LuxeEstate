import React, { useState } from 'react';
import { mockService } from '../services/mockService';

export const LeadPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<'offer' | 'form' | 'success'>('offer');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // Auto-open timer removed as per user request to be less irritating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockService.createLead({
        ...formData,
        message: 'Interested in Exclusive Off-Market Offer',
      });
      setStep('success');
      setTimeout(() => {
        setIsOpen(false);
        setStep('offer'); // Reset for next time
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen && !minimized) return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-white text-gray-900 px-5 py-3 rounded-full shadow-xl border border-gray-100 font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform font-serif group"
      >
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        Get Exclusive Offer
        <div className="absolute inset-0 bg-blue-600 rounded-full -z-10 blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      </button>
  );

  if (minimized) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-10"
        >
          <i className="fas fa-times"></i>
        </button>

        {step === 'offer' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
              <i className="fas fa-gem"></i>
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">Unlock Off-Market Listings</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Get exclusive access to premium properties before they hit the public market. Join our VIP list today.
            </p>
            <button 
              onClick={() => setStep('form')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              Get Access Now
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-4 text-gray-400 text-sm hover:text-gray-600"
            >
              No thanks, I'll browse publicly
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="p-8">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 text-center">Where should we send the list?</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Optional)</label>
                <input 
                  type="tel" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition mt-4"
              >
                Reveal Listings
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center bg-green-50 h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6 animate-bounce">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h3>
            <p className="text-gray-600">One of our premium agents will contact you shortly with curated options.</p>
          </div>
        )}
      </div>
    </div>
  );
};