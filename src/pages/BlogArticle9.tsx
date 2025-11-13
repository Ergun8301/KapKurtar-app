import React from 'react';
import { Calendar, User, ArrowLeft, Heart, TrendingDown, Utensils } from 'lucide-react';

const BlogArticle9 = () => {
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
            Économiser tout en mangeant sainement avec TILKAPP
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Nutritionniste Elif</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>30 septembre 2024</span>
            <span className="mx-3">•</span>
            <span>7 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Repas sain et équilibré"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            On entend souvent que manger sainement coûte cher. Avec TILKAPP, découvrez comment concilier 
            budget serré et alimentation équilibrée grâce aux invendus de qualité.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <TrendingDown className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Le mythe du "manger sain = cher"
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Contrairement aux idées reçues, une alimentation équilibrée n'est pas forcément plus coûteuse. 
            Le problème ? Les produits frais et de qualité sont souvent hors budget pour beaucoup de familles.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">📊 Quelques chiffres en Turquie :</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Une famille de 4 personnes dépense en moyenne <strong>4 000-5 000 TL/mois</strong> en alimentation</li>
              <li>• Les fruits et légumes frais représentent <strong>30-40%</strong> de ce budget</li>
              <li>• <strong>60%</strong> des Turcs déclarent avoir réduit leur consommation de produits frais à cause des prix</li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "TILKAPP permet d'accéder à des produits de qualité équivalente à celle du matin, 
            mais à des prix divisés par deux. C'est une révolution pour l'accès à une alimentation saine."
            <br />
            <span className="text-sm not-italic">- Dr. Elif Yıldız, nutritionniste</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Heart className="inline w-6 h-6 mr-2 text-red-500" />
            Les bases d'une alimentation équilibrée
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Avant de parler économies, rappelons ce qu'est une assiette équilibrée selon les recommandations 
            du Ministère de la Santé turc.
          </p>

          <div className="bg-tilkapp-beige rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">🍽️ L'assiette idéale :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">50% Légumes</p>
                <p className="text-sm text-gray-700">Frais, cuits ou crus. Variez les couleurs !</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">25% Protéines</p>
                <p className="text-sm text-gray-700">Viande, poisson, œufs, légumineuses</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">25% Féculents</p>
                <p className="text-sm text-gray-700">Pain, riz, pâtes, bulgur, pommes de terre</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">+ Produits laitiers</p>
                <p className="text-sm text-gray-700">Fromage, yaourt, ayran</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Utensils className="inline w-6 h-6 mr-2 text-tilkapp-green" />
            Comment TILKAPP facilite l'alimentation équilibrée
          </h2>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Accès facilité aux fruits et légumes frais</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Les primeurs partenaires proposent régulièrement des fruits et légumes légèrement défraîchis 
            ou en surplus à -50% / -70%.
          </p>
          <div className="bg-green-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Exemple concret :</strong> Un primeur de Konyaaltı propose chaque soir un panier de 3kg 
              de légumes variés (tomates, concombres, poivrons, aubergines) à 25 TL au lieu de 60 TL.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Résultat :</strong> Pour une famille de 4, cela représente 420 TL d'économies par mois 
              sur les légumes seuls !
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Plats préparés équilibrés à prix doux</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Les restaurants proposent souvent leurs plats du jour invendus en fin de service. 
            Une aubaine pour ceux qui n'ont pas le temps de cuisiner.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Exemple :</strong> Un restaurant à Muratpaşa propose un menu complet (soupe + plat + accompagnement) 
              à 40 TL au lieu de 85 TL entre 19h et 20h.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Qualité nutritionnelle :</strong> Légumes frais, protéines de qualité, portions généreuses. 
              Identique au service du midi !
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Pain et produits céréaliers complets</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Le pain complet, plus nutritif que le pain blanc, est souvent plus cher. 
            Sur TILKAPP, vous le trouvez à prix réduit en fin de journée.
          </p>
          <div className="bg-amber-50 rounded-lg p-6 my-6">
            <p className="text-sm text-gray-700">
              <strong>À savoir :</strong> Le pain de la veille reste parfaitement consommable et garde 
              toutes ses qualités nutritionnelles. Il est même meilleur pour la digestion car moins humide !
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Témoignage : Le budget alimentaire de Ayşe</h2>
          <div className="bg-gray-100 rounded-lg p-6 my-8">
            <p className="text-gray-700 mb-4">
              Ayşe, 38 ans, mère de 3 enfants, enseignante à Antalya, utilise TILKAPP depuis 8 mois. 
              Voici comment elle a transformé son budget alimentaire :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-red-50 rounded p-4">
                <h4 className="font-bold text-gray-900 mb-3">❌ Avant TILKAPP</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Budget mensuel : 5 200 TL</li>
                  <li>• Fruits/légumes : 2x/semaine max</li>
                  <li>• Plats préparés : jamais (trop cher)</li>
                  <li>• Gaspillage : ~300 TL/mois</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded p-4">
                <h4 className="font-bold text-gray-900 mb-3">✅ Avec TILKAPP</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Budget mensuel : 3 800 TL</li>
                  <li>• Fruits/légumes : 4-5x/semaine</li>
                  <li>• Plats préparés : 2x/semaine</li>
                  <li>• Gaspillage : quasi nul</li>
                </ul>
              </div>
            </div>

            <p className="text-gray-700 italic">
              "Avec les 1 400 TL économisés chaque mois, nous avons pu reprendre les activités sportives 
              des enfants. Et on mange plus varié qu'avant !"
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Idées menus de la semaine avec TILKAPP</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Voici un exemple de semaine type en combinant courses traditionnelles et offres TILKAPP.
          </p>

          <div className="space-y-4 my-8">
            {[
              { jour: 'Lundi', midi: 'Salade de lentilles + pain complet TILKAPP', soir: 'Poisson + légumes vapeur de TILKAPP' },
              { jour: 'Mardi', midi: 'Reste poisson + riz', soir: 'Menu restaurant TILKAPP (soupe + plat)' },
              { jour: 'Mercredi', midi: 'Œufs + légumes sautés TILKAPP', soir: 'Pâtes + sauce tomate maison (tomates TILKAPP)' },
              { jour: 'Jeudi', midi: 'Sandwich pain TILKAPP + fromage + crudités', soir: 'Poulet rôti + purée + salade' },
              { jour: 'Vendredi', midi: 'Soupe de légumes TILKAPP + pain', soir: 'Pizza maison (pain TILKAPP en base)' },
              { jour: 'Samedi', midi: 'Brunch (viennoiseries TILKAPP + œufs + fruits)', soir: 'Köfte + boulgour + yaourt' },
              { jour: 'Dimanche', midi: 'Repas familial traditionnel', soir: 'Soupe + pain + fromage TILKAPP' }
            ].map((menu, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-tilkapp-green mb-2">{menu.jour}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div><strong>Midi :</strong> {menu.midi}</div>
                  <div><strong>Soir :</strong> {menu.soir}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-3">💡 Astuce nutritionniste :</h3>
            <p className="text-gray-700 text-sm">
              Les produits TILKAPP sont parfaits pour les préparations cuites (soupes, gratins, compotes, smoothies). 
              Même si un fruit ou légume n'est plus parfait visuellement, il conserve tous ses nutriments !
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Les pièges à éviter</h2>
          <div className="space-y-4 my-8">
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Acheter sans besoin</p>
                <p className="text-sm text-gray-600">Même à -50%, si vous ne consommez pas, c'est du gaspillage</p>
              </div>
            </div>
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Négliger la planification</p>
                <p className="text-sm text-gray-600">Planifiez vos menus en fonction des offres disponibles</p>
              </div>
            </div>
            <div className="flex items-start bg-red-50 rounded-lg p-4">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Oublier de congeler</p>
                <p className="text-sm text-gray-600">Les surplus ? Congelez-les immédiatement !</p>
              </div>
            </div>
          </div>

          <div className="bg-tilkapp-green text-white rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Mangez mieux pour moins cher dès aujourd'hui</h3>
            <p className="mb-6 text-tilkapp-beige">
              Téléchargez TILKAPP et découvrez les offres près de chez vous
            </p>
            <a
              href="/download"
              className="bg-white text-tilkapp-green px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-beige transition-colors inline-block"
            >
              Télécharger l'application
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle9;