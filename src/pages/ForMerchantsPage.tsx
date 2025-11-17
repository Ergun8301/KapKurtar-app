import React from 'react';
import { TrendingUp, Clock, Users, Smartphone, CheckCircle, BarChart3, Shield, Zap } from 'lucide-react';
import MerchantsHero from '../components/MerchantsHero';
import PricingSection3Plans from '../components/PricingSection3Plans';

const ForMerchantsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <MerchantsHero />

      {/* Problem Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sorun</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">5-15%</div>
              <p>her gün atılan stok</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">2,3M</div>
              <p>Türkiye'de yılda israf edilen ton</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">-100%</div>
              <p>atılan ürünlerdeki kar marjı</p>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">KapKurtar Çözümü</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Satılmayan ürünlerinizi atmak yerine, motive müşterilere indirimli fiyatlarla satın.
            Her şeyi kaybetmek yerine değerinin %50'sine kadar geri kazanın.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-kapkurtar-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">+%30 Gelir</h3>
            <p className="text-sm text-gray-600">Satılmayan ürünlerinizin değerinin %30-50'sini geri kazanın</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-kapkurtar-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-kapkurtar-gray" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">2 Dakika</h3>
            <p className="text-sm text-gray-600">Akıllı telefonunuzdan teklif yayınlamak için</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Yeni Müşteriler</h3>
            <p className="text-sm text-gray-600">Hiç ulaşamayacağınız müşterilere ulaşın</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">%100 Ücretsiz</h3>
            <p className="text-sm text-gray-600">Kayıt veya abonelik ücreti yok</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-kapkurtar-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kayıt</h3>
              <p className="text-sm text-gray-600">İşletme hesabınızı 5 dakikada oluşturun</p>
            </div>

            <div className="text-center">
              <div className="bg-kapkurtar-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Yayınlama</h3>
              <p className="text-sm text-gray-600">Satılmayan ürünlerinizi fotoğraf ve indirimli fiyatla yayınlayın</p>
            </div>

            <div className="text-center">
              <div className="bg-kapkurtar-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Rezervasyon</h3>
              <p className="text-sm text-gray-600">Müşteriler uygulama üzerinden rezervasyon yapar ve öder</p>
            </div>

            <div className="text-center">
              <div className="bg-kapkurtar-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Teslim Alma</h3>
              <p className="text-sm text-gray-600">Müşteri siparişini almaya gelir</p>
            </div>
          </div>
        </div>

      </div>

      {/* Pricing */}
      <PricingSection3Plans />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bize Güvenenler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-kapkurtar-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  A
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ahmet</div>
                  <div className="text-sm text-gray-600">Fırın, Konyaaltı</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "KapKurtar'tan önce günde 50 ekmek atıyordum. Şimdi sadece 5 tane atıyorum.
                İşletmem için gerçek bir değişiklik!"
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-kapkurtar-yellow text-kapkurtar-gray rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  F
                </div>
                <div>
                  <div className="font-bold text-gray-900">Fatma</div>
                  <div className="text-sm text-gray-600">Gourmet Market, Lara</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "KapKurtar kayıplarımı %70 azaltmamı sağladı. Ayrıca, müşterilerim
                daha sonra normal fiyattan satın aldıkları yeni ürünleri keşfediyorlar."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  M
                </div>
                <div>
                  <div className="font-bold text-gray-900">Mehmet</div>
                  <div className="text-sm text-gray-600">Restoran, Muratpaşa</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Öğlen yemeklerimi servis sonunda sunuyorum. Basit, hızlı
                ve bana önemli bir ek gelir sağlıyor."
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-kapkurtar-green-light rounded-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">İhtiyacınız Olan Tüm Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Basit Arayüz</h3>
                <p className="text-sm text-gray-700">Sezgisel mobil uygulama, eğitim gerektirmez</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Güvenli Ödeme</h3>
                <p className="text-sm text-gray-700">Müşteriler online öder, otomatik olarak ödeme alırsınız</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Gerçek Zamanlı Bildirimler</h3>
                <p className="text-sm text-gray-700">Sipariş verilir verilmez bildirim alın</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Detaylı İstatistikler</h3>
                <p className="text-sm text-gray-700">Satışlarınızı ve israf önleme etkinizi takip edin</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Esnek Saatler</h3>
                <p className="text-sm text-gray-700">Teslim alma zamanlarını istediğiniz gibi belirleyin</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-kapkurtar-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Hızlı Destek</h3>
                <p className="text-sm text-gray-700">Ekibimiz her adımda size eşlik eder</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Download App Section */}
      <div className="bg-gradient-to-br from-kapkurtar-green-light to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📱 Mobil Uygulamamızı İndirin
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Tekliflerinizi her yerden yönetin. Yakında Google Play ve App Store'da!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 bg-gray-800/10 border-2 border-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold opacity-60 cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play'de Yakında
            </button>
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 bg-gray-800/10 border-2 border-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold opacity-60 cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
              </svg>
              App Store'da Yakında
            </button>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-kapkurtar-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Sorularınız mı var?</h2>
          <p className="text-xl text-kapkurtar-green-light mb-8">
            Ekibimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-kapkurtar-green px-8 py-4 rounded-lg hover:bg-kapkurtar-green-light transition-colors font-bold text-lg"
          >
            Bize Ulaşın
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForMerchantsPage;
