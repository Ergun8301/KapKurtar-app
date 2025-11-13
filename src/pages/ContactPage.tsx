import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Formspree endpoint (remplace par ton vrai endpoint)
    const formspreeEndpoint = 'https://formspree.io/f/xanykvyr';

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _replyto: formData.email
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-tilkapp-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-tilkapp-beige max-w-2xl mx-auto">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>
      </div>

      {/* Contact Options + Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* WhatsApp */}
            
              href="https://wa.me/33685507985?text=Bonjour%20TILKAPP,%20j'ai%20une%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-3 group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
                  <p className="text-gray-600 mb-3">
                    Contactez-nous directement via WhatsApp pour une réponse rapide
                  </p>
                  <span className="text-tilkapp-green font-medium group-hover:text-tilkapp-orange transition-colors">
                    Envoyer un message →
                  </span>
                </div>
              </div>
            </a>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 mb-3">
                    Remplissez le formulaire ci-contre, nous vous répondrons sous 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start">
                <div className="bg-red-100 rounded-full p-3">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Adresse</h3>
                  <p className="text-gray-600 text-sm">
                    Eski Hisar, 9501. Sk. No:3<br />
                    07600 Manavgat/Antalya<br />
                    Türkiye
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-600 mb-6">
                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-tilkapp-green text-white px-6 py-2 rounded-lg hover:bg-tilkapp-orange transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="question_client">Question client</option>
                      <option value="question_marchand">Question marchand</option>
                      <option value="probleme_technique">Problème technique</option>
                      <option value="partenariat">Proposition de partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                      placeholder="Votre message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-tilkapp-green text-white px-6 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;