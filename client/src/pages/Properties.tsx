import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Property } from '../types';
import { mockService } from '../services/mockService';
import { PropertyCard } from '../components/PropertyCard';
import { SEO } from '../components/SEO';

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    minPrice: '',
    maxPrice: '',
    status: '',
    sortBy: 'newest'
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const data = await mockService.getProperties({
        search: filters.search,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        sortBy: filters.sortBy
    });
    setProperties(data);
    setLoading(false);
  }, [filters]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Re-fetch whenever sortBy changes
  useEffect(() => {
    if (filters.sortBy !== 'newest') {
      fetchProperties();
    }
  }, [filters.sortBy, fetchProperties]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const applyFilters = (e: React.FormEvent) => {
      e.preventDefault();
      fetchProperties();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="Properties" description="Search our database of luxury homes, villas, and apartments for sale or rent." />
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Find Your Perfect Home</h1>
        <p className="text-gray-600">Browse our exclusive collection of premium properties.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-serif text-gray-900">Filter Search</h3>
                <i className="fas fa-sliders-h text-gray-400"></i>
            </div>
            
            <form onSubmit={applyFilters} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location / Keyword</label>
                <div className="relative">
                    <input 
                    type="text" 
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="City, Zip, Type..."
                    className="w-full border-gray-200 rounded-lg bg-gray-50 p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                    <i className="fas fa-search absolute left-3 top-3.5 text-gray-400 text-xs"></i>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                    <input 
                    type="number" 
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full border-gray-200 rounded-lg bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                    <input 
                    type="number" 
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full border-gray-200 rounded-lg bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Property Type</label>
                  <select className="w-full border-gray-200 rounded-lg bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-gray-600">
                      <option>All Types</option>
                      <option>House</option>
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Condo</option>
                  </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/20">
                Update Results
              </button>
            </form>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center pb-4 border-b border-gray-200">
            <h2 className="text-gray-900 font-medium">
                Showing <span className="font-bold text-blue-600">{properties.length}</span> Properties
            </h2>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                <select 
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="border-none bg-transparent text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                >
                    <option value="newest">Newest Listed</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[1,2,3,4].map(n => (
                     <div key={n} className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
                 ))}
             </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
              <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="text-gray-300 text-5xl mb-4"><i className="far fa-folder-open"></i></div>
                  <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
                  <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};