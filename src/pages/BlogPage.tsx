import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_at: string;
  featured_image_url: string;
  reading_time: number;
}

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Tous', 'Anti-Gaspi', 'Recettes', 'Conseils', 'Témoignages', 'Actualités'];

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Comment réduire le gaspillage alimentaire à la maison',
      excerpt: 'Des astuces simples et efficaces pour conserver vos aliments plus longtemps et éviter de jeter.',
      content: '',
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
      content: '',
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
      content: '',
      category: 'Actualités',
      author: 'Dr. Mehmet Yılmaz',
      published_at: '2025-01-05',
      featured_image_url: 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 6
    },
    {
      id: 4,
      title: 'Témoignage : "TILKAPP a changé ma façon de consommer"',
      excerpt: 'Rencontre avec Zeynep, utilisatrice fidèle de TILKAPP depuis 6 mois.',
      content: '',
      category: 'Témoignages',
      author: 'Zeynep K.',
      published_at: '2025-01-03',
      featured_image_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 4
    },
    {
      id: 5,
      title: 'Les meilleures pratiques pour les commerçants anti-gaspi',
      excerpt: 'Comment optimiser vos invendus et augmenter votre rentabilité avec TILKAPP.',
      content: '',
      category: 'Conseils',
      author: 'TILKAPP Business',
      published_at: '2025-01-01',
      featured_image_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 8
    },
    {
      id: 6,
      title: 'Pain rassis : 5 façons créatives de le réutiliser',
      excerpt: 'Ne jetez plus votre pain dur ! Découvrez comment le transformer en délices.',
      content: '',
      category: 'Recettes',
      author: 'Chef Ayşe',
      published_at: '2024-12-28',
      featured_image_url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 5
    },
    {
      id: 7,
      title: 'Le mouvement anti-gaspi gagne du terrain à Antalya',
      excerpt: 'De plus en plus de commerces rejoignent TILKAPP pour lutter contre le gaspillage.',
      content: '',
      category: 'Actualités',
      author: 'Rédaction',
      published_at: '2024-11-25',
      featured_image_url: 'https://images.pexels.com/photos/2767815/pexels-photo-2767815.jpeg',
      reading_time: 6
    },
    {
      id: 8,
      title: 'Conservation des fruits et légumes : le guide complet',
      excerpt: 'Apprenez à conserver vos fruits et légumes pour qu\'ils restent frais plus longtemps.',
      content: '',
      category: 'Conseils',
      author: 'Nutritionniste Elif',
      published_at: '2024-09-22',
      featured_image_url: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 9
    },
    {
      id: 9,
      title: 'Économiser tout en mangeant sainement avec TILKAPP',
      excerpt: 'Comment TILKAPP vous permet de manger équilibré sans exploser votre budget.',
      content: '',
      category: 'Anti-Gaspi',
      author: 'Nutritionniste Elif',
      published_at: '2024-05-20',
      featured_image_url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading_time: 7
    },
    {
      id: 10,
      title: 'Les dates de péremption : comprendre pour mieux consommer',
      excerpt: 'DLC, DDM... Apprenez à décrypter les dates sur vos produits alimentaires.',
      content: '',
      category: 'Anti-Gaspi',
      author: 'Dr. Mehmet Yılmaz',
      published_at: '2023-11-18',
      featured_image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
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

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Le Blog TILKAPP
          </h1>
          <p className="text-xl text-tilkapp-beige mb-8 max-w-2xl mx-auto">
            Actualités, conseils et recettes pour un mode de vie anti-gaspi
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un article..."
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
                    ? 'bg-tilkapp-green text-white'
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
                  <a
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;