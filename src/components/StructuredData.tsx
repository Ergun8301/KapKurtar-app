import React from 'react';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface LocalBusinessSchemaProps {
  type: 'localBusiness';
  city: string;
  cityTurkish: string;
}

interface FAQSchemaProps {
  type: 'faq';
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

type StructuredDataProps = OrganizationSchemaProps | LocalBusinessSchemaProps | FAQSchemaProps;

/**
 * Composant pour injecter des données structurées Schema.org dans le <head>
 * Améliore le référencement et l'affichage dans les résultats de recherche Google
 */
const StructuredData: React.FC<StructuredDataProps> = (props) => {
  let schema: any = {};

  if (props.type === 'organization') {
    schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://kapkurtar.com/#organization",
      "name": "KapKurtar",
      "url": "https://kapkurtar.com",
      "logo": "https://kapkurtar.com/logo.png",
      "description": "Türkiye'nin gıda israfını önleyen marketplace platformu. Restoranlar, fırınlar ve marketlerden %70 indirimli yemek fırsatları.",
      "foundingDate": "2024",
      "areaServed": [
        {
          "@type": "City",
          "name": "İstanbul",
          "addressCountry": "TR"
        },
        {
          "@type": "City",
          "name": "Ankara",
          "addressCountry": "TR"
        },
        {
          "@type": "City",
          "name": "İzmir",
          "addressCountry": "TR"
        },
        {
          "@type": "City",
          "name": "Antalya",
          "addressCountry": "TR"
        },
        {
          "@type": "City",
          "name": "Bursa",
          "addressCountry": "TR"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/kapkurtar",
        "https://www.instagram.com/kapkurtar",
        "https://www.linkedin.com/company/kapkurtar"
      ]
    };
  } else if (props.type === 'localBusiness') {
    schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `KapKurtar ${props.cityTurkish}`,
      "description": `${props.cityTurkish}'da gıda israfını önleyen marketplace. %70 indirimli yemek fırsatları.`,
      "url": `https://kapkurtar.com/${props.city}`,
      "priceRange": "₺₺",
      "areaServed": {
        "@type": "City",
        "name": props.cityTurkish,
        "addressCountry": "TR"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `${props.cityTurkish} Yemek Fırsatları`,
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "FoodEvent",
              "name": "İndirimli Yemek"
            }
          }
        ]
      }
    };
  } else if (props.type === 'faq') {
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": props.questions.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer
        }
      }))
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData;
