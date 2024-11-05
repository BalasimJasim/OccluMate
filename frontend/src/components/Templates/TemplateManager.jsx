import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy } from 'react-icons/fa';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api';
import TemplateForm from './TemplateForm';
import './TemplateManager.scss';

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        _id: undefined
      };
      await createTemplate(duplicatedTemplate);
      fetchTemplates();
    } catch (err) {
      setError('Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate._id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowForm(false);
      fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
    }
  };

  if (loading) return <div className="loading">Loading templates...</div>;

  return (
    <div className="template-manager">
      <div className="header">
        <h2>Document Templates</h2>
        <button className="btn primary" onClick={handleCreateTemplate}>
          <FaPlus /> New Template
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template._id} className="template-card">
            <div className="template-header">
              <h3>{template.name}</h3>
              <span className="category">{template.category}</span>
            </div>
            <div className="template-actions">
              <button 
                className="btn edit" 
                onClick={() => handleEditTemplate(template)}
                title="Edit Template"
              >
                <FaEdit />
              </button>
              <button 
                className="btn duplicate" 
                onClick={() => handleDuplicateTemplate(template)}
                title="Duplicate Template"
              >
                <FaCopy />
              </button>
              <button 
                className="btn delete" 
                onClick={() => handleDeleteTemplate(template._id)}
                title="Delete Template"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TemplateForm
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TemplateManager; 