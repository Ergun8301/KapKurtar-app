import React from 'react';
import { TrendingUp, Clock, Users, Smartphone, CheckCircle, BarChart3, Shield, Zap } from 'lucide-react';

const ForMerchantsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transformez vos invendus en revenus
            </h1>
            <p className="text-xl text-tilkapp-beige mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 150 commerçants qui ont déjà réduit leur gaspillage et augmenté leurs revenus avec TILKAPP
            </p>
            
              href="/merchant/auth"
              className="inline-block bg-tilkapp-orange text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg"
            >
              Devenir partenaire gratuitement
            </a>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Le Problème</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">5-15%</div>
              <p>de votre stock jeté chaque jour</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">2,3M</div>
              <p>tonnes gaspillées par an en Turquie</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">-100%</div>
              <p>de marge sur les produits jetés</p>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">La Solution TILKAPP</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Plutôt que de jeter vos invendus, vendez-les à prix réduit à des clients motivés. 
            Récupérez jusqu'à 50% de leur valeur au lieu de tout perdre.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-tilkapp-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">+30% de revenus</h3>
            <p className="text-sm text-gray-600">Récupérez 30-50% de la valeur de vos invendus</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-tilkapp-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">2 minutes</h3>
            <p className="text-sm text-gray-600">Pour publier une offre depuis votre smartphone</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Nouveaux clients</h3>
            <p className="text-sm text-gray-600">Touchez une clientèle que vous n'auriez jamais eue</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">100% gratuit</h3>
            <p className="text-sm text-gray-600">Aucun frais d'inscription ni d'abonnement</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-tilkapp-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Inscription</h3>
              <p className="text-sm text-gray-600">Créez votre compte marchand en 5 minutes</p>
            </div>

            <div className="text-center">
              <div className="bg-tilkapp-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Publication</h3>
              <p className="text-sm text-gray-600">Publiez vos invendus avec photo et prix réduit</p>
            </div>

            <div className="text-center">
              <div className="bg-tilkapp-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Réservation</h3>
              <p className="text-sm text-gray-600">Les clients réservent et paient via l'app</p>
            </div>

            <div className="text-center">
              <div className="bg-tilkapp-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Retrait</h3>
              <p className="text-sm text-gray-600">Le client vient récupérer sa commande</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ils nous font confiance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-tilkapp-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  A
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ahmet</div>
                  <div className="text-sm text-gray-600">Boulangerie, Konyaaltı</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Avant TILKAPP, je jetais 50 pains par jour. Maintenant je n'en jette plus que 5. 
                C'est un vrai changement pour mon commerce !"
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-tilkapp-orange text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  F
                </div>
                <div>
                  <div className="font-bold text-gray-900">Fatma</div>
                  <div className="text-sm text-gray-600">Épicerie fine, Lara</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "TILKAPP m'a permis de réduire mes pertes de 70%. En plus, mes clients découvrent 
                de nouveaux produits qu'ils rachètent ensuite au prix normal."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                  M
                </div>
                <div>
                  <div className="font-bold text-gray-900">Mehmet</div>
                  <div className="text-sm text-gray-600">Restaurant, Muratpaşa</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Je propose mes plats du midi en fin de service. C'est simple, rapide, 
                et ça me fait un complément de revenu non négligeable."
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-tilkapp-beige rounded-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Toutes les fonctionnalités dont vous avez besoin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Interface simple</h3>
                <p className="text-sm text-gray-700">Application mobile intuitive, pas besoin de formation</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Paiement sécurisé</h3>
                <p className="text-sm text-gray-700">Les clients paient en ligne, vous êtes payé automatiquement</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Notifications en temps réel</h3>
                <p className="text-sm text-gray-700">Soyez alerté dès qu'une commande est passée</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Statistiques détaillées</h3>
                <p className="text-sm text-gray-700">Suivez vos ventes et votre impact anti-gaspi</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Horaires flexibles</h3>
                <p className="text-sm text-gray-700">Définissez vos créneaux de retrait comme vous voulez</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-tilkapp-green flex-shrink-0 mr-3 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Support réactif</h3>
                <p className="text-sm text-gray-700">Notre équipe vous accompagne à chaque étape</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarification transparente</h2>
          <div className="flex items-center justify-center mb-6">
            <div className="text-6xl font-bold text-tilkapp-green">0€</div>
            <div className="text-left ml-4">
              <div className="text-xl font-bold text-gray-900">Inscription</div>
              <div className="text-gray-600">100% gratuit</div>
            </div>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            TILKAPP prend une petite commission uniquement sur les ventes réalisées. 
            Pas de vente = pas de frais. C'est aussi simple que ça !
          </p>
          <div className="inline-block bg-tilkapp-beige rounded-lg px-6 py-3">
            <p className="text-gray-900">
              <span className="font-bold text-2xl text-tilkapp-green">15%</span> de commission sur chaque vente
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à transformer vos invendus en revenus ?</h2>
          <p className="text-xl text-tilkapp-beige mb-8">
            Rejoignez TILKAPP gratuitement et commencez à vendre dès aujourd'hui
          </p>
          
            href="/merchant/auth"
            className="inline-block bg-tilkapp-orange text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg"
          >
            Créer mon compte marchand
          </a>
          <p className="text-sm text-tilkapp-beige mt-4">
            Inscription en 5 minutes • Aucune carte bancaire requise
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForMerchantsPage;