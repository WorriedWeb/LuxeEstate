
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Property, Agent } from '../types';
import { mockService } from '../services/mockService';

export const PropertyDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Image State
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Lead Form
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Mortgage Calculator State
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

    //   Get Agent Info
   const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    mockService.getPropertyBySlug(slug)
        .then(data => {
        setProperty(data || null);
        setLoading(false);
        })
        .catch(err => {
        console.error(err.message);
        // setProperty(null);
        });

    }, [slug]);

    useEffect(() => {
        if (!property?.agentId) {
            console.warn('Property has no agentId');
            setAgent(null);
            return;
        }

        mockService.getAgentById(property.agentId)
            .then(data => {
            setAgent(data.agent); // ONLY agent, not properties/leads
            })
            .catch(err => {
            console.error(err.message);
            setAgent(null);
            });

}, [property?.agentId]);



  // Keyboard Navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLightboxOpen || !property) return;

    if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    } else if (e.key === 'ArrowRight') {
      setActiveImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowLeft') {
      setActiveImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  }, [isLightboxOpen, property]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleContactSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormStatus('sending');
      try {
          await mockService.createLead({
              ...formState,
              propertyId: property?.id
          });
          setFormStatus('sent');
      } catch (err) {
          console.error(err);
      }
  };

  const calculateMortgage = () => {
      if (!property) return 0;
      const principal = property.price * (1 - downPayment / 100);
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;
      return (principal * monthlyRate * (Math.pow(1 + monthlyRate, numberOfPayments))) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pool')) return 'fa-person-swimming';
    if (lower.includes('smart')) return 'fa-wifi';
    if (lower.includes('wine')) return 'fa-wine-glass';
    if (lower.includes('theater') || lower.includes('cinema')) return 'fa-film';
    if (lower.includes('spa')) return 'fa-spa';
    if (lower.includes('garden') || lower.includes('backyard')) return 'fa-tree';
    if (lower.includes('gym') || lower.includes('fitness')) return 'fa-dumbbell';
    if (lower.includes('parking') || lower.includes('garage')) return 'fa-car';
    if (lower.includes('concierge')) return 'fa-user-tie';
    if (lower.includes('elevator')) return 'fa-elevator';
    if (lower.includes('fireplace')) return 'fa-fire';
    if (lower.includes('security')) return 'fa-shield-halved';
    return 'fa-circle-check';
  };

  const openLightbox = (index: number) => {
      setActiveImage(index);
      setIsLightboxOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!property) return;
      setActiveImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!property) return;
      setActiveImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Property not found</div>;

