import React from 'react';
import { useState, useEffect } from 'react';
import { getPartners, type Partner } from '../api';

const PartnersCarousel = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await getPartners();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading || partners.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 font-medium">Trusted by leading food partners</p>
        </div>
        <div className="overflow-hidden">
          <div className="animate-slide flex items-center space-x-12 whitespace-nowrap">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex items-center space-x-3 flex-shrink-0">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-gray-700 font-medium text-sm">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersCarousel;