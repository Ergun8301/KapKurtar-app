import React from 'react';
import { Calendar, User, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BlogArticle10 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-[#00A690] hover:text-[#F75C00] transition-colors duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bloga dön
          </a>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-[#00A690] text-white px-4 py-2 rounded-full text-sm font-medium">
              İsraf Karşıtı
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Son kullanma tarihleri: daha iyi tüketmek için anlamak
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Dr. Mehmet Yılmaz</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>22 Eylül 2024</span>
            <span className="mx-3">•</span>
            <span>6 dk okuma</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Gıda ambalajlarında tarihler"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            SKT, TETT, "Son Kullanma Tarihi"... Ambalajlardaki bu tarihler genellikle yanlış anlaşılır.
            Sonuç: hala tüketilebilir tonlarca gıda çöpe gidiyor. Bunları çözmeyi öğrenelim!
          </p>

          <blockquote className="border-l-4 border-[#00A690] pl-6 my-8 italic text-gray-700">
            "Türkiye'de evsel gıda israfının %30'u son kullanma tarihlerinin yanlış anlaşılmasıyla ilgili.
            Oysa SKT ile TETT arasındaki fark çok önemli!"
            <br />
            <span className="text-sm not-italic">- Türk Tarım Bakanlığı, 2024</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <AlertCircle className="inline w-6 h-6 mr-2 text-red-500" />
            SKT: Son Kullanma Tarihi (Son Tüketim Tarihi)
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            SKT <strong>zorunlu</strong> bir tarihtir. Bu tarihten sonra ürün sağlık için risk oluşturabilir.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">📋 SKT özellikleri:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>İfade:</strong> "...tarihine kadar tüketilmeli" / "Son Tüketim Tarihi"</li>
              <li>• <strong>Format:</strong> Kesin tarih (gün/ay/yıl)</li>
              <li>• <strong>Uyma:</strong> Bu tarihten sonra TÜKETMEYİN</li>
              <li>• <strong>Saklama:</strong> Soğuk zincir zorunlu</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">SKT ile ilgili ürünler:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥩 Taze et ve balık</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Kıyma: 24-48 saat</li>
                <li>• Taze tavuk: 2-3 gün</li>
                <li>• Taze balık: 1-2 gün</li>
                <li>• Deniz ürünleri: 24 saat</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥛 Taze süt ürünleri</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Taze süt: 3-4 gün</li>
                <li>• Yoğurt: 3-4 hafta</li>
                <li>• Taze peynir: 1 hafta</li>
                <li>• Taze ayran: 2-3 gün</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥗 Hazır yemekler</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Hazır salatalar: 1-2 gün</li>
                <li>• Sandviçler: 24 saat</li>
                <li>• Catering yemekleri: 2-3 gün</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍰 Taze pastalar</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Krema şanti: 24 saat</li>
                <li>• Muhallebi: 2-3 gün</li>
                <li>• Tiramisu: 2-3 gün</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-100 rounded-lg p-6 my-8">
            <p className="font-bold text-red-800 mb-2">⚠️ ÖNEMLİ</p>
            <p className="text-red-700">
              SKT'den sonra, görünüşü iyi olsa bile ürünü atın. Patojen bakteriler
              görünüş, koku veya tadında değişiklik olmadan gelişebilir.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <CheckCircle className="inline w-6 h-6 mr-2 text-[#00A690]" />
            TETT: Tavsiye Edilen Tüketim Tarihi
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            TETT <strong>gösterge niteliğinde</strong> bir tarihtir. Bu tarihten sonra ürün bazı kaliteleri
            (tat, doku, vitaminler) kaybeder ancak tamamen tüketilebilir ve tehlikesizdir.
          </p>

          <div className="bg-green-50 border-l-4 border-[#00A690] p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">📋 TETT özellikleri:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>İfade:</strong> "Tercihen...tarihinden önce tüketilmeli" / "Tavsiye Edilen Tüketim Tarihi"</li>
              <li>• <strong>Format:</strong> Ürüne göre ay/yıl veya kesin tarih</li>
              <li>• <strong>Esneklik:</strong> Birkaç hafta/ay sonra tüketilebilir</li>
              <li>• <strong>Güvenlik:</strong> Tarihten sonra sağlık riski yok</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">TETT ile ilgili ürünler:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍪 Kuru ürünler</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Makarna: TETT'den +1 yıl sonra</li>
                <li>• Pirinç: TETT'den +1 yıl sonra</li>
                <li>• Un: TETT'den +6 ay sonra</li>
                <li>• Bisküvi: TETT'den +3-6 ay sonra</li>
                <li>• Tahıllar: TETT'den +6 ay sonra</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥫 Konserveler</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Konserveler: TETT'den +2 yıl sonra</li>
                <li>• Kavanozlar: TETT'den +1 yıl sonra</li>
                <li>• Soslar: TETT'den +6 ay sonra</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">☕ İçecekler</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Kahve: TETT'den +1 yıl sonra</li>
                <li>• Çay: TETT'den +1 yıl sonra</li>
                <li>• UHT meyve suları: TETT'den +3 ay sonra</li>
                <li>• Gazlı içecekler: TETT'den +3 ay sonra</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍫 Diğerleri</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Çikolata: TETT'den +6 ay sonra</li>
                <li>• Reçel: TETT'den +1 yıl sonra</li>
                <li>• Bal: sınırsız</li>
                <li>• Tuz/Şeker: sınırsız</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-6 my-8">
            <p className="font-bold text-green-800 mb-2">💡 BİLİNMESİ İYİDİR</p>
            <p className="text-green-700">
              TETT'si 3 hafta geçmiş bir yoğurt mu? Tamamen tüketilebilir! Görünüşü ve tadı
              hafifçe değişebilir, ancak sağlık için hiçbir tehlike oluşturmaz.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Clock className="inline w-6 h-6 mr-2 text-orange-500" />
            Bir ürünün hala iyi olup olmadığını nasıl anlarız?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            TETT'si geçmiş ürünler için, atmadan önce duyularınıza güvenin!
          </p>

          <div className="space-y-6 my-8">
            <div className="bg-white border-2 border-[#00A690] rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👀</span> Görme
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Küfler:</strong> Atın (mavi peynirler hariç)</li>
                <li><strong>Renk değişikliği:</strong> Şüpheli, dikkatle koklayın ve tadın</li>
                <li><strong>Şişmiş ambalaj:</strong> Derhal atın</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-[#00A690] rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👃</span> Koklama
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Ekşi veya acı koku:</strong> Atın</li>
                <li><strong>Olağandışı koku:</strong> Risk almayın</li>
                <li><strong>Şüpheli koku yok:</strong> TETT için muhtemelen OK</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-[#00A690] rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👅</span> Tadma
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Acı veya ekşi tat:</strong> Atın</li>
                <li><strong>Garip doku:</strong> Dikkatli olun</li>
                <li><strong>Normal ama yavan tat:</strong> Tüketilebilir (kalite sadece azalmış)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Özel durumlar</h2>

          <div className="space-y-4 my-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🥖 Ekmek</h4>
              <p className="text-sm text-gray-700">
                Kuru (bayat) ekmek birkaç gün tüketilebilir. Kruton, galeta unu
                veya ekmek tatlısı için kullanın. Sadece küf görünürse atın.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🥚 Yumurtalar</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Tazelik testi:</strong> Yumurtayı soğuk suya batırın.
              </p>
              <ul className="text-xs text-gray-600 ml-4 space-y-1">
                <li>• Dibe çöküyor → Çok taze (rafadan, poşe)</li>
                <li>• Hafifçe kalkıyor → Daha az taze (katı, omlet)</li>
                <li>• Yüzüyor → Atılmalı</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🧀 Peynirler</h4>
              <p className="text-sm text-gray-700">
                Sert peynirler: küflü kısmı kesin, gerisi OK.<br />
                Taze/yumuşak peynirler: küflüyse atın.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">TILKAPP ve son kullanma tarihleri</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            TILKAPP'ta sunulan ürünler genellikle TETT'ye yakın veya hafifçe geçmiş.
            Rahat olun: tamamen tüketilebilir ve kontrol edilmiştir!
          </p>

          <div className="bg-[#FFFFF0] rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">🛡️ TILKAPP garantileri:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• ✅ Tüm partner işletmeler doğrulanmış ve sertifikalıdır</li>
              <li>• ✅ SKT ürünleri son kullanma tarihlerine kesinlikle uyar</li>
              <li>• ✅ TETT'si geçmiş ürünler açıkça belirtilir</li>
              <li>• ✅ Kalite sorunu durumunda iade mümkündür</li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-[#00A690] pl-6 my-8 italic text-gray-700">
            "TILKAPP'ta TETT'si geçmiş bir ürün almak, akıllı bir israf karşıtı harekettir.
            Ürün sağlıklı, kalite yerinde, sadece büyük marketlerin pazarlaması
            bizi çok çabuk atmaya alıştırdı!"
          </blockquote>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Hala mükemmel ürünleri kurtarın</h3>
            <p className="text-gray-700 mb-6">
              TILKAPP tekliflerini keşfedin ve satılmayan ürünlere ikinci bir şans verin
            </p>
            <a
              href="/offers"
              className="bg-[#00A690] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#F75C00] transition-colors duration-300 inline-block"
            >
              Teklifleri görüntüle
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle10;
