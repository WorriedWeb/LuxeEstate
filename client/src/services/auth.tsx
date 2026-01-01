import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AgentStatus } from '../types';
import { MOCK_USERS, MOCK_AGENTS } from '../constants';
import { mockService } from './mockService';

const API_URL = '/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  updateUserAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent auth
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      (async () => {
        try {
          const parsedUser = JSON.parse(storedUser);
          const validUser = await checkUserStatus(parsedUser);
          if (validUser) setUser(validUser);
          else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (e) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkUserStatus = async (user: User): Promise<User | null> => {
      // Logic to re-validate user from "DB"
      const agents = await mockService.getAgents(true);
      const foundAgent = agents.find(a => a.id === user.id);
      
      if (foundAgent && foundAgent.status === AgentStatus.BLOCKED) {
          return null;
      }
      return user;
  };
  
  const updateUserAvatar = (avatar: string) => {
  setUser(prev =>
    prev ? { ...prev, avatar } : prev
  );
};


  const login = async (email: string, password: string): Promise<User> => {
    // Try backend API first
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (e) {
      // Fallback to mocked logic: network error or backend unavailable
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const allAgents = await mockService.getAgents(true);
            const users = await mockService.getUsers();

            // 1. Check Admin
            if (email.toLowerCase() === 'admin@example.com' && password === 'Admin123') {
              const admin = MOCK_USERS.find(u => u.role === UserRole.ADMIN) || MOCK_USERS[0];
              const mockUser = { ...admin, token: 'mock-token' } as User & { token?: string };
              setUser(mockUser);
              localStorage.setItem('user', JSON.stringify(mockUser));
              localStorage.setItem('token', 'mock-token');
              resolve(mockUser as User);
              return;
            }

            // 2. Check Agents (Dynamic from Service)
            const foundAgent = allAgents.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (foundAgent) {
              if (foundAgent.status === AgentStatus.BLOCKED) {
                reject(new Error('Your account has been suspended. Please contact administration.'));
                return;
              }
              const validPassword = foundAgent.password || 'Agent123';
              if (password === validPassword) {
                const mockUser = { ...foundAgent, token: 'mock-token' } as User & { token?: string };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('token', 'mock-token');
                resolve(mockUser as User);
                return;
              }
            }

            // 3. Check Users
            const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (foundUser) {
              const mockUser = { ...foundUser, token: 'mock-token' } as User & { token?: string };
              setUser(mockUser);
              localStorage.setItem('user', JSON.stringify(mockUser));
              localStorage.setItem('token', 'mock-token');
              resolve(mockUser as User);
              return;
            }

            reject(new Error('Invalid credentials'));
          } catch (err2) {
            reject(err2);
          }
        }, 600);
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};