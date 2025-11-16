import React from 'react';
import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Award } from 'lucide-react';
import { getMerchants, type Merchant } from '../api';

const MerchantsSection = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await getMerchants();
        setMerchants(data);
      } catch (error) {
        console.error('Error fetching merchants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Merchants</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing restaurants and food businesses in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchants.map((merchant) => (
            <div key={merchant.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={merchant.image}
                  alt={merchant.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {merchant.verified && (
                  <div className="absolute top-4 right-4 bg-[#00A690] text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{merchant.name}</h3>

                <p className="text-gray-600 mb-3 text-sm">{merchant.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{merchant.full_address || (merchant.street && merchant.city ? `${merchant.street}, ${merchant.city}` : merchant.city || 'Location not specified')}</span>
                </div>

                {merchant.verified && (
                  <div className="flex items-center mb-4">
                    <Award className="w-4 h-4 text-[#00A690] mr-1" />
                    <span className="text-sm text-[#00A690]">Verified Merchant</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-[#00A690]">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Open now</span>
                  </div>
                  <button className="bg-[#00A690] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#F75C00] transition-colors duration-300">
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/merchants"
            className="bg-[#00A690] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#F75C00] transition-colors duration-300 inline-block"
          >
            View All Merchants
          </a>
        </div>
      </div>
    </div>
  );
};

export default MerchantsSection;