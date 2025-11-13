import React from 'react';
import { Calendar, User, ArrowLeft, ChefHat } from 'lucide-react';

const BlogArticle6 = () => {
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
              Recettes
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pain rassis : 5 façons créatives de le réutiliser
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">Chef Ayşe</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>20 octobre 2024</span>
            <span className="mx-3">•</span>
            <span>5 min de lecture</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Pain rassis transformé"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Ne jetez plus votre pain dur ! Découvrez 5 recettes délicieuses et économiques pour transformer 
            votre pain rassis en véritables gourmandises.
          </p>

          <blockquote className="border-l-4 border-tilkapp-green pl-6 my-8 italic text-gray-700">
            "En Turquie, nous jetons en moyenne 2,3 millions de tonnes de nourriture par an. 
            Le pain représente une part importante de ce gaspillage. Pourtant, il suffit de quelques astuces 
            pour lui donner une seconde vie !"
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center">
            <ChefHat className="w-6 h-6 mr-2 text-tilkapp-green" />
            1. Croûtons maison ultra-croustillants
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Les croûtons faits maison sont 10x meilleurs que ceux du commerce, et tellement simples à préparer !
          </p>
          <div className="bg-tilkapp-beige rounded-lg p-6 my-6">
            <h3 className="font-bold text-gray-900 mb-3">Ingrédients :</h3>
            <ul className="space-y-1 text-gray-700 mb-4">
              <li>• Pain rassis (quantité au choix)</li>
              <li>• 3 cuillères à soupe d'huile d'olive</li>
              <li>• 1 gousse d'ail</li>
              <li>• Herbes de Provence</li>
              <li>• Sel, poivre</li>
            </ul>
            <h3 className="font-bold text-gray-900 mb-3">Préparation :</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Coupez le pain en cubes de 2cm</li>
              <li>2. Mélangez l'huile, l'ail écrasé et les herbes</li>
              <li>3. Enrobez les cubes de pain</li>
              <li>4. Enfournez 15 min à 180°C en remuant à mi-cuisson</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 italic">
            💡 Parfaits pour les salades, soupes ou à grignoter à l'apéritif !
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center">
            <ChefHat className="w-6 h-6 mr-2 text-tilkapp-green" />
            2. Pudding au pain façon grand-mère
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Un dessert réconfortant qui ravira petits et grands. Cette recette traditionnelle turque (Ekmek Tatlısı) 
            transforme le pain sec en un délice sucré.
          </p>
          <div className="bg-tilkapp-beige rounded-lg p-6 my-6">
            <h3 className="font-bold text-gray-900 mb-3">Ingrédients (4 personnes) :</h3>
            <ul className="space-y-1 text-gray-700 mb-4">
              <li>• 300g de pain rassis</li>
              <li>• 500ml de lait</li>
              <li>• 3 œufs</li>
              <li>• 100g de sucre</li>
              <li>• 1 sachet de sucre vanillé</li>
              <li>• Cannelle</li>
              <li>• Beurre</li>
            </ul>
            <h3 className="font-bold text-gray-900 mb-3">Préparation :</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Coupez le pain en tranches</li>
              <li>2. Trempez-les rapidement dans du lait chaud sucré</li>
              <li>3. Disposez dans un plat beurré</li>
              <li>4. Battez œufs + sucre + vanille, versez sur le pain</li>
              <li>5. Saupoudrez de cannelle</li>
              <li>6. Enfournez 35 min à 170°C</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 italic">
            🍯 Servez tiède avec une boule de glace vanille ou de la crème fraîche !
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center">
            <ChefHat className="w-6 h-6 mr-2 text-tilkapp-green" />
            3. Chapelure maison (Galeta Unu)
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            La chapelure maison est plus économique et plus savoureuse que celle du commerce. 
            Elle se conserve plusieurs mois dans un bocal hermétique.
          </p>
          <div className="bg-tilkapp-beige rounded-lg p-6 my-6">
            <h3 className="font-bold text-gray-900 mb-3">Méthode ultra-simple :</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Laissez sécher complètement le pain 2-3 jours</li>
              <li>2. Mixez au robot jusqu'à obtenir des miettes fines</li>
              <li>3. Passez au tamis pour une texture uniforme</li>
              <li>4. Conservez dans un bocal hermétique</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 italic">
            🍗 Idéal pour paner viandes, poissons, légumes ou gratiner vos plats !
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center">
            <ChefHat className="w-6 h-6 mr-2 text-tilkapp-green" />
            4. Soupe paysanne au pain (Paçanga)
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Une soupe traditionnelle turque épaisse et réconfortante, parfaite pour les soirées d'hiver.
          </p>
          <div className="bg-tilkapp-beige rounded-lg p-6 my-6">
            <h3 className="font-bold text-gray-900 mb-3">Ingrédients (4 personnes) :</h3>
            <ul className="space-y-1 text-gray-700 mb-4">
              <li>• 200g de pain rassis</li>
              <li>• 1L de bouillon de légumes ou poulet</li>
              <li>• 2 tomates</li>
              <li>• 1 oignon</li>
              <li>• 2 gousses d'ail</li>
              <li>• Paprika, cumin</li>
              <li>• Huile d'olive</li>
              <li>• Persil frais</li>
            </ul>
            <h3 className="font-bold text-gray-900 mb-3">Préparation :</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Faites revenir oignon + ail dans l'huile d'olive</li>
              <li>2. Ajoutez tomates concassées + épices</li>
              <li>3. Versez le bouillon, portez à ébullition</li>
              <li>4. Ajoutez le pain en morceaux</li>
              <li>5. Laissez mijoter 20 min en remuant</li>
              <li>6. Mixez partiellement pour une texture crémeuse</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 italic">
            🥖 Servez avec un filet d'huile d'olive, du persil ciselé et du pain grillé !
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center">
            <ChefHat className="w-6 h-6 mr-2 text-tilkapp-green" />
            5. Bruschetta turque aux tomates
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Une entrée méditerranéenne rapide et savoureuse, parfaite pour l'apéritif ou en accompagnement.
          </p>
          <div className="bg-tilkapp-beige rounded-lg p-6 my-6">
            <h3 className="font-bold text-gray-900 mb-3">Ingrédients (4 personnes) :</h3>
            <ul className="space-y-1 text-gray-700 mb-4">
              <li>• Pain rassis tranché</li>
              <li>• 4 tomates bien mûres</li>
              <li>• Fromage beyaz peynir ou feta</li>
              <li>• Basilic frais</li>
              <li>• 1 gousse d'ail</li>
              <li>• Huile d'olive</li>
              <li>• Vinaigre balsamique</li>
              <li>• Sel, poivre</li>
            </ul>
            <h3 className="font-bold text-gray-900 mb-3">Préparation :</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Grillez les tranches de pain (au four ou poêle)</li>
              <li>2. Frottez-les avec la gousse d'ail coupée</li>
              <li>3. Coupez les tomates en dés</li>
              <li>4. Mélangez tomates + fromage émietté + basilic ciselé</li>
              <li>5. Assaisonnez avec huile d'olive, vinaigre, sel, poivre</li>
              <li>6. Déposez généreusement sur le pain grillé</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 italic">
            🍅 À déguster immédiatement pour que le pain reste croustillant !
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Conseil de conservation</h2>
          <div className="bg-white border-2 border-tilkapp-green rounded-lg p-6 my-8">
            <p className="text-gray-700 mb-4">
              <strong>Astuce pro :</strong> Si vous n'utilisez pas tout de suite votre pain rassis, 
              congelez-le en tranches. Il sera parfait pour faire des croûtons ou de la chapelure même après plusieurs mois !
            </p>
            <p className="text-gray-700">
              <strong>Réhydratation express :</strong> Pour ramollir du pain très dur, passez-le 30 secondes sous l'eau 
              puis 5 minutes au four à 150°C. Il retrouvera sa texture moelleuse !
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trouvez du pain à prix réduit près de chez vous</h3>
            <p className="text-gray-700 mb-6">
              Avec TILKAPP, achetez du pain frais de boulangerie à -50% en fin de journée
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

export default BlogArticle6;