import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyStatus, UserRole, AgentStatus } from '../../types';
import { mockService } from '../../services/mockService';
import { useAuth } from '../../services/auth';
import { Notification } from '../../components/Notification';

// Declare Leaflet globally since we import it via script tag
declare const L: any;

export const PropertiesAdmin: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'features' | 'media'>('basic');
  
  // Empty State for new Property
  const initialFormState: Partial<Property> = {
    title: '', 
    price: 0, 
    status: PropertyStatus.FOR_SALE, 
    type: 'House',
    description: '',
    location: { address: '', city: '', state: '', zip: '', country: 'USA', lat: 34.0522, lng: -118.2437 },
    features: { bedrooms: 3, bathrooms: 2, sqft: 2000, yearBuilt: 2024 },
    images: [],
    amenities: [], 
    agentId: user?.id || ''
  };

  const [formData, setFormData] = useState<Partial<Property>>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Lists for dropdowns/checkboxes
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Villa', 'Land', 'Penthouse'];
  const commonAmenities = [
      'Pool', 'Gym', 'Spa', 'Garage', 'Garden', 'Smart Home', 'Fireplace', 
      'Elevator', 'Security System', 'Wine Cellar', 'Ocean View', 'Guesthouse'
  ];

  useEffect(() => {
    loadProperties();
    loadAgents();
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error') => {
      setNotification({ message, type });
  };

  // Leaflet Map Initialization Logic
  useEffect(() => {
    // Only initialize map if modal is open, tab is location, and map container exists
    if (isModalOpen && activeTab === 'location' && mapContainerRef.current && !mapInstanceRef.current) {
        
        // Default to LA if no coords, or current property coords
        const lat = formData.location?.lat || 34.0522;
        const lng = formData.location?.lng || -118.2437;

        // Init Map
        const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add Draggable Marker
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        
        marker.on('dragend', function(event: any) {
            const position = marker.getLatLng();
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location!,
                    lat: parseFloat(position.lat.toFixed(6)),
                    lng: parseFloat(position.lng.toFixed(6))
                }
            }));
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Fix for map rendering issues in modals (resize triggering)
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } 
    
    // Update marker position if coordinates change externally (e.g. via inputs)
    if (mapInstanceRef.current && markerRef.current && formData.location) {
        const { lat, lng } = formData.location;
        const currentLatLng = markerRef.current.getLatLng();
        
        // Only move if significantly different to prevent loop
        if (Math.abs(currentLatLng.lat - lat) > 0.0001 || Math.abs(currentLatLng.lng - lng) > 0.0001) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.setView([lat, lng], 13);
        }
    }

    // Cleanup function
    return () => {
        if (!isModalOpen || activeTab !== 'location') {
             if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        }
    };
  }, [isModalOpen, activeTab, formData.location?.lat, formData.location?.lng]);


  const loadProperties = async () => {
    const filters = user?.role === UserRole.AGENT 
        ? { agentId: user.id, ignoreStatus: true } 
        : { ignoreStatus: true };
    const data = await mockService.getProperties(filters);
    setProperties(data);
    console.log("Loaded properties:", data);
  };

  const loadAgents = async () => {
      const data = await mockService.getAgents(false); 
      setAgents(data);
  };

 const handleEdit = (prop: Property) => {
  const { _id, ...safeData } = prop as any;

  setEditingId(_id); // URL param ONLY
  setFormData(JSON.parse(JSON.stringify(safeData))); // NO _id in form
  setActiveTab('basic');
  setIsModalOpen(true);
};


  const handleCreate = () => {
    setEditingId(null);
    setFormData({ ...initialFormState, agentId: user?.role === UserRole.AGENT ? user.id : agents[0]?.id });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log("DELETE ID:", id);
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        try {
            await mockService.deleteProperty(id);
            showNotification('Property deleted successfully', 'success');
            loadProperties();
        } catch (e) {
            showNotification('Failed to delete property', 'error');
        }
    }
  };

