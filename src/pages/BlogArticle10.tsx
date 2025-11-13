import React from 'react';
import { Calendar, User, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BlogArticle10 = () => {
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
              Anti-Gaspi
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Les dates de péremption : comprendre pour mieux consommer
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Dr. Mehmet Yılmaz</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>22 septembre 2024</span>
            <span className="mx-3">•</span>
            <span>6 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Dates sur emballages alimentaires"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            DLC, DDM, "Son Kullanma Tarihi"... Ces dates sur nos emballages sont souvent mal comprises. 
            Résultat : des tonnes de nourriture encore consommable finissent à la poubelle. Apprenons à les décrypter !
          </p>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "En Turquie, 30% du gaspillage alimentaire domestique est lié à une mauvaise compréhension 
            des dates de péremption. Pourtant, la différence entre DLC et DDM est cruciale !"
            <br />
            <span className="text-sm not-italic">- Ministère de l'Agriculture turc, 2024</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <AlertCircle className="inline w-6 h-6 mr-2 text-red-500" />
            DLC : Date Limite de Consommation (Son Tüketim Tarihi)
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            La DLC est une date <strong>impérative</strong>. Au-delà, le produit peut présenter des risques pour la santé.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">📋 Caractéristiques de la DLC :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Mention :</strong> "À consommer jusqu'au..." / "Son Tüketim Tarihi"</li>
              <li>• <strong>Format :</strong> Date précise (jour/mois/année)</li>
              <li>• <strong>Respect :</strong> NE PAS consommer après cette date</li>
              <li>• <strong>Conservation :</strong> Chaîne du froid obligatoire</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Produits concernés par la DLC :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥩 Viandes et poissons frais</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Viande hachée : 24-48h</li>
                <li>• Volaille fraîche : 2-3 jours</li>
                <li>• Poisson frais : 1-2 jours</li>
                <li>• Fruits de mer : 24h</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥛 Produits laitiers frais</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Lait frais : 3-4 jours</li>
                <li>• Yaourts : 3-4 semaines</li>
                <li>• Fromages frais : 1 semaine</li>
                <li>• Ayran frais : 2-3 jours</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥗 Plats préparés</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Salades composées : 1-2 jours</li>
                <li>• Sandwichs : 24h</li>
                <li>• Plats traiteur : 2-3 jours</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍰 Pâtisseries fraîches</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Chantilly : 24h</li>
                <li>• Crème pâtissière : 2-3 jours</li>
                <li>• Tiramisu : 2-3 jours</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-100 rounded-lg p-6 my-8">
            <p className="font-bold text-red-800 mb-2">⚠️ IMPORTANT</p>
            <p className="text-red-700">
              Après la DLC, jetez le produit même s'il semble encore bon. Les bactéries pathogènes 
              peuvent se développer sans modification visible de l'aspect, de l'odeur ou du goût.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <CheckCircle className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            DDM : Date de Durabilité Minimale (Tavsiye Edilen Tüketim Tarihi)
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            La DDM est une date <strong>indicative</strong>. Après cette date, le produit perd certaines qualités 
            (goût, texture, vitamines) mais reste parfaitement consommable et sans danger.
          </p>

          <div className="bg-green-50 border-l-4 border-tilkapp-green p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">📋 Caractéristiques de la DDM :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Mention :</strong> "À consommer de préférence avant..." / "Tavsiye Edilen Tüketim Tarihi"</li>
              <li>• <strong>Format :</strong> Mois/année ou date précise selon le produit</li>
              <li>• <strong>Flexibilité :</strong> Consommable plusieurs semaines/mois après</li>
              <li>• <strong>Sécurité :</strong> Aucun risque sanitaire après la date</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Produits concernés par la DDM :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍪 Produits secs</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Pâtes : +1 an après DDM</li>
                <li>• Riz : +1 an après DDM</li>
                <li>• Farine : +6 mois après DDM</li>
                <li>• Biscuits : +3-6 mois après DDM</li>
                <li>• Céréales : +6 mois après DDM</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🥫 Conserves</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Conserves : +2 ans après DDM</li>
                <li>• Bocaux : +1 an après DDM</li>
                <li>• Sauces : +6 mois après DDM</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">☕ Boissons</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Café : +1 an après DDM</li>
                <li>• Thé : +1 an après DDM</li>
                <li>• Jus UHT : +3 mois après DDM</li>
                <li>• Sodas : +3 mois après DDM</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🍫 Autres</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Chocolat : +6 mois après DDM</li>
                <li>• Confiture : +1 an après DDM</li>
                <li>• Miel : illimité</li>
                <li>• Sel/Sucre : illimité</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-6 my-8">
            <p className="font-bold text-green-800 mb-2">💡 BON À SAVOIR</p>
            <p className="text-green-700">
              Un yaourt DDM dépassé de 3 semaines ? Totalement consommable ! Son aspect et son goût 
              peuvent être légèrement altérés, mais il ne présente aucun danger pour la santé.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Clock className="inline w-6 h-6 mr-2 text-orange-500" />
            Comment savoir si un produit est encore bon ?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Pour les produits avec DDM dépassée, fiez-vous à vos sens avant de jeter !
          </p>

          <div className="space-y-6 my-8">
            <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👀</span> La vue
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Moisissures :</strong> Jetez (sauf fromages à pâte persillée)</li>
                <li><strong>Changement de couleur :</strong> Suspect, sentez et goûtez prudemment</li>
                <li><strong>Emballage gonflé :</strong> Jetez immédiatement</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👃</span> L'odorat
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Odeur aigre ou rance :</strong> Jetez</li>
                <li><strong>Odeur inhabituelle :</strong> Ne prenez pas de risque</li>
                <li><strong>Pas d'odeur suspecte :</strong> Probablement OK pour DDM</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">👅</span> Le goût
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-11">
                <li><strong>Goût amer ou acide :</strong> Jetez</li>
                <li><strong>Texture bizarre :</strong> Prudence</li>
                <li><strong>Goût normal mais fade :</strong> Consommable (qualité juste diminuée)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Cas particuliers</h2>

          <div className="space-y-4 my-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🥖 Le pain</h4>
              <p className="text-sm text-gray-700">
                Le pain sec (rassis) reste consommable plusieurs jours. Utilisez-le pour croûtons, 
                chapelure ou pudding. Jetez uniquement si moisissures visibles.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🥚 Les œufs</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Test de fraîcheur :</strong> Plongez l'œuf dans l'eau froide.
              </p>
              <ul className="text-xs text-gray-600 ml-4 space-y-1">
                <li>• Coule au fond → Très frais (coque, poché)</li>
                <li>• Se dresse légèrement → Moins frais (dur, omelette)</li>
                <li>• Flotte → À jeter</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🧀 Les fromages</h4>
              <p className="text-sm text-gray-700">
                Fromages à pâte dure : coupez la partie moisie, le reste est OK.<br />
                Fromages frais/à pâte molle : jetez si moisi.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">TILKAPP et les dates de péremption</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Les produits proposés sur TILKAPP ont souvent une DDM proche ou légèrement dépassée. 
            Rassurez-vous : ils sont parfaitement consommables et contrôlés !
          </p>

          <div className="bg-tilkapp-beige rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">🛡️ Les garanties TILKAPP :</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• ✅ Tous les commerces partenaires sont vérifiés et certifiés</li>
              <li>• ✅ Les produits DLC respectent strictement les dates limites</li>
              <li>• ✅ Les produits DDM dépassés sont clairement indiqués</li>
              <li>• ✅ Retour possible en cas de problème de qualité</li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "Acheter un produit DDM dépassé sur TILKAPP, c'est faire un geste anti-gaspi intelligent. 
            Le produit est sain, la qualité est là, seul le marketing de la grande distribution 
            nous a habitués à jeter trop vite !"
          </blockquote>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
  <h3 className="text-2xl font-bold text-gray-900 mb-4">Sauvez des produits encore parfaits</h3>
  <p className="text-gray-700 mb-6">
    Découvrez les offres TILKAPP et donnez une seconde chance aux invendus
  </p>
  <a
    href="/offers"
    className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
  >
    Voir les offres
  </a>
</div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle10;