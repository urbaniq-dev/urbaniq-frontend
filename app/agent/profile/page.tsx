'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Loader2, Save, User as UserIcon, MapPin, Phone, MessageCircle,
  CheckCircle2, AlertCircle, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

export default function AgentProfileSettings() {
  const { user, initialize } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    bio: '',
    city: '',
    area: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/agent-profiles/me');
        const data = res.data;

        setFormData({
          firstName: data.user?.firstName || '',
          lastName: data.user?.lastName || '',
          // phone and whatsapp are now stored on AgentProfile
          phone: data.phone || data.user?.phone || '',
          whatsapp: data.whatsapp || '',
          bio: data.bio || '',
          city: data.location?.city || '',
          area: data.location?.area || '',
        });

        const imgUrl = getImageUrl(data.profileImage);
        if (imgUrl) setPreviewImage(imgUrl);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear messages on change
    if (message) setMessage('');
    if (error) setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      // Revoke old blob URL
      if (previewImage?.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('phone', formData.phone);
      data.append('whatsapp', formData.whatsapp);
      data.append('bio', formData.bio);
      data.append('location', JSON.stringify({ city: formData.city, area: formData.area }));

      if (profileImage) {
        data.append('profileImage', profileImage);
      }

      await api.put('/agent-profiles/me', data);
      setMessage('Profile updated successfully!');
      setProfileImage(null); // Reset file picker state

      // Refresh auth store so Navbar and other consumers reflect updated name
      await initialize();

      // Auto-clear success message after 4 seconds
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Public Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your public information that buyers will see on your listings.
        </p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

          {/* Status Messages */}
          {message && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Profile Image Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <UserIcon className="w-5 h-5 text-primary" /> Profile Image
            </div>
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile Preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={previewImage.startsWith('http://localhost') || previewImage.startsWith('blob:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Upload profile photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 5MB.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {profileImage && (
                  <p className="text-xs text-primary font-medium">
                    ✓ {profileImage.name} selected
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <UserIcon className="w-5 h-5 text-primary" /> Personal Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-destructive">*</span></label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">Professional Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell buyers about your experience, specialties, and the areas you serve..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">{formData.bio.length} characters</p>
            </div>
          </section>

          {/* Contact Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Phone className="w-5 h-5 text-primary" /> Contact Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed on your property listings for buyer inquiries.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  WhatsApp Number
                </label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. 12345678900 (with country code)"
                />
                <p className="text-xs text-muted-foreground">
                  Used for direct Click-to-Chat buttons on listings. Digits only with country code.
                </p>
              </div>
            </div>
          </section>

          {/* Location Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <MapPin className="w-5 h-5 text-primary" /> Service Area
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Dubai" />
              </div>
              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-medium">Primary Area / Neighborhood</label>
                <Input id="area" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Downtown" />
              </div>
            </div>
          </section>

          <div className="pt-4 flex justify-end border-t">
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto px-8 h-12 text-base">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
