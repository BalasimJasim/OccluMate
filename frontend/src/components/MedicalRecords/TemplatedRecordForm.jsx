import React, { useState, useEffect } from 'react';
import { getTemplates } from '../../api';
import './TemplatedRecordForm.scss';

const TemplatedRecordForm = ({ onSubmit }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize form data with template's default values
    const initialData = {};
    template.fields.forEach(field => {
      initialData[field.label] = field.defaultValue || '';
    });
    setFormData(initialData);
  };

  const handleFieldChange = (fieldLabel, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      templateId: selectedTemplate._id,
      data: formData
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={formData[field.label] || false}
            onChange={(e) => handleFieldChange(field.label, e.target.checked)}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.label] || ''}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="templated-record-form">
      <div className="template-selection">
        <h3>Select Template</h3>
        <div className="template-grid">
          {templates.map(template => (
            <div
              key={template._id}
              className={`template-card ${selectedTemplate?._id === template._id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <h4>{template.name}</h4>
              <span className="category">{template.category}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <form onSubmit={handleSubmit}>
          <h3>{selectedTemplate.name}</h3>
          
          <div className="fields-container">
            {selectedTemplate.fields.map((field, index) => (
              <div key={index} className="form-group">
                <label>
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {selectedTemplate.commonNotes.length > 0 && (
            <div className="common-notes">
              <h4>Common Notes</h4>
              <div className="notes-grid">
                {selectedTemplate.commonNotes.map((note, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const notesField = selectedTemplate.fields.find(f => f.type === 'textarea');
                      if (notesField) {
                        handleFieldChange(
                          notesField.label,
                          (formData[notesField.label] || '') + '\n' + note.text
                        );
                      }
                    }}
                  >
                    {note.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn primary">Save Record</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TemplatedRecordForm; 