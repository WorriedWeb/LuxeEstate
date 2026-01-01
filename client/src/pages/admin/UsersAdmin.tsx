import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { User } from '../../types';
import { useAuth } from '../../services/auth';

export const UsersAdmin: React.FC = () => {
  const { updateUserAvatar } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);


  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
      const data = await mockService.getUsers();
      setUsers(data);
  };

  const handleBlockToggle = async (id: string) => {
      await mockService.toggleUserBlock(id);
      loadUsers(); // Refresh list
  };

  const handleAvatarUpload = async (file: File) => {
  if (!editingUser) return;

  try {
    setUploadingAvatar(true);
    const avatarUrl = await mockService.uploadImage(file);

    await mockService.updateUserAvatar(editingUser.id, avatarUrl);
    setEditingUser(null);
    updateUserAvatar(avatarUrl);
    loadUsers();
  } catch (err) {
    console.error('Avatar update failed:', err);
    alert('Failed to update avatar');
  } finally {
    setUploadingAvatar(false);
  }
};


  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => {
                        const isBlocked = user.name.includes('(BLOCKED)');
                        return (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <img
  className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
  src={user.avatar || 'https://via.placeholder.com/150'}
  onClick={() => setEditingUser(user)}
  title="Click to change avatar"
/>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name.replace(' (BLOCKED)', '')}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {isBlocked ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Blocked
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button 
                                        onClick={() => handleBlockToggle(user.id)}
                                        className={`font-bold transition ${isBlocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                                    >
                                        {isBlocked ? 'Unblock' : 'Block Access'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
      <h3 className="text-lg font-bold mb-4">Update Avatar</h3>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={editingUser.avatar || 'https://via.placeholder.com/150'}
          className="h-16 w-16 rounded-full object-cover"
        />

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleAvatarUpload(e.target.files[0]);
              }
            }}
            disabled={uploadingAvatar}
          />
          <span className={`px-4 py-2 rounded-lg text-sm font-bold transition
            ${uploadingAvatar
              ? 'bg-gray-300 text-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploadingAvatar ? 'Uploading…' : 'Upload New Photo'}
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setEditingUser(null)}
          className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        </div>
    </div>
  );
};