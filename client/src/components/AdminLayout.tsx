import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

export const AdminLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
      if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT'))) {
          navigate('/login');
      }
  }, [user, navigate, isLoading]);

  if (!user || isLoading) return null;

  const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
          active
            ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <i className={`fas ${icon} w-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-400'}`}></i>
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md z-10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Luxe<span className="text-blue-600">Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1">
            <NavItem to="/admin" icon="fa-chart-pie" label="Dashboard" />
            <NavItem to="/admin/properties" icon="fa-building" label="Properties" />
            <NavItem to="/admin/leads" icon="fa-envelope" label="Leads" />
            <NavItem to="/admin/blog" icon="fa-newspaper" label="Blog Posts" />
            {user.role === 'ADMIN' && (
                <>
                <NavItem to="/admin/agents" icon="fa-user-tie" label="Advisors" />
                <NavItem to="/admin/users" icon="fa-users" label="Users" />
                <NavItem to="/admin/settings" icon="fa-cog" label="Settings" />
                </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4">
            <img src={user.avatar || 'https://via.placeholder.com/40'} alt="User" className="h-8 w-8 rounded-full" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm z-10 p-4 flex justify-between items-center">
             <Link to="/admin" className="font-bold">LuxeAdmin</Link>
             <button onClick={() => { logout(); navigate('/'); }} className="text-gray-600"><i className="fas fa-sign-out-alt"></i></button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};