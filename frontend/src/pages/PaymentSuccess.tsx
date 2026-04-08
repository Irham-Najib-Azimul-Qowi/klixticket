import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-stanton translate-x-3 translate-y-3 rounded-full" />
          <div className="relative bg-green-400 border-4 border-black p-8 rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="w-24 h-24 text-black" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-stanton">Payment Success!</h1>
          <p className="text-lg font-bold text-gray-700">Your order has been confirmed. Get ready for an unforgettable experience.</p>
        </div>

        <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
            <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-salmon" />
                <span className="font-black uppercase text-sm">Next Steps</span>
            </div>
            <ul className="space-y-2 text-sm font-bold">
                <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                    <span>Check your email for the E-Ticket.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                    <span>View your order history in your profile.</span>
                </li>
            </ul>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <Link to="/profile">
            <Button className="w-full bg-stanton text-white border-4 border-black py-8 rounded-2xl text-xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-0 hover:translate-x-1 hover:translate-y-1 transition-all">
              Go to My Tickets <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full border-4 border-black py-8 rounded-2xl text-xl font-black uppercase hover:bg-cream transition-all">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
