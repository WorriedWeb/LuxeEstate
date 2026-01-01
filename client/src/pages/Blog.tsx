import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { SEO } from '../components/SEO';

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    mockService.getBlogPosts().then(setPosts);
  }, []);
  return (
    <div className="bg-white min-h-screen py-16">
      <SEO title="Blog" description="Read the latest news, tips, and trends in the luxury real estate market." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Real Estate Insights</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest trends, market analysis, and luxury living tips.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="group cursor-pointer flex flex-col h-full">
              <div className="rounded-2xl overflow-hidden mb-6 h-64 relative shadow-lg">
                <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">
                    {post.category}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                  <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">
                      <span>{post.date}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span>By {post.author}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition leading-tight">
                      {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed flex-grow">
                      {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center text-gray-900 font-bold text-sm group-hover:text-blue-600 transition">
                          Read Article <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition"></i>
                      </span>
                  </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
