import React from 'react';
import HeroBanner from '../components/HeroBanner';
import HowItWorks from '../components/HowItWorks';
import FeaturedOffers from '../components/FeaturedOffers';
import ForMerchantsSection from '../components/ForMerchantsSection';
import DownloadAppSection from '../components/DownloadAppSection';
import AppDownloadCTA from '../components/AppDownloadCTA';

const HomePage = () => {
  return (
    <div>
      <HeroBanner />
      <HowItWorks />
      <FeaturedOffers />
      <ForMerchantsSection />
      <DownloadAppSection />
    </div>
  );
};

export default HomePage;