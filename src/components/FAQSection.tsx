import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does TILKAPP work?',
      answer: 'TILKAPP connects you with local restaurants offering discounted meals to reduce food waste. Browse available offers, place your order, and pick up your meal at the specified time.'
    },
    {
      question: 'Are the discounted meals still fresh and safe?',
      answer: 'Absolutely! All meals are prepared fresh and meet the same quality standards as regular-priced items. We work only with verified restaurants that maintain strict food safety protocols.'
    },
    {
      question: 'How much can I save?',
      answer: 'You can typically save 30-70% off regular menu prices. The exact discount varies by restaurant and availability, but our average savings are around 50%.'
    },
    {
      question: 'Can I choose what I want to eat?',
      answer: 'Yes! You can browse all available offers and choose exactly what you want. Each listing shows the meal details, ingredients, and any dietary information.'
    },
    {
      question: 'What if I need to cancel my order?',
      answer: 'You can cancel your order up to 30 minutes before the pickup time for a full refund. After that, cancellations may be subject to our cancellation policy.'
    },
    {
      question: 'How do I become a merchant partner?',
      answer: 'Restaurant owners can apply to become partners through our merchant signup process. We review applications and work with businesses that meet our quality and sustainability standards.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Got questions? We've got answers. Find everything you need to know about TILKAPP.
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
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/faq"
            className="bg-tilkapp-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-block mr-4"
          >
            View All FAQs
          </a>
          <a
            href="/contact"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-block"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;