import React from 'react';
import { CheckCircle, Truck, Leaf, Shield } from 'lucide-react';

const PromoBanner = () => {
  const promos = [
    {
      icon: CheckCircle,
      text: 'Save money on fresh food',
    },
    {
      icon: Truck,
      text: 'Fast delivery to your door',
    },
    {
      icon: Leaf,
      text: 'Help reduce food waste',
    },
    {
      icon: Shield,
      text: 'Quality guaranteed',
    },
  ];

  return (
    <div className="bg-tilkapp-blue text-white py-3 overflow-hidden">
      <div className="animate-scroll flex items-center space-x-12 whitespace-nowrap">
        {[...promos, ...promos, ...promos].map((promo, index) => (
          <div key={index} className="flex items-center space-x-2 flex-shrink-0">
            <promo.icon className="w-5 h-5" />
            <span className="font-medium">{promo.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;