import React from 'react';
import { Link } from 'react-router-dom';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">
                Join LuxeEstate to save properties and get alerts.
            </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" required />
                <input type="email" placeholder="Email Address" className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" required />
                <input type="password" placeholder="Password" className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" required />
                <input type="password" placeholder="Confirm Password" className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" required />
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition">
                Sign Up
            </button>
        </form>

        <div className="text-center">
            <p className="text-sm text-gray-600">
                Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</Link>
            </p>
        </div>
      </div>
    </div>
  );
};