import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Comment réduire le gaspillage alimentaire à la maison',
      excerpt: 'Des astuces simples et efficaces pour conserver vos aliments plus longtemps et éviter de jeter.',
      category: 'Conseils',
      author: 'TILKAPP',
      published_at: '2025-01-10',
      featured_image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 5
    },
    {
      id: 2,
      title: '10 recettes anti-gaspi avec des restes',
      excerpt: 'Transformez vos restes en délicieux repas avec ces recettes créatives et économiques.',
      category: 'Recettes',
      author: 'Chef Ayşe',
      published_at: '2025-01-08',
      featured_image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 7
    },
    {
      id: 3,
      title: 'L\'impact environnemental du gaspillage alimentaire en Turquie',
      excerpt: 'Découvrez les chiffres alarmants et comment chacun peut faire la différence.',
      category: 'Actualités',
      author: 'Dr. Mehmet Yılmaz',
      published_at: '2025-01-05',
      featured_image_url: 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 6
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Derniers articles du blog</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Actualités, conseils et astuces pour un mode de vie anti-gaspi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-tilkapp-green text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-tilkapp-green transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.reading_time} min de lecture</span>
                  
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-tilkapp-green hover:text-tilkapp-orange font-medium transition-colors"
                  >
                    Lire plus
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          
            href="/blog"
            className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
          >
            Voir tous les articles
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogSection;