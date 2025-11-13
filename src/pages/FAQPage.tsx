import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      name: 'Pour les Clients',
      faqs: [
        {
          question: 'Comment fonctionne TILKAPP ?',
          answer: 'TILKAPP vous connecte avec des commerces locaux qui proposent des produits à prix réduits pour éviter le gaspillage. Parcourez les offres disponibles, réservez ou venez directement en magasin selon le mode choisi par le commerçant.'
        },
        {
          question: 'Dois-je réserver ou puis-je venir directement ?',
          answer: 'Cela dépend du commerçant ! Certaines offres nécessitent une réservation via l\'app, d\'autres fonctionnent en "premier arrivé, premier servi". Le mode est clairement indiqué sur chaque offre.'
        },
        {
          question: 'Les produits sont-ils encore frais et sûrs ?',
          answer: 'Absolument ! Tous les produits sont frais et respectent les normes de sécurité alimentaire. Nous travaillons uniquement avec des commerces vérifiés qui maintiennent des protocoles stricts.'
        },
        {
          question: 'Combien puis-je économiser ?',
          answer: 'En moyenne, vous économisez entre 30% et 70% sur les prix habituels. Les réductions exactes varient selon les commerçants et la disponibilité.'
        },
        {
          question: 'Quel est le rayon de recherche ?',
          answer: 'Par défaut, TILKAPP affiche les offres dans un rayon de 0 à 30 km autour de vous. Vous pouvez également consulter les offres au-delà de cette distance si vous souhaitez élargir votre recherche.'
        },
        {
          question: 'Puis-je annuler ma réservation ?',
          answer: 'Pour les offres avec réservation, vous pouvez annuler jusqu\'à 30 minutes avant l\'heure de retrait. Passé ce délai, des frais peuvent s\'appliquer selon notre politique d\'annulation.'
        }
      ]
    },
    {
      name: 'Pour les Commerçants',
      faqs: [
        {
          question: 'Comment devenir partenaire TILKAPP ?',
          answer: 'Les commerçants peuvent s\'inscrire via notre processus d\'inscription marchand. Nous examinons chaque demande et travaillons avec des entreprises qui répondent à nos normes de qualité.'
        },
        {
          question: 'Quels types de produits puis-je proposer ?',
          answer: 'Tous types de produits alimentaires frais : pâtisseries, plats préparés, fruits et légumes, produits laitiers, etc. L\'important est qu\'ils soient de qualité et encore consommables.'
        },
        {
          question: 'Comment fixer mes prix ?',
          answer: 'Vous fixez librement vos prix réduits. Nous recommandons une réduction de 30% à 70% pour attirer les clients tout en valorisant vos invendus.'
        },
        {
          question: 'TILKAPP prend-elle une commission ?',
          answer: 'Oui, TILKAPP prend une petite commission sur chaque vente pour maintenir la plateforme. Les détails tarifaires sont communiqués lors de l\'inscription.'
        },
        {
          question: 'Puis-je choisir le mode de vente ?',
          answer: 'Oui ! Vous choisissez si vos offres nécessitent une réservation ou si elles sont disponibles en "premier arrivé, premier servi".'
        }
      ]
    },
    {
      name: 'À propos de TILKAPP',
      faqs: [
        {
          question: 'Où TILKAPP est-elle disponible ?',
          answer: 'TILKAPP est actuellement disponible à Antalya et ses environs. Nous prévoyons d\'étendre nos services à d\'autres villes de Turquie prochainement.'
        },
        {
          question: 'TILKAPP est-elle gratuite ?',
          answer: 'Oui, le téléchargement et l\'utilisation de l\'application sont entièrement gratuits pour les clients. Vous ne payez que les produits que vous achetez.'
        },
        {
          question: 'Comment contacter le support ?',
          answer: 'Vous pouvez nous contacter via la page Contact de notre site ou directement depuis l\'application. Notre équipe répond sous 24h.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex: number, faqIndex: number) => {
    const globalIndex = categoryIndex * 100 + faqIndex;
    setOpenFAQ(openFAQ === globalIndex ? null : globalIndex);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-xl text-tilkapp-beige mb-8">
            Trouvez rapidement les réponses à vos questions sur TILKAPP
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-tilkapp-orange"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            <div className="space-y-4">
              {category.faqs.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex;
                return (
                  <div key={faqIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <button
                      onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      {openFAQ === globalIndex ? (
                        <ChevronUp className="w-5 h-5 text-tilkapp-green flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFAQ === globalIndex && (
                      <div className="px-6 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucune question trouvée pour "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas votre réponse ?
          </h3>
          <p className="text-gray-600 mb-8">
            Notre équipe est là pour vous aider
          </p>
          
            href="/contact"
            className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;