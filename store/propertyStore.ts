import { create } from 'zustand';
import api from '@/lib/api';
import { IProperty, IPropertyFilter } from '@/types/property';

interface PropertyState {
  properties: IProperty[];
  currentProperty: IProperty | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  fetchProperties: (filters?: IPropertyFilter) => Promise<void>;
  fetchAgentProperties: (filters?: IPropertyFilter) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (formData: FormData) => Promise<void>;
  updateProperty: (id: string, formData: FormData) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  
  fetchProperties: async (filters?: IPropertyFilter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/properties', { params: filters });
      set({ 
        properties: response.data.data?.properties || response.data.data || response.data, 
        totalCount: response.data.data?.meta?.total || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch properties',
        isLoading: false 
      });
    }
  },

  fetchAgentProperties: async (filters?: IPropertyFilter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/properties/agent', { params: filters });
      set({ 
        properties: response.data.data?.properties || response.data.data || response.data, 
        totalCount: response.data.data?.meta?.total || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch your properties',
        isLoading: false 
      });
    }
  },

  fetchPropertyById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/properties/${id}`);
      set({ currentProperty: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch property details',
        isLoading: false 
      });
    }
  },

  createProperty: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/properties', formData);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create property',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProperty: async (id: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/properties/${id}`, formData);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update property',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/properties/${id}`);
      set((state) => ({ 
        properties: state.properties.filter(p => p._id !== id),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete property',
        isLoading: false 
      });
      throw error;
    }
  }
}));
