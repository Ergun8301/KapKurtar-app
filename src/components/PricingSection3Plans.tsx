import React from 'react';
import { Check, Star, Zap, TrendingUp, Award } from 'lucide-react';

const PricingSection3Plans = () => {
  const plans = [
    {
      name: 'TEMEL',
      price: '0',
      commission: '20',
      badge: null,
      icon: Zap,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      gradient: 'from-gray-50 to-white',
      features: [
        'Sınırsız teklifler',
        'Temel istatistikler',
        'E-posta desteği',
        'Sadece satışta komisyon',
        'Risk sıfır',
      ],
      description: 'Küçük işletmeler için',
      ideal: '1-7 paket/gün',
      highlight: false
    },
    {
      name: 'İŞLETME',
      price: '349',
      commission: '12',
      badge: 'ÖNERİLEN',
      icon: TrendingUp,
      iconBg: 'bg-[#F75C00]',
      iconColor: 'text-white',
      gradient: 'from-[#00A690] via-[#00B89F] to-[#00A690]',
      features: [
        'Tüm Temel özellikler',
        'Gelişmiş istatistikler',
        'Öncelikli destek',
        'Performans raporları',
        'Daha iyi marj',
      ],
      description: 'Orta ölçekli işletmeler için',
      ideal: '8-14 paket/gün',
      highlight: true
    },
    {
      name: 'PREMİUM',
      price: '799',
      commission: '8',
      badge: null,
      icon: Award,
      iconBg: 'bg-[#F75C00]',
      iconColor: 'text-white',
      gradient: 'from-orange-50 to-white',
      features: [
        'Tüm İşletme özellikler',
        'Özel hesap yöneticisi',
        'Özel pazarlama desteği',
        'API erişimi',
        'Maksimum marj',
      ],
      description: 'Yüksek hacimli işletmeler için',
      ideal: '15+ paket/gün',
      highlight: false
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white py-20" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-[#FFFFF0] text-[#00A690] px-4 py-1 rounded-full text-sm font-semibold">
              💰 Fiyatlandırma
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Şeffaf ve Esnek Fiyatlandırma
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Tüm planlar için 3 ay ücretsiz deneme! Planınızı sonra seçin.
          </p>
          <div className="bg-gradient-to-r from-[#00A690] to-[#008C7A] text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-2xl inline-block">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <div className="text-2xl">İLK 3 AY TAMAMEN ÜCRETSİZ</div>
                <div className="text-sm font-normal opacity-90">%0 komisyon + 0₺ abonelik • Hemen başlayın!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards - Grid 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.highlight
                  ? 'shadow-2xl ring-4 ring-[#00A690] ring-offset-4'
                  : 'shadow-lg'
              }`}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0fffe 100%)'
                  : 'white'
              }}
            >
              {/* Badge Recommandé */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#F75C00] to-[#FF6B1A] text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {plan.badge}
                    <Star className="w-4 h-4" fill="currentColor" />
                  </div>
                </div>
              )}

              {/* Header avec gradient */}
              <div className={`relative pt-${plan.badge ? '12' : '8'} pb-8 px-8 bg-gradient-to-br ${plan.gradient}`}>
                {plan.highlight && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A690]/10 to-transparent"></div>
                )}

                {/* Icon */}
                <div className={`inline-flex ${plan.iconBg} ${plan.iconColor} p-3 rounded-xl mb-4 shadow-md`}>
                  <plan.icon className="w-8 h-8" />
                </div>

                <h3 className="text-3xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Prix */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black ${plan.highlight ? 'text-[#F75C00]' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-gray-700">TRY</span>
                      <span className="text-sm text-gray-500">/ay</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-gray-600">+</span>
                    <span className={`text-3xl font-bold ${plan.highlight ? 'text-[#F75C00]' : 'text-gray-700'}`}>
                      {plan.commission}%
                    </span>
                    <span className="text-sm text-gray-600">komisyon satışta</span>
                  </div>
                </div>

                {/* Idéal pour */}
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                  plan.highlight
                    ? 'bg-[#F75C00]/10 text-[#F75C00]'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  📦 {plan.ideal}
                </div>
              </div>

              {/* Features */}
              <div className="p-8 bg-white">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        plan.highlight ? 'bg-[#00A690]' : 'bg-gray-200'
                      }`}>
                        <Check className={`w-4 h-4 ${plan.highlight ? 'text-white' : 'text-gray-600'}`} strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Single Big CTA Button */}
        <div className="flex justify-center mb-8">
          <a
            href="/merchant/auth"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#00A690] to-[#008C7A] text-white px-12 py-5 rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ücretsiz Başlayın - 3 Ay Deneme
          </a>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Planınızı 4. aydan önce seçeceksiniz. Şimdilik sadece başlayın!
        </p>
      </div>
    </div>
  );
};

export default PricingSection3Plans;
