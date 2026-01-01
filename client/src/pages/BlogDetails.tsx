import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { SEO } from '../components/SEO';

export const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
        setLoading(true);
        // Load main post
        mockService.getBlogPostBySlug(slug).then(data => {
            setPost(data);
            
            // Load all posts to find related ones (filtering out current)
            mockService.getBlogPosts().then(allPosts => {
                const others = allPosts.filter(p => p.slug !== slug).slice(0, 3);
                setRelatedPosts(others);
                setLoading(false);
            });
        });
    }
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading article...</div>;
  if (!post) return <div className="h-screen flex items-center justify-center">Article not found</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO title={post.title} description={post.excerpt} image={post.image} />
      
      {/* Hero Image */}
      <div className="h-[50vh] relative w-full">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-5xl mx-auto">
             <span className="bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded mb-4 inline-block shadow-lg">
                 {post.category}
             </span>
             <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight drop-shadow-md">{post.title}</h1>
             <div className="flex items-center gap-4 text-sm font-medium">
                 <span>By {post.author}</span>
                 <span>•</span>
                 <span>{post.date}</span>
             </div>
          </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl border border-gray-100 mb-16">
             {/* Content */}
             <div 
                className="prose prose-lg max-w-none text-gray-700 font-sans leading-loose"
                dangerouslySetInnerHTML={{ __html: post.content }}
             />

             {/* Share / Tags */}
             <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                 <Link to="/blog" className="text-blue-600 font-bold hover:underline flex items-center">
                    <i className="fas fa-arrow-left mr-2"></i> Back to Blog
                 </Link>
                 <div className="flex space-x-3">
                     <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 flex items-center justify-center transition">
                         <i className="fab fa-facebook-f"></i>
                     </button>
                     <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 flex items-center justify-center transition">
                         <i className="fab fa-twitter"></i>
                     </button>
                     <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 flex items-center justify-center transition">
                         <i className="fab fa-linkedin-in"></i>
                     </button>
                 </div>
             </div>
          </div>
      </div>

      {/* Suggested Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(rp => (
                  <Link to={`/blog/${rp.slug}`} key={rp.id} className="group block h-full">
                      <div className="rounded-xl overflow-hidden mb-4 h-48 shadow-sm">
                          <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                      <div className="text-xs font-bold text-blue-600 uppercase mb-2">{rp.category}</div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">{rp.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{rp.excerpt}</p>
                  </Link>
              ))}
          </div>
      </div>
    </div>
  );
};