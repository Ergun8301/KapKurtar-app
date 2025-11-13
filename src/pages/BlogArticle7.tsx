import React from 'react';
import { Calendar, User, ArrowLeft, TrendingUp, Store, Users2 } from 'lucide-react';

const BlogArticle7 = () => {
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
              Actualités
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Le mouvement anti-gaspi gagne du terrain à Antalya
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Rédaction TILKAPP</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>15 octobre 2024</span>
            <span className="mx-3">•</span>
            <span>6 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Antalya vue aérienne"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Six mois après le lancement de TILKAPP, plus de 150 commerces d'Antalya ont rejoint le mouvement. 
            Portrait d'une ville qui lutte activement contre le gaspillage alimentaire.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <TrendingUp className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Des chiffres encourageants
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Depuis le lancement de TILKAPP en avril 2024, la dynamique anti-gaspillage s'accélère dans la région d'Antalya.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-tilkapp-beige rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-tilkapp-green mb-2">150+</div>
              <div className="text-gray-700">Commerces partenaires</div>
            </div>
            <div className="bg-tilkapp-beige rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-tilkapp-green mb-2">8 000+</div>
              <div className="text-gray-700">Utilisateurs actifs</div>
            </div>
            <div className="bg-tilkapp-beige rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-tilkapp-green mb-2">25 tonnes</div>
              <div className="text-gray-700">Nourriture sauvée</div>
            </div>
          </div>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "Ces chiffres dépassent toutes nos espérances. Cela prouve que les habitants d'Antalya sont prêts 
            à adopter de nouvelles habitudes de consommation plus responsables."
            <br />
            <span className="text-sm not-italic">- Équipe TILKAPP</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Store className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Des commerces de tous secteurs
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            La diversité des commerces partenaires fait la richesse de TILKAPP. Boulangeries, primeurs, 
            restaurants, supérettes... tous les acteurs de l'alimentation se mobilisent.
          </p>

          <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">Répartition des commerces partenaires :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>45% Boulangeries-pâtisseries</strong> - Les pionniers du mouvement</li>
              <li>• <strong>25% Primeurs et épiceries</strong> - Fruits et légumes sauvés</li>
              <li>• <strong>20% Restaurants</strong> - Plats préparés en fin de service</li>
              <li>• <strong>10% Autres</strong> - Traiteurs, supérettes, fromageries</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Focus : Les boulangeries en première ligne</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Les boulangeries représentent presque la moitié des commerces partenaires. Et pour cause : 
            elles sont particulièrement exposées au gaspillage avec leurs produits frais du jour.
          </p>

          <div className="bg-gray-100 rounded-lg p-6 my-6">
            <p className="text-gray-700 italic mb-3">
              "Avant TILKAPP, je jetais facilement 40 à 50 pains par jour. Aujourd'hui, je n'en jette plus que 5 à 10. 
              C'est une vraie révolution pour mon commerce !"
            </p>
            <p className="text-sm text-gray-600">- Ahmet, Ekmek Fırını, Konyaaltı</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Users2 className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Un profil utilisateur varié
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Contrairement aux idées reçues, TILKAPP ne séduit pas uniquement les personnes à petit budget. 
            Le profil des utilisateurs est surprenant de diversité.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-tilkapp-beige rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👨‍👩‍👧‍👦 Profil n°1 : Les familles</h4>
              <p className="text-sm text-gray-700">
                <strong>35% des utilisateurs</strong><br />
                Motivation : économies + éducation des enfants à l'anti-gaspi
              </p>
            </div>
            <div className="bg-tilkapp-beige rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👩‍💼 Profil n°2 : Les actifs pressés</h4>
              <p className="text-sm text-gray-700">
                <strong>30% des utilisateurs</strong><br />
                Motivation : repas rapides et économiques après le travail
              </p>
            </div>
            <div className="bg-tilkapp-beige rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👵 Profil n°3 : Les retraités</h4>
              <p className="text-sm text-gray-700">
                <strong>20% des utilisateurs</strong><br />
                Motivation : produits de qualité à prix réduits
              </p>
            </div>
            <div className="bg-tilkapp-beige rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">🎓 Profil n°4 : Les étudiants</h4>
              <p className="text-sm text-gray-700">
                <strong>15% des utilisateurs</strong><br />
                Motivation : budget serré + conscience écologique
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Les quartiers les plus actifs</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Sans surprise, les quartiers centraux et densément peuplés concentrent la majorité de l'activité. 
            Mais des zones résidentielles commencent également à s'équiper.
          </p>

          <div className="space-y-3 my-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">1. Muratpaşa</span>
              <span className="text-tilkapp-green font-bold">42 commerces</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">2. Konyaaltı</span>
              <span className="text-tilkapp-green font-bold">38 commerces</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">3. Kepez</span>
              <span className="text-tilkapp-green font-bold">31 commerces</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">4. Lara</span>
              <span className="text-tilkapp-green font-bold">24 commerces</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">5. Autres</span>
              <span className="text-tilkapp-green font-bold">15 commerces</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Témoignages croisés</h2>

          <div className="bg-green-50 rounded-lg p-6 my-6">
            <p className="text-gray-700 mb-3">
              <strong className="text-tilkapp-green">Côté commerçant :</strong><br />
              "TILKAPP nous a permis de toucher une nouvelle clientèle. Certains clients venus pour une offre 
              reviennent ensuite acheter au prix normal. C'est aussi un outil marketing !"
            </p>
            <p className="text-sm text-gray-600">- Fatma, épicerie fine, Lara</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 my-6">
            <p className="text-gray-700 mb-3">
              <strong className="text-blue-600">Côté client :</strong><br />
              "J'ai découvert plein de petits commerces de quartier que je ne connaissais pas. 
              Au-delà des économies, j'ai l'impression de participer à quelque chose de positif."
            </p>
            <p className="text-sm text-gray-600">- Deniz, utilisateur depuis mai 2024</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Et demain ?</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            L'équipe TILKAPP ne compte pas s'arrêter là. Plusieurs projets sont dans les tuyaux pour 2025 :
          </p>

          <ul className="space-y-3 text-gray-700 ml-6 mb-8">
            <li>• <strong>Extension géographique</strong> : Manavgat, Side et Alanya dès janvier 2025</li>
            <li>• <strong>Nouveaux partenaires</strong> : Hôtels et grands restaurants</li>
            <li>• <strong>Programme fidélité</strong> : Récompenser les utilisateurs réguliers</li>
            <li>• <strong>Partenariats associatifs</strong> : Dons aux associations caritatives</li>
          </ul>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "Notre objectif pour 2025 : sauver 100 tonnes de nourriture et atteindre 300 commerces partenaires 
            dans la région d'Antalya. Ensemble, nous pouvons faire bouger les choses !"
          </blockquote>

          <div className="bg-tilkapp-green text-white rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Rejoignez le mouvement !</h3>
            <p className="mb-6 text-tilkapp-beige">
              Que vous soyez commerçant ou consommateur, participez à la révolution anti-gaspi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              
                href="/merchant/auth"
                className="bg-white text-tilkapp-green px-6 py-3 rounded-lg font-medium hover:bg-tilkapp-beige transition-colors inline-block"
              >
                Je suis commerçant
              </a>
              
                href="/download"
                className="bg-tilkapp-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-block"
              >
                Je suis consommateur
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle7;