import React from 'react';
import { Smartphone, Bell, MapPin, Star, QrCode } from 'lucide-react';

const DownloadPage = () => {
  const features = [
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Get instant alerts when new offers are available near you'
    },
    {
      icon: MapPin,
      title: 'Location-based Offers',
      description: 'Find the best deals from restaurants in your area'
    },
    {
      icon: Star,
      title: 'Exclusive App Deals',
      description: 'Access special offers only available on mobile'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Download the KapKurtar App</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get the best food rescue experience on your mobile device. Never miss a deal again!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side - QR Code and Download */}
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6 font-medium">Scan to download</p>
              
              {/* Download Text */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get notified instantly. Download our app today.
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Never miss a deal from your favorite restaurants. Get push notifications for new offers near you.
                </p>
              </div>
              
              {/* Download Buttons */}
              <div className="flex flex-col gap-4">
                <a
                  href="#"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                    alt="Download on the App Store" 
                    className="h-14 mx-auto"
                  />
                </a>
                
                <a
                  href="#"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                    alt="Get it on Google Play" 
                    className="h-14 mx-auto"
                  />
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00A690]">4.8★</div>
                <div className="text-sm text-gray-600">App Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00A690]">50K+</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00A690]">1M+</div>
                <div className="text-sm text-gray-600">Meals Saved</div>
              </div>
            </div>
          </div>

          {/* Right side - Features */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Download the App?
            </h2>
            
            <div className="space-y-8 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-[#F7F2E7] p-4 rounded-lg">
                    <feature.icon className="w-8 h-8 text-[#00A690]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#00A690] py-16">
              <h3 className="font-semibold text-[#00A690] mb-2">📱 Activate Notifications</h3>
              <p className="text-[#00A690] leading-relaxed">
                Enable push notifications to never miss a deal. Get alerted when your favorite restaurants post new offers!
              </p>
            </div>
          </div>
        </div>

        {/* Phone Mockup Section */}
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Experience KapKurtar on Mobile</h2>
          
          <div className="flex justify-center relative">
            <div className="mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                {/* Phone screen content */}
                <div className="bg-gradient-to-br from-green-400 to-green-500 h-24 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <span className="font-bold text-lg">KapKurtar</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-[#00A690] rounded-full"></div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded w-20"></div>
                        <div className="h-2 bg-gray-200 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded w-24"></div>
                        <div className="h-2 bg-gray-200 rounded w-12 mt-1"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute top-32 left-2 right-2 bg-white rounded-lg shadow-lg p-3 border-l-4 border-[#00A690]">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#00A690]" />
                    <div>
                      <div className="text-xs font-semibold text-gray-900">New offer nearby!</div>
                      <div className="text-xs text-gray-600">50% off at Green Kitchen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6 text-lg">Ready to start saving money and reducing waste?</p>
          <a
            href="/"
            className="bg-[#00A690] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#F75C00] transition-colors inline-block text-lg"
          >
            Explore Offers Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;