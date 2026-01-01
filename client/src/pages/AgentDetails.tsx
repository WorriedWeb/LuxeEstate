
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Agent, Property } from '../types';
import { mockService } from '../services/mockService';
import { PropertyCard } from '../components/PropertyCard';
import { SEO } from '../components/SEO';
import { Notification } from '../components/Notification';

export const AgentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form States
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [scheduleForm, setScheduleForm] = useState({ name: '', email: '', phone: '', countryCode: '+1', date: '', time: '', type: 'Call' });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Country Codes
  const countryCodes = [
      { code: '+1', country: 'USA/Canada' },
      { code: '+44', country: 'UK' },
      { code: '+91', country: 'India' },
      { code: '+61', country: 'Australia' },
      { code: '+81', country: 'Japan' },
      { code: '+49', country: 'Germany' },
      { code: '+33', country: 'France' },
      { code: '+971', country: 'UAE' },
  ];

  useEffect(() => {
    if (id) {
        setLoading(true);
        // Load agent info (using getAgents and finding by ID since we don't have getById mock)
        mockService.getAgents(true).then(agents => {
            const found = agents.find(a => a.id === id);
            setAgent(found || null);
        });

        // Load agent properties
        mockService.getProperties({ agentId: id }).then(data => {
            setProperties(data);
            setLoading(false);
        });
    }
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmissionStatus('sending');
      try {
          await mockService.createLead({
              ...contactForm,
              propertyId: properties[0]?.id || undefined, // Associate with agent's listing if any, or generic
              message: `[ADVISOR INQUIRY] ${contactForm.message}`
          });
          setSubmissionStatus('success');
          setTimeout(() => {
              setShowContactModal(false);
              setSubmissionStatus('idle');
              setContactForm({ name: '', email: '', phone: '', message: '' });
          }, 2000);
      } catch (err) {
          setNotification({ message: 'Failed to send message', type: 'error' });
          setSubmissionStatus('idle');
      }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmissionStatus('sending');
      try {
          await mockService.createLead({
              name: scheduleForm.name,
              email: scheduleForm.email,
              phone: `${scheduleForm.countryCode} ${scheduleForm.phone}`,
              propertyId: properties[0]?.id || undefined,
              message: `[SCHEDULE REQUEST] ${scheduleForm.type} requested for ${scheduleForm.date} at ${scheduleForm.time}`
          });
          setSubmissionStatus('success');
          setTimeout(() => {
              setShowScheduleModal(false);
              setSubmissionStatus('idle');
              setScheduleForm({ name: '', email: '', phone: '', countryCode: '+1', date: '', time: '', type: 'Call' });
          }, 2000);
      } catch (err) {
          setNotification({ message: 'Failed to schedule', type: 'error' });
          setSubmissionStatus('idle');
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading advisor profile...</div>;
  if (!agent) return <div className="h-screen flex items-center justify-center">Advisor not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <SEO title={agent.name} description={agent.bio} image={agent.avatar} />
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative">
                      <div className="w-48 h-48 rounded-full p-1 bg-white/20 backdrop-blur-sm">
                          <img 
                            src={agent.avatar ? agent.avatar.replace('facearea&facepad=2&w=256&h=256', 'crop&w=800&h=800') : 'https://via.placeholder.com/800'} 
                            alt={agent.name} 
                            className="w-full h-full object-cover rounded-full border-4 border-slate-900" 
                          />
                      </div>
                      <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-slate-900 ${agent.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold">{agent.name}</h1>
                        {agent.status !== 'ACTIVE' && (
                            <span className="bg-red-500 text-xs px-2 py-1 rounded font-bold uppercase">{agent.status.replace('_', ' ')}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-blue-300 font-medium mb-6">
                          <span>License: {agent.licenseNumber}</span>
                          <span>•</span>
                          <span>{agent.listingsCount} Listings</span>
                      </div>
                      <p className="text-gray-300 max-w-2xl text-lg leading-relaxed mb-8">
                          {agent.bio}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <button 
                            onClick={() => setShowContactModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg shadow-blue-600/30 flex items-center"
                          >
                              <i className="fas fa-envelope mr-2"></i> Contact Me
                          </button>
                          <button 
                            onClick={() => setShowScheduleModal(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold transition backdrop-blur-sm flex items-center"
                          >
                              <i className="fas fa-calendar-alt mr-2"></i> Schedule Call
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-8">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Contact Details</h3>
                      <ul className="space-y-4 text-sm">
                          <li className="flex items-center">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                  <i className="fas fa-envelope"></i>
                              </div>
                              <span className="text-gray-600">{agent.email}</span>
                          </li>
                          <li className="flex items-center">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                  <i className="fas fa-phone"></i>
                              </div>
                              <span className="text-gray-600">{agent.phone || '+1 (555) 123-4567'}</span>
                          </li>
                           <li className="flex items-center">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                  <i className="fas fa-map-marker-alt"></i>
                              </div>
                              <span className="text-gray-600">Beverly Hills, CA</span>
                          </li>
                      </ul>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase">Social Media</h4>
                          <div className="flex space-x-3">
                              <button onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition">
                                  <i className="fab fa-linkedin-in"></i>
                              </button>
                              <button onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-blue-400 hover:text-white flex items-center justify-center transition">
                                  <i className="fab fa-twitter"></i>
                              </button>
                              <button onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-pink-600 hover:text-white flex items-center justify-center transition">
                                  <i className="fab fa-instagram"></i>
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                          <i className="fas fa-quote-right text-6xl"></i>
                      </div>
                      <p className="italic font-serif text-lg mb-4 relative z-10">
                          "I am committed to providing the highest level of service to my clients. Your success is my success."
                      </p>
                      <div className="font-bold">- {agent.name}</div>
                  </div>
              </div>

              {/* Main Content - Listings */}
              <div className="lg:col-span-3">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-serif font-bold text-gray-900">Active Listings</h2>
                      <div className="text-gray-500 text-sm font-bold">{properties.length} Properties</div>
                  </div>
                  
                  {properties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {properties.map(property => (
                              <PropertyCard key={property.id} property={property} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <div className="text-gray-400 text-5xl mb-4"><i className="far fa-building"></i></div>
                          <h3 className="text-xl font-bold text-gray-900">No active listings</h3>
                          <p className="text-gray-500">This advisor currently has no properties listed.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in-up">
                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
                    <i className="fas fa-times text-xl"></i>
                </button>
                
                {submissionStatus === 'success' ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                            <i className="fas fa-check"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
                        <p className="text-gray-500 mt-2">{agent.name} will be in touch shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleContactSubmit} className="p-8">
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Contact {agent.name}</h3>
                        <p className="text-gray-500 mb-6 text-sm">Fill out the form below to start a conversation.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Your Name</label>
                                <input 
                                    type="text" required 
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={contactForm.name}
                                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                                <input 
                                    type="email" required 
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={contactForm.email}
                                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Message</label>
                                <textarea 
                                    rows={4} required 
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={contactForm.message}
                                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submissionStatus === 'sending'}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {submissionStatus === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in-up">
                <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
                    <i className="fas fa-times text-xl"></i>
                </button>

                {submissionStatus === 'success' ? (
                     <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                            <i className="far fa-calendar-check"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Request Received!</h3>
                        <p className="text-gray-500 mt-2">We will confirm your appointment shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleScheduleSubmit} className="p-8">
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Schedule with {agent.name}</h3>
                        <p className="text-gray-500 mb-6 text-sm">Select a preferred time for a consultation.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                                    <input 
                                        type="text" required 
                                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={scheduleForm.name}
                                        onChange={e => setScheduleForm({...scheduleForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                                    <input 
                                        type="email" required 
                                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={scheduleForm.email}
                                        onChange={e => setScheduleForm({...scheduleForm, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                                <div className="flex gap-2">
                                    <select 
                                        className="bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none w-28 text-sm"
                                        value={scheduleForm.countryCode}
                                        onChange={e => setScheduleForm({...scheduleForm, countryCode: e.target.value})}
                                    >
                                        {countryCodes.map(c => (
                                            <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="tel" required 
                                        className="flex-1 bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="000-0000"
                                        value={scheduleForm.phone}
                                        onChange={e => setScheduleForm({...scheduleForm, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Meeting Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Call', 'Video', 'In-Person'].map(t => (
                                        <button 
                                            key={t} type="button"
                                            onClick={() => setScheduleForm({...scheduleForm, type: t})}
                                            className={`py-2 text-sm font-bold rounded-lg border ${scheduleForm.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Date</label>
                                    <input 
                                        type="date" required 
                                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={scheduleForm.date}
                                        onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Time</label>
                                    <input 
                                        type="time" required 
                                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={scheduleForm.time}
                                        onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submissionStatus === 'sending'}
                                className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 mt-4"
                            >
                                {submissionStatus === 'sending' ? 'Scheduling...' : 'Confirm Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

    </div>
  );
};
