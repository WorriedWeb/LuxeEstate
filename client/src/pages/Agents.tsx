import React, { useEffect, useState } from 'react';
import { Agent } from '../types';
import { mockService } from '../services/mockService';
import { Link } from 'react-router-dom';

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService.getAgents().then(data => {
        setAgents(data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Meet Our Advisors</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our team of experienced real estate professionals is dedicated to helping you find your dream home.
          </p>
        </div>

        {loading ? (
             <div className="text-center text-gray-500">Loading advisors...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {agents.map(agent => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="h-80 overflow-hidden relative">
                    <img 
                        src={agent.avatar.replace('facearea&facepad=2&w=256&h=256', 'crop&w=800&h=800')} 
                        alt={agent.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold font-serif mb-1">{agent.name}</h3>
                        <p className="text-blue-300 font-medium text-sm tracking-wide uppercase">{agent.listingsCount} Active Listings</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Licensed Advisor
                        </span>
                        <div className="flex space-x-3 text-gray-400">
                            <i className="fab fa-linkedin hover:text-blue-600 cursor-pointer text-lg transition"></i>
                            <i className="fab fa-twitter hover:text-blue-400 cursor-pointer text-lg transition"></i>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                        {agent.bio}
                    </p>
                    <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                        <Link to={`/agents/${agent.id}`} className="text-gray-900 font-bold text-sm hover:text-blue-600 transition flex items-center">
                            View Profile <i className="fas fa-arrow-right ml-2 text-xs"></i>
                        </Link>
                        <Link to={`/agents/${agent.id}`} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-900/10">
                            Contact
                        </Link>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};