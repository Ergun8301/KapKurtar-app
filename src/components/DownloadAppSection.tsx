import React from 'react';
import { QrCode } from 'lucide-react';
const DownloadAppSection = () => {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Download Our App
            </h2>
            <div className="mb-8">
              <p className="text-2xl font-semibold text-white mb-4">
                Get notified instantly. Download our app today.
              </p>
              <p className="text-xl text-tilkapp-beige">
                Never miss a deal from your favorite restaurants. Get push notifications for new offers near you.
              </p>
            </div>
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8★</div>
                <div className="text-sm text-tilkapp-beige">App Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-tilkapp-beige">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1M+</div>
                <div className="text-sm text-tilkapp-beige">Meals Saved</div>
              </div>
            </div>
          </div>
          {/* Right side - QR Code */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Scan to download</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DownloadAppSection;