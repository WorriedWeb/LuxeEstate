import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { useAuth } from '../../services/auth';
import { Lead } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalProperties: 0, activeLeads: 0, totalAgents: 0, totalUsers: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    mockService.getDashboardStats().then(setStats);
    mockService.getLeads().then(setRecentLeads);
  }, []);

  const StatCard = ({ title, value, icon, color, link }: any) => (
    <Link to={link} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-xl mr-4`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h4 className="text-gray-500 text-sm font-medium uppercase">{title}</h4>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Link>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500">Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Properties" value={stats.totalProperties} icon="fa-home" color="bg-blue-600" link="/admin/properties" />
        <StatCard title="New Leads" value={stats.activeLeads} icon="fa-user-clock" color="bg-yellow-500" link="/admin/leads" />
        {user?.role === 'ADMIN' && (
          <>
            <StatCard title="Active Agents" value={stats.totalAgents} icon="fa-user-tie" color="bg-green-500" link="/admin/agents" />
            <StatCard title="Total Users" value={stats.totalUsers} icon="fa-users" color="bg-purple-500" link="/admin/users" />
          </>
        )}
      </div>

      {/* Recent Activity Mockup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Leads</h3>
            <Link to="/admin/leads" className="text-blue-600 text-sm font-bold hover:underline">View All Leads</Link>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Action</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {recentLeads.map((lead) => (
                    <tr key={lead.id}>
                        <td className="py-3">{lead.name}</td>
                        <td><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{lead.status}</span></td>
                        <td className="text-gray-500">{formatDate(lead.createdAt)}</td>
                        <td><Link to="/admin/leads" className="text-blue-600 hover:text-blue-800 font-bold text-xs">View Details</Link></td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};