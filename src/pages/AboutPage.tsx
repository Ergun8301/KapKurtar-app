import React from 'react';
import { Heart, Users, TrendingUp, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            À propos de TILKAPP
          </h1>
          <p className="text-xl text-tilkapp-beige max-w-2xl mx-auto">
            Une plateforme qui connecte commerçants et consommateurs pour lutter contre le gaspillage alimentaire
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            TILKAPP est née d'un constat simple : chaque jour, des milliers de produits alimentaires parfaitement consommables 
            finissent à la poubelle. Notre mission est de créer un pont entre les commerçants qui ont des invendus 
            et les consommateurs qui cherchent des produits de qualité à prix réduits.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-tilkapp-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Anti-Gaspillage</h3>
            <p className="text-gray-600">
              Réduire le gaspillage alimentaire en donnant une seconde chance aux invendus de qualité
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-tilkapp-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Solidarité Locale</h3>
            <p className="text-gray-600">
              Soutenir les commerces de proximité et créer du lien entre commerçants et habitants
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibilité</h3>
            <p className="text-gray-600">
              Rendre une alimentation de qualité accessible à tous grâce à des prix réduits
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Notre Histoire</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              TILKAPP a été lancée en 2024 à Antalya avec une vision claire : utiliser la technologie 
              pour résoudre le problème du gaspillage alimentaire tout en rendant service aux commerçants et aux consommateurs.
            </p>
            <p className="mb-4">
              Constatant qu'en Turquie, plus de 2,3 millions de tonnes de nourriture sont gaspillées chaque année, 
              notre petite équipe passionnée a décidé d'agir concrètement. L'idée était simple : créer une plateforme 
              permettant aux commerçants de valoriser leurs invendus plutôt que de les jeter.
            </p>
            <p className="mb-4">
              Depuis notre lancement, nous avons déjà permis de sauver plus de 25 tonnes de nourriture et 
              connecté plus de 150 commerces avec des milliers de clients satisfaits. Mais ce n'est que le début.
            </p>
            <p>
              Notre ambition ? Devenir la référence de l'anti-gaspillage en Turquie et prouver qu'un modèle 
              économique peut être à la fois rentable, écologique et solidaire.
            </p>
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="bg-tilkapp-green rounded-xl p-8 md:p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Notre Impact en Chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-tilkapp-beige">Commerçants partenaires</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8 000+</div>
              <div className="text-tilkapp-beige">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25 tonnes</div>
              <div className="text-tilkapp-beige">Nourriture sauvée</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5 villes</div>
              <div className="text-tilkapp-beige">Couverture prévue en 2025</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Une Équipe Passionnée</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            TILKAPP, c'est avant tout une équipe de passionnés convaincus qu'on peut changer les choses 
            en agissant localement. Développeurs, designers, spécialistes du commerce et de la logistique : 
            nous travaillons tous ensemble pour faire de TILKAPP un outil simple, efficace et utile au quotidien.
          </p>
        </div>

        {/* Zone Coverage */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-tilkapp-green mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Nos Zones d'Action</h2>
          </div>
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-6">
              Actuellement actif à Antalya et ses environs, TILKAPP prévoit une expansion rapide 
              dans toute la région méditerranéenne turque.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-tilkapp-green rounded-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">📍 Actuellement</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Antalya centre (Muratpaşa, Konyaaltı, Kepez)</li>
                <li>• Manavgat</li>
                <li>• Alanya (en déploiement)</li>
              </ul>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">🚀 Bientôt (2025)</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Side</li>
                <li>• Belek</li>
                <li>• Kaş</li>
                <li>• Autres villes côtières</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Rejoignez le Mouvement</h2>
          <p className="text-lg text-gray-600 mb-8">
            Que vous soyez commerçant ou consommateur, vous pouvez faire partie de la solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/merchant/auth"
              className="bg-tilkapp-green text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Je suis commerçant
            </a>
            <a
              href="/download"
              className="bg-tilkapp-orange text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Je suis consommateur
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;