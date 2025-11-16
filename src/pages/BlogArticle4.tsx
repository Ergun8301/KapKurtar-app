import React from 'react';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const BlogArticle4 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-[#00A690] hover:text-[#F75C00] transition-colors duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bloga dön
          </a>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-[#00A690] text-white px-4 py-2 rounded-full text-sm font-medium">
              Referanslar
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            "KapKurtar tüketim şeklimi değiştirdi"
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Zeynep K.</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>1 Kasım 2024</span>
            <span className="mx-3">•</span>
            <span>4 dk okuma</span>
          </div>
          <img
            src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Zeynep KapKurtar alışverişleriyle"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            32 yaşındaki iki çocuk annesi ve Antalya'da öğretmen olan Zeynep, KapKurtar'ı 6 aydır kullanıyor.
            Uygulamanın tüketim alışkanlıklarını ve aile bütçesini nasıl dönüştürdüğünü anlatıyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">KapKurtar'ı keşfetmek</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            "KapKurtar'ı tesadüfen, gıda harcamalarımı azaltmak için çözüm ararken keşfettim.
            İki çocukla market bütçesi hızla artabiliyor! Başta şüpheliydim: %50 indirimli ürünler,
            gerçek olamayacak kadar güzel görünüyordu."
          </p>

          <blockquote className="border-l-4 border-[#00A690] pl-6 my-8 italic text-gray-700">
            "İlk siparişimi aldığımda kaliteye şaşırdım.
            Aynı sabah tam fiyata satılan ürünlerle tamamen aynıydılar!"
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Önemli tasarruflar</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Altı ayda Zeynep, aile gıda bütçesinden yaklaşık 2.000 TL tasarruf ettiğini tahmin ediyor.
            "Haftada 2-3 kez sipariş veriyorum, çoğunlukla taze ekmek, hamur işleri ve bazen hazır yemekler.
            İşten geç geldiğim akşamlar için mükemmel."
          </p>

          <div className="bg-[#F7F2E7] rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">Zeynep'in KapKurtar ile aylık bütçesi:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Ekmek ve hamur işleri: Ayda 150 TL tasarruf</li>
              <li>• Meyve ve sebzeler: Ayda 200 TL tasarruf</li>
              <li>• Hazır yemekler: Ayda 100 TL tasarruf</li>
              <li>• <strong>Toplam: Ayda ~450 TL tasarruf</strong></li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Olumlu çevresel etki</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Mali yönün ötesinde Zeynep, gıda israfıyla mücadeleye katkıda bulunmaktan gurur duyuyor.
            "Çocuklarım yiyecek atmamanın önemini anladılar. Artık evde sık sık bunun hakkında konuşuyoruz."
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Favori işletmeleri</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Zeynep'in alışkanlıkları var: "Okulun yakınındaki fırın her zaman gün sonunda mükemmel ürünler sunuyor.
            Pazardaki manav da hafif solmuş meyve ve sebzelerini rakipsiz fiyatlarla satışa çıkarıyor.
            Smoothie'lerim ve çorbalarım için mükemmel!"
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">İyi başlamak için tavsiyeleri</h2>
          <div className="bg-white border-2 border-[#00A690] rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">Zeynep'in 5 tavsiyesi:</h3>
            <ol className="space-y-3 text-gray-700">
              <li><strong>1. Bildirimleri açın</strong> - Favori işletmelerinizin hiçbir teklifini kaçırmamak için</li>
              <li><strong>2. Menülerinizi planlayın</strong> - KapKurtar'ı alışverişlerinizi tamamlamak için kullanın, değiştirmek için değil</li>
              <li><strong>3. Esnek olun</strong> - Teklifler her gün değişir, yemeklerinizi buna göre uyarlayın</li>
              <li><strong>4. Birkaç işletme deneyin</strong> - Favorilerinizi hızlıca bulacaksınız</li>
              <li><strong>5. Çevrenizle paylaşın</strong> - Ne kadar çok olursak, o kadar çok gıdayı kurtarırız!</li>
            </ol>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">KapKurtar ile gelecek</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            "Artık onsuz yapamıyorum! KapKurtar artık günlük rutinimin bir parçası.
            Her sabah kahvemi içerken uygulamayı kontrol ediyorum ve akşam için ilgimi çeken şeyleri ayırtıyorum."
          </p>

          <blockquote className="border-l-4 border-[#00A690] pl-6 my-8 italic text-gray-700">
            "Tüm bunlardaki en güzel şey? Çocuklarım gerçek israf karşıtı elçiler oldular.
            Okuldaki arkadaşlarına bundan bahsediyorlar!"
          </blockquote>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Siz de harekete katılın!</h3>
            <p className="text-gray-700 mb-6">
              KapKurtar'ı indirin ve gezegeni kurtarırken tasarruf etmeye başlayın
            </p>
            <a
              href="/download"
              className="bg-[#00A690] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#F75C00] transition-colors inline-block"
            >
              Uygulamayı indir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle4;