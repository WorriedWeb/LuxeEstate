
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { mockService } from '../services/mockService';
import { PropertyCard } from '../components/PropertyCard';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Property[]>([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    mockService.getProperties().then(data => {
      setFeatured(data.slice(0, 3));
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      navigate(`/properties?search=${search}`);
  }

  return (
    <div className="flex flex-col">
      <SEO 
        title="Home" 
        description="LuxeEstate is your premier destination for luxury properties, offering an exclusive collection of homes, villas, and apartments." 
      />
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {/* High quality architecture image */}
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Home" 
            className="w-full h-full object-cover"
          />
          {/* Darker gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl px-4 text-center text-white">
          <span className="block text-blue-400 font-bold tracking-widest uppercase mb-4 text-sm animate-fade-in-up">The Future of Living</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-2xl leading-tight">
            Discover Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Dream Sanctuary</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 font-light max-w-2xl mx-auto">
            Exclusive properties in the world's most desirable locations.
          </p>
          
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-2 rounded-full shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row border border-white/20">
            <div className="flex-1 text-left px-6 py-3 relative border-b md:border-b-0 md:border-r border-white/20">
              <label className="block text-xs font-bold text-blue-200 uppercase mb-1 tracking-wider">Location</label>
              <input 
                type="text" 
                placeholder="City, Neighborhood, or Address" 
                className="w-full bg-transparent text-white placeholder-gray-300 focus:outline-none text-lg font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-white/50"></i>
            </div>
            <div className="w-full md:w-auto p-1">
              <button type="submit" className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2">
                Search <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </form>
          
          <div className="mt-12 flex justify-center gap-8 text-sm font-medium text-white/80">
             <span className="flex items-center gap-2"><i className="fas fa-check-circle text-blue-400"></i> Verified Listings</span>
             <span className="flex items-center gap-2"><i className="fas fa-check-circle text-blue-400"></i> Expert Support</span>
             <span className="flex items-center gap-2"><i className="fas fa-check-circle text-blue-400"></i> Direct Contact</span>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Exclusive Offers</span>
                <h2 className="text-4xl font-serif font-bold text-gray-900 mt-2">Featured Properties</h2>
            </div>
            <Link to="/properties" className="hidden md:inline-flex items-center text-gray-900 font-semibold hover:text-blue-600 transition mt-4 md:mt-0 border-b-2 border-transparent hover:border-blue-600 pb-1">
              View All Properties <i className="fas fa-long-arrow-alt-right ml-2"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featured.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="md:hidden mt-8 text-center">
             <Link to="/properties" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium">View All Properties</Link>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Explore Popular Cities</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  From bustling urban centers to serene coastal retreats, find the perfect location for your lifestyle.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-96">
                <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                    {/* Updated New York Image */}
                    <img src="https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="New York" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold font-serif">New York</h3>
                        <p className="text-sm opacity-90">120+ Properties</p>
                    </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                    <img src="https://images.unsplash.com/photo-1534239143101-1b1c627395c5?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Los Angeles" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold font-serif">Los Angeles</h3>
                        <p className="text-sm opacity-90">85+ Properties</p>
                    </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                    <img src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Miami" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold font-serif">Miami</h3>
                        <p className="text-sm opacity-90">64+ Properties</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-slate-800/50">
             <div className="p-4">
                 <div className="text-5xl font-bold font-serif text-white mb-2">1.2k+</div>
                 <div className="text-blue-400 font-medium uppercase tracking-wider text-xs">Premium Listings</div>
             </div>
             <div className="p-4">
                 <div className="text-5xl font-bold font-serif text-white mb-2">850+</div>
                 <div className="text-blue-400 font-medium uppercase tracking-wider text-xs">Properties Sold</div>
             </div>
             <div className="p-4">
                 <div className="text-5xl font-bold font-serif text-white mb-2">98%</div>
                 <div className="text-blue-400 font-medium uppercase tracking-wider text-xs">Client Satisfaction</div>
             </div>
             <div className="p-4">
                 <div className="text-5xl font-bold font-serif text-white mb-2">150+</div>
                 <div className="text-blue-400 font-medium uppercase tracking-wider text-xs">Expert Advisors</div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Ready to find your new home?</h2>
              <p className="text-xl text-gray-600 mb-10">Contact our real estate experts today and let us help you find the property of your dreams.</p>
              <div className="flex justify-center gap-4">
                  <Link to="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">Contact Us</Link>
                  <Link to="/properties" className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">Browse Listings</Link>
              </div>
          </div>
      </section>
    </div>
  );
};
