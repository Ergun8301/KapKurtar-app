import React from 'react';
import { Calendar, User, ArrowLeft, TrendingUp, Users, BarChart3, Smartphone } from 'lucide-react';

const BlogArticle5 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-tilkapp-green hover:text-tilkapp-orange transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au blog
          </a>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-tilkapp-green text-white px-4 py-2 rounded-full text-sm font-medium">
              Conseils
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Les meilleures pratiques pour les commerçants anti-gaspi
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">TILKAPP Business</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>28 octobre 2024</span>
            <span className="mx-3">•</span>
            <span>8 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Commerce partenaire TILKAPP"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Vous êtes commerçant et vous vous demandez comment optimiser vos invendus tout en augmentant votre rentabilité ? 
            Découvrez les stratégies gagnantes des commerçants partenaires TILKAPP.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <TrendingUp className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Transformez vos pertes en profits
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            En moyenne, un commerce alimentaire jette entre 5% et 15% de son stock chaque jour. 
            Avec TILKAPP, ces pertes deviennent des opportunités de revenus supplémentaires.
          </p>

          <div className="bg-tilkapp-beige rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">Exemple concret : Une boulangerie à Antalya</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Avant TILKAPP :</strong> 50 pains invendus/jour = 200 TL de perte</li>
              <li>• <strong>Avec TILKAPP :</strong> 45 pains vendus à -40% = 108 TL de revenus</li>
              <li>• <strong>Gain mensuel :</strong> +3 240 TL au lieu de -6 000 TL</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <BarChart3 className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Les 5 piliers du succès
          </h2>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Fixez des prix attractifs (mais rentables)</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            L'erreur courante : proposer seulement -10% ou -20%. Les utilisateurs TILKAPP recherchent des vraies bonnes affaires.
          </p>
          <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6 my-6">
            <p className="font-bold text-gray-900 mb-2">Notre recommandation :</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Pâtisseries/Pain : -40% à -60%</li>
              <li>• Fruits et légumes : -50% à -70%</li>
              <li>• Plats préparés : -40% à -50%</li>
              <li>• Produits laitiers : -30% à -40%</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Publiez vos offres au bon moment</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Les statistiques TILKAPP montrent que les offres publiées en fin de matinée (10h-12h) génèrent 3x plus de réservations 
            que celles publiées en fin d'après-midi.
          </p>
          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "Depuis que je publie mes offres vers 11h pour une récupération à 18h, 
            je vends 90% de mes invendus contre 40% avant." - Ahmet, primeur à Konyaaltı
          </blockquote>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Soignez vos photos</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Une photo appétissante multiplie par 4 les chances de vente. Investissez 2 minutes pour prendre une belle photo :
          </p>
          <ul className="space-y-2 text-gray-700 ml-6 mb-6">
            <li>• Lumière naturelle (près d'une fenêtre)</li>
            <li>• Fond propre et neutre</li>
            <li>• Cadrage serré sur le produit</li>
            <li>• Évitez le flash du téléphone</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Choisissez le bon mode de vente</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            TILKAPP propose deux modes : réservation ou "premier arrivé". Choisissez selon votre activité :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">✅ Réservation</h4>
              <p className="text-sm text-gray-700 mb-2"><strong>Idéal pour :</strong></p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Plats préparés</li>
                <li>• Gros volumes</li>
                <li>• Produits fragiles</li>
              </ul>
              <p className="text-sm text-gray-700 mt-3">
                <strong>Avantage :</strong> Zéro gaspillage garanti
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">⚡ Premier arrivé</h4>
              <p className="text-sm text-gray-700 mb-2"><strong>Idéal pour :</strong></p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Pain/viennoiseries</li>
                <li>• Petits volumes</li>
                <li>• Clients de passage</li>
              </ul>
              <p className="text-sm text-gray-700 mt-3">
                <strong>Avantage :</strong> Plus de flexibilité
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Fidélisez vos clients TILKAPP</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Un client satisfait revient ! Quelques astuces pour transformer un acheteur occasionnel en habitué :
          </p>
          <ul className="space-y-3 text-gray-700 ml-6 mb-6">
            <li>• <strong>Accueil chaleureux :</strong> Un sourire et un merci font la différence</li>
            <li>• <strong>Régularité :</strong> Publiez des offres tous les jours (même petites)</li>
            <li>• <strong>Bonus surprise :</strong> Ajoutez occasionnellement un petit extra</li>
            <li>• <strong>Communication :</strong> Prévenez vos habitués de vos meilleures offres</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Users className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Témoignages de commerçants partenaires
          </h2>

          <div className="bg-gray-100 rounded-lg p-6 my-8">
            <p className="text-gray-700 italic mb-3">
              "TILKAPP m'a permis de réduire mes pertes de 70%. En plus, mes clients réguliers découvrent 
              de nouveaux produits qu'ils n'auraient jamais achetés au prix normal."
            </p>
            <p className="text-sm text-gray-600">- Fatma, épicerie fine à Lara</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 my-8">
            <p className="text-gray-700 italic mb-3">
              "Au début, j'avais peur de dévaloriser mes produits. Maintenant je comprends : 
              vendre à -50% c'est infiniment mieux que jeter à -100% !"
            </p>
            <p className="text-sm text-gray-600">- Mehmet, boulangerie-pâtisserie à Muratpaşa</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Smartphone className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Utilisez l'app marchand efficacement
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            L'application marchand TILKAPP est conçue pour être rapide et intuitive. 
            En moins de 2 minutes, vous pouvez publier une offre complète.
          </p>

          <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">Checklist pour une offre parfaite :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Photo de qualité</li>
              <li>✓ Titre descriptif (ex: "5 croissants pur beurre" plutôt que "Viennoiseries")</li>
              <li>✓ Prix attractif (-40% minimum recommandé)</li>
              <li>✓ Heure de retrait claire</li>
              <li>✓ Quantité disponible précisée</li>
              <li>✓ Mode réservation/direct choisi</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Erreurs à éviter</h2>
          <div className="space-y-4 my-8">
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-bold text-gray-900">❌ Prix trop élevés</p>
              <p className="text-sm text-gray-600">Les utilisateurs cherchent de vraies réductions</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-bold text-gray-900">❌ Photos de mauvaise qualité</p>
              <p className="text-sm text-gray-600">Prenez 30 secondes pour une belle photo</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-bold text-gray-900">❌ Horaires de retrait peu pratiques</p>
              <p className="text-sm text-gray-600">Adaptez-vous aux horaires de vos clients (17h-20h idéal)</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-bold text-gray-900">❌ Irrégularité</p>
              <p className="text-sm text-gray-600">Publiez tous les jours pour créer une habitude chez vos clients</p>
            </div>
          </div>

          <div className="bg-tilkapp-green text-white rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Prêt à rejoindre TILKAPP ?</h3>
            <p className="mb-6 text-tilkapp-beige">
              Inscrivez-vous gratuitement et commencez à valoriser vos invendus dès aujourd'hui
            </p>
            
              href="/merchant/auth"
              className="bg-white text-tilkapp-green px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-beige transition-colors inline-block"
            >
              Devenir partenaire
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle5;