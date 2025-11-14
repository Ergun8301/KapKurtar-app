import React from 'react';
import { Leaf, Store, Users, MapPin } from 'lucide-react';

const ImpactSection = () => {
  const stats = [
    {
      icon: Leaf,
      value: '25',
      unit: 'tonnes',
      label: 'de nourriture sauvées'
    },
    {
      icon: Store,
      value: '150+',
      unit: '',
      label: 'commerçants partenaires'
    },
    {
      icon: Users,
      value: '8000+',
      unit: '',
      label: 'utilisateurs actifs'
    },
    {
      icon: MapPin,
      value: '5',
      unit: 'villes',
      label: 'couvertes en 2025'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Notre Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ensemble, nous créons un avenir plus durable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tilkapp-beige rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-tilkapp-green" />
              </div>
              <div className="text-4xl font-bold text-tilkapp-green mb-1">
                {stat.value}
              </div>
              {stat.unit && (
                <div className="text-lg font-semibold text-tilkapp-orange mb-2">
                  {stat.unit}
                </div>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactSection;
