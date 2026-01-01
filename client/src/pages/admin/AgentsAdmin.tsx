import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { Agent, AgentStatus } from '../../types';
import { Notification } from '../../components/Notification';

export const AgentsAdmin: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Modal States
  const [reassignModal, setReassignModal] = useState<{ open: boolean, agentId: string, agentName: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, agentId: string, agentName: string } | null>(null);
  const [targetAgentId, setTargetAgentId] = useState('');
  
  // Add/Edit Agent State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      licenseNumber: '',
      bio: '',
      avatar: ''
  });
  
  // Validation & Feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
      try {
          const data = await mockService.getAgents(true);
          setAgents(data);
      } catch (err) {
          showNotification('Failed to load advisors', 'error');
      }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
      setNotification({ message, type });
  };

  // --- ACTIONS ---

  const handleOpenCreate = () => {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', password: '', licenseNumber: '', bio: '', avatar: '' });
      setErrors({});
      setIsFormModalOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
      setEditingId(agent.id);
      setFormData({
          name: agent.name,
          email: agent.email,
          phone: agent.phone || '',
          password: '', // Do not populate password on edit for security
          licenseNumber: agent.licenseNumber || '',
          bio: agent.bio || '',
          avatar: agent.avatar || ''
      });
      setErrors({});
      setIsFormModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files[0]) return;

  try {
    setUploadingAvatar(true);
    const file = e.target.files[0];

    const imageUrl = await mockService.uploadImage(file); // 🔥 Cloudinary
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
  } catch (err) {
    console.error('Avatar upload failed:', err);
    alert('Failed to upload profile image');
  } finally {
    setUploadingAvatar(false);
    e.target.value = '';
  }
};


  const validateForm = () => {
      const newErrors: any = {};
      if (!formData.name.trim()) newErrors.name = 'Full Name is required';
      if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
      }
      
      // Password validation: Required on Create, Optional on Edit
      if (!editingId && !formData.password.trim()) {
          newErrors.password = 'Password is required for new advisors';
      }
      
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License ID is required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      try {
          const payload: any = {
              ...formData,
              avatar: formData.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
          };
          
          // Remove password if empty (user didn't want to change it during edit)
          if (editingId && !payload.password) {
              delete payload.password;
          }

          if (editingId) {
              await mockService.updateAgent(editingId, payload);
              showNotification('Advisor updated successfully', 'success');
          } else {
              await mockService.createAgent(payload);
              showNotification('New advisor created successfully', 'success');
          }
          
          setIsFormModalOpen(false);
          loadAgents();
      } catch (error: any) {
          showNotification(error.message || 'Failed to save advisor', 'error');
      }
  };

  const handleStatusChange = async (id: string, newStatus: AgentStatus) => {
      try {
          await mockService.updateAgentStatus(id, newStatus);
          
          if (newStatus !== AgentStatus.ACTIVE) {
              const agent = agents.find(a => a.id === id);
              if (agent && agent.listingsCount > 0) {
                  setReassignModal({ open: true, agentId: id, agentName: agent.name });
              }
          }
          loadAgents();
          showNotification('Status updated', 'success');
      } catch (e) {
          showNotification('Failed to update status', 'error');
      }
  };

  const handleDeleteClick = (agent: Agent) => {
      setDeleteModal({ open: true, agentId: agent.id, agentName: agent.name });
  };

  const confirmDelete = async () => {
      if (!deleteModal) return;
      try {
          await mockService.deleteAgent(deleteModal.agentId);
          showNotification('Advisor deleted successfully', 'success');
          setDeleteModal(null);
          loadAgents();
      } catch (error: any) {
          setDeleteModal(null);
          showNotification(error.message, 'error');
      }
  };

  const handleReassign = async () => {
      if ((reassignModal || deleteModal) && targetAgentId) {
          const sourceId = reassignModal ? reassignModal.agentId : (deleteModal ? deleteModal.agentId : '');
          try {
              await mockService.reassignListings(sourceId, targetAgentId);
              setReassignModal(null);
              // If we were deleting, try delete again after reassign
              if (deleteModal) {
                  await confirmDelete(); 
              } else {
                  setTargetAgentId('');
                  loadAgents();
                  showNotification('Listings reassigned successfully', 'success');
              }
          } catch (e) {
              showNotification('Reassignment failed', 'error');
          }
      }
  };

  return (
    <div>
        {notification && (
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(null)} 
            />
        )}

        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Advisor Management</h1>
                <p className="text-sm text-gray-500">Manage your real estate team</p>
            </div>
            <button 
                onClick={handleOpenCreate}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center shadow-md font-bold transition"
            >
                <i className="fas fa-plus mr-2"></i> Add New Advisor
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advisor Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map(agent => (
                        <tr key={agent.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                        <img className="h-full w-full object-cover" src={agent.avatar} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-bold text-gray-900">{agent.name}</div>
                                        <div className="text-xs text-gray-500">{agent.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                {agent.listingsCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {agent.licenseNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <select 
                                    className={`bg-transparent text-xs font-bold rounded-full px-2 py-1 border-none focus:ring-0 cursor-pointer uppercase tracking-wide
                                        ${agent.status === 'ACTIVE' ? 'text-green-700 bg-green-50' : 
                                          agent.status === 'ON_LEAVE' ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'}`}
                                    value={agent.status}
                                    onChange={(e) => handleStatusChange(agent.id, e.target.value as AgentStatus)}
                                >
                                    <option value={AgentStatus.ACTIVE}>Active</option>
                                    <option value={AgentStatus.ON_LEAVE}>On Leave</option>
                                    <option value={AgentStatus.BLOCKED}>Blocked</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => handleOpenEdit(agent)}
                                    className="text-blue-600 hover:text-blue-900 mr-4 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition"
                                >
                                    <i className="fas fa-edit mr-1"></i> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(agent)}
                                    className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition"
                                >
                                    <i className="fas fa-trash-alt mr-1"></i> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Add/Edit Agent Modal */}
        {isFormModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Advisor Details' : 'Add New Advisor'}</h3>
                        <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition">
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveAgent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name *</label>
                                <input 
                                    type="text" 
                                    className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-blue-500'}`}
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">License ID *</label>
                                <input 
                                    type="text" 
                                    className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.licenseNumber ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-blue-500'}`}
                                    value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                                />
                                {errors.licenseNumber && <p className="text-xs text-red-500 mt-1">{errors.licenseNumber}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address *</label>
                            <input 
                                type="email" 
                                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-blue-500'}`}
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                             {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                {editingId ? 'New Password (Optional)' : 'Password *'}
                            </label>
                            <input 
                                type="text" 
                                placeholder={editingId ? 'Leave blank to keep current' : 'Set a login password'}
                                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.password ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-blue-500'}`}
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                             {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number *</label>
                            <input 
                                type="text" 
                                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.phone ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:ring-blue-500'}`}
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                             {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>

                        <div>
  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
    Profile Photo
  </label>

  <div className="flex items-center gap-4">
    {/* Preview */}
    <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
      {formData.avatar ? (
        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <i className="fas fa-user text-gray-400 text-xl"></i>
      )}
    </div>

    {/* Upload */}
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploadingAvatar}
        className="hidden"
      />
      <span className={`px-4 py-2 rounded-lg text-sm font-bold transition
        ${uploadingAvatar 
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
      </span>
    </label>
  </div>
</div>


                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bio</label>
                            <textarea 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                             <button 
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                className="text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                            >
                                {editingId ? 'Save Changes' : 'Create Advisor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                 <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Advisor?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Are you sure you want to remove <strong>{deleteModal.agentName}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setDeleteModal(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-md"
                        >
                            Yes, Delete
                        </button>
                    </div>
                 </div>
             </div>
        )}

        {/* Reassign Listings Modal (Triggered by Delete or Status change if active listings exist) */}
        {reassignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4 text-yellow-600">
                         <i className="fas fa-exclamation-circle text-xl"></i>
                         <h3 className="text-lg font-bold text-gray-900">Action Required</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6">
                        <strong>{reassignModal.agentName}</strong> has active listings. You must reassign them to another advisor before proceeding.
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select New Advisor</label>
                        <select 
                            className="w-full border-gray-200 rounded-lg p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={targetAgentId}
                            onChange={(e) => setTargetAgentId(e.target.value)}
                        >
                            <option value="">-- Select Advisor --</option>
                            {agents
                                .filter(a => a.status === AgentStatus.ACTIVE && a.id !== reassignModal.agentId)
                                .map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => { setReassignModal(null); setDeleteModal(null); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReassign}
                            disabled={!targetAgentId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                        >
                            Reassign & Proceed
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};