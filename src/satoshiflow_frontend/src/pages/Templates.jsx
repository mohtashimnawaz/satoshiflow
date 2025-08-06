import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Clock, 
  DollarSign, 
  User, 
  Copy,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    satsPerSec: '',
    duration: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('Fetching templates...');
      const templateList = await satoshiflow_backend.list_templates();
      console.log('Templates fetched:', templateList);
      console.log('Number of templates:', templateList.length);
      
      // Convert BigInt values to Numbers for frontend compatibility
      const convertedTemplates = templateList.map(template => {
        const converted = {
          ...template,
          id: template.id !== undefined ? Number(template.id) : 0,
          duration_secs: template.duration_secs !== undefined ? Number(template.duration_secs) : 0,
          sats_per_sec: template.sats_per_sec !== undefined ? Number(template.sats_per_sec) : 0,
          created_at: template.created_at !== undefined ? Number(template.created_at) : Date.now(),
          usage_count: template.usage_count !== undefined ? Number(template.usage_count) : 0
        };
        
        // Ensure creator is converted properly
        if (template.creator) {
          converted.creator = template.creator;
        }
        
        return converted;
      });
      
      console.log('Converted templates:', convertedTemplates);
      setTemplates(convertedTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert(`Error fetching templates: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      alert('You must be logged in to create templates');
      return;
    }
    
    // Log the user and authentication status
    console.log('User:', user);
    console.log('Creating template with user:', principalToText(user));
    
    // Validate required fields
    if (!newTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (!newTemplate.satsPerSec || parseInt(newTemplate.satsPerSec) <= 0) {
      alert('Please enter a valid rate (sats/second)');
      return;
    }
    
    if (!newTemplate.duration || parseInt(newTemplate.duration) <= 0) {
      alert('Please enter a valid duration (minutes)');
      return;
    }
    
    try {
      setCreateLoading(true);
      console.log('Creating template with:', {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        duration_secs: parseInt(newTemplate.duration) * 60,
        sats_per_sec: parseInt(newTemplate.satsPerSec)
      });
      
      const result = await satoshiflow_backend.create_template(
        newTemplate.name.trim(),
        newTemplate.description.trim(),
        parseInt(newTemplate.duration) * 60, // Convert minutes to seconds
        parseInt(newTemplate.satsPerSec)
      );
      
      console.log('Create template result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
      
      if (result && result.ok !== undefined) {
        console.log('Template created successfully with ID:', result.ok);
        alert('Template created successfully!');
        setShowCreateModal(false);
        setNewTemplate({ name: '', description: '', satsPerSec: '', duration: '' });
        await fetchTemplates();
      } else if (result && result.err) {
        console.error('Template creation failed:', result.err);
        alert(`Failed to create template: ${result.err}`);
      } else {
        console.log('Unexpected result format, treating as success');
        alert('Template created successfully!');
        setShowCreateModal(false);
        setNewTemplate({ name: '', description: '', satsPerSec: '', duration: '' });
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      alert(`Error creating template: ${error.message || error}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    try {
      console.log('Using template:', template);
      
      // Ensure the template data is properly formatted for storage
      const templateData = {
        id: template.id,
        name: template.name,
        description: template.description,
        sats_per_sec: Number(template.sats_per_sec || 0),
        duration_secs: Number(template.duration_secs || 0),
        creator: principalToText(template.creator),
        usage_count: Number(template.usage_count || 0)
      };
      
      console.log('Storing template data:', templateData);
      
      // Store template in localStorage and navigate to create stream
      localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
      
      // Navigate to create stream page
      window.location.href = '/create';
    } catch (error) {
      console.error('Error using template:', error);
      alert('Failed to use template. Please try again.');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
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
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating 3D Template Icons */}
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${10 + i * 10}%`,
              top: `${12 + (i % 3) * 28}%`,
              width: `${65 + i * 7}px`,
              height: `${65 + i * 7}px`,
              background: `linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.05))`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '25%' : '15%',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i}s`,
            }}
          />
        ))}

        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)`,
              backgroundSize: '70px 70px',
              transform: 'perspective(700px) rotateX(25deg)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            Stream Templates
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-6">
            Reusable stream configurations for common payments
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={24} />
            <span>Create Template</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div 
              key={template.id} 
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300 group animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-orange-300 transition-colors duration-300">{template.name}</h3>
                    <p className="text-sm text-slate-400">
                      Created by {principalToText(template.creator).slice(0, 8)}...
                    </p>
                  </div>
                </div>
                
                {principalToText(template.creator) === principalToText(user) && (
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300">
                      <Edit className="h-5 w-5 text-slate-300 hover:text-orange-400" />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300">
                      <Trash2 className="h-5 w-5 text-slate-300 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-300 mb-6 line-clamp-2">
                {template.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-400 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-orange-400" />
                    Rate
                  </span>
                  <span className="font-bold text-white">
                    {(() => {
                      try {
                        const rate = template.sats_per_sec;
                        if (rate !== undefined && rate !== null) {
                          return Number(rate).toLocaleString();
                        }
                        return 'N/A';
                      } catch (e) {
                        return 'N/A';
                      }
                    })()} sats/sec
                  </span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-400 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-400" />
                    Duration
                  </span>
                  <span className="font-bold text-white">
                    {(() => {
                      try {
                        const duration = template.duration_secs;
                        if (duration !== undefined && duration !== null) {
                          return formatDuration(Number(duration));
                        }
                        return 'N/A';
                      } catch (e) {
                        return 'N/A';
                      }
                    })()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="font-bold text-orange-400">
                    {(() => {
                      try {
                        const rate = template.sats_per_sec;
                        const duration = template.duration_secs;
                        if (rate !== undefined && rate !== null && duration !== undefined && duration !== null) {
                          return (Number(rate) * Number(duration)).toLocaleString();
                        }
                        return 'N/A';
                      } catch (e) {
                        return 'N/A';
                      }
                    })()} sats
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <User className="h-5 w-5 text-orange-400" />
                  <span>Used {(() => {
                    try {
                      return Number(template.usage_count || 0);
                    } catch (e) {
                      return 0;
                    }
                  })()} times</span>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleUseTemplate(template)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Use Template
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-slate-300 p-2 rounded-lg transition-all duration-300 transform hover:scale-105">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
          </div>
        ))}
      </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-2xl shadow-lg mx-auto w-24 h-24 flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-slate-300 mb-8 text-lg">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first template to reuse stream configurations'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus size={24} />
                  <span>Create Your First Template</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md animate-fadeInUp">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Template</h2>
              
              <form onSubmit={handleCreateTemplate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., Monthly Subscription"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    rows="3"
                    placeholder="Describe what this template is for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rate (sats/second) *
                  </label>
                  <input
                    type="number"
                    value={newTemplate.satsPerSec}
                    onChange={(e) => setNewTemplate({...newTemplate, satsPerSec: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate({...newTemplate, duration: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                  >
                    {createLoading ? 'Creating...' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