//   const agent = MOCK_AGENTS.find(a => a.id === property.agentId) || MOCK_AGENTS[0];
  const monthlyPayment = calculateMortgage();
  const agentPhoneClean = agent
  ? (agent.phone || '18005550199').replace(/[^0-9]/g, '')
  : '18005550199';

  // Mock Highlights for UI demonstration
  const highlights = [
      "Expansive open floor plan ideal for entertaining",
      "Chef's kitchen with premium Sub-Zero & Wolf appliances",
      "Primary suite with spa-inspired bath and dual walk-in closets",
      "Private outdoor oasis with custom landscaping",
      "Located in a top-rated school district"
  ];

  const nearbyPoints = [
      { name: "Central Park", distance: "0.5 miles", type: "Park", icon: "fa-tree" },
      { name: "Whole Foods Market", distance: "1.2 miles", type: "Grocery", icon: "fa-basket-shopping" },
      { name: "Lincoln Elementary", distance: "0.8 miles", type: "School", icon: "fa-graduation-cap" },
      { name: "Metro Station", distance: "0.3 miles", type: "Transit", icon: "fa-train-subway" },
  ];


  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* LIGHTBOX POPUP */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
            <button 
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-6 right-6 text-white/70 hover:text-white text-4xl transition z-50 p-2"
            >
                <i className="fas fa-times"></i>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20 py-10">
                 {/* Main Image */}
                 <img 
                    src={property.images[activeImage]} 
                    alt={`Gallery ${activeImage}`} 
                    className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                 />
                 
                 {/* Controls */}
                 <button 
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition border border-white/10"
                 >
                     <i className="fas fa-chevron-left text-xl"></i>
                 </button>
                 <button 
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition border border-white/10"
                 >
                     <i className="fas fa-chevron-right text-xl"></i>
                 </button>
                 
                 {/* Counter */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-medium tracking-widest text-sm bg-black/50 px-4 py-1 rounded-full backdrop-blur-md">
                     {activeImage + 1} / {property.images.length}
                 </div>
            </div>
        </div>
      )}

      {/* Immersive Image Gallery Hero (Top Carousel) */}
      <div className="h-[75vh] relative bg-gray-900 group">
        <img 
            src={property.images[activeImage]} 
            className="w-full h-full object-cover opacity-95 transition-opacity duration-500"
            alt={property.title}
            onClick={() => setIsLightboxOpen(true)} // Open lightbox on click
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
        
        {/* Navigation Arrows for Hero */}
        <button 
            onClick={(e) => { e.stopPropagation(); prevImage(e); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center transition"
        >
            <i className="fas fa-chevron-left"></i>
        </button>
        <button 
            onClick={(e) => { e.stopPropagation(); nextImage(e); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center transition"
        >
            <i className="fas fa-chevron-right"></i>
        </button>

        <div className="absolute bottom-8 right-8 flex gap-3 p-2 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden max-w-2xl pointer-events-auto z-10">
            <button onClick={() => setIsLightboxOpen(true)} className="text-white text-sm font-bold px-4 flex items-center hover:text-blue-400 transition">
                <i className="fas fa-expand-arrows-alt mr-2"></i> View All Photos
            </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Column */}
          <div className="flex-1 space-y-8">
            
            {/* 1. Header Card (Important Info) */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <i className="fas fa-home text-9xl"></i>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/30">
                                {property.status.replace('_', ' ')}
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                {property.type}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tight">{property.title}</h1>
                        <p className="text-gray-500 flex items-center text-lg font-medium">
                            <i className="fas fa-location-dot mr-2 text-red-500"></i>
                            {property.location.address}, {property.location.city}, {property.location.state}
                        </p>
                    </div>
                    <div className="text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">List Price</p>
                        <p className="text-4xl font-bold text-gray-900 font-serif">${property.price.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100">
                    <div className="text-center group">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition">
                            <i className="fas fa-bed text-lg"></i>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{property.features.bedrooms}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bedrooms</div>
                    </div>
                    <div className="text-center group">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition">
                            <i className="fas fa-bath text-lg"></i>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{property.features.bathrooms}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bathrooms</div>
                    </div>
                    <div className="text-center group">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition">
                            <i className="fas fa-ruler-combined text-lg"></i>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{property.features.sqft.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Square Ft</div>
                    </div>
                    <div className="text-center group">
                         <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition">
                            <i className="far fa-calendar-alt text-lg"></i>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{property.features.yearBuilt}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Year Built</div>
                    </div>
                </div>
            </div>

            {/* 2. VISUAL GALLERY */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex justify-between items-end mb-8">
                     <h2 className="text-2xl font-serif font-bold text-gray-900">Property Gallery</h2>
                     <button onClick={() => setIsLightboxOpen(true)} className="text-blue-600 font-bold text-sm hover:underline">
                         View All {property.images.length} Photos
                     </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-96">
                    {/* Primary Large Image */}
                    <div 
                        className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden shadow-sm cursor-pointer group relative h-full"
                        onClick={() => openLightbox(0)}
                    >
                        <img src={property.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Main View" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs font-bold uppercase shadow-sm">
                            Primary View
                        </div>
                    </div>
                    
                    {/* Secondary Images */}
                    {property.images.slice(1, 3).map((img, index) => (
                        <div key={index} 
                             className="rounded-xl overflow-hidden shadow-sm cursor-pointer group relative h-full"
                             onClick={() => openLightbox(index + 1)}
                        >
                            <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={`View ${index + 1}`} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Description & Highlights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900">About this home</h2>
                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-light">
                            <span className="float-left text-5xl font-serif font-bold text-blue-600 mr-3 mt-[-10px]">E</span>
                            {property.description}
                        </p>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-6 h-fit border border-blue-100">
                        <h3 className="text-lg font-bold font-serif mb-4 text-gray-900 flex items-center">
                            <i className="fas fa-star text-yellow-500 mr-2"></i> Why we love it
                        </h3>
                        <ul className="space-y-4">
                            {highlights.map((item, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-700">
                                    <i className="fas fa-check text-blue-500 mt-1 mr-3 flex-shrink-0"></i>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-10 border-t border-gray-100">
                    <h3 className="text-xl font-serif font-bold mb-6">Property Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div>
                             <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Property Type</span>
                             <span className="font-medium text-gray-900">{property.type}</span>
                         </div>
                         <div>
                             <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Listing Status</span>
                             <span className="font-medium text-gray-900">{property.status.replace('_', ' ')}</span>
                         </div>
                         <div>
                             <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Price / SqFt</span>
                             <span className="font-medium text-gray-900">${Math.round(property.price / property.features.sqft)}</span>
                         </div>
                         <div>
                             <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Year Renovated</span>
                             <span className="font-medium text-gray-900">{property.features.yearBuilt}</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* 4. Amenities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                <h2 className="text-2xl font-serif font-bold mb-8 text-gray-900">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map(item => (
                        <div key={item} className="flex items-center text-gray-700 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition duration-300 bg-white group">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition">
                                <i className={`fas ${getAmenityIcon(item)}`}></i>
                            </div>
                            <span className="font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 5. Location */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Location & Neighborhood</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                        <i className="fas fa-check-circle mr-1"></i> Great Walk Score: 85
                    </span>
                 </div>
                 
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                        {/* Switched to OpenStreetMap Iframe to avoid "Development Purposes Only" error without API Key */}
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.lng-0.01}%2C${property.location.lat-0.01}%2C${property.location.lng+0.01}%2C${property.location.lat+0.01}&layer=mapnik&marker=${property.location.lat}%2C${property.location.lng}`} 
                            style={{border: "none"}}
                        ></iframe>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Nearby</h4>
                        {nearbyPoints.map((point, i) => (
                            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm mr-3">
                                    <i className={`fas ${point.icon}`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{point.name}</p>
                                    <p className="text-xs text-gray-500">{point.type}</p>
                                </div>
                                <span className="text-xs font-bold text-blue-600">{point.distance}</span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Action Center */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
                
                {/* 1. CONTACT FORM CARD */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    
                    {/* Agent Header */}
                    <div className="p-6 flex items-center border-b border-gray-100">
                        <img src={agent?.avatar} className="w-16 h-16 rounded-full mr-4 border-2 border-white shadow-md object-cover ring-2 ring-gray-50" alt={agent?.name} />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 font-serif">{agent?.name}</h3>
                            <div className="flex items-center text-yellow-500 text-xs mt-1 mb-2">
                                <i className="fas fa-star"></i>
                                <span className="text-gray-400 ml-1 font-semibold">4.9 (48 reviews)</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-bold transition">View Profile</button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - NOW FUNCTIONAL */}
                    <div className="p-4 grid grid-cols-2 gap-2 bg-gray-50/50">
                        <a 
                            href={`tel:${agent?.phone || ''}`}
                            className="bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center text-xs"
                        >
                            <i className="fas fa-phone-alt mr-2"></i> Call Advisor
                        </a>
                        <a 
                            href={`https://wa.me/${agentPhoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center text-xs"
                        >
                            <i className="fab fa-whatsapp mr-2 text-green-500 text-lg"></i> WhatsApp
                        </a>
                    </div>

                    {/* Contact Form */}
                    <div className="p-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Send Message</h4>
                        <div className="animate-fade-in">
                            {formStatus === 'sent' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <p className="text-gray-900 font-bold text-lg">Inquiry Sent!</p>
                                    <p className="text-sm text-gray-600 mt-2">We will contact you shortly.</p>
                                    <button onClick={() => setFormStatus('idle')} className="mt-6 text-blue-600 text-sm font-bold underline">Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <input 
                                        type="text" placeholder="Your Name" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm"
                                        value={formState.name}
                                        onChange={e => setFormState({...formState, name: e.target.value})}
                                    />
                                    <input 
                                        type="email" placeholder="Email Address" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm"
                                        value={formState.email}
                                        onChange={e => setFormState({...formState, email: e.target.value})}
                                    />
                                    <input 
                                        type="tel" placeholder="Phone Number" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm"
                                        value={formState.phone}
                                        onChange={e => setFormState({...formState, phone: e.target.value})}
                                    />
                                    <textarea 
                                        placeholder="I'm interested in viewing this property..." 
                                        rows={3} required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none shadow-sm"
                                        value={formState.message}
                                        onChange={e => setFormState({...formState, message: e.target.value})}
                                    ></textarea>
                                    <button 
                                        type="submit" 
                                        disabled={formStatus === 'sending'}
                                        className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 font-bold transition disabled:opacity-50 shadow-lg shadow-blue-600/20 mt-2"
                                    >
                                        {formStatus === 'sending' ? 'Sending...' : 'Schedule Viewing'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MORTGAGE CALCULATOR CARD */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                             <i className="fas fa-calculator text-sm"></i>
                         </div>
                         <h3 className="font-bold text-gray-900">Mortgage Calculator</h3>
                    </div>

                    <div className="text-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estimated Monthly</p>
                        <div className="text-3xl font-extrabold text-blue-600">${Math.round(monthlyPayment).toLocaleString()}</div>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                <span>Down Payment ({downPayment}%)</span>
                                <span>${Math.round(property.price * (downPayment/100)).toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="0" max="80" step="5"
                                value={downPayment}
                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                <span>Interest Rate ({interestRate}%)</span>
                            </div>
                            <input 
                                type="range" min="1" max="10" step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                <span>Loan Term</span>
                                <span className="text-blue-600">{loanTerm} Years</span>
                            </div>
                            <select 
                                value={loanTerm} 
                                onChange={(e) => setLoanTerm(Number(e.target.value))}
                                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none font-medium shadow-sm text-gray-700"
                            >
                                <option value="15">15 Years Fixed</option>
                                <option value="20">20 Years Fixed</option>
                                <option value="30">30 Years Fixed</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 text-center mt-4 border-t border-gray-100">
                        <button className="text-gray-500 text-xs font-bold hover:text-blue-600 transition flex items-center justify-center w-full">
                            View Amortization Schedule <i className="fas fa-chevron-right ml-1"></i>
                        </button>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
