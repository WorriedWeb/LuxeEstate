import { Property, Lead, Agent, User, PropertyStatus, AgentStatus, UserRole, BlogPost } from '../types';
import { normalizeMongoArray, normalizeMongoObject } from '../utils/normalize';
// Backend API URL
// For local development: http://localhost:5000/api
// For production: configured via environment variables
const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MockService {
  constructor() {
    console.log(`Using Backend API at: ${API_URL}`);
  }

  private async handleResponse(res: Response) {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API Error: ${res.status}`);
    }
    return res.json();
  }

  // --- IMAGE UPLOAD SERVICE ---
async uploadImage(file: File): Promise<string> {
  // Cloudinary configuration defaults
  const CLOUD_NAME = "dxpblw3ks"; // Demo Cloud Name
  const UPLOAD_PRESET = "photo_upload";

  if (CLOUD_NAME && UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Cloudinary Upload Failed");
      }

      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.warn(
        "Cloudinary upload failed, falling back to local compression.",
        error
      );
    }
  }

  throw new Error("Image upload failed");
}

  // --- PROPERTIES ---

  
  async getProperties(filters?: any): Promise<Property[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, String(filters[key]));
        }
      });
    }

    const res = await fetch(`${API_URL}/properties?${params.toString()}`);
    const data = await this.handleResponse(res);

    // 🔥 NORMALIZE MongoDB _id → frontend id
    return data.map((p: any) => ({
      ...p,
      id: p._id,
    }));
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const res = await fetch(`${API_URL}/properties/${slug}`);
    if (!res.ok) return undefined;
    return this.handleResponse(res);
  }

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'slug'>): Promise<Property> {
    const slug = property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...property, slug })
    });
    return this.handleResponse(res);
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_URL}/properties/id/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return this.handleResponse(res);
  }

  async deleteProperty(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE' });
    await this.handleResponse(res);
    return true;
  }

  // --- LEADS ---
  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    return this.handleResponse(res);
  }

  async getLeads(currentUser?: User): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (currentUser?.id) {
      params.append('userId', currentUser.id);
      params.append('role', currentUser.role);
    }
    const res = await fetch(`${API_URL}/leads?${params.toString()}`);
    return this.handleResponse(res);
  }

  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    const res = await fetch(`${API_URL}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }

  async assignLead(leadId: string, agentId: string): Promise<Lead> {
    const res = await fetch(`${API_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedAgentId: agentId })
    });
    return this.handleResponse(res);
  }

  // --- AGENTS ---
  async getAgents(includeInactive = false): Promise<Agent[]> {
    const res = await fetch(`${API_URL}/agents?includeInactive=${includeInactive}`);
    const data = this.handleResponse(res);
    return normalizeMongoArray<Agent>(await data);
  }


  // --- GET AGENT BY ID (FULL DETAILS) ---
async getAgentById(agentId: string): Promise<{
  agent: Agent;
  properties: Property[];
  leads: Lead[];
  stats: {
    totalProperties: number;
    activeLeads: number;
  };
}> {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  const res = await fetch(`${API_URL}/agents/${agentId}`);
  const data = await this.handleResponse(res);

  // DO NOT normalize array here — this is an object response
  return {
    agent: normalizeMongoObject<Agent>(data.agent),
    properties: normalizeMongoArray<Property>(data.properties),
    leads: normalizeMongoArray<Lead>(data.leads),
    stats: data.stats
  };
}

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${API_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData)
    });
    return this.handleResponse(res);
  }

  async updateAgentStatus(id: string, status: AgentStatus): Promise<Agent> {
    return this.updateAgent(id, { status });
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${API_URL}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return this.handleResponse(res);
  }

  async deleteAgent(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
    await this.handleResponse(res);
    return true;
  }

  async reassignListings(oldAgentId: string, newAgentId: string): Promise<void> {
    await fetch(`${API_URL}/agents/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldAgentId, newAgentId })
    });
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`);
    const data = this.handleResponse(res);
    return normalizeMongoArray<User>(await data);
  }

  async updateUserAvatar(id: string, avatar: string) {
  const res = await fetch(`${API_URL}/users/${id}/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar }),
  });

  return this.handleResponse(res);
}

  async createUser(userData: { name: string; email: string; password: string }): Promise<User> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(data.error || 'Failed to register');
    }
    return res.json();
  }

  async toggleUserBlock(id: string): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}/toggle-block`, { method: 'PUT' });
    return this.handleResponse(res);
  }

  // --- NEWSLETTER ---
  
  async subscribeNewsletter(email: string) {
  const res = await fetch(`${API_URL}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  return this.handleResponse(res);
}

// --- BLOG ---
  
 async getBlogPosts(authorId?: string): Promise<BlogPost[]> {
    let url = `${API_URL}/blog`;
    if (authorId) url += `?authorId=${authorId}`;

    const res = await fetch(url);
    const data = await this.handleResponse(res);

    return normalizeMongoArray<BlogPost>(await data);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const res = await fetch(`${API_URL}/blog/${slug}`);
    if (!res.ok) return undefined;
    return this.handleResponse(res);
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'slug'>): Promise<BlogPost> {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = await fetch(`${API_URL}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, slug })
    });
    return this.handleResponse(res);
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_URL}/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return this.handleResponse(res);
  }

  async deleteBlogPost(id: string): Promise<void> {
    await fetch(`${API_URL}/blog/${id}`, { method: 'DELETE' });
  }

  // --- ANALYTICS ---
  async getDashboardStats() {
    const res = await fetch(`${API_URL}/dashboard`);
    return this.handleResponse(res);
  }

  // Gemini Integration (Client Side for now)
  async generatePropertyDescription(title: string, features: any): Promise<string> {
      return `Indulge in the epitome of luxury with this magnificent residence, "${title}". Boasting ${features.bedrooms} expansive bedrooms and ${features.bathrooms} designer bathrooms, this ${features.sqft} sqft estate is a masterpiece of modern living. Constructed in ${features.yearBuilt}, every detail has been meticulously curated to offer an unparalleled lifestyle of comfort and sophistication.`;
  }
}

export const mockService = new MockService();