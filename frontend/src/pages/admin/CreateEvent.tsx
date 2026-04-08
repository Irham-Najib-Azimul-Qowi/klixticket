import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { adminApi } from '@/services/api';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Event state
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  // Ticket tiers state
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'Presale 1', description: 'Early bird access', price: '', quota: '', sales_start_at: '', sales_end_at: '' },
    { name: 'Presale 2', description: 'Standard access', price: '', quota: '', sales_start_at: '', sales_end_at: '' }
  ]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTierChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newTiers = [...ticketTiers];
    const { name, value } = e.target;
    newTiers[index] = { ...newTiers[index], [name]: value };
    setTicketTiers(newTiers);
  };

  const addTier = () => {
    setTicketTiers([...ticketTiers, { name: '', description: '', price: '', quota: '', sales_start_at: '', sales_end_at: '' }]);
  };

  const removeTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!eventData.title || !eventData.location || !eventData.start_date || !eventData.end_date) {
      alert("Please fill in all required event fields.");
      return;
    }
    
    // Validate tiers
    const isValidTiers = ticketTiers.every(t => t.name && t.price && t.quota && t.sales_start_at && t.sales_end_at);
    if (!isValidTiers) {
      alert("Please fill in all required fields for each ticket tier.");
      return;
    }

    setLoading(true);
    try {
      const ticketTypes = ticketTiers.map(t => ({
        name: t.name,
        description: t.description,
        price: Number(t.price),
        quota: Number(t.quota),
        sales_start_at: new Date(t.sales_start_at).toISOString(),
        sales_end_at: new Date(t.sales_end_at).toISOString(),
        active_status: true,
      }));

      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('location', eventData.location);
      formData.append('start_date', new Date(eventData.start_date).toISOString());
      formData.append('end_date', new Date(eventData.end_date).toISOString());
      formData.append('publish_status', 'published');
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await adminApi.createEvent(formData as any);
      navigate('/admin/events');
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Check server connection or input data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-stanton uppercase font-black">Create New Event</h2>
        <p className="text-muted-foreground mt-1">Configure event details and multiple ticket tiers.</p>
      </div>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase">1. Event Details</CardTitle>
          <CardDescription>Primary information about the event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">Event Title <span className="text-red-500">*</span></label>
            <Input name="title" value={eventData.title} onChange={handleEventChange} placeholder="Enter event title" className="border-2 border-black" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">Description</label>
            <textarea 
              name="description"
              value={eventData.description}
              onChange={handleEventChange}
              className="flex min-h-[120px] w-full rounded-md border-2 border-black bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Location Venue <span className="text-red-500">*</span></label>
              <Input name="location" value={eventData.location} onChange={handleEventChange} placeholder="Venue name" className="border-2 border-black" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Banner Image</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} className="border-2 border-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Start Date & Time <span className="text-red-500">*</span></label>
              <Input name="start_date" type="datetime-local" value={eventData.start_date} onChange={handleEventChange} className="border-2 border-black" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">End Date & Time <span className="text-red-500">*</span></label>
              <Input name="end_date" type="datetime-local" value={eventData.end_date} onChange={handleEventChange} className="border-2 border-black" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black uppercase text-stanton">2. Ticket Tiers</h3>
          <Button onClick={addTier} variant="outline" className="border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
            Add Tier
          </Button>
        </div>

        {ticketTiers.map((tier, index) => (
          <Card key={index} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
            {ticketTiers.length > 1 && (
              <Button 
                onClick={() => removeTier(index)} 
                variant="destructive" 
                size="sm" 
                className="absolute top-4 right-4 border-2 border-black font-black uppercase"
              >
                Remove
              </Button>
            )}
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Tier #{index + 1}: {tier.name || 'Untitled'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Tier Name <span className="text-red-500">*</span></label>
                  <Input name="name" value={tier.name} onChange={(e) => handleTierChange(index, e)} placeholder="e.g. Presale 1" className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Description</label>
                  <Input name="description" value={tier.description} onChange={(e) => handleTierChange(index, e)} placeholder="Short tier info" className="border-2 border-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Price (IDR) <span className="text-red-500">*</span></label>
                  <Input name="price" type="number" value={tier.price} onChange={(e) => handleTierChange(index, e)} placeholder="0" className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Capacity <span className="text-red-500">*</span></label>
                  <Input name="quota" type="number" value={tier.quota} onChange={(e) => handleTierChange(index, e)} placeholder="100" className="border-2 border-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Sales Start <span className="text-red-500">*</span></label>
                  <Input name="sales_start_at" type="datetime-local" value={tier.sales_start_at} onChange={(e) => handleTierChange(index, e)} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">Sales End <span className="text-red-500">*</span></label>
                  <Input name="sales_end_at" type="datetime-local" value={tier.sales_end_at} onChange={(e) => handleTierChange(index, e)} className="border-2 border-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Link to="/admin/events">
          <Button variant="outline" className="border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all px-8 py-6 h-auto">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={loading} className="bg-salmon text-white border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all px-12 py-6 h-auto">
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default CreateEvent;
