import React, { useState } from 'react';
import { TrendingUp, Users, Zap, Star, ArrowRight, CheckCircle } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const MerchantsPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Revenue',
      description: 'Turn surplus food into profit instead of waste. Generate additional income from items that would otherwise be discarded.',
      stats: 'Average 25% revenue increase'
    },
    {
      icon: Users,
      title: 'Attract New Customers',
      description: 'Reach food-conscious consumers who discover your restaurant through our platform and become regular customers.',
      stats: '40% become repeat customers'
    },
    {
      icon: Zap,
      title: 'Simple Integration',
      description: 'Easy-to-use dashboard, quick setup, and seamless integration with your existing operations. No complex training required.',
      stats: 'Setup in under 30 minutes'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Rodriguez',
      business: 'Green Garden Bistro',
      quote: 'ResQ Food helped us reduce waste by 60% while attracting amazing new customers. It\'s been a game-changer for our business.',
      rating: 5
    },
    {
      name: 'James Chen',
      business: 'Urban Kitchen',
      quote: 'The platform is incredibly easy to use. We\'ve seen a significant boost in revenue from food that would have gone to waste.',
      rating: 5
    }
  ];

  const partnerLogos = [
    'FoodTech Solutions',
    'Green Delivery',
    'Organic Farms',
    'Fresh Market',
    'Eco Foods',
    'City Restaurants'
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
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Turn Waste into Revenue
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join our network of forward-thinking restaurants. Attract new customers, 
                reduce food waste, and boost your bottom line with ResQ Food.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center text-lg shadow-lg"
                >
                  Become a Partner
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <a
                  href="#benefits"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-lg"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner with ResQ Food?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join hundreds of restaurants already benefiting from our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{benefit.description}</p>
                  <div className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full inline-block">
                    {benefit.stats}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Simple steps to start reducing waste and increasing revenue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up & Setup</h3>
                <p className="text-gray-600 leading-relaxed">Create your merchant account and set up your restaurant profile in minutes.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">List Your Offers</h3>
                <p className="text-gray-600 leading-relaxed">Add surplus food items with discounted prices. Set pickup times and quantities.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Serve Customers</h3>
                <p className="text-gray-600 leading-relaxed">Customers reserve and pick up their orders. You reduce waste and earn revenue.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Partners Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.business}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-gray-500 font-medium">Trusted by leading food partners</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {partnerLogos.map((partner, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="text-xs text-gray-600">{partner}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-24 bg-green-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-green-100 mb-12 leading-relaxed">
              Join ResQ Food today and start turning your food waste into revenue while attracting new customers.
            </p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-green-600 px-12 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-xl shadow-lg"
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              Become a Partner
            </button>
            
            <p className="text-green-200 mt-6">No setup fees • Cancel anytime • 24/7 support</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default MerchantsPage;