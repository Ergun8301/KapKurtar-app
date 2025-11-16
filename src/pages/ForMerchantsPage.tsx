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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">TILKAPP Çözümü</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Satılmayan ürünlerinizi atmak yerine, motive müşterilere indirimli fiyatlarla satın.
            Her şeyi kaybetmek yerine değerinin %50'sine kadar geri kazanın.
          </p>
        </div>

      </div>

      {/* Pricing */}
      <PricingSection3Plans />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-[#00A690] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">+%30 Gelir</h3>
            <p className="text-sm text-gray-600">Satılmayan ürünlerinizin değerinin %30-50'sini geri kazanın</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-[#F75C00] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
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
              <div className="bg-[#00A690] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kayıt</h3>
              <p className="text-sm text-gray-600">İşletme hesabınızı 5 dakikada oluşturun</p>
            </div>

            <div className="text-center">
              <div className="bg-[#00A690] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Yayınlama</h3>
              <p className="text-sm text-gray-600">Satılmayan ürünlerinizi fotoğraf ve indirimli fiyatla yayınlayın</p>
            </div>

            <div className="text-center">
              <div className="bg-[#00A690] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Rezervasyon</h3>
              <p className="text-sm text-gray-600">Müşteriler uygulama üzerinden rezervasyon yapar ve öder</p>
            </div>

            <div className="text-center">
              <div className="bg-[#00A690] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Teslim Alma</h3>
              <p className="text-sm text-gray-600">Müşteri siparişini almaya gelir</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bize Güvenenler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#00A690] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  A
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ahmet</div>
                  <div className="text-sm text-gray-600">Fırın, Konyaaltı</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "TILKAPP'tan önce günde 50 ekmek atıyordum. Şimdi sadece 5 tane atıyorum.
                İşletmem için gerçek bir değişiklik!"
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#F75C00] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  F
                </div>
                <div>
                  <div className="font-bold text-gray-900">Fatma</div>
                  <div className="text-sm text-gray-600">Gourmet Market, Lara</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "TILKAPP kayıplarımı %70 azaltmamı sağladı. Ayrıca, müşterilerim
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
        <div className="bg-[#F7F2E7] rounded-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">İhtiyacınız Olan Tüm Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Basit Arayüz</h3>
                <p className="text-sm text-gray-700">Sezgisel mobil uygulama, eğitim gerektirmez</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Güvenli Ödeme</h3>
                <p className="text-sm text-gray-700">Müşteriler online öder, otomatik olarak ödeme alırsınız</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Gerçek Zamanlı Bildirimler</h3>
                <p className="text-sm text-gray-700">Sipariş verilir verilmez bildirim alın</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Detaylı İstatistikler</h3>
                <p className="text-sm text-gray-700">Satışlarınızı ve israf önleme etkinizi takip edin</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Esnek Saatler</h3>
                <p className="text-sm text-gray-700">Teslim alma zamanlarını istediğiniz gibi belirleyin</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#00A690] flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Hızlı Destek</h3>
                <p className="text-sm text-gray-700">Ekibimiz her adımda size eşlik eder</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Final CTA */}
      <div className="bg-[#00A690] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Satılmayan Ürünlerinizi Gelire Dönüştürmeye Hazır mısınız?</h2>
          <p className="text-xl text-[#F7F2E7] mb-8">
            TILKAPP'a ücretsiz katılın ve bugün satmaya başlayın
          </p>
          <a
            href="/merchant/auth"
            className="inline-block bg-[#F75C00] text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg"
          >
            İşletme Hesabımı Oluştur
          </a>
          <p className="text-sm text-[#F7F2E7] mt-4">
            5 dakikada kayıt • Kredi kartı gerektirmez
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForMerchantsPage;