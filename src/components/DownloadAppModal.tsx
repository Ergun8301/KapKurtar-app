import React, { useState } from 'react';
import { X, Smartphone, QrCode } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Implement email notification signup
      console.log('Email submitted for notifications:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-tilkapp-green mb-2">
              Téléchargez TILKAPP
            </h2>
            <p className="text-gray-600 text-lg">
              Sauvez de la nourriture près de chez vous
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="mb-6 flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-gray-300">
              <QrCode className="w-16 h-16 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">QR Code</span>
              <span className="text-xs text-gray-400">Coming Soon</span>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed opacity-60 flex items-center justify-center space-x-2 transition-all"
            >
              <span className="text-2xl">📱</span>
              <span className="text-sm">For iPhone</span>
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed opacity-60 flex items-center justify-center space-x-2 transition-all"
            >
              <span className="text-2xl">🤖</span>
              <span className="text-sm">For Android</span>
            </button>
          </div>

          {/* Coming Soon Text */}
          <p className="text-center text-sm italic text-gray-500 mb-6">
            Bientôt disponible sur iOS et Android
          </p>

          {/* Email Notification Form */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600 mb-4">
              Soyez notifié du lancement de l'application
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tilkapp-green focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="w-full bg-tilkapp-green text-white px-6 py-3 rounded-lg font-bold hover:bg-tilkapp-orange transition-colors shadow-md hover:shadow-lg"
              >
                {isSubmitted ? '✓ Merci !' : 'Notifiez-moi'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
