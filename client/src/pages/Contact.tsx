import React, { useState } from 'react';
import { mockService } from '../services/mockService';
import { Notification } from '../components/Notification';

export const Contact: React.FC = () => {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await mockService.createLead({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: '', // Optional in this form
                message: `[${formData.subject}] ${formData.message}`,
                propertyId: undefined // Explicitly undefined means general inquiry
            });
            setSent(true);
        } catch (error) {
            console.error("Failed to send message", error);
            setNotification({ message: "Failed to send message. Please try again.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

  return (
    <div className="bg-white min-h-screen py-20">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">Get in Touch</h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">We'd love to hear from you. Our team is always here to help you find your dream property.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Contact Info */}
            <div className="bg-slate-900 p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-serif font-bold mb-10">Contact Information</h3>
                    <div className="space-y-10">
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                                <i className="fas fa-map-marker-alt text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Our Office</h4>
                                <p className="text-gray-300 leading-relaxed">123 Luxury Lane, Suite 100<br/>Beverly Hills, CA 90210</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                                <i className="fas fa-envelope text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Email Us</h4>
                                <p className="text-gray-300">contact@luxeestate.com</p>
                                <p className="text-gray-300">support@luxeestate.com</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                                <i className="fas fa-phone text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Call Us</h4>
                                <p className="text-gray-300">+1 (800) 555-0199</p>
                                <p className="text-gray-300 text-sm mt-1">Mon-Fri: 9am - 6pm PST</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-20">
                        <h4 className="font-bold text-lg mb-6">Follow Us</h4>
                        <div className="flex space-x-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition duration-300"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-400 transition duration-300"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition duration-300"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="p-16 bg-white">
                {sent ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">
                            <i className="fas fa-check"></i>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Message Sent!</h3>
                        <p className="text-gray-600 text-lg mb-8">Thank you for contacting us. We will get back to you as soon as possible.</p>
                        <button onClick={() => setSent(false)} className="text-blue-600 font-bold hover:underline">Send another message</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">First Name</label>
                                <input 
                                    type="text" name="firstName" required 
                                    value={formData.firstName} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Last Name</label>
                                <input 
                                    type="text" name="lastName" required 
                                    value={formData.lastName} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <input 
                                type="email" name="email" required 
                                value={formData.email} onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                            <select 
                                name="subject"
                                value={formData.subject} onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-gray-600"
                            >
                                <option>General Inquiry</option>
                                <option>Buying Property</option>
                                <option>Selling Property</option>
                                <option>Career Opportunity</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                            <textarea 
                                name="message" rows={4} required 
                                value={formData.message} onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 transform hover:-translate-y-1 disabled:opacity-70"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};