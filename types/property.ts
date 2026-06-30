export interface IUserPopulated {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface IProperty {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  amenities: string[];
  images: string[];
  status: 'Available' | 'Pending' | 'Sold' | 'Rented';
  propertyType: 'Villa' | 'Apartment' | 'Penthouse' | 'Commercial' | 'Townhouse' | 'Land';
  ownerId: IUserPopulated | any;
  agentId?: IUserPopulated | any;
  createdAt?: string;
  updatedAt?: string;
  distance?: number; // Calculated distance in km from search coordinate
}

export interface IPropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  status?: string;
  amenities?: string[];
  furnished?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'nearest';
  // Geo-based search
  lat?: number;
  lng?: number;
  radius?: number; // km
  address?: string; // the formatted address for display
}
