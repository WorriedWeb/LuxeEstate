import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { Lead, Agent, UserRole } from '../../types';
import { useAuth } from '../../services/auth';
import { Notification } from '../../components/Notification';

export const LeadsAdmin: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
      if (user) {
          const leadsData = await mockService.getLeads(user);
          setLeads(leadsData);

          // Only Admin needs list of agents to assign
          if (user.role === UserRole.ADMIN) {
              const agentsData = await mockService.getAgents();
              setAgents(agentsData);
          }
      }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
      setNotification({ message, type });
  };

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
      try {
          await mockService.updateLeadStatus(id, newStatus);
          loadData();
          // Update selected modal data if needed
          if (selectedLead && selectedLead.id === id) {
              setSelectedLead(prev => prev ? ({...prev, status: newStatus}) : null);
          }
          showNotification('Status updated', 'success');
      } catch (e) {
          showNotification('Failed to update status', 'error');
      }
  };

  const handleAssignAgent = async (leadId: string, agentId: string) => {
      try {
          await mockService.assignLead(leadId, agentId);
          loadData();
          if (selectedLead && selectedLead.id === leadId) {
              setSelectedLead(prev => prev ? ({...prev, assignedAgentId: agentId}) : null);
          }
          showNotification('Agent assigned successfully', 'success');
      } catch (e) {
          showNotification('Failed to assign agent', 'error');
      }
  };

  return (
    <div>
        {notification && (
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {user?.role === 'ADMIN' ? 'All Leads & Inquiries' : 'My Leads'}
        </h1>
        
        {leads.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                <i className="far fa-envelope-open text-4xl mb-4"></i>
                <p>No leads found.</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                {user?.role === UserRole.ADMIN && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agent</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map(lead => {
                                const isGeneralInquiry = !lead.propertyId;
                                return (
                                <tr key={lead.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900">{lead.name}</div>
                                        <div className="text-xs text-gray-500">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isGeneralInquiry ? (
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">General Inquiry</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">Property Listing</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{lead.message}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={lead.status} 
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-xs font-bold uppercase px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
                                                lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                                                lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            <option value="NEW">New</option>
                                            <option value="CONTACTED">Contacted</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </td>
                                    {user?.role === UserRole.ADMIN && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isGeneralInquiry ? (
                                                <select
                                                    value={lead.assignedAgentId || ''}
                                                    onChange={(e) => handleAssignAgent(lead.id, e.target.value)}
                                                    className="text-xs border-gray-200 rounded-lg py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">-- Unassigned --</option>
                                                    {agents.map(a => (
                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Property Owner</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => setSelectedLead(lead)}
                                            className="text-blue-600 hover:text-blue-900 font-bold text-xs"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                            <p className="text-gray-500 text-sm">Lead ID: #{selectedLead.id}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedLead(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <div className="text-sm font-medium break-all">{selectedLead.email}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                <div className="text-sm font-medium">{selectedLead.phone || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-xs font-bold text-blue-500 uppercase mb-2">Message</label>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
                        </div>

                        {user?.role === UserRole.ADMIN && !selectedLead.propertyId && (
                             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <label className="block text-xs font-bold text-yellow-700 uppercase mb-2">Assign to Agent</label>
                                <select
                                    value={selectedLead.assignedAgentId || ''}
                                    onChange={(e) => handleAssignAgent(selectedLead.id, e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Unassigned --</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Received</label>
                                <div className="text-sm">{new Date(selectedLead.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                <select 
                                    value={selectedLead.status} 
                                    onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as any)}
                                    className="border border-gray-300 rounded text-sm p-1"
                                >
                                    <option key="NEW" value="NEW">New</option>
                                    <option key="CONTACTED" value="CONTACTED">Contacted</option>
                                    <option key="CLOSED" value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                         <a href={`mailto:${selectedLead.email}`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200">
                             Email
                         </a>
                         {selectedLead.phone && (
                            <a href={`tel:${selectedLead.phone}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                                Call Now
                            </a>
                         )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};