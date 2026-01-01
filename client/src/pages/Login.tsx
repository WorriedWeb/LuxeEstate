import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in as admin/agent
  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.AGENT)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === UserRole.ADMIN || user.role === UserRole.AGENT) {
          navigate('/admin');
      } else {
          navigate('/');
      }
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Luxe<span className="text-blue-600">Estate</span></h2>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
                Access your dashboard and saved properties
            </p>
        </div>
        
        <div className="bg-white py-8 px-10 shadow-xl rounded-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center border border-red-100">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                <input
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                <input
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition"
                >
                {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};