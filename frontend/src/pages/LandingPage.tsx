import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowRight, ShieldCheck, Ticket, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      
      {/* Navbar Section */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">mastutik.</span>
          </div>

          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#events" className="text-muted-foreground hover:text-foreground transition">Explore</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="default" size="sm">Admin Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-8">
        <Badge variant="secondary" className="px-3 py-1 rounded-full bg-muted">
          🌟 Discover the Best Events in Town
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground">
          Unforgettable Experiences Start <span className="text-primary italic">Here.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          A minimalist, highly secure platform for purchasing and discovering your favorite concerts, seminars, and expos effortlessly.
        </p>
        <div className="flex space-x-4 pt-4">
          <Button size="lg" className="rounded-full px-8">Find Events <ArrowRight className="ml-2 w-4 h-4" /></Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">Promote Event</Button>
        </div>
      </section>

      {/* Recommended Events */}
      <section id="events" className="max-w-7xl mx-auto px-6 py-16 border-t border-border mt-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Events</h2>
            <p className="text-muted-foreground mt-2">Curated experiences hand-picked for you.</p>
          </div>
          <Button variant="ghost">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Symphony of The Stars", date: "Oct 12, 2026", loc: "Jakarta Arena", price: "IDR 500,000", tag: "Concert" },
            { title: "DevConnect Summit", date: "Nov 20, 2026", loc: "ICE BSD", price: "IDR 150,000", tag: "Tech" },
            { title: "Culinary Night Fest", date: "Dec 05, 2026", loc: "GBK Plaza", price: "Free", tag: "Festival" }
          ].map((item, i) => (
            <Card key={i} className="group overflow-hidden rounded-2xl border-border bg-card shadow-none hover:shadow-sm transition-shadow">
              <div className="aspect-[16/9] bg-muted relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Badge className="absolute top-4 right-4" variant="secondary">{item.tag}</Badge>
                 {/* Placeholder for images */}
                 <span className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Image Placeholder</span>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" /> {item.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" /> {item.loc}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Starting At</p>
                    <p className="font-bold text-foreground text-lg">{item.price}</p>
                  </div>
                  <Button size="sm" variant="default" className="rounded-full">Get Ticket</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/50 py-20 mt-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center mb-6">
               <ShieldCheck className="w-6 h-6 text-primary" />
             </div>
             <h3 className="text-lg font-bold mb-2">Secure Ticketing</h3>
             <p className="text-muted-foreground text-sm leading-relaxed">Built on isolated architecture ensuring 100% encrypted, secure transactions.</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center mb-6">
               <Ticket className="w-6 h-6 text-primary" />
             </div>
             <h3 className="text-lg font-bold mb-2">Instant Delivery</h3>
             <p className="text-muted-foreground text-sm leading-relaxed">Your e-tickets are generated immediately and stored safely in your digital wallet.</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center mb-6">
               <Users className="w-6 h-6 text-primary" />
             </div>
             <h3 className="text-lg font-bold mb-2">Organizer Tools</h3>
             <p className="text-muted-foreground text-sm leading-relaxed">Powerful dashboard metrics for creators to manage their events and revenues.</p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
             <Ticket className="w-5 h-5" />
             <span className="font-bold text-foreground">mastutik.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
