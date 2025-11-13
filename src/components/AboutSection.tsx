import React from 'react';
import { Leaf, Users, Award, Heart } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Reduce Food Waste',
      description: 'Help restaurants reduce food waste while getting amazing deals on quality meals.'
    },
    {
      icon: Users,
      title: 'Support Local Business',
      description: 'Connect with local restaurants and food businesses in your community.'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'All our partner merchants are verified and maintain high quality standards.'
    },
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Make a positive impact on your community and the environment with every purchase.'
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About TILKAPP</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to connect people with delicious food while reducing waste and supporting local businesses. 
            Join thousands of food lovers making a difference, one meal at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-tilkapp-beige w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-tilkapp-green" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
              <p className="text-gray-600 mb-4">
                TILKAPP was born from a simple observation: too much good food goes to waste while people are looking for affordable, quality meals. We created a platform that benefits everyone - customers get great deals, restaurants reduce waste, and our planet gets a little healthier.
              </p>
              <p className="text-gray-600 mb-6">
                Since our launch, we've helped save over 100,000 meals from going to waste, supported hundreds of local businesses, and built a community of conscious food lovers who care about making a difference.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-tilkapp-green">100K+</div>
                  <div className="text-sm text-gray-500">Meals Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-tilkapp-green">500+</div>
                  <div className="text-sm text-gray-500">Partner Restaurants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-tilkapp-green">50K+</div>
                  <div className="text-sm text-gray-500">Happy Customers</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Team working together"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/about"
            className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
          >
            Learn More About Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;