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

// Utility: Deeply convert all BigInt fields to Number
function deepBigIntToNumber(obj, seen = new Set()) {
  if (typeof obj === 'bigint') return Number(obj);
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  // Avoid circular references
  if (seen.has(obj)) return obj;
  seen.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepBigIntToNumber(item, seen));
  }
  
  // Handle special objects like Principal
  if (obj._isPrincipal || obj.toText || obj._arr) {
    return obj;
  }
  
  const out = {};
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      try {
        out[k] = deepBigIntToNumber(obj[k], seen);
      } catch (error) {
        // If conversion fails, keep original value
        console.warn(`Failed to convert ${k}:`, error);
        out[k] = obj[k];
      }
    }
  }
  return out;
}

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

  // Load selected template from localStorage if coming from templates page
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        console.log('Loading saved template:', template);
        handleTemplateSelect(template);
        // Clear from localStorage after use
        localStorage.removeItem('selectedTemplate');
      } catch (error) {
        console.error('Error loading saved template:', error);
        localStorage.removeItem('selectedTemplate');
      }
    }
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates for CreateStream...');
      const templateList = await satoshiflow_backend.list_templates();
      console.log('Raw templates:', templateList);
      
      // Convert BigInt values to Numbers for frontend compatibility
      const convertedTemplates = templateList.map(template => {
        const converted = deepBigIntToNumber(template);
        return {
          ...converted,
          id: template.id !== undefined ? Number(template.id) : 0,
          duration_secs: template.duration_secs !== undefined ? Number(template.duration_secs) : 0,
          sats_per_sec: template.sats_per_sec !== undefined ? Number(template.sats_per_sec) : 0,
          created_at: template.created_at !== undefined ? Number(template.created_at) : Date.now(),
          usage_count: template.usage_count !== undefined ? Number(template.usage_count) : 0
        };
      });
      
      console.log('Converted templates for CreateStream:', convertedTemplates);
      setTemplates(convertedTemplates);
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
    console.log('Selecting template:', template);
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      satsPerSec: Number(template.sats_per_sec || 0).toString(),
      duration: Math.floor(Number(template.duration_secs || 0) / 60).toString(), // Convert to minutes
      title: template.name || '',
      description: template.description || '',
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
        console.log('Using template with ID:', selectedTemplate.id, 'Type:', typeof selectedTemplate.id);
        streamId = await backend.create_stream_from_template(
          Number(selectedTemplate.id),
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
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          {/* Floating 3D shapes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: `${60 + i * 8}px`,
                height: `${60 + i * 8}px`,
                background: `linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))`,
                borderRadius: i % 2 === 0 ? '50%' : '20%',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                backdropFilter: 'blur(10px)',
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + i}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-md mx-auto pt-32 px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
              Stream Created!
            </h2>
            <p className="text-slate-300 mb-6">
              Your Bitcoin stream has been created successfully.
            </p>
            <div className="animate-pulse text-orange-400 font-semibold">
              Redirecting to stream details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating 3D Elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + (i % 4) * 20}%`,
              width: `${50 + i * 6}px`,
              height: `${50 + i * 6}px`,
              background: `linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 191, 36, 0.05))`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '0%',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}

        {/* 3D Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(30deg)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-4">
            Create New Stream
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-6">
            Set up a new Bitcoin streaming payment
          </p>
          <button 
            type="button" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
            onClick={autofillRecipient}
          >
            Autofill my Principal as Recipient
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 space-y-6 hover:bg-white/15 transition-all duration-300">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-center space-x-2 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="inline h-4 w-4 mr-1 text-orange-400" />
                Recipient Principal ID *
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter recipient's principal ID"
                required
              />
            </div>

            {/* Stream Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calculator className="inline h-4 w-4 mr-1 text-orange-400" />
                Stream Rate (sats/second) *
              </label>
              <input
                type="number"
                name="satsPerSec"
                value={formData.satsPerSec}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., 100"
                min="1"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="inline h-4 w-4 mr-1 text-orange-400" />
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., 60"
                min="1"
                required
              />
            </div>

            {/* Total Locked Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calculator className="inline h-4 w-4 mr-1 text-orange-400" />
                Total Locked Amount (sats)
              </label>
              <input
                type="number"
                name="totalLocked"
                value={formData.totalLocked}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder={`Auto-calculated: ${totalLocked !== undefined && totalLocked !== null ? Number(totalLocked).toLocaleString() : '--'}`}
                min="1"
              />
              <p className="text-sm text-slate-400 mt-1">
                Leave empty to auto-calculate based on rate × duration
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-orange-400" />
                Title (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., Monthly subscription payment"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-orange-400" />
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Add more details about this stream..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="inline h-4 w-4 mr-1 text-orange-400" />
                Tags (optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., subscription, service, payment (comma-separated)"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-orange-400" />
              Stream Preview
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rate:</span>
                <span className="font-medium text-white">
                  {formData.satsPerSec ? `${formData.satsPerSec} sats/sec` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Duration:</span>
                <span className="font-medium text-white">
                  {formData.duration ? `${formData.duration} minutes` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total:</span>
                <span className="font-medium text-orange-400">
                  {totalLocked !== undefined && totalLocked !== null ? `${Number(totalLocked).toLocaleString()} sats` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Per minute:</span>
                <span className="font-medium text-white">
                  {formData.satsPerSec !== undefined && formData.satsPerSec !== null ? `${(Number(formData.satsPerSec) * 60).toLocaleString()} sats` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <TemplateIcon className="h-5 w-5 mr-2 text-orange-400" />
                Templates
              </h3>
              <div className="space-y-3">
                {templates.slice(0, 3).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedTemplate?.id === template.id
                        ? 'border-orange-500 bg-orange-500/20 shadow-lg'
                        : 'border-white/20 bg-white/5 hover:border-orange-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-sm text-slate-400">
                      {template.sats_per_sec} sats/sec • {Math.floor(template.duration_secs / 60)} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 p-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
              💡 Pro Tips
            </h3>
            <ul className="text-sm text-blue-200 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Start with smaller amounts for testing
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Use descriptive titles and tags
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Double-check the recipient's principal ID
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Consider using templates for recurring payments
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateStream;
