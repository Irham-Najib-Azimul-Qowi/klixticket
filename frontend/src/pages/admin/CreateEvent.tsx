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

  // Ticket state
  const [ticketData, setTicketData] = useState({
    name: 'General Admission',
    description: 'Standard event entry ticket',
    price: '',
    quota: '',
    sales_start_at: '',
    sales_end_at: '',
  });

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTicketData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    
    if (!ticketData.name || !ticketData.price || !ticketData.quota || !ticketData.sales_start_at || !ticketData.sales_end_at) {
      alert("Please fill in all required ticket fields.");
      return;
    }

    setLoading(true);
    try {
      const ticketTypes = [
        {
          name: ticketData.name,
          description: ticketData.description,
          price: Number(ticketData.price),
          quota: Number(ticketData.quota),
          sales_start_at: new Date(ticketData.sales_start_at).toISOString(),
          sales_end_at: new Date(ticketData.sales_end_at).toISOString(),
          active_status: true,
        }
      ];

      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('location', eventData.location);
      formData.append('start_date', new Date(eventData.start_date).toISOString());
      formData.append('end_date', new Date(eventData.end_date).toISOString());
      formData.append('publish_status', 'draft');
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await adminApi.createEvent(formData as any);
      navigate('/admin/events');
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to draft event. Check server connection or input data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Draft New Event</h2>
        <p className="text-muted-foreground mt-1">Configure event details and ticket tiers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Event Details</CardTitle>
          <CardDescription>Primary information about the event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Event Title <span className="text-red-500">*</span></label>
            <Input name="title" value={eventData.title} onChange={handleEventChange} placeholder="Enter a catchy title" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Description</label>
            <textarea 
              name="description"
              value={eventData.description}
              onChange={handleEventChange}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what people can expect..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Location Venue <span className="text-red-500">*</span></label>
              <Input name="location" value={eventData.location} onChange={handleEventChange} placeholder="e.g. Jakarta Convention Center" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Event Thumbnail (Optional)</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Start Date & Time <span className="text-red-500">*</span></label>
              <Input name="start_date" type="datetime-local" value={eventData.start_date} onChange={handleEventChange} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">End Date & Time <span className="text-red-500">*</span></label>
              <Input name="end_date" type="datetime-local" value={eventData.end_date} onChange={handleEventChange} className="text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ticket Configuration</CardTitle>
          <CardDescription>Set up the primary ticket for this event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Ticket Name <span className="text-red-500">*</span></label>
              <Input name="name" value={ticketData.name} onChange={handleTicketChange} placeholder="e.g. Presale 1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Description</label>
              <Input name="description" value={ticketData.description} onChange={handleTicketChange} placeholder="e.g. 3 Days Pass" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Price (IDR) <span className="text-red-500">*</span></label>
              <Input name="price" type="number" min="0" value={ticketData.price} onChange={handleTicketChange} placeholder="0 if free" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Maximum Quota <span className="text-red-500">*</span></label>
              <Input name="quota" type="number" min="1" value={ticketData.quota} onChange={handleTicketChange} placeholder="Capacity" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Sales Start <span className="text-red-500">*</span></label>
              <Input name="sales_start_at" type="datetime-local" value={ticketData.sales_start_at} onChange={handleTicketChange} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Sales End <span className="text-red-500">*</span></label>
              <Input name="sales_end_at" type="datetime-local" value={ticketData.sales_end_at} onChange={handleTicketChange} className="text-muted-foreground" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t px-6 py-4">
          <Link to="/admin/events">
            <Button variant="outline" disabled={loading}>Cancel</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Drafting...' : 'Save Draft'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEvent;
