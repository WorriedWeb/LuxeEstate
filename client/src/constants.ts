
import { Property, PropertyStatus, User, UserRole, Agent, Lead, AgentStatus, BlogPost } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'Jane Advisor',
    email: 'agent@example.com',
    role: UserRole.AGENT,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '3',
    name: 'John Advisor',
    email: 'john@example.com',
    role: UserRole.AGENT,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const MOCK_AGENTS: Agent[] = [
  {
    ...MOCK_USERS[1] as Agent,
    bio: 'Top selling advisor with over 10 years of experience in the luxury market. specialized in high-value property transactions.',
    licenseNumber: 'CA-BRE-123456',
    listingsCount: 12,
    status: AgentStatus.ACTIVE
  },
  {
    ...MOCK_USERS[2] as Agent,
    bio: 'Specializing in modern homes and penthouses. Dedicated to finding your perfect urban sanctuary.',
    licenseNumber: 'NY-RE-987654',
    listingsCount: 8,
    status: AgentStatus.ACTIVE
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Sunset Villa',
    slug: 'modern-sunset-villa',
    description: 'Experience luxury living in this stunning modern villa featuring panoramic sunset views. This architectural masterpiece offers an open floor plan, floor-to-ceiling windows, and a state-of-the-art kitchen. The outdoor area is an entertainer\'s dream with an infinity pool and spacious deck.',
    price: 2500000,
    location: {
      address: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90069',
      country: 'USA',
      lat: 34.0928,
      lng: -118.3287
    },
    features: {
      bedrooms: 5,
      bathrooms: 4.5,
      sqft: 4200,
      yearBuilt: 2022
    },
    amenities: ['Infinity Pool', 'Smart Home', 'Wine Cellar', 'Home Theater', 'Spa', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1600&q=80'
    ],
    agentId: '2',
    status: PropertyStatus.FOR_SALE,
    type: 'Villa',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Downtown Penthouse',
    slug: 'downtown-penthouse',
    description: 'Luxurious penthouse in the heart of the city with floor-to-ceiling windows offering breathtaking skyline views. Features include a private elevator, wrap-around terrace, and custom Italian cabinetry.',
    price: 1800000,
    location: {
      address: '456 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      lat: 40.7128,
      lng: -74.0060
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2800,
      yearBuilt: 2019
    },
    amenities: ['Concierge', 'Private Elevator', 'Rooftop Terrace', 'Gym', 'Parking', 'WiFi'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
    ],
    agentId: '3',
    status: PropertyStatus.FOR_SALE,
    type: 'Apartment',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Cozy Family Home',
    slug: 'cozy-family-home',
    description: 'Perfect starter home for a growing family in a quiet neighborhood. Large backyard, newly renovated kitchen, and close to top-rated schools.',
    price: 650000,
    location: {
      address: '789 Oak Ln',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'USA',
      lat: 30.2672,
      lng: -97.7431
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      sqft: 2100,
      yearBuilt: 2015
    },
    amenities: ['Large Backyard', 'Fireplace', 'Hardwood Floors', 'Garage', 'Laundry Room'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80'
    ],
    agentId: '2',
    status: PropertyStatus.PENDING,
    type: 'House',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Seaside Retreat',
    slug: 'seaside-retreat',
    description: 'Escape to this beautiful seaside retreat. Direct beach access, stunning ocean views, and a breezy open layout make this the perfect vacation home.',
    price: 3200000,
    location: {
      address: '101 Ocean Dr',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
      country: 'USA',
      lat: 25.7617,
      lng: -80.1918
    },
    features: {
      bedrooms: 6,
      bathrooms: 6,
      sqft: 5500,
      yearBuilt: 2023
    },
    amenities: ['Private Beach', 'Infinity Pool', 'Guesthouse', 'Boat Dock', 'Smart Home'],
    images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', 
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80'
    ],
    agentId: '3',
    status: PropertyStatus.FOR_SALE,
    type: 'Villa',
    createdAt: new Date(Date.now() - 200000000).toISOString()
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    propertyId: '1',
    name: 'Alice Buyer',
    email: 'alice@test.com',
    phone: '555-0101',
    message: 'Is this property still available?',
    status: 'NEW',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    propertyId: '2',
    name: 'Bob Investor',
    email: 'bob@test.com',
    phone: '555-0102',
    message: 'I would like to schedule a viewing.',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Interior Design Trends for 2024',
    slug: 'top-10-interior-design-trends-2024',
    excerpt: 'Discover the latest trends that are transforming luxury homes this year, from sustainable materials to biophilic design.',
    content: `
      <p>Interior design is constantly evolving, and 2024 is shaping up to be a year of bold choices and sustainable living. In the world of luxury real estate, buyers are looking for homes that are not only beautiful but also functional and environmentally conscious.</p>
      <h3>1. Biophilic Design</h3>
      <p>Bringing the outdoors in continues to be a massive trend. Think large living walls, natural stone materials, and maximizing natural light through floor-to-ceiling windows. It's about creating a serene sanctuary that connects you with nature.</p>
      <h3>2. Sustainable Luxury</h3>
      <p>High-end homeowners are increasingly prioritizing sustainability. This means reclaimed wood flooring, energy-efficient appliances, and smart home systems that reduce carbon footprints without sacrificing comfort.</p>
      <h3>3. Warm Minimalism</h3>
      <p>Gone are the days of stark, cold minimalist spaces. The new luxury is "warm minimalism"—clean lines paired with warm textures like boucle fabrics, natural woods, and soft, earthy color palettes.</p>
    `,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    author: 'Jane Advisor',
    authorId: '2',
    date: 'Oct 15, 2024',
    category: 'Design',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Investing in Real Estate: A Beginner’s Guide',
    slug: 'investing-in-real-estate-beginners-guide',
    excerpt: 'Everything you need to know before making your first property investment, from analyzing markets to understanding ROI.',
    content: `
      <p>Real estate remains one of the safest and most profitable long-term investments. However, for beginners, the market can seem daunting. Here is a breakdown of how to get started in luxury property investment.</p>
      <h3>Location, Location, Location</h3>
      <p>It's a cliché for a reason. When investing, the potential for appreciation is heavily tied to the neighborhood. Look for areas with developing infrastructure, good schools, and proximity to amenities.</p>
      <h3>Rental Yield vs. Capital Appreciation</h3>
      <p>Decide your strategy early. Are you looking for monthly cash flow (rental yield) or do you want to sell the property for a profit in 5 years (capital appreciation)? In luxury markets, capital appreciation is often the primary driver.</p>
    `,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    author: 'John Advisor',
    authorId: '3',
    date: 'Oct 10, 2024',
    category: 'Investment',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'The Ultimate Guide to Luxury Living in LA',
    slug: 'luxury-living-la-guide',
    excerpt: 'Explore the most exclusive neighborhoods and amenities in Los Angeles, the city of stars.',
    content: `
      <p>Los Angeles is a sprawling metropolis known for its celebrity residents, stunning beaches, and world-class entertainment. But where do the ultra-wealthy live?</p>
      <h3>Beverly Hills</h3>
      <p>The crown jewel of LA. Famous for Rodeo Drive and the Beverly Hills Hotel, this area offers large estates with privacy hedges and immaculate landscaping.</p>
      <h3>Malibu</h3>
      <p>For those who prefer the ocean breeze, Malibu offers beachfront properties that redefine luxury. It's a retreat from the city noise, offering a laid-back yet exclusive lifestyle.</p>
    `,
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
    author: 'Jane Advisor',
    authorId: '2',
    date: 'Oct 05, 2024',
    category: 'Lifestyle',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];
