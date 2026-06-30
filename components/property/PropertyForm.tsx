import React, { useState, useEffect } from 'react';
import { IProperty } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted/50 animate-pulse rounded-md border flex items-center justify-center text-muted-foreground">Loading Interactive Map...</div>
});

interface PropertyFormProps {
  initialData?: IProperty | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const router = useRouter();
  
  // State for new image uploads
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // State for keeping track of existing images to keep
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'Available',
    propertyType: 'Apartment',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    features: {
      bedrooms: '0',
      bathrooms: '0',
      area: '0'
    },
    amenities: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price.toString(),
        status: initialData.status,
        propertyType: initialData.propertyType,
        location: {
          address: initialData.location.address,
          city: initialData.location.city,
          state: initialData.location.state,
          country: initialData.location.country || '',
          zipCode: initialData.location.zipCode || '',
          coordinates: {
            lat: initialData.location.coordinates?.lat || 0,
            lng: initialData.location.coordinates?.lng || 0
          }
        },
        features: {
          bedrooms: initialData.features.bedrooms.toString(),
          bathrooms: initialData.features.bathrooms.toString(),
          area: initialData.features.area.toString()
        },
        amenities: initialData.amenities.join(', ')
      });
      
      if (initialData.images) {
        setExistingImages([...initialData.images]);
      }
    }
  }, [initialData]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (locationData: any) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    
    // Reset file input value so same files can be selected again if needed
    e.target.value = '';
  };

  const removeNewImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => {
      // Revoke the URL to avoid memory leak
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('status', formData.status);
    data.append('propertyType', formData.propertyType);
    
    // Append nested objects as JSON strings
    data.append('location', JSON.stringify(formData.location));
    data.append('features', JSON.stringify({
      bedrooms: Number(formData.features.bedrooms),
      bathrooms: Number(formData.features.bathrooms),
      area: Number(formData.features.area)
    }));
    
    // Convert comma separated string to array and stringify
    const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(Boolean);
    data.append('amenities', JSON.stringify(amenitiesArray));
    
    // Append existing images state
    data.append('existingImages', JSON.stringify(existingImages));
    
    images.forEach(img => {
      data.append('images', img);
    });

    await onSubmit(data);
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Property Title" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Price ($)</label>
          <Input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea 
          required 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          className="w-full flex min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Property Description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <select 
            name="propertyType" 
            value={formData.propertyType} 
            onChange={handleChange}
            className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Commercial">Commercial</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Land">Land</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            disabled={initialData?.status === 'Sold' || initialData?.status === 'Rented'}
            className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pin the exact location of your property on the map. We will automatically extract the address details.
        </p>
        
        <div className="mb-6">
          <MapComponent 
            locationData={formData.location} 
            onChange={handleLocationChange} 
          />
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bedrooms</label>
            <Input required type="number" name="features.bedrooms" value={formData.features.bedrooms} onChange={handleChange} min="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bathrooms</label>
            <Input required type="number" name="features.bathrooms" value={formData.features.bathrooms} onChange={handleChange} min="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Area (sqft)</label>
            <Input required type="number" name="features.area" value={formData.features.area} onChange={handleChange} min="0" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amenities (comma separated)</label>
          <Input name="amenities" value={formData.amenities} onChange={handleChange} placeholder="Pool, Gym, Parking..." />
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Images</h3>
          <div className="relative">
            <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Button type="button" variant="outline" size="sm">Add Images</Button>
          </div>
        </div>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
           <div className="mt-4">
             <p className="text-sm font-medium mb-2">Current Images (Will be kept)</p>
             <div className="flex gap-4 flex-wrap">
               {existingImages.map((img, i) => (
                 <div key={`existing-${i}`} className="relative group rounded shadow-sm border border-border">
                   <img src={`${baseUrl}${img}`} alt="Property" className="h-24 w-24 object-cover rounded" />
                   <button 
                     type="button"
                     onClick={() => removeExistingImage(i)}
                     className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* New Upload Previews */}
        {imagePreviews.length > 0 && (
           <div className="mt-6">
             <p className="text-sm font-medium mb-2">New Images to Upload</p>
             <div className="flex gap-4 flex-wrap">
               {imagePreviews.map((url, i) => (
                 <div key={`new-${i}`} className="relative group rounded shadow-sm border border-border ring-2 ring-primary/20">
                   <img src={url} alt="New Upload Preview" className="h-24 w-24 object-cover rounded" />
                   <button 
                     type="button"
                     onClick={() => removeNewImage(i)}
                     className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {existingImages.length === 0 && imagePreviews.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-sm">No images selected. Click "Add Images" to upload.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Property' : 'Create Property')}
        </Button>
      </div>
    </form>
  );
};
