import React from 'react';

const AppDownloadCTA = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Get notified instantly. Download our app today.
          </h3>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Never miss a deal from your favorite restaurants. Get push notifications for new offers near you.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#"
            className="transition-transform hover:scale-105"
          >
            <img 
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
              alt="Download on the App Store" 
              className="h-14"
            />
          </a>
          <a
            href="#"
            className="transition-transform hover:scale-105"
          >
            <img 
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
              alt="Get it on Google Play" 
              className="h-14"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadCTA;