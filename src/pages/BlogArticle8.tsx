import React from 'react';
import { Calendar, User, ArrowLeft, Apple, Leaf, Snowflake, Sun } from 'lucide-react';

const BlogArticle8 = () => {
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
            Conservation des fruits et légumes : le guide complet
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Nutritionniste Elif</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>8 octobre 2024</span>
            <span className="mx-3">•</span>
            <span>9 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Fruits et légumes frais"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Saviez-vous que 40% du gaspillage alimentaire domestique concerne les fruits et légumes ? 
            Apprenez à les conserver correctement pour qu'ils restent frais plus longtemps.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Snowflake className="inline w-6 h-6 mr-2 text-blue-500" />
            Au réfrigérateur (0-5°C)
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Contrairement aux idées reçues, tous les fruits et légumes ne vont pas au frigo ! 
            Certains y perdent leur saveur et leur texture.
          </p>

          <div className="bg-blue-50 rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">✅ À conserver au réfrigérateur :</h3>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Légumes (bac à légumes) :</h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <strong>Légumes feuilles :</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Salade (dans un torchon humide)</li>
                  <li>• Épinards</li>
                  <li>• Blettes</li>
                  <li>• Herbes fraîches</li>
                </ul>
              </div>
              <div>
                <strong>Autres légumes :</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Carottes</li>
                  <li>• Poireaux</li>
                  <li>• Brocoli</li>
                  <li>• Chou-fleur</li>
                  <li>• Champignons</li>
                  <li>• Asperges</li>
                </ul>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">Fruits (étagères du haut) :</h4>
            <ul className="text-sm text-gray-700 ml-4 space-y-1">
              <li>• Fruits rouges (fraises, framboises, myrtilles)</li>
              <li>• Raisins</li>
              <li>• Figues</li>
              <li>• Cerises</li>
            </ul>

            <div className="bg-white rounded p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>💡 Astuce :</strong> Ne lavez pas les fruits et légumes avant de les mettre au frigo, 
                l'humidité accélère leur dégradation. Lavez-les juste avant consommation.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Sun className="inline w-6 h-6 mr-2 text-orange-500" />
            À température ambiante (18-22°C)
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Beaucoup de fruits et légumes méditerranéens préfèrent l'air ambiant au froid du réfrigérateur.
          </p>

          <div className="bg-orange-50 rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">🏠 À conserver hors du frigo :</h3>
            
            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Légumes :</h4>
            <ul className="text-sm text-gray-700 ml-4 space-y-1 mb-4">
              <li>• <strong>Tomates</strong> - Le froid détruit leur saveur !</li>
              <li>• <strong>Pommes de terre</strong> - Dans un endroit sombre et sec</li>
              <li>• <strong>Oignons</strong> - Dans un endroit aéré</li>
              <li>• <strong>Ail</strong> - Dans un endroit sec</li>
              <li>• <strong>Courges</strong> - Peuvent se conserver plusieurs mois</li>
              <li>• <strong>Aubergines</strong> - Consommer rapidement</li>
              <li>• <strong>Poivrons</strong> - 3-4 jours max</li>
              <li>• <strong>Concombres</strong> - Sensibles au froid</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Fruits :</h4>
            <ul className="text-sm text-gray-700 ml-4 space-y-1">
              <li>• <strong>Bananes</strong> - Noircissent au frigo</li>
              <li>• <strong>Agrumes</strong> - Citrons, oranges, mandarines</li>
              <li>• <strong>Fruits à noyau</strong> - Pêches, abricots, prunes (jusqu'à maturité)</li>
              <li>• <strong>Melons</strong> - Entiers uniquement, au frigo une fois coupés</li>
              <li>• <strong>Avocats</strong> - Mûrir à l'air, puis frigo si très mûrs</li>
              <li>• <strong>Ananas</strong></li>
              <li>• <strong>Mangues</strong></li>
            </ul>

            <div className="bg-white rounded p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Attention :</strong> Ne rangez jamais pommes de terre et oignons ensemble ! 
                Les pommes de terre font germer les oignons plus vite.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Apple className="inline w-6 h-6 mr-2 text-red-500" />
            Le gaz éthylène : ami ou ennemi ?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Certains fruits produisent un gaz appelé éthylène qui accélère le mûrissement. 
            C'est utile... ou problématique selon les cas !
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">🍎 Gros producteurs d'éthylène :</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Pommes</li>
                <li>• Bananes</li>
                <li>• Avocats</li>
                <li>• Poires</li>
                <li>• Tomates</li>
                <li>• Kiwis</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                👉 Isolez-les pour ne pas accélérer le mûrissement des autres fruits !
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">🥒 Sensibles à l'éthylène :</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Brocoli</li>
                <li>• Chou-fleur</li>
                <li>• Concombres</li>
                <li>• Aubergines</li>
                <li>• Salades</li>
                <li>• Carottes</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                👉 Éloignez-les des producteurs d'éthylène !
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
            <p className="font-bold text-gray-900 mb-2">💡 Astuce pro :</p>
            <p className="text-gray-700">
              Vous voulez faire mûrir rapidement un avocat ou une poire ? Mettez-les dans un sac en papier 
              avec une pomme ou une banane. L'éthylène concentré accélère le processus !
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Leaf className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Techniques de conservation avancées
          </h2>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Le bain d'eau glacée</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Pour redonner du croquant aux salades et légumes feuilles ramollis.
          </p>
          <div className="bg-tilkapp-beige rounded p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Méthode :</strong> Plongez les légumes dans un grand bol d'eau très froide avec des glaçons 
              pendant 15-30 minutes. Égouttez et essuyez délicatement.
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Le papier absorbant</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Idéal pour prolonger la durée de vie des légumes feuilles et champignons.
          </p>
          <div className="bg-tilkapp-beige rounded p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Méthode :</strong> Enveloppez les légumes dans du papier absorbant légèrement humide 
              avant de les mettre dans un sac plastique perforé au frigo.
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Le vinaigre blanc</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Prolonge la fraîcheur des fruits rouges de plusieurs jours.
          </p>
          <div className="bg-tilkapp-beige rounded p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Méthode :</strong> Mélangez 1 volume de vinaigre blanc pour 3 volumes d'eau. 
              Plongez rapidement les fruits rouges, rincez à l'eau claire et séchez délicatement. 
              Le vinaigre élimine les bactéries sans altérer le goût.
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. La congélation maline</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Vous avez trop de fruits ou légumes ? Congelez-les intelligemment !
          </p>
          <div className="bg-tilkapp-beige rounded p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Fruits :</strong> Lavez, séchez et étalez-les sur une plaque. Congelez 2h, 
              puis transférez dans un sac congélation. Parfaits pour smoothies et compotes !
            </p>
            <p className="text-sm text-gray-700">
              <strong>Légumes :</strong> Blanchissez-les 2-3 minutes dans l'eau bouillante, 
              puis plongez dans l'eau glacée avant de congeler. Ils garderont couleur et nutriments.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tableau récapitulatif</h2>
          <div className="overflow-x-auto my-8">
            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead className="bg-tilkapp-green text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Aliment</th>
                  <th className="px-4 py-3 text-left">Où ?</th>
                  <th className="px-4 py-3 text-left">Durée</th>
                  <th className="px-4 py-3 text-left">Astuce</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="px-4 py-3">Tomates</td>
                  <td className="px-4 py-3">Ambiant</td>
                  <td className="px-4 py-3">5-7 jours</td>
                  <td className="px-4 py-3">Tête en bas</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-3">Salade</td>
                  <td className="px-4 py-3">Frigo</td>
                  <td className="px-4 py-3">3-5 jours</td>
                  <td className="px-4 py-3">Torchon humide</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3">Bananes</td>
                  <td className="px-4 py-3">Ambiant</td>
                  <td className="px-4 py-3">5-7 jours</td>
                  <td className="px-4 py-3">Isoler des autres fruits</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-3">Carottes</td>
                  <td className="px-4 py-3">Frigo</td>
                  <td className="px-4 py-3">2-3 semaines</td>
                  <td className="px-4 py-3">Dans l'eau au frigo</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3">Fraises</td>
                  <td className="px-4 py-3">Frigo</td>
                  <td className="px-4 py-3">3-5 jours</td>
                  <td className="px-4 py-3">Bain vinaigre blanc</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Achetez malin avec TILKAPP</h3>
            <p className="text-gray-700 mb-6">
              Fruits et légumes légèrement défraîchis à -50% ? Parfaits pour smoothies, soupes et compotes !
            </p>
            <a
              href="/offers"
              className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
            >
              Voir les offres du jour
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle8;