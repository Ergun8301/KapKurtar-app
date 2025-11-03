import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Loader, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const MerchantProfileEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    logo_url: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!user) {
        navigate('/merchant/auth');
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) {
          setToast({ message: 'Profil introuvable', type: 'error' });
          return;
        }

        const { data: merchantData, error: merchantError } = await supabase
          .from('merchants')
          .select('id, company_name, phone, street, city, postal_code, logo_url')
          .eq('profile_id', profileData.id)
          .maybeSingle();

        if (merchantError) throw merchantError;
        if (!merchantData) {
          setToast({ message: 'Marchand introuvable', type: 'error' });
          return;
        }

        setMerchantId(merchantData.id);
        setFormData({
          company_name: merchantData.company_name || '',
          phone: merchantData.phone || '',
          street: merchantData.street || '',
          city: merchantData.city || '',
          postal_code: merchantData.postal_code || '',
          logo_url: merchantData.logo_url || '',
        });
      } catch (error: any) {
        console.error('Error fetching merchant data:', error);
        setToast({ message: error.message || 'Erreur de chargement', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantData();
  }, [user, navigate]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !merchantId) return;

    setUploadingLogo(true);
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${merchantId}_${timestamp}.${extension}`;
      const filePath = `${merchantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('merchant-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('merchant-logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      setToast({ message: 'Logo upload\u00e9 avec succ\u00e8s', type: 'success' });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setToast({ message: error.message || 'Erreur lors de l\'upload', type: 'error' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchantId) {
      setToast({ message: 'Marchand introuvable', type: 'error' });
      return;
    }

    if (!formData.company_name.trim()) {
      setToast({ message: 'Le nom de l\'entreprise est obligatoire', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          company_name: formData.company_name,
          phone: formData.phone || null,
          street: formData.street || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          logo_url: formData.logo_url || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);

      if (error) throw error;

      setToast({ message: 'Profil enregistr\u00e9 avec succ\u00e8s', type: 'success' });
      setTimeout(() => {
        navigate('/merchant/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Error updating merchant:', error);
      setToast({ message: error.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast && (
        <div className={'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ' + (toast.type === 'success' ? 'bg-green-500' : 'bg-red-500') + ' text-white'}>
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/merchant/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au tableau de bord
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Building2 className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon profil marchand</h1>
              <p className="text-gray-600 mt-1">Compl\u00e9tez vos informations pour am\u00e9liorer votre visibilit\u00e9</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Boulangerie Martin"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                T\u00e9l\u00e9phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: +33 1 23 45 67 89"
              />
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 12 rue de la R\u00e9publique"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Paris"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 75001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'entreprise
              </label>
              <div className="flex items-start space-x-4">
                {formData.logo_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        {formData.logo_url ? 'Changer le logo' : 'Uploader un logo'}
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format accept\u00e9s : JPG, PNG, GIF. Taille max : 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/merchant/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfileEditPage;
