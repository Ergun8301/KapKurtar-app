import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
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
      question: 'Comment devenir commerçant partenaire ?',
      answer: 'Les commerçants peuvent s\'inscrire via notre processus d\'inscription marchand. Nous examinons chaque demande et travaillons avec des entreprises qui répondent à nos normes de qualité.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions Fréquentes</h2>
          <p className="text-xl text-gray-600">
            Vous avez des questions ? Nous avons les réponses.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-tilkapp-green" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-600 pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Vous avez d'autres questions ?</p>
          
            href="/faq"
            className="bg-tilkapp-green text-white px-8 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors inline-block mr-4"
          >
            Voir toutes les FAQ
          </a>
          
            href="/contact"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-block"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;