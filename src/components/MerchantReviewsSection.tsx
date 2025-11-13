import React from 'react';
import { Star, Quote } from 'lucide-react';

const MerchantReviewsSection = () => {
  const reviews = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      role: 'Food Lover',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      review: 'TILKAPP has completely changed how I think about dining out. I get amazing meals at great prices while helping reduce food waste. It\'s a win-win!',
      restaurant: 'Green Kitchen'
    },
    {
      id: '2',
      name: 'David Chen',
      role: 'Regular Customer',
      avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      review: 'The quality of food is outstanding, and the savings are incredible. I\'ve discovered so many new restaurants through this platform.',
      restaurant: 'Nonna\'s Kitchen'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Sustainability Advocate',
      avatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      review: 'Love that I can enjoy delicious food while making a positive environmental impact. The app is easy to use and the pickup process is seamless.',
      restaurant: 'Burger Craft'
    },
    {
      id: '4',
      name: 'Marco Rossi',
      role: 'Restaurant Owner',
      avatar: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      review: 'As a restaurant owner, TILKAPP has helped us reduce waste significantly while reaching new customers. The platform is fantastic for business.',
      restaurant: 'Rossi\'s Pizzeria'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from customers and merchants who are making a difference with TILKAPP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-xl p-6 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-200" />
              
              <div className="flex items-center mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm text-gray-600">at {review.restaurant}</span>
              </div>

              <p className="text-gray-700 italic">"{review.review}"</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h3>
            <p className="text-gray-600 mb-6">
              Be part of the food rescue movement. Save money, reduce waste, and discover amazing local restaurants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth"
                className="bg-tilkapp-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Join as Customer
              </a>
              <a
                href="/merchants/signup"
                className="bg-white text-blue-600 border-2 border-tilkapp-blue px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Join as Merchant
              </a>
            </div>
          </div>

          <a
            href="/reviews"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Read All Reviews →
          </a>
        </div>
      </div>
    </div>
  );
};

export default MerchantReviewsSection;