import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  quantity: number;
  available_from: string;
  available_until: string;
}

interface FormData {
  title: string;
  description: string;
  image: File | null;
  imagePreview: string;
  price_before: string;
  price_after: string;
  quantity: string;
  available_from: string;
  available_until: string;
  startNow: boolean;
  duration: string;
  customDuration: string;
}

interface OfferFormProps {
  mode: 'create' | 'edit';
  initialData?: Offer;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    imagePreview: '',
    price_before: '',
    price_after: '',
    quantity: '',
    available_from: '',
    available_until: '',
    startNow: true,
    duration: '2h',
    customDuration: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: initialData.title,
        description: initialData.description,
        image: null,
        imagePreview: initialData.image_url || '',
        price_before: initialData.price_before.toString(),
        price_after: initialData.price_after.toString(),
        quantity: initialData.quantity.toString(),
        available_from: formatDateForInput(initialData.available_from),
        available_until: formatDateForInput(initialData.available_until),
        startNow: false,
        duration: '2h',
        customDuration: '',
      });
    } else if (mode === 'create') {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 120 * 60000);
      setFormData({
        title: '',
        description: '',
        image: null,
        imagePreview: '',
        price_before: '',
        price_after: '',
        quantity: '',
        available_from: now.toISOString().slice(0, 16),
        available_until: twoHoursLater.toISOString().slice(0, 16),
        startNow: true,
        duration: '2h',
        customDuration: '',
      });
    }
  }, [mode, initialData]);

  const calculateDiscount = (priceBefore: string, priceAfter: string): number => {
    const before = parseFloat(priceBefore);
    const after = parseFloat(priceAfter);
    if (!before || !after || before <= 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'duration' || name === 'customDuration') {
      updateEndDate(value, name === 'duration' ? 'duration' : 'custom');
    }
  };

  const updateEndDate = (durationValue: string, type: 'duration' | 'custom') => {
    const startDate = formData.startNow
      ? new Date()
      : new Date(formData.available_from);
    if (isNaN(startDate.getTime())) return;

    let minutes = 0;
    if (type === 'duration') {
      switch (durationValue) {
        case '30min':
          minutes = 30;
          break;
        case '1h':
          minutes = 60;
          break;
        case '2h':
          minutes = 120;
          break;
        case '4h':
          minutes = 240;
          break;
        case 'allday':
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 0, 0);
          setFormData((prev) => ({
            ...prev,
            available_until: endOfDay.toISOString().slice(0, 16),
          }));
          return;
        case 'custom':
          minutes = parseInt(formData.customDuration) || 0;
          break;
        default:
          return;
      }
    } else {
      minutes = parseInt(durationValue) || 0;
    }

    const endDate = new Date(startDate.getTime() + minutes * 60000);
    setFormData((prev) => ({
      ...prev,
      available_until: endDate.toISOString().slice(0, 16),
    }));
  };

  const handleStartNowChange = (checked: boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, startNow: checked };
      if (checked) {
        const now = new Date();
        newData.available_from = now.toISOString().slice(0, 16);
      }
      return newData;
    });
    if (checked && formData.duration) {
      setTimeout(() => updateEndDate(formData.duration, 'duration'), 0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif',
      ];

      if (file.size > MAX_SIZE) {
        setToast({
          message:
            "Image trop volumineuse (max. 5 Mo). Réduis la taille ou compresse-la avant d'envoyer.",
          type: 'error',
        });
        return;
      }

      if (!validTypes.includes(file.type.toLowerCase())) {
        setToast({
          message:
            'Format non pris en charge. Formats acceptés : JPG, PNG, WEBP, HEIC, HEIF, AVIF.',
          type: 'error',
        });
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.price_before &&
    formData.price_after &&
    formData.quantity &&
    formData.available_from &&
    formData.available_until;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {toast && (
        <div
          className={
            'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ' +
            (toast.type === 'success' ? 'bg-green-500' : 'bg-red-500') +
            ' text-white'
          }
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Fresh Croissants Box"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 Photo du produit
            </label>
            {mode === 'create' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Prendre une photo ou choisir une image</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formData.image
                        ? formData.image.name
                        : 'Prendre une photo ou choisir une image (optionnel)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.imagePreview && (
                  <div className="mt-3">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (€)
              </label>
              <input
                type="number"
                name="price_before"
                value={formData.price_before}
                onChange={handleInputChange}
                placeholder="12.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (€)</label>
              <input
                type="number"
                name="price_after"
                value={formData.price_after}
                onChange={handleInputChange}
                placeholder="5.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {formData.price_before && formData.price_after && parseFloat(formData.price_before) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <span className="text-lg font-bold text-green-600">
                -{calculateDiscount(formData.price_before, formData.price_after)}% discount
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Available
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="10"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {mode === 'create' && (
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="startNow"
                  checked={formData.startNow}
                  onChange={(e) => handleStartNowChange(e.target.checked)}
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                />
                <label htmlFor="startNow" className="ml-2 text-sm font-medium text-gray-700">
                  Start: Now
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    disabled={formData.startNow}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    name="available_until"
                    value={formData.available_until}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="30min">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="2h">2 hours</option>
                  <option value="4h">4 hours</option>
                  <option value="allday">All day (today)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {formData.duration === 'custom' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="customDuration"
                    value={formData.customDuration}
                    onChange={handleInputChange}
                    placeholder="120"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until
                </label>
                <input
                  type="datetime-local"
                  name="available_until"
                  value={formData.available_until}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className={
              'w-full py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ' +
              (mode === 'create'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600')
            }
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Publishing...'
                : 'Updating...'
              : mode === 'create'
              ? 'Publish Product'
              : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
