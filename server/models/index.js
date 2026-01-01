import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ADMIN', 'AGENT', 'USER'], default: 'USER' },
  avatar: { type: String, default: '' },
  phone: String,
  password: { type: String, select: false }
});

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'AGENT' },
  avatar: String,
  phone: String,
  bio: String,
  licenseNumber: String,
  listingsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'BLOCKED'], default: 'ACTIVE' },
  password: { type: String }
});

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  location: {
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    lat: Number,
    lng: Number
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    sqft: Number,
    yearBuilt: Number
  },
  amenities: [String],
  images: [String],
  agentId: { type: String},
  status: { type: String, enum: ['FOR_SALE', 'SOLD', 'PENDING', 'FOR_RENT'], default: 'FOR_SALE' },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LeadSchema = new mongoose.Schema({
  propertyId: String,
  assignedAgentId: String,
  name: { type: String, required: true },
  email: String,
  phone: String,
  message: String,
  status: { type: String, enum: ['NEW', 'CONTACTED', 'CLOSED'], default: 'NEW' },
  createdAt: { type: Date, default: Date.now }
});

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  image: String,
  author: String,
  authorId: String,
  date: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
export const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);