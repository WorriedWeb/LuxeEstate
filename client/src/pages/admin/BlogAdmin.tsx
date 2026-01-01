import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, UserRole } from '../../types';
import { mockService } from '../../services/mockService';
import { useAuth } from '../../services/auth';
import { Notification } from '../../components/Notification';

export const BlogAdmin: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const initialFormState: Partial<BlogPost> = {
    title: '',
    excerpt: '',
    content: '',
    category: 'General',
    image: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const [formData, setFormData] = useState<Partial<BlogPost>>(initialFormState);

  const categories = ['Market News', 'Design', 'Lifestyle', 'Investment', 'Company News'];

  useEffect(() => {
    loadPosts();
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error') => {
      setNotification({ message, type });
  };

  const loadPosts = async () => {
    // Admins see all posts; Agents see their own (or all if you prefer collaboration)
    const data = await mockService.getBlogPosts();
    setPosts(data);

    if (user?.role === UserRole.ADMIN) {
        const data = await mockService.getBlogPosts();
        setPosts(data);
    } else if (user) {
        const data = await mockService.getBlogPosts(user.id);
        setPosts(data);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ ...initialFormState });
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData(JSON.parse(JSON.stringify(post)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await mockService.deleteBlogPost(id);
        showNotification('Article deleted', 'success');
        loadPosts();
      } catch (e) {
        showNotification('Failed to delete article', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        showNotification("Title and Content are required", 'error');
        return;
    }

    try {
        const postData = {
            ...formData,
            author: user?.name || 'Admin',
            authorId: user?.id || '1', // Ensure authorship
        };

        if (editingId) {
            await mockService.updateBlogPost(editingId, postData);
            showNotification('Article updated successfully', 'success');
        } else {
            await mockService.createBlogPost(postData as any);
            showNotification('Article published successfully', 'success');
        }
        setIsModalOpen(false);
        loadPosts();
    } catch (error: any) {
        if (error.message && error.message.includes('exceeded the quota')) {
            showNotification("Storage full! Try using shorter content or image URLs.", 'error');
        } else {
            showNotification("Error saving post.", 'error');
        }
    }
  };

  // Image Handling (Cloudinary or Local)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setUploadingImage(true);
          try {
              const imageUrl = await mockService.uploadImage(file);
              setFormData({ ...formData, image: imageUrl });
              showNotification("Image uploaded successfully", 'success');
          } catch (error) {
              console.error(error);
              showNotification("Failed to upload image", 'error');
          } finally {
              setUploadingImage(false);
          }
      }
  };

  return (
    <div>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-500 text-sm">Create and manage news articles</p>
        </div>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center shadow-md font-bold transition">
            <i className="fas fa-plus mr-2"></i> Write Article
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <i className="far fa-newspaper text-4xl mb-3"></i>
                <p>No articles found. Start writing!</p>
            </div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map(post => (
                        <tr key={post.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                        <img className="h-full w-full object-cover" src={post.image || 'https://via.placeholder.com/150'} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{post.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {post.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {post.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                {post.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-3">
                                    <Link 
                                        to={`/blog/${post.slug}`} 
                                        target="_blank" 
                                        className="text-gray-600 hover:text-gray-900 font-bold bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition flex items-center gap-1"
                                    >
                                        <i className="fas fa-eye text-xs"></i> View
                                    </Link>
                                    <button 
                                        onClick={() => handleEdit(post)} 
                                        className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition flex items-center gap-1"
                                    >
                                        <i className="fas fa-edit text-xs"></i> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(post.id)} 
                                        className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition flex items-center gap-1"
                                    >
                                        <i className="fas fa-trash text-xs"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                      <h2 className="text-2xl font-serif font-bold text-gray-900">{editingId ? 'Edit Article' : 'New Article'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800"><i className="fas fa-times text-xl"></i></button>
                  </div>
                  
                  <div className="overflow-y-auto p-8 flex-1">
                      <form onSubmit={handleSave} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Headline</label>
                                  <input 
                                    type="text" required 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter article title..."
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                                  <select 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                  >
                                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Date</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Excerpt (SEO)</label>
                              <textarea 
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Brief summary displayed on the blog list..."
                                value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
                              ></textarea>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Article Content (HTML Supported)</label>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2 text-xs text-gray-500 flex gap-2">
                                  <span>Tips: Use &lt;h3&gt; for subtitles, &lt;p&gt; for paragraphs.</span>
                              </div>
                              <textarea 
                                rows={10} required
                                className="w-full bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="<p>Start writing your article...</p>"
                                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                              ></textarea>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Featured Image</label>
                              <div className="flex gap-4 items-start">
                                  {formData.image && (
                                      <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded-lg shadow-sm border border-gray-200" />
                                  )}
                                  <div className="flex-1">
                                      <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Image URL..."
                                        value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                                      />
                                      <p className="text-center text-xs text-gray-400 font-bold my-1">OR</p>
                                      <div className="relative">
                                        <input 
                                            type="file" accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploadingImage}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                        />
                                        {uploadingImage && <div className="absolute top-2 right-2 text-blue-600 text-xs font-bold"><i className="fas fa-spinner animate-spin"></i> Uploading...</div>}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                              <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition">
                                  {editingId ? 'Update Article' : 'Publish Article'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};