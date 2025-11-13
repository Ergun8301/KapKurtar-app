import React from 'react';
import HeroBanner from '../components/HeroBanner';
import HowItWorks from '../components/HowItWorks';
import FeaturedOffers from '../components/FeaturedOffers';
import ForMerchantsSection from '../components/ForMerchantsSection';

const HomePage = () => {
  return (
    <div>
      <HeroBanner />
      <HowItWorks />
      <FeaturedOffers />
      <ForMerchantsSection />
    </div>
  );
};

export default HomePage;