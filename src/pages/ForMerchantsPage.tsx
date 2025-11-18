import React, { useState } from 'react';
import MerchantsHero from '../components/MerchantsHero';
import PricingSection3Plans from '../components/PricingSection3Plans';

// Calculatrice Interactive Component
const CalculatorWidget = () => {
  const [productsPerDay, setProductsPerDay] = useState(10);
  const [avgPrice, setAvgPrice] = useState(50);

  const dailyLoss = productsPerDay * avgPrice;
  const monthlyLoss = dailyLoss * 25;
  const yearlyLoss = monthlyLoss * 12;

  const dailyGain = dailyLoss * 0.8;
  const monthlyGain = dailyGain * 25;
  const yearlyGain = monthlyGain * 12;

  const commission = dailyLoss * 0.2;

  return (
    <div className="space-y-6">
      {/* Slider 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Günlük atılan ürün sayısı: <span className="text-[#00A690] font-bold">{productsPerDay}</span>
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={productsPerDay}
          onChange={(e) => setProductsPerDay(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A690]"
        />
      </div>

      {/* Slider 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ortalama ürün fiyatı: <span className="text-[#00A690] font-bold">{avgPrice} TRY</span>
        </label>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={avgPrice}
          onChange={(e) => setAvgPrice(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A690]"
        />
      </div>

      {/* Séparateur */}
      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* Résultats */}
      <div className="space-y-4">
        {/* Perte actuelle */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">❌ Şu an (çöp)</p>
              <p className="text-xs text-red-600">Aylık kayıp</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{monthlyLoss.toLocaleString()} TRY</p>
          </div>
        </div>

        {/* Gain avec KapKurtar */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">✅ KapKurtar ile (80% size)</p>
              <p className="text-xs text-green-600">Aylık kazancınız</p>
            </div>
            <p className="text-2xl font-bold text-green-600">+{monthlyGain.toLocaleString()} TRY</p>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Komisyon (20%)</p>
              <p className="text-xs text-orange-600">Sadece sattığınızda</p>
            </div>
            <p className="text-xl font-bold text-orange-600">{(commission * 25).toLocaleString()} TRY/ay</p>
          </div>
        </div>

        {/* Gain annuel */}
        <div className="bg-gradient-to-r from-[#00A690] to-[#008C7A] p-6 rounded-xl text-white mt-6">
          <p className="text-sm font-medium mb-2">💰 Yıllık toplam kazanç</p>
          <p className="text-4xl font-bold">+{yearlyGain.toLocaleString()} TRY</p>
          <p className="text-sm text-white/80 mt-2">
            Çöpe atılan 0 TRY yerine
          </p>
        </div>
      </div>

      {/* CTA */}
      <a
        href="/merchant/auth"
        className="block w-full bg-[#F75C00] text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-[#FF6B1A] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        Ücretsiz Başlayın →
      </a>
      <p className="text-xs text-gray-500 text-center">
        İlk 3 ay tamamen ücretsiz • Kredi kartı gerektirmez
      </p>
    </div>
  );
};

const ForMerchantsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <MerchantsHero />

      {/* Calculatrice Interactive */}
      <div id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-[#00A690] to-[#008C7A] rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Gauche - Photo Impact */}
            <div className="relative h-64 lg:h-auto">
              <img
                src="https://images.pexels.com/photos/3737581/pexels-photo-3737581.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Gaspillage alimentaire"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
                <div className="text-white">
                  <h3 className="text-3xl font-bold mb-4">Dur Gıda İsrafına</h3>
                  <p className="text-lg text-white/90 mb-4">
                    Her gün çöpe atılan ürünlerinizi gelire dönüştürün
                  </p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      🌍 Çevreyi koruyun
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      💰 Para kazanın
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Droite - Calculatrice */}
            <div className="p-8 lg:p-12 bg-white">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                🧮 Kazanç Hesaplayıcı
              </h2>
              <p className="text-gray-600 mb-8">
                Günlük kayıplarınızı gelire dönüştürün
              </p>

              <CalculatorWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Exemples Concrets par Type de Commerce */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            💼 İşletme Tipi'nize Göre Kazanç Örnekleri
          </h2>
          <p className="text-lg text-gray-600">
            Sizin gibi işletmeler ne kadar kazanıyor?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Exemple 1 - Petit Boulanger */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🥖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Küçük Fırın</h3>
              <p className="text-sm text-gray-600">Konyaaltı, Antalya</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Günlük atılan ürün</p>
                <p className="text-lg font-bold text-gray-900">15 ekmek × 20 TRY</p>
              </div>

              <div className="bg-red-100 rounded-lg p-4">
                <p className="text-xs text-red-700 mb-1">❌ Önceki kayıp</p>
                <p className="text-2xl font-bold text-red-600">7,500 TRY/ay</p>
              </div>

              <div className="bg-green-100 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">✅ KapKurtar ile kazanç</p>
                <p className="text-2xl font-bold text-green-600">+6,000 TRY/ay</p>
                <p className="text-xs text-green-600 mt-1">(80% sizin)</p>
              </div>

              <div className="bg-gradient-to-r from-[#00A690] to-[#008C7A] rounded-lg p-4 text-white text-center">
                <p className="text-sm mb-1">Yıllık kazanç</p>
                <p className="text-3xl font-bold">72,000 TRY</p>
              </div>
            </div>
          </div>

          {/* Exemple 2 - Restaurant Moyen */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition-shadow ring-4 ring-[#F75C00] ring-offset-2 relative">
            <div className="absolute top-2 right-2">
              <span className="bg-[#F75C00] text-white text-xs font-bold px-3 py-1 rounded-full">
                EN POPÜLER
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🍽️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Orta Boy Restoran</h3>
              <p className="text-sm text-gray-600">Muratpaşa, Antalya</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Günlük atılan porsiyon</p>
                <p className="text-lg font-bold text-gray-900">20 porsiyon × 80 TRY</p>
              </div>

              <div className="bg-red-100 rounded-lg p-4">
                <p className="text-xs text-red-700 mb-1">❌ Önceki kayıp</p>
                <p className="text-2xl font-bold text-red-600">40,000 TRY/ay</p>
              </div>

              <div className="bg-green-100 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">✅ KapKurtar ile kazanç</p>
                <p className="text-2xl font-bold text-green-600">+32,000 TRY/ay</p>
                <p className="text-xs text-green-600 mt-1">(80% sizin)</p>
              </div>

              <div className="bg-gradient-to-r from-[#00A690] to-[#008C7A] rounded-lg p-4 text-white text-center">
                <p className="text-sm mb-1">Yıllık kazanç</p>
                <p className="text-3xl font-bold">384,000 TRY</p>
              </div>
            </div>
          </div>

          {/* Exemple 3 - Grand Supermarché */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🏪
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Süpermarket</h3>
              <p className="text-sm text-gray-600">Lara, Antalya</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Günlük atılan ürün</p>
                <p className="text-lg font-bold text-gray-900">50 ürün × 120 TRY</p>
              </div>

              <div className="bg-red-100 rounded-lg p-4">
                <p className="text-xs text-red-700 mb-1">❌ Önceki kayıp</p>
                <p className="text-2xl font-bold text-red-600">150,000 TRY/ay</p>
              </div>

              <div className="bg-green-100 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">✅ KapKurtar ile kazanç</p>
                <p className="text-2xl font-bold text-green-600">+120,000 TRY/ay</p>
                <p className="text-xs text-green-600 mt-1">(80% sizin)</p>
              </div>

              <div className="bg-gradient-to-r from-[#00A690] to-[#008C7A] rounded-lg p-4 text-white text-center">
                <p className="text-sm mb-1">Yıllık kazanç</p>
                <p className="text-3xl font-bold">1,440,000 TRY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action sous les exemples */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">
            Hangisine benziyorsunuz? Hemen hesaplayın! 👆
          </p>
          <a
            href="#calculator"
            className="inline-block bg-[#F75C00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#FF6B1A] transition-colors shadow-lg"
          >
            Kendi Kazancımı Hesapla 🧮
          </a>
        </div>
      </div>

      {/* FAQ Commission */}
      <div className="bg-[#F7F2E7] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ❓ Neden Abonelik Değil, Komisyon?
            </h2>
            <p className="text-lg text-gray-600">
              Başarınız bizim başarımız - Siz kazanırsanız biz kazanırız
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Abonnement */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Abonelik Modeli</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Sabit aylık maliyet (500-1000 TRY)
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Az satış olsa bile ödeme
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Mali baskı ve risk
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Küçük işletmeler için ağır
                </li>
              </ul>
            </div>

            {/* Commission */}
            <div className="bg-gradient-to-br from-[#00A690] to-[#008C7A] rounded-2xl p-8 shadow-2xl text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-bold">Komisyon Modeli</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#F7F2E7] mr-2">•</span>
                  Sadece sattığınızda ödeme (%20)
                </li>
                <li className="flex items-start">
                  <span className="text-[#F7F2E7] mr-2">•</span>
                  Satış yok = Maliyet yok
                </li>
                <li className="flex items-start">
                  <span className="text-[#F7F2E7] mr-2">•</span>
                  Sıfır risk - Tam güvenlik
                </li>
                <li className="flex items-start">
                  <span className="text-[#F7F2E7] mr-2">•</span>
                  Başarınızla ölçeklenir
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-semibold mb-2">Örnek:</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Satış: 10,000 TRY</span>
                    <span className="font-bold">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size: 8,000 TRY (80%)</span>
                    <span className="font-bold text-[#F7F2E7]">💰</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Komisyon: 2,000 TRY (20%)</span>
                    <span className="font-bold">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact écologique */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <img
                src="https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Nature"
                className="w-24 h-24 rounded-full object-cover mr-6"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🌍 Para Kazanın + Dünyayı Kurtarın
                </h3>
                <p className="text-gray-600">
                  Her kaydettiğiniz ürün çevreye katkı sağlar
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00A690] mb-2">-150 kg</div>
                <p className="text-sm text-gray-600">CO₂ tasarrufu/yıl</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00A690] mb-2">-12,000 L</div>
                <p className="text-sm text-gray-600">Su tasarrufu/yıl</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00A690] mb-2">= 15 🌳</div>
                <p className="text-sm text-gray-600">Ağaç eşdeğeri</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works - Version améliorée */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-lg text-gray-600">4 basit adımda gelir elde edin</p>
        </div>

        <div className="relative">
          {/* Ligne de connexion */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#00A690] via-[#F75C00] to-[#00A690] transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Étape 1 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00A690] to-[#008C7A] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kayıt Olun</h3>
              <p className="text-sm text-gray-600">5 dakikada hesap oluşturun</p>
            </div>

            {/* Étape 2 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F75C00] to-[#FF6B1A] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Teklif Yayınlayın</h3>
              <p className="text-sm text-gray-600">Fotoğraf + fiyat ekleyin</p>
            </div>

            {/* Étape 3 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Müşteri Rezerve Eder</h3>
              <p className="text-sm text-gray-600">Online ödeme alırsınız</p>
            </div>

            {/* Étape 4 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                4
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Para Kazanın</h3>
              <p className="text-sm text-gray-600">%80 kazanç otomatik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <PricingSection3Plans />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Testimonials - Version améliorée */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bize Güvenenler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Témoignage 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Ahmet"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
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

            {/* Témoignage 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Fatma"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
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

            {/* Témoignage 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Mehmet"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
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
      </div>

      {/* Download App Section */}
      <div className="bg-gradient-to-br from-[#F7F2E7] to-white py-16">
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
      <div className="bg-[#00A690] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Sorularınız mı var?</h2>
          <p className="text-xl text-[#F7F2E7] mb-8">
            Ekibimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-[#00A690] px-8 py-4 rounded-lg hover:bg-[#F7F2E7] transition-colors font-bold text-lg"
          >
            Bize Ulaşın
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForMerchantsPage;
