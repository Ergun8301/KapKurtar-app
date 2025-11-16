import React from 'react';
import { Calendar, User, ArrowLeft, Heart, TrendingDown, Utensils } from 'lucide-react';

const BlogArticle9 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-tilkapp-green hover:text-tilkapp-orange transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bloga dön
          </a>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-tilkapp-green text-white px-4 py-2 rounded-full text-sm font-medium">
              İsraf Karşıtı
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            TILKAPP ile tasarruf ederken sağlıklı beslenmek
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Diyetisyen Elif</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>30 Eylül 2024</span>
            <span className="mx-3">•</span>
            <span>7 dk okuma</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Sağlıklı ve dengeli öğün"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sağlıklı beslenmenin pahalı olduğu sık duyulur. TILKAPP ile, kaliteli satılmayan ürünler
            sayesinde kısıtlı bütçeyi dengeli beslenme ile nasıl uzlaştıracağınızı keşfedin.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <TrendingDown className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            "Sağlıklı yemek = pahalı" efsanesi
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Yaygın kanaatin aksine, dengeli beslenme mutlaka daha pahalı değildir.
            Sorun? Taze ve kaliteli ürünler genellikle birçok aile için bütçe dışı.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">📊 Türkiye'de bazı rakamlar:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• 4 kişilik bir aile beslenme için ayda ortalama <strong>4.000-5.000 TL</strong> harcıyor</li>
              <li>• Taze meyve ve sebzeler bu bütçenin <strong>%30-40'ını</strong> oluşturuyor</li>
              <li>• Türklerin <strong>%60'ı</strong> fiyatlar nedeniyle taze ürün tüketimlerini azalttıklarını bildiriyor</li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "TILKAPP sabah satılanlara eşdeğer kalitede ürünlere, fakat yarı fiyatına erişim sağlıyor.
            Sağlıklı beslenme erişimi için bir devrim."
            <br />
            <span className="text-sm not-italic">- Dr. Elif Yıldız, diyetisyen</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Heart className="inline w-6 h-6 mr-2 text-red-500" />
            Dengeli beslenmenin temelleri
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Tasarruftan bahsetmeden önce, Türk Sağlık Bakanlığı tavsiyelerine göre
            dengeli bir tabağın ne olduğunu hatırlayalım.
          </p>

          <div className="bg-tilkapp-beige rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">🍽️ İdeal tabak:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">%50 Sebze</p>
                <p className="text-sm text-gray-700">Taze, pişmiş veya çiğ. Renkleri çeşitlendirin!</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">%25 Protein</p>
                <p className="text-sm text-gray-700">Et, balık, yumurta, baklagiller</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">%25 Nişasta</p>
                <p className="text-sm text-gray-700">Ekmek, pirinç, makarna, bulgur, patates</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">+ Süt ürünleri</p>
                <p className="text-sm text-gray-700">Peynir, yoğurt, ayran</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Utensils className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            TILKAPP dengeli beslenmeyi nasıl kolaylaştırıyor
          </h2>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Taze meyve ve sebzeye kolay erişim</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Partner manavlar düzenli olarak hafif solmuş veya fazla meyve ve sebzeleri
            %50 / %70 indirimle sunuyor.
          </p>
          <div className="bg-green-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Somut örnek:</strong> Konyaaltı'nda bir manav her akşam çeşitli 3kg sebze sepeti
              (domates, salatalık, biber, patlıcan) 60 TL yerine 25 TL'ye sunuyor.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Sonuç:</strong> 4 kişilik bir aile için bu ayda sadece sebzelerde
              420 TL tasarruf anlamına geliyor!
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Uygun fiyatlı dengeli hazır yemekler</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Restoranlar genellikle servis sonunda satılmayan günlük yemeklerini sunuyor.
            Yemek pişirmeye vakti olmayanlar için bir nimet.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Örnek:</strong> Muratpaşa'da bir restoran 19:00-20:00 arası tam menüyü
              (çorba + ana yemek + garnitür) 85 TL yerine 40 TL'ye sunuyor.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Beslenme kalitesi:</strong> Taze sebzeler, kaliteli proteinler, bol porsiyonlar.
              Öğle servisi ile aynı!
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Tam buğday ekmek ve tahıl ürünleri</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Beyaz ekmekten daha besleyici olan tam buğday ekmek genellikle daha pahalıdır.
            TILKAPP'ta gün sonunda indirimli bulursunuz.
          </p>
          <div className="bg-amber-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700">
              <strong>Bilinmesi gereken:</strong> Bir günlük ekmek tamamen tüketilebilir ve
              tüm besin değerlerini korur. Daha az nemli olduğu için sindirim için bile daha iyidir!
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Referans: Ayşe'nin gıda bütçesi</h2>
          <div className="bg-gray-100 rounded-lg p-6 my-8">
            <p className="text-gray-700 mb-4">
              38 yaşında, 3 çocuk annesi, Antalya'da öğretmen olan Ayşe, TILKAPP'ı 8 aydır kullanıyor.
              Gıda bütçesini nasıl dönüştürdüğü:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-red-50 rounded p-4">
                <h4 className="font-bold text-gray-900 mb-3">❌ TILKAPP öncesi</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Aylık bütçe: 5.200 TL</li>
                  <li>• Meyve/sebze: Haftada maksimum 2 kez</li>
                  <li>• Hazır yemek: asla (çok pahalı)</li>
                  <li>• İsraf: ~300 TL/ay</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded p-4">
                <h4 className="font-bold text-gray-900 mb-3">✅ TILKAPP ile</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Aylık bütçe: 3.800 TL</li>
                  <li>• Meyve/sebze: Haftada 4-5 kez</li>
                  <li>• Hazır yemek: Haftada 2 kez</li>
                  <li>• İsraf: neredeyse yok</li>
                </ul>
              </div>
            </div>

            <p className="text-gray-700 italic">
              "Her ay tasarruf ettiğimiz 1.400 TL ile çocukların spor aktivitelerini yeniden başlatabildik.
              Ve eskisinden daha çeşitli yiyoruz!"
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">TILKAPP ile haftalık menü fikirleri</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Geleneksel alışverişi ve TILKAPP tekliflerini birleştirerek tipik bir hafta örneği.
          </p>

          <div className="space-y-4 my-8">
            {[
              { gun: 'Pazartesi', ogle: 'Mercimek salatası + TILKAPP tam buğday ekmek', aksam: 'Balık + TILKAPP buharda sebze' },
              { gun: 'Salı', ogle: 'Balık artığı + pirinç', aksam: 'TILKAPP restoran menüsü (çorba + ana yemek)' },
              { gun: 'Çarşamba', ogle: 'Yumurta + TILKAPP sote sebze', aksam: 'Makarna + ev yapımı domates sosu (TILKAPP domates)' },
              { gun: 'Perşembe', ogle: 'TILKAPP ekmek + peynir + çiğ sebze sandviç', aksam: 'Fırında tavuk + patates püresi + salata' },
              { gun: 'Cuma', ogle: 'TILKAPP sebze çorbası + ekmek', aksam: 'Ev yapımı pizza (taban olarak TILKAPP ekmek)' },
              { gun: 'Cumartesi', ogle: 'Brunch (TILKAPP hamur işleri + yumurta + meyve)', aksam: 'Köfte + bulgur + yoğurt' },
              { gun: 'Pazar', ogle: 'Geleneksel aile yemeği', aksam: 'Çorba + ekmek + TILKAPP peynir' }
            ].map((menu, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-tilkapp-green mb-2">{menu.gun}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div><strong>Öğle:</strong> {menu.ogle}</div>
                  <div><strong>Akşam:</strong> {menu.aksam}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">💡 Diyetisyen ipucu:</h3>
            <p className="text-gray-700 text-sm">
              TILKAPP ürünleri pişmiş preparatlar (çorba, graten, komposto, smoothie) için mükemmel.
              Bir meyve veya sebze artık görsel olarak mükemmel olmasa bile, tüm besinlerini korur!
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Kaçınılması gereken tuzaklar</h2>
          <div className="space-y-4 my-8">
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">İhtiyaç olmadan satın almak</p>
                <p className="text-sm text-gray-600">%50 indirimli olsa bile, tüketmezseniz israftır</p>
              </div>
            </div>
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Planlamayı ihmal etmek</p>
                <p className="text-sm text-gray-600">Menülerinizi mevcut tekliflere göre planlayın</p>
              </div>
            </div>
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Dondurmayı unutmak</p>
                <p className="text-sm text-gray-600">Fazlalıklar mı var? Hemen dondurun!</p>
              </div>
            </div>
          </div>

          <div className="bg-tilkapp-green text-white rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Bugünden daha iyisini daha ucuza yiyin</h3>
            <p className="mb-6 text-tilkapp-beige">
              TILKAPP'ı indirin ve yakınınızdaki teklifleri keşfedin
            </p>
            <a
              href="/download"
              className="bg-white text-tilkapp-green px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-beige transition-colors inline-block"
            >
              Uygulamayı indir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle9;
