import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const CreateEvent: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Draft New Event</CardTitle>
          <CardDescription>Enter the primary details for your new event to publish it to the catalog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Event Title</label>
            <Input placeholder="Enter a catchy title" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Description</label>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what people can expect..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Location Venue</label>
              <Input placeholder="e.g. Jakarta Convention Center" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Date & Time</label>
              <Input type="datetime-local" className="text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Price (IDR)</label>
              <Input type="number" placeholder="Leave empty if free" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Maximum Quota</label>
              <Input type="number" placeholder="Capacity" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t px-6 py-4">
          <Link to="/admin/events">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button>Publish Event</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEvent;
