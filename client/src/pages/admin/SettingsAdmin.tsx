import React, { useState } from 'react';
import { Notification } from '../../components/Notification';

export const SettingsAdmin: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'LuxeEstate',
    contactEmail: 'contact@luxeestate.com',
    phoneNumber: '+1 (800) 555-0199',
    address: '123 Luxury Lane, Beverly Hills, CA',
    facebookUrl: 'https://facebook.com/luxeestate',
    twitterUrl: 'https://twitter.com/luxeestate',
    maintenanceMode: false
  });
  
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would PATCH to /api/settings
    setNotification({ message: 'Settings saved successfully!', type: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">General Information</h2>
            <p className="text-sm text-gray-500">Update your company details and public contact info.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="text" name="phoneNumber" value={settings.phoneNumber} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                    <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                 <h2 className="text-lg font-bold text-gray-800 mb-4">Social Media</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                        <input type="text" name="facebookUrl" value={settings.facebookUrl} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                        <input type="text" name="twitterUrl" value={settings.twitterUrl} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white text-gray-900" />
                    </div>
                 </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Maintenance Mode</h2>
                        <p className="text-sm text-gray-500">Temporarily disable the public site.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};