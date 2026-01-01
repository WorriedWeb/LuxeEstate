export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  USER = 'USER'
}

export enum PropertyStatus {
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  PENDING = 'PENDING',
  FOR_RENT = 'FOR_RENT'
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  BLOCKED = 'BLOCKED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lng: number;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
  };
  amenities: string[];
  images: string[];
  agentId: string;
  status: PropertyStatus;
  type: 'House' | 'Apartment' | 'Condo' | 'Villa' | 'Land' | 'Penthouse';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorId: string;
  date: string;
  category: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  propertyId?: string; // Optional: If null, it's a general contact form inquiry
  assignedAgentId?: string; // Optional: Used for general inquiries assigned by Admin
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

export interface Agent extends User {
  bio: string;
  licenseNumber: string;
  listingsCount: number;
  status: AgentStatus;
  password?: string; // Added password field for auth
}

// src/types/base.ts

export interface BaseEntity {
  id: string;
}
