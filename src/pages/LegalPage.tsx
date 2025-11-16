import React, { useState } from 'react';
import { Shield, FileText, Lock } from 'lucide-react';

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'mentions'>('terms');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mentions Légales
          </h1>
          <p className="text-xl text-tilkapp-beige">
            Conditions d'utilisation, politique de confidentialité et mentions légales
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'border-tilkapp-green text-tilkapp-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Conditions d'utilisation</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'border-tilkapp-green text-tilkapp-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Politique de confidentialité</span>
            </button>
            <button
              onClick={() => setActiveTab('mentions')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'mentions'
                  ? 'border-tilkapp-green text-tilkapp-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Mentions légales</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'terms' && (
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Conditions Générales d'Utilisation</h2>
            <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : Novembre 2024</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Objet</h3>
            <p className="text-gray-700 mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
              et conditions d'utilisation de la plateforme TILKAPP accessible via le site web et l'application mobile.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Acceptation des conditions</h3>
            <p className="text-gray-700 mb-4">
              L'utilisation de la plateforme TILKAPP implique l'acceptation pleine et entière des présentes CGU. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Description du service</h3>
            <p className="text-gray-700 mb-4">
              TILKAPP est une plateforme numérique qui met en relation des commerçants proposant des produits 
              alimentaires invendus à prix réduit avec des consommateurs. La plateforme permet :
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li>Aux commerçants de publier leurs offres d'invendus</li>
              <li>Aux consommateurs de réserver et acheter ces produits à prix réduit</li>
              <li>La gestion des paiements et des transactions</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Inscription et compte utilisateur</h3>
            <p className="text-gray-700 mb-4">
              <strong>4.1.</strong> Pour utiliser TILKAPP, vous devez créer un compte en fournissant des informations exactes et à jour.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>4.2.</strong> Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>4.3.</strong> Vous devez avoir au moins 18 ans pour créer un compte.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Obligations des utilisateurs</h3>
            <p className="text-gray-700 mb-4">
              <strong>Pour les consommateurs :</strong>
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li>Récupérer les commandes aux horaires convenus</li>
              <li>Payer les produits réservés</li>
              <li>Ne pas abuser du système de réservation</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Pour les commerçants :</strong>
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li>Proposer des produits conformes aux normes sanitaires en vigueur</li>
              <li>Respecter les prix et horaires annoncés</li>
              <li>Honorer les commandes réservées</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Transactions et paiements</h3>
            <p className="text-gray-700 mb-4">
              <strong>6.1.</strong> Les paiements sont effectués via la plateforme de manière sécurisée.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>6.2.</strong> TILKAPP prélève une commission de 15% sur chaque transaction réalisée.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>6.3.</strong> Les remboursements sont possibles selon les conditions définies dans notre politique de remboursement.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Responsabilité</h3>
            <p className="text-gray-700 mb-4">
              <strong>7.1.</strong> TILKAPP agit en tant qu'intermédiaire entre commerçants et consommateurs.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>7.2.</strong> La qualité et la conformité des produits relèvent de la responsabilité des commerçants.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>7.3.</strong> TILKAPP ne peut être tenu responsable en cas de litige entre un commerçant et un consommateur.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Propriété intellectuelle</h3>
            <p className="text-gray-700 mb-4">
              Tous les éléments de la plateforme TILKAPP (logo, marque, design, contenu) sont protégés 
              par les droits de propriété intellectuelle et ne peuvent être utilisés sans autorisation.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Modification des CGU</h3>
            <p className="text-gray-700 mb-4">
              TILKAPP se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
              seront informés de toute modification significative.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Droit applicable</h3>
            <p className="text-gray-700 mb-4">
              Les présentes CGU sont régies par le droit turc. En cas de litige, les tribunaux turcs seront compétents.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Politique de Confidentialité</h2>
            <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : Novembre 2024</p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h3>
            <p className="text-gray-700 mb-4">
              TILKAPP s'engage à protéger la vie privée de ses utilisateurs. Cette politique explique 
              comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Données collectées</h3>
            <p className="text-gray-700 mb-4">Nous collectons les types de données suivants :</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Données d'identification :</strong> Nom, prénom, email, numéro de téléphone</li>
              <li><strong>Données de localisation :</strong> Adresse, position GPS (si autorisée)</li>
              <li><strong>Données de paiement :</strong> Informations bancaires (traitées de manière sécurisée par notre prestataire)</li>
              <li><strong>Données d'utilisation :</strong> Historique des commandes, préférences</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Utilisation des données</h3>
            <p className="text-gray-700 mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li>Fournir et améliorer nos services</li>
              <li>Traiter vos commandes et paiements</li>
              <li>Vous envoyer des notifications pertinentes</li>
              <li>Personnaliser votre expérience</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Partage des données</h3>
            <p className="text-gray-700 mb-4">
              Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement avec :
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li>Les commerçants concernés par vos commandes (nom, numéro de commande)</li>
              <li>Nos prestataires de services (paiement, hébergement) sous strict contrat de confidentialité</li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Sécurité des données</h3>
            <p className="text-gray-700 mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
              vos données contre tout accès, modification, divulgation ou destruction non autorisés.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Vos droits</h3>
            <p className="text-gray-700 mb-4">Conformément au RGPD et au KVKK (loi turque sur la protection des données), vous disposez des droits suivants :</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et vos données</li>
              <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Pour exercer vos droits, contactez-nous via notre formulaire de contact.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h3>
            <p className="text-gray-700 mb-4">
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences 
              de cookies dans les paramètres de votre navigateur.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Conservation des données</h3>
            <p className="text-gray-700 mb-4">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles 
              ont été collectées, puis archivées ou supprimées conformément aux obligations légales.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact</h3>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant cette politique de confidentialité, contactez-nous via notre 
              formulaire de contact ou par WhatsApp.
            </p>
          </div>
        )}

        {activeTab === 'mentions' && (
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Mentions Légales</h2>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Éditeur de la plateforme</h3>
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2"><strong>Nom :</strong> TILKAPP</p>
              <p className="text-gray-700 mb-2"><strong>Forme juridique :</strong> En cours de constitution</p>
              <p className="text-gray-700 mb-2"><strong>Adresse :</strong> Eski Hisar, 9501. Sk. No:3, 07600 Manavgat/Antalya, Türkiye</p>
              <p className="text-gray-700 mb-2"><strong>Contact :</strong> Via formulaire de contact ou WhatsApp</p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hébergement</h3>
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2"><strong>Service :</strong> Supabase</p>
              <p className="text-gray-700 mb-2"><strong>Hébergement :</strong> Cloud infrastructure</p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Propriété intellectuelle</h3>
            <p className="text-gray-700 mb-4">
              L'ensemble du contenu de la plateforme TILKAPP (textes, images, logos, design) est protégé 
              par les droits de propriété intellectuelle. Toute reproduction ou utilisation non autorisée 
              est strictement interdite.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Responsabilité</h3>
            <p className="text-gray-700 mb-4">
              TILKAPP s'efforce de maintenir la plateforme accessible et fonctionnelle. Toutefois, nous ne 
              pouvons garantir une disponibilité à 100% et déclinons toute responsabilité en cas d'interruption 
              temporaire du service.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Droit applicable et juridiction</h3>
            <p className="text-gray-700 mb-4">
              Les présentes mentions légales sont régies par le droit turc. En cas de litige, les tribunaux 
              compétents d'Antalya seront seuls compétents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPage;