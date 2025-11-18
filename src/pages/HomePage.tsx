import React, { useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import HowItWorks from '../components/HowItWorks';
import FeaturedOffers from '../components/FeaturedOffers';
import ImpactSection from '../components/ImpactSection';
import ForMerchantsSection from '../components/ForMerchantsSection';
import DownloadAppModal from '../components/DownloadAppModal';
import { Smartphone } from 'lucide-react';

const HomePage = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <div>
      <HeroBanner />
      
      {/* Section HowItWorks - fond vert clair */}
      <div className="bg-kapkurtar-green-light/30">
        <HowItWorks />
      </div>

      {/* Section FeaturedOffers - fond blanc */}
      <div className="bg-white">
        <FeaturedOffers onOpenDownloadModal={() => setShowDownloadModal(true)} />
      </div>

      {/* Section ImpactSection - fond vert clair */}
      <div className="bg-kapkurtar-green-light/30">
        <ImpactSection />
      </div>

      {/* CTA Download Section - fond vert clair */}
      <div className="bg-kapkurtar-green-light py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-kapkurtar-green rounded-full p-4">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            KapKurtar Uygulamasını İndirin
          </h2>
          <p className="text-lg text-kapkurtar-gray mb-8 max-w-2xl mx-auto">
            Gerçek zamanlı bildirimler alın ve yakınınızdaki hiçbir teklifi kaçırmayın
          </p>
          <button
            onClick={() => setShowDownloadModal(true)}
            className="bg-kapkurtar-green text-white px-8 py-4 rounded-lg font-bold hover:bg-kapkurtar-yellow hover:text-kapkurtar-gray transition-colors duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Şimdi İndir
          </button>
        </div>
      </div>

      {/* Section ForMerchants - fond vert clair */}
      <div className="bg-kapkurtar-green-light/30">
        <ForMerchantsSection />
      </div>

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};

export default HomePage;