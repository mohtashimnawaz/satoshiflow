import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Clock, 
  User, 
  FileText, 
  Tag,
  AlertCircle,
  CheckCircle,
  FileText as TemplateIcon
} from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';
import { getBackendActor } from '../utils/getBackendActor';

const CreateStream = () => {
  const [formData, setFormData] = useState({
    recipient: '',
    satsPerSec: '',
    duration: '',
    totalLocked: '',
    title: '',
    description: '',
    tags: '',
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user, walletType } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const templateList = await satoshiflow_backend.list_templates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      satsPerSec: template.sats_per_sec.toString(),
      duration: Math.floor(template.duration_secs / 60).toString(), // Convert to minutes
      title: template.name,
      description: template.description,
    }));
  };

  const calculateTotalLocked = () => {
    const satsPerSec = parseFloat(formData.satsPerSec) || 0;
    const durationMinutes = parseFloat(formData.duration) || 0;
    const durationSeconds = durationMinutes * 60;
    return Math.floor(satsPerSec * durationSeconds);
  };

  // Autofill recipient with current user's principal
  const autofillRecipient = () => {
    if (user && user.toText) {
      setFormData(prev => ({
        ...prev,
        recipient: user.toText(),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log the user principal for debugging
      console.log('Creating stream as user:', user && user.toText ? user.toText() : user);
      // Validate inputs
      if (!formData.recipient || !formData.satsPerSec || !formData.duration) {
        throw new Error('Please fill in all required fields');
      }

      // Validate recipient principal
      let recipientPrincipal;
      try {
        recipientPrincipal = Principal.fromText(formData.recipient);
      } catch {
        throw new Error('Invalid recipient principal ID');
      }

      const satsPerSec = parseInt(formData.satsPerSec);
      const durationSecs = parseInt(formData.duration) * 60; // Convert minutes to seconds
      const totalLocked = formData.totalLocked ? parseInt(formData.totalLocked) : calculateTotalLocked();

      if (satsPerSec <= 0 || durationSecs <= 0 || totalLocked <= 0) {
        throw new Error('Values must be positive numbers');
      }

      // Get the authenticated identity
      let identity = null;
      if (walletType === 'plug' && window.ic?.plug) {
        await window.ic.plug.createAgent();
        identity = window.ic.plug.agent.identity;
      } else if (walletType === 'ii') {
        const { AuthClient } = await import('@dfinity/auth-client');
        const authClient = await AuthClient.create();
        identity = authClient.getIdentity();
      }
      console.log('Using identity:', identity);
      const backend = getBackendActor(identity);
      console.log('Backend actor:', backend);

      // Create stream
      let streamId;
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const safeTitle = formData.title && formData.title.trim() ? formData.title.trim() : null;
      const safeDescription = formData.description && formData.description.trim() ? formData.description.trim() : null;
      console.log('create_stream args:', recipientPrincipal, satsPerSec, durationSecs, totalLocked, safeTitle, safeDescription, tagsArray);
      if (selectedTemplate) {
        streamId = await backend.create_stream_from_template(
          selectedTemplate.id,
          recipientPrincipal,
          totalLocked
        );
      } else {
        streamId = await backend.create_stream(
          recipientPrincipal,
          satsPerSec,
          durationSecs,
          totalLocked,
          safeTitle ? [safeTitle] : [],
          safeDescription ? [safeDescription] : [],
          tagsArray
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/streams/${streamId}`);
      }, 2000);

    } catch (error) {
      console.error('Failed to create stream:', error);
      setError(error.message || 'Failed to create stream');
    } finally {
      setLoading(false);
    }
  };

  const totalLocked = formData.totalLocked ? parseInt(formData.totalLocked) : calculateTotalLocked();

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="card">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stream Created!</h2>
          <p className="text-gray-600 mb-4">
            Your Bitcoin stream has been created successfully.
          </p>
          <div className="animate-pulse text-orange-500">
            Redirecting to stream details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Stream</h1>
        <p className="text-gray-600 mt-2">
          Set up a new Bitcoin streaming payment
        </p>
        <button type="button" className="btn-secondary mt-2" onClick={autofillRecipient}>
          Autofill my Principal as Recipient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Recipient Principal ID *
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter recipient's principal ID"
                required
              />
            </div>

            {/* Stream Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calculator className="inline h-4 w-4 mr-1" />
                Stream Rate (sats/second) *
              </label>
              <input
                type="number"
                name="satsPerSec"
                value={formData.satsPerSec}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 100"
                min="1"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 60"
                min="1"
                required
              />
            </div>

            {/* Total Locked Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calculator className="inline h-4 w-4 mr-1" />
                Total Locked Amount (sats)
              </label>
              <input
                type="number"
                name="totalLocked"
                value={formData.totalLocked}
                onChange={handleInputChange}
                className="input-field"
                placeholder={`Auto-calculated: ${totalLocked !== undefined && totalLocked !== null ? Number(totalLocked).toLocaleString() : '--'}`}
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to auto-calculate based on rate × duration
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Title (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Monthly subscription payment"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="input-field"
                placeholder="Add more details about this stream..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags (optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., subscription, service, payment (comma-separated)"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Stream...</span>
                  </div>
                ) : (
                  'Create Stream'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stream Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stream Preview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Rate:</span>
                <span className="font-medium">
                  {formData.satsPerSec ? `${formData.satsPerSec} sats/sec` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">
                  {formData.duration ? `${formData.duration} minutes` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium">
                  {totalLocked !== undefined && totalLocked !== null ? `${Number(totalLocked).toLocaleString()} sats` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Per minute:</span>
                <span className="font-medium">
                  {formData.satsPerSec !== undefined && formData.satsPerSec !== null ? `${(Number(formData.satsPerSec) * 60).toLocaleString()} sats` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <TemplateIcon className="inline h-5 w-5 mr-2" />
                Templates
              </h3>
              <div className="space-y-2">
                {templates.slice(0, 3).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">
                      {template.sats_per_sec} sats/sec • {Math.floor(template.duration_secs / 60)} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start with smaller amounts for testing</li>
              <li>• Use descriptive titles and tags</li>
              <li>• Double-check the recipient's principal ID</li>
              <li>• Consider using templates for recurring payments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStream;
