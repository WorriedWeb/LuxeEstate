import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Redefining Luxury</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
                  We are more than just a real estate agency. We are your partners in finding the extraordinary.
              </p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-24">
              <div>
                  <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">Our Mission</h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      At LuxeEstate, our mission is to provide an unparalleled real estate experience by combining traditional brokerage services with innovative technology and data-driven insights.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-blue-600 pl-6 italic">
                      "We believe that every home has a story, and our job is to find the perfect setting for your next chapter. Whether you are buying, selling, or investing, we are committed to excellence in every interaction."
                  </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl relative">
                   <div className="absolute -inset-4 bg-blue-100 rounded-2xl rotate-3 z-0"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" 
                    alt="Office" 
                    className="w-full h-full object-cover relative z-10"
                  />
              </div>
          </div>

          <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-16">Why Choose Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="p-10 bg-gray-50 rounded-2xl hover:-translate-y-2 transition duration-300">
                      <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-lg">
                          <i className="fas fa-globe-americas"></i>
                      </div>
                      <h3 className="text-xl font-bold mb-4 font-serif">Global Reach</h3>
                      <p className="text-gray-600 leading-relaxed">Access to an international network of buyers and exclusive properties across 30+ countries.</p>
                  </div>
                  <div className="p-10 bg-gray-50 rounded-2xl hover:-translate-y-2 transition duration-300">
                      <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-lg">
                          <i className="fas fa-chart-line"></i>
                      </div>
                      <h3 className="text-xl font-bold mb-4 font-serif">Market Expertise</h3>
                      <p className="text-gray-600 leading-relaxed">Deep local knowledge backed by comprehensive market analysis and real-time data.</p>
                  </div>
                  <div className="p-10 bg-gray-50 rounded-2xl hover:-translate-y-2 transition duration-300">
                      <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-lg">
                          <i className="fas fa-hand-holding-heart"></i>
                      </div>
                      <h3 className="text-xl font-bold mb-4 font-serif">Client Focus</h3>
                      <p className="text-gray-600 leading-relaxed">Personalized service tailored to your unique lifestyle, goals, and privacy requirements.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};