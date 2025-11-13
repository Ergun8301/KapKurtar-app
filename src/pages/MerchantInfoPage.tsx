import React, { useState } from 'react';
import { TrendingUp, Users, Zap, Star, ArrowRight, CheckCircle, DollarSign, Award, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MerchantInfoPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Monetize Surplus Inventory',
      description: 'Transform food waste into additional revenue streams instead of disposal costs.',
      stats: 'Average 25% revenue increase'
    },
    {
      icon: Users,
      title: 'Attract New Customers',
      description: 'Reach conscious consumers who discover your restaurant through our platform.',
      stats: '40% become repeat customers'
    },
    {
      icon: Zap,
      title: 'Professional Partnership',
      description: 'Join our network of verified merchants with dedicated support and tools.',
      stats: 'Setup in under 30 minutes'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Rodriguez',
      business: 'Green Garden Bistro',
      quote: 'TILKAPP helped us reduce waste by 60% while attracting amazing new customers. The professional partnership has been transformative for our business.',
      rating: 5,
      revenue: '+€2,400/month'
    },
    {
      name: 'James Chen',
      business: 'Urban Kitchen',
      quote: 'The platform is incredibly easy to use and the support team is fantastic. We\'ve seen significant growth in both revenue and customer base.',
      rating: 5,
      revenue: '+€1,800/month'
    }
  ];

  const features = [
    'Professional merchant dashboard',
    'Real-time analytics and insights',
    'Customer review management',
    'Inventory optimization tools',
    'Marketing support and promotion',
    'Dedicated account manager',
    'Priority customer support',
    'Performance tracking and reporting'
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Become Our Professional Partner
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our exclusive network of verified merchants. Transform surplus inventory into 
              profitable revenue while building a sustainable business model.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/merchant/auth')}
                className="bg-tilkapp-green text-white px-8 py-4 rounded-lg font-semibold hover:bg-tilkapp-orange transition-colors inline-flex items-center text-lg shadow-lg"
              >
                Register as Professional Partner
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Partnership Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of successful restaurants already maximizing their potential with our platform
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

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Professional Tools & Support
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Access enterprise-grade tools designed specifically for professional food service partners.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-tilkapp-green flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Professional kitchen"
                className="rounded-lg shadow-lg"
              />
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600">Partner Restaurants</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-2xl font-bold text-green-600">€2M+</div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories from Our Partners</h2>
            <p className="text-xl text-gray-600">Real results from professional merchants in our network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 relative">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-3 text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {testimonial.revenue}
                  </span>
                </div>
                
                <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.business}</div>
                  </div>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Professional Onboarding</h2>
            <p className="text-xl text-gray-600">Get started with our streamlined partner registration process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tilkapp-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Registration</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete our partner application with your business details and verification documents.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-tilkapp-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Setup & Training</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized onboarding with your dedicated account manager and access to professional tools.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-tilkapp-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Launch & Grow</h3>
              <p className="text-gray-600 leading-relaxed">
                Start creating offers, serving customers, and growing your revenue with ongoing support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-tilkapp-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="w-12 h-12 text-white mr-4" />
            <h2 className="text-4xl font-bold text-white">Ready to Transform Your Business?</h2>
          </div>
          <p className="text-xl text-green-100 mb-12 leading-relaxed">
            Join our exclusive network of professional partners and start monetizing your surplus inventory 
            while building a more sustainable business model.
          </p>
          
          <button
            onClick={() => navigate('/merchant/auth')}
            className="bg-white text-green-600 px-12 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-xl shadow-lg"
          >
            <CheckCircle className="w-6 h-6 mr-3" />
            Register as Professional Partner
          </button>
          
          <p className="text-green-200 mt-6">No setup fees • Professional support • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default MerchantInfoPage;