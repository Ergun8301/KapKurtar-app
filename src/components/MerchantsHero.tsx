import React from 'react';
import { TrendingUp, Shield, Zap } from 'lucide-react';

const MerchantsHero = () => {
  const heroImageUrl = "https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/merchants-hero.jpg";
  const fallbackImageUrl = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <div className="relative bg-gradient-to-br from-[#00A690] via-[#00B89F] to-[#008C7A] text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImageUrl}
          alt="KapKurtar İşletmeler"
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
            e.currentTarget.src = fallbackImageUrl;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A690]/90 to-[#008C7A]/80"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                🏪 İşletmeler İçin
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              İsrafı Gelire
              <br />
              <span className="text-[#F7F2E7]">Dönüştürün</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Satılmayan gıdalarınızı atmak yerine <strong>KapKurtar</strong> ile satın.
              Yeni müşteriler kazanın, geliri artırın, çevreye katkıda bulunun.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-black text-[#F7F2E7]">500+</div>
                <div className="text-sm text-white/80">Ortak İşletme</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#F7F2E7]">10K+</div>
                <div className="text-sm text-white/80">Kurtarılan Paket</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#F7F2E7]">%0</div>
                <div className="text-sm text-white/80">İlk 3 Ay</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/merchant/auth"
                className="inline-flex items-center justify-center gap-2 bg-[#F75C00] hover:bg-[#E54B00] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Zap className="w-6 h-6" />
                Hemen Başlayın
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              >
                <TrendingUp className="w-6 h-6" />
                Fiyatları Görün
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F75C00] rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Risk Sıfır</h3>
                    <p className="text-white/80 text-sm">
                      İlk 3 ay tamamen ücretsiz. Satış yapmadığınızda ödeme yok.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F75C00] rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Hızlı Başlangıç</h3>
                    <p className="text-white/80 text-sm">
                      2 dakikada kayıt olun, hemen tekliflerinizi eklemeye başlayın.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F75C00] rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Gelir Artışı</h3>
                    <p className="text-white/80 text-sm">
                      Ortalama %25 gelir artışı. Atılan gıda yerine satış geliri.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48h1440V0s-187.5 48-360 48S720 0 720 0 532.5 48 360 48 0 0 0 0v48z" fill="#F9FAFB"/>
        </svg>
      </div>
    </div>
  );
};

export default MerchantsHero;
