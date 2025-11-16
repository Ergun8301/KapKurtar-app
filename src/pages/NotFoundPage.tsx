import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 border border-gray-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 bg-[#00A690] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#F75C00] transition-colors duration-300"
          >
            <Home className="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3">
            Liens utiles
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/offers')}
              className="text-[#00A690] hover:text-[#00A690] font-medium text-sm"
            >
              Voir les offres
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/customer/auth')}
              className="text-[#00A690] hover:text-[#00A690] font-medium text-sm"
            >
              Se connecter
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/merchant/auth')}
              className="text-[#00A690] hover:text-[#00A690] font-medium text-sm"
            >
              Espace commerçant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