const handleSave = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  console.log('SAVE MODE:', editingId ? 'UPDATE' : 'CREATE', editingId);

  const errors = [];
  if (!formData.title) errors.push("Title is required");
  if (!formData.price) errors.push("Price is required");
  if (!formData.location?.address) errors.push("Address is required");
  if (!formData.images || formData.images.length === 0) errors.push("At least one image is required");

  if (errors.length > 0) {
    showNotification(errors[0], 'error');
    return;
  }

  try {
    if (editingId) {
      // 🔥 UPDATE ONLY
      await mockService.updateProperty(editingId, formData);
      showNotification('Property updated successfully', 'success');
    } else {
      // 🔥 CREATE ONLY
      await mockService.createProperty(formData as any);
      showNotification('Property created successfully', 'success');
    }

    setIsModalOpen(false);
    setEditingId(null);
    loadProperties();
  } catch (error: any) {
    console.error("Save error:", error);
    showNotification("Error saving property. Please try again.", 'error');
  }
};

  const addImageUrl = () => {
      if (newImageUrl && formData.images) {
          setFormData({ ...formData, images: [...formData.images, newImageUrl] });
          setNewImageUrl('');
      } else if (newImageUrl) {
          setFormData({ ...formData, images: [newImageUrl] });
          setNewImageUrl('');
      }
  };

  // Image Upload Handling (Cloudinary or Local Fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploadingImage(true);
          try {
              const file = e.target.files[0];
              const imageUrl = await mockService.uploadImage(file);
              const currentImages = formData.images || [];
              setFormData({ ...formData, images: [...currentImages, imageUrl] });
              showNotification('Image uploaded successfully', 'success');
          } catch (error) {
              console.error("Upload failed", error);
              showNotification('Failed to upload image', 'error');
          } finally {
              setUploadingImage(false);
              // Reset input
              e.target.value = '';
          }
      }
  };

  const removeImage = (index: number) => {
      if (formData.images) {
          const newImages = [...formData.images];
          newImages.splice(index, 1);
          setFormData({ ...formData, images: newImages });
      }
  };

  const toggleAmenity = (amenity: string) => {
      const current = formData.amenities || [];
      const updated = current.includes(amenity) 
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      setFormData({ ...formData, amenities: updated });
  };

  const generateDescription = async () => {
      if (!formData.title) return showNotification("Please enter a title first", 'error');
      setGeneratingDesc(true);
      try {
        const desc = await mockService.generatePropertyDescription(formData.title!, formData.features);
        setFormData(prev => ({...prev, description: desc}));
        showNotification("Description generated!", 'success');
      } catch (e) {
          showNotification("Failed to generate description", 'error');
      } finally {
        setGeneratingDesc(false);
      }
  };

  const detectLocation = async () => {
      if (!formData.location?.address || !formData.location?.city) {
          showNotification("Please enter at least an Address and City first.", 'error');
          return;
      }
      setDetectingLocation(true);
      const query = `${formData.location.address}, ${formData.location.city}, ${formData.location.state || ''}, ${formData.location.country || ''}`;
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data && data.length > 0) {
              const result = data[0];
              const newLat = parseFloat(result.lat);
              const newLng = parseFloat(result.lon);
              
              setFormData({
                  ...formData,
                  location: {
                      ...formData.location!,
                      lat: newLat,
                      lng: newLng
                  }
              });
              showNotification("Location found!", 'success');
              // Map will auto-update via useEffect dependency
          } else {
              showNotification("Could not find coordinates. Please drag the pin on the map.", 'error');
          }
      } catch (error) {
          console.error("Geocoding error:", error);
          showNotification("Error connecting to map service.", 'error');
      } finally {
          setDetectingLocation(false);
      }
  };

  return (
    <div>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === UserRole.AGENT ? 'My Listings' : 'All Properties'}
            </h1>
            <p className="text-gray-500 text-sm">Manage your real estate inventory</p>
        </div>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center shadow-md font-bold transition">
            <i className="fas fa-plus mr-2"></i> Add New Property
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {properties.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <i className="far fa-folder-open text-4xl mb-3"></i>
                <p>No properties found. Start adding some!</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Status</th>
                        {user?.role === UserRole.ADMIN && (
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Advisor</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Added</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map(p =>(
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                        <img className="h-full w-full object-cover" src={p.images[0] || 'https://via.placeholder.com/150'} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.location.city}, {p.location.state}</div>
                                        <div className="text-xs text-gray-400 mt-1">{p.features.bedrooms}bd • {p.features.bathrooms}ba • {p.features.sqft}sqft</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">${p.price.toLocaleString()}</div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                    ${p.status === 'FOR_SALE' ? 'bg-green-100 text-green-800' : 
                                      p.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {p.status.replace('_', ' ')}
                                </span>
                            </td>
                            {user?.role === UserRole.ADMIN && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agents.find(a => a.id === p.agentId)?.name || 'Unknown/Inactive'}
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-900 mr-4 font-bold">
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* FULL SCREEN MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                  
                  {/* Header */}
                  <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center flex-shrink-0">
                      <div>
                          <h2 className="text-2xl font-serif font-bold text-gray-900">{editingId ? 'Edit Property' : 'Create New Listing'}</h2>
                          <p className="text-sm text-gray-500">Complete the details below to publish.</p>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition">Cancel</button>
                          <button
  type="button"
  onClick={() => handleSave()}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition"
>
  {editingId ? 'Save Changes' : 'Publish Listing'}
</button>
                      </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-gray-50 border-b border-gray-100 px-6 flex space-x-6 flex-shrink-0 overflow-x-auto">
                      {['basic', 'location', 'features', 'media'].map((tab) => (
                          <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                          >
                              {tab} Info
                          </button>
                      ))}
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-8">
                      <form id="propertyForm" onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
                          
                          {/* BASIC INFO */}
                          {activeTab === 'basic' && (
                              <div className="space-y-6 animate-fade-in">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="md:col-span-2">
                                          <label className="label">Listing Title</label>
                                          <input 
                                            type="text" className="input-field text-lg font-medium" placeholder="e.g. Modern Sunset Villa"
                                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                                          />
                                      </div>
                                      <div>
                                          <label className="label">Price ($)</label>
                                          <input 
                                            type="number" className="input-field" 
                                            value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                                          />
                                      </div>
                                      <div>
                                          <label className="label">Property Type</label>
                                          <select 
                                            className="input-field"
                                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                                          >
                                              {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                          </select>
                                      </div>
                                      <div>
                                          <label className="label">Listing Status</label>
                                          <select 
                                            className="input-field font-bold text-blue-600"
                                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                                          >
                                              <option value={PropertyStatus.FOR_SALE}>For Sale</option>
                                              <option value={PropertyStatus.PENDING}>Pending</option>
                                              <option value={PropertyStatus.SOLD}>Sold</option>
                                              <option value={PropertyStatus.FOR_RENT}>For Rent</option>
                                          </select>
                                      </div>
                                      {user?.role === UserRole.ADMIN && (
                                          <div>
                                              <label className="label">Assigned Advisor</label>
                                              <select 
                                                className="input-field"
                                                value={formData.agentId} onChange={e => setFormData({...formData, agentId: e.target.value})}
                                              >
                                                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                              </select>
                                              <p className="text-xs text-gray-500 mt-1">Only active advisors listed.</p>
                                          </div>
                                      )}
                                  </div>
                                  
                                  <div>
                                      <div className="flex justify-between items-end mb-2">
                                          <label className="label mb-0">Description</label>
                                          <button type="button" onClick={generateDescription} disabled={generatingDesc} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200 transition">
                                              <i className="fas fa-magic mr-1"></i> {generatingDesc ? 'Writing...' : 'AI Generate'}
                                          </button>
                                      </div>
                                      <textarea 
                                        rows={8} className="input-field leading-relaxed" placeholder="Describe the property..."
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                      ></textarea>
                                  </div>
                              </div>
                          )}

                          {/* LOCATION */}
                          {activeTab === 'location' && (
                              <div className="space-y-6 animate-fade-in">
                                  <div>
                                      <label className="label">Street Address</label>
                                      <input 
                                        type="text" className="input-field" placeholder="123 Main St"
                                        value={formData.location?.address} 
                                        onChange={e => setFormData({...formData, location: {...formData.location!, address: e.target.value}})} 
                                      />
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                      <div className="md:col-span-1">
                                          <label className="label">City</label>
                                          <input 
                                            type="text" className="input-field" 
                                            value={formData.location?.city} 
                                            onChange={e => setFormData({...formData, location: {...formData.location!, city: e.target.value}})} 
                                          />
                                      </div>
                                      <div className="md:col-span-1">
                                          <label className="label">State</label>
                                          <input 
                                            type="text" className="input-field" 
                                            value={formData.location?.state} 
                                            onChange={e => setFormData({...formData, location: {...formData.location!, state: e.target.value}})} 
                                          />
                                      </div>
                                      <div className="md:col-span-1">
                                          <label className="label">Zip Code</label>
                                          <input 
                                            type="text" className="input-field" 
                                            value={formData.location?.zip} 
                                            onChange={e => setFormData({...formData, location: {...formData.location!, zip: e.target.value}})} 
                                          />
                                      </div>
                                      <div className="md:col-span-1">
                                          <label className="label">Country</label>
                                          <input 
                                            type="text" className="input-field" 
                                            placeholder="USA, UK, etc."
                                            value={formData.location?.country} 
                                            onChange={e => setFormData({...formData, location: {...formData.location!, country: e.target.value}})} 
                                          />
                                      </div>
                                  </div>
                                  
                                  <div className="border border-gray-200 rounded-xl overflow-hidden p-6 bg-gray-50">
                                      <div className="flex justify-between items-center mb-4">
                                          <div>
                                              <h3 className="font-bold text-gray-700">Property Location</h3>
                                              <p className="text-xs text-gray-500">Drag the blue pin to set the exact location on the map.</p>
                                          </div>
                                          <button 
                                            type="button" 
                                            onClick={detectLocation}
                                            disabled={detectingLocation}
                                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center"
                                          >
                                              {detectingLocation ? (
                                                  <span className="animate-spin mr-1"><i className="fas fa-spinner"></i></span>
                                              ) : (
                                                  <i className="fas fa-search-location mr-1"></i>
                                              )}
                                              Find Address on Map
                                          </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div>
                                              <label className="label text-xs">Latitude</label>
                                              <input type="number" className="input-field py-1" readOnly value={formData.location?.lat} />
                                          </div>
                                          <div>
                                              <label className="label text-xs">Longitude</label>
                                              <input type="number" className="input-field py-1" readOnly value={formData.location?.lng} />
                                          </div>
                                      </div>

                                      {/* Leaflet Map Container */}
                                      <div 
                                        ref={mapContainerRef}
                                        className="h-[400px] w-full rounded-lg border border-blue-200 shadow-inner z-0"
                                      >
                                          {/* Map renders here */}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* FEATURES */}
                          {activeTab === 'features' && (
                              <div className="space-y-8 animate-fade-in">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                      <div>
                                          <label className="label text-center block">Bedrooms</label>
                                          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                                              <button type="button" className="w-8 h-8 rounded bg-white shadow text-gray-600 hover:text-blue-600" onClick={() => setFormData({...formData, features: {...formData.features!, bedrooms: Math.max(0, formData.features!.bedrooms - 1)}})}>-</button>
                                              <span className="mx-4 font-bold text-xl">{formData.features?.bedrooms}</span>
                                              <button type="button" className="w-8 h-8 rounded bg-white shadow text-gray-600 hover:text-blue-600" onClick={() => setFormData({...formData, features: {...formData.features!, bedrooms: formData.features!.bedrooms + 1}})}>+</button>
                                          </div>
                                      </div>
                                      <div>
                                          <label className="label text-center block">Bathrooms</label>
                                           <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                                              <button type="button" className="w-8 h-8 rounded bg-white shadow text-gray-600 hover:text-blue-600" onClick={() => setFormData({...formData, features: {...formData.features!, bathrooms: Math.max(0, formData.features!.bathrooms - 0.5)}})}>-</button>
                                              <span className="mx-4 font-bold text-xl">{formData.features?.bathrooms}</span>
                                              <button type="button" className="w-8 h-8 rounded bg-white shadow text-gray-600 hover:text-blue-600" onClick={() => setFormData({...formData, features: {...formData.features!, bathrooms: formData.features!.bathrooms + 0.5}})}>+</button>
                                          </div>
                                      </div>
                                      <div>
                                          <label className="label">Square Feet</label>
                                          <input 
                                            type="number" className="input-field" 
                                            value={formData.features?.sqft} 
                                            onChange={e => setFormData({...formData, features: {...formData.features!, sqft: Number(e.target.value)}})} 
                                          />
                                      </div>
                                      <div>
                                          <label className="label">Year Built</label>
                                          <input 
                                            type="number" className="input-field" 
                                            value={formData.features?.yearBuilt} 
                                            onChange={e => setFormData({...formData, features: {...formData.features!, yearBuilt: Number(e.target.value)}})} 
                                          />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="label mb-4 block">Amenities</label>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {commonAmenities.map(amenity => (
                                              <label key={amenity} className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${formData.amenities?.includes(amenity) ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                    type="checkbox" className="mr-3 h-4 w-4 text-blue-600"
                                                    checked={formData.amenities?.includes(amenity)}
                                                    onChange={() => toggleAmenity(amenity)}
                                                  />
                                                  {amenity}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* MEDIA */}
                          {activeTab === 'media' && (
                              <div className="space-y-6 animate-fade-in">
                                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                                      <label className="label mb-2 text-blue-900">Upload Images</label>
                                      <div className="flex flex-col gap-2">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploadingImage}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white rounded-lg border border-blue-100 disabled:opacity-50"
                                        />
                                        <p className="text-xs text-blue-600 flex items-center mt-1">
                                            {uploadingImage ? (
                                                <><span className="animate-spin mr-2"><i className="fas fa-spinner"></i></span> Uploading to Cloud...</>
                                            ) : (
                                                <><i className="fas fa-info-circle mr-1"></i> Supports Cloudinary Upload (or Local Fallback)</>
                                            )}
                                        </p>
                                      </div>
                                  </div>

                                  <div className="flex gap-4 items-center">
                                      <span className="text-gray-400 text-xs uppercase font-bold">OR</span>
                                  </div>

                                  <div className="flex gap-4">
                                      <input 
                                        type="text" className="input-field" placeholder="Paste Image URL (https://...)"
                                        value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                                      />
                                      <button type="button" onClick={addImageUrl} className="bg-gray-900 text-white px-6 rounded-lg font-bold hover:bg-gray-800 transition">Add</button>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                      {formData.images?.map((img, idx) => (
                                          <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-100">
                                              <img src={img} alt="" className="w-full h-full object-cover" />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                  <button type="button" onClick={() => removeImage(idx)} className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                                                      <i className="fas fa-trash"></i>
                                                  </button>
                                              </div>
                                              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                  {idx === 0 ? 'Main Photo' : `Image ${idx + 1}`}
                                              </div>
                                          </div>
                                      ))}
                                      {formData.images?.length === 0 && (
                                          <div className="col-span-3 text-center py-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
                                              No images added yet.
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                      </form>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            background-color: white;
            color: #111827;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 0.5rem;
            letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};