import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Search, ExternalLink } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  featured_image_url: string;
  reading_time: number;
  external_url?: string; // Pour les articles externes
}

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Tümü', 'İsraf Önleme', 'Tarifler', 'Tavsiyeler', 'Görüşler', 'Haberler'];

  const blogPosts: BlogPost[] = [
    // 🌐 DIŞ MAKALELER (doğrudan bağlantılar)
    {
      id: 1,
      title: 'Türkiye gıda israfına karşı eylem planı başlatıyor',
      excerpt: 'Türk hükümeti her yıl israf edilen 2,3 milyon ton gıdayı azaltmak için ulusal stratejisini açıklıyor.',
      category: 'Haberler',
      author: 'Daily Sabah',
      published_at: '2024-03-15',
      featured_image_url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 8,
      external_url: 'https://www.dailysabah.com/turkiye/turkiye-launches-action-plan-to-reduce-massive-food-waste-levels/news'
    },
    {
      id: 2,
      title: 'Türkiye\'de her yıl 2,3 milyon ton gıda israf ediliyor',
      excerpt: 'Endişe verici bir rapor Türkiye\'deki gıda israfının boyutunu ortaya koyuyor. Tüm paydaşlar sorumluluk almalı.',
      category: 'Haberler',
      author: 'Ekoiq',
      published_at: '2024-05-22',
      featured_image_url: 'https://images.pexels.com/photos/8466654/pexels-photo-8466654.jpeg',
      reading_time: 6,
      external_url: 'https://www.ekoiq.com/turkiyede-her-yil-23-milyon-ton-gida-israf-ediliyor-tum-paydaslar-sorumluluk-almali/'
    },
    {
      id: 3,
      title: 'Korkunç israf: 2,3 milyon ton çöpe gidiyor',
      excerpt: 'Türkiye\'de her yıl milyonlarca ton tüketilebilir gıda çöpe atılıyor. Mücadele edilmesi gereken bir felaket.',
      category: 'Haberler',
      author: 'Risale Haber',
      published_at: '2024-06-10',
      featured_image_url: 'https://images.pexels.com/photos/8466649/pexels-photo-8466649.jpeg',
      reading_time: 7,
      external_url: 'https://www.risalehaber.com/korkunc-israf-turkiyede-her-yil-23-milyon-ton-gida-cope-gidiyor-447473h.htm'
    },
    
    // 📝 TILKAPP MAKALELERİ (iç sayfalar)
    {
      id: 4,
      title: 'Görüş: "TILKAPP tüketim şeklimi değiştirdi"',
      excerpt: '6 aydır TILKAPP\'ın sadık kullanıcısı Zeynep ile tanışın. İsrafla mücadele ederken nasıl tasarruf ettiğini keşfedin.',
      category: 'Görüşler',
      author: 'Zeynep K.',
      published_at: '2024-11-01',
      featured_image_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 4
    },
    {
      id: 5,
      title: 'İsraf önleyici işletmeler için en iyi uygulamalar',
      excerpt: 'TILKAPP ile satılmayan ürünlerinizi nasıl optimize edip karlılığınızı artırırsınız. İş ortağı işletmeler için kapsamlı rehber.',
      category: 'Tavsiyeler',
      author: 'TILKAPP Business',
      published_at: '2024-10-28',
      featured_image_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 8
    },
    {
      id: 6,
      title: 'Bayat ekmek: Yeniden kullanmanın 5 yaratıcı yolu',
      excerpt: 'Sert ekmeğinizi artık atmayın! Test edilmiş ve onaylanmış bu israf önleyici tariflerle onu lezzetlere dönüştürmeyi keşfedin.',
      category: 'Tarifler',
      author: 'Şef Ayşe',
      published_at: '2024-10-20',
      featured_image_url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 5
    },
    {
      id: 7,
      title: 'Antalya\'da israf önleme hareketi ivme kazanıyor',
      excerpt: 'Giderek daha fazla işletme israfla mücadele için TILKAPP\'a katılıyor. Harekete geçen bir şehrin portresi.',
      category: 'Haberler',
      author: 'TILKAPP Editörlüğü',
      published_at: '2024-10-15',
      featured_image_url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 6
    },
    {
      id: 8,
      title: 'Meyve ve sebze saklama: Kapsamlı rehber',
      excerpt: 'Meyve ve sebzelerinizi daha uzun süre taze tutmak için nasıl saklayacağınızı öğrenin. Pratik ve doğal ipuçları.',
      category: 'Tavsiyeler',
      author: 'Diyetisyen Elif',
      published_at: '2024-10-08',
      featured_image_url: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 9
    },
    {
      id: 9,
      title: 'TILKAPP ile sağlıklı beslenirken tasarruf edin',
      excerpt: 'TILKAPP bütçenizi patlatmadan dengeli beslenmenizi nasıl sağlar. Görüşler ve beslenme tavsiyeleri.',
      category: 'İsraf Önleme',
      author: 'Diyetisyen Elif',
      published_at: '2024-09-30',
      featured_image_url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 7
    },
    {
      id: 10,
      title: 'Son kullanma tarihleri: Daha iyi tüketmek için anlamak',
      excerpt: 'SKT, TETT... Gıda ürünlerinizdeki tarihleri çözmeyi öğrenin ve aşırı önlem almayı bırakın.',
      category: 'İsraf Önleme',
      author: 'Dr. Mehmet Yılmaz',
      published_at: '2024-09-22',
      featured_image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 6
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Tümü' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#00615F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            TILKAPP Blog
          </h1>
          <p className="text-xl text-[#F3EACE] mb-8 max-w-2xl mx-auto">
            İsraf önleyici yaşam tarzı için haberler, tavsiyeler ve tarifler
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Makale ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-tilkapp-orange"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#00615F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#00615F] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                </div>
                {post.external_url && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Harici
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#00615F] transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.reading_time} dk okuma</span>
                  {post.external_url ? (
                    <a
                      href={post.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#00615F] hover:text-[#2DD4BF] font-medium transition-colors"
                    >
                      Makaleyi oku
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <a
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center text-[#00615F] hover:text-[#2DD4BF] font-medium transition-colors"
                    >
                      Devamını oku
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Makale bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;