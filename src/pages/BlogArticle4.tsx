import React from 'react';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const BlogArticle4 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-tilkapp-green hover:text-tilkapp-orange transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au blog
          </a>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-tilkapp-green text-white px-4 py-2 rounded-full text-sm font-medium">
              Témoignages
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            "TILKAPP a changé ma façon de consommer"
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Zeynep K.</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>1 novembre 2024</span>
            <span className="mx-3">•</span>
            <span>4 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Zeynep avec ses courses TILKAPP"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Zeynep, 32 ans, mère de deux enfants et professeure à Antalya, utilise TILKAPP depuis 6 mois. 
            Elle nous raconte comment l'application a transformé ses habitudes de consommation et son budget familial.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">La découverte de TILKAPP</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            "J'ai découvert TILKAPP par hasard, en cherchant des solutions pour réduire mes dépenses alimentaires. 
            Avec deux enfants, le budget courses peut vite grimper ! Au début, j'étais sceptique : des produits à -50%, 
            ça paraissait trop beau pour être vrai."
          </p>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "La première fois que j'ai récupéré une commande, j'ai été surprise par la qualité. 
            C'étaient exactement les mêmes produits que ceux vendus au prix fort le matin même !"
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Des économies significatives</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            En six mois, Zeynep estime avoir économisé près de 2 000 TL sur son budget alimentaire familial. 
            "Je commande 2 à 3 fois par semaine, principalement du pain frais, des pâtisseries et parfois des plats préparés. 
            C'est parfait pour les soirs où je rentre tard du travail."
          </p>

          <div className="bg-tilkapp-beige rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">Le budget mensuel de Zeynep avec TILKAPP :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Pain et viennoiseries : 150 TL économisés/mois</li>
              <li>• Fruits et légumes : 200 TL économisés/mois</li>
              <li>• Plats préparés : 100 TL économisés/mois</li>
              <li>• <strong>Total : ~450 TL d'économies par mois</strong></li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Un impact environnemental positif</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Au-delà de l'aspect financier, Zeynep est fière de contribuer à la lutte contre le gaspillage alimentaire. 
            "Mes enfants ont compris l'importance de ne pas jeter la nourriture. On en parle souvent à la maison maintenant."
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Ses commerçants préférés</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Zeynep a ses habitudes : "La boulangerie près de l'école propose toujours d'excellents produits en fin de journée. 
            Et le primeur du marché met en vente ses fruits et légumes légèrement défraîchis à des prix imbattables. 
            Parfaits pour mes smoothies et soupes !"
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Ses conseils pour bien débuter</h2>
          <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">Les 5 conseils de Zeynep :</h3>
            <ol className="space-y-3 text-gray-700">
              <li><strong>1. Activez les notifications</strong> - Pour ne rater aucune offre de vos commerces préférés</li>
              <li><strong>2. Planifiez vos menus</strong> - Utilisez TILKAPP pour compléter vos courses, pas les remplacer</li>
              <li><strong>3. Soyez flexible</strong> - Les offres changent chaque jour, adaptez vos repas en conséquence</li>
              <li><strong>4. Testez plusieurs commerces</strong> - Vous trouverez rapidement vos favoris</li>
              <li><strong>5. Partagez autour de vous</strong> - Plus on est nombreux, plus on sauve de nourriture !</li>
            </ol>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">L'avenir avec TILKAPP</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            "Je ne peux plus m'en passer ! TILKAPP fait maintenant partie de ma routine quotidienne. 
            Je consulte l'app tous les matins en buvant mon café, et je réserve ce qui m'intéresse pour le soir."
          </p>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "Le plus beau dans tout ça ? Mes enfants sont devenus de véritables ambassadeurs anti-gaspi. 
            Ils en parlent à leurs copains à l'école !"
          </blockquote>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Vous aussi, rejoignez le mouvement !</h3>
            <p className="text-gray-700 mb-6">
              Téléchargez TILKAPP et commencez à économiser tout en sauvant la planète
            </p>
            
              href="/download"
              className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
            >
              Télécharger l'application
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle4;