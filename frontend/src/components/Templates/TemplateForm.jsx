import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './TemplateForm.scss';

const FIELD_TYPES = ['text', 'number', 'checkbox', 'select', 'date', 'textarea'];
const CATEGORIES = ['examination', 'procedure', 'treatment', 'followup'];

const TemplateForm = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState(template || {
    name: '',
    category: CATEGORIES[0],
    fields: [],
    commonNotes: []
  });

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          label: '',
          type: 'text',
          required: false,
          options: [],
          defaultValue: ''
        }
      ]
    }));
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const handleMoveField = (index, direction) => {
    const newFields = [...formData.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormData({ ...formData, fields: newFields });
  };

  const handleAddCommonNote = () => {
    setFormData(prev => ({
      ...prev,
      commonNotes: [...prev.commonNotes, { text: '', category: '' }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="template-form-modal">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>{template ? 'Edit Template' : 'New Template'}</h2>
          <button type="button" className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="form-body">
          <div className="form-group">
            <label>Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="fields-section">
            <div className="section-header">
              <h3>Fields</h3>
              <button type="button" className="btn add" onClick={handleAddField}>
                <FaPlus /> Add Field
              </button>
            </div>

            {formData.fields.map((field, index) => (
              <div key={index} className="field-item">
                <div className="field-header">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    placeholder="Field Label"
                    required
                  />
                  <div className="field-actions">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveField(index, 'up')}
                        title="Move Up"
                      >
                        <FaArrowUp />
                      </button>
                    )}
                    {index < formData.fields.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveField(index, 'down')}
                        title="Move Down"
                      >
                        <FaArrowDown />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newFields = formData.fields.filter((_, i) => i !== index);
                        setFormData({ ...formData, fields: newFields });
                      }}
                      title="Remove Field"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="field-config">
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <label>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                    />
                    Required
                  </label>

                  {field.type === 'select' && (
                    <textarea
                      value={field.options.join('\n')}
                      onChange={(e) => handleFieldChange(
                        index,
                        'options',
                        e.target.value.split('\n').filter(Boolean)
                      )}
                      placeholder="Enter options (one per line)"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="common-notes-section">
            <div className="section-header">
              <h3>Common Notes</h3>
              <button type="button" className="btn add" onClick={handleAddCommonNote}>
                <FaPlus /> Add Common Note
              </button>
            </div>

            {formData.commonNotes.map((note, index) => (
              <div key={index} className="note-item">
                <input
                  type="text"
                  value={note.category}
                  onChange={(e) => {
                    const newNotes = [...formData.commonNotes];
                    newNotes[index].category = e.target.value;
                    setFormData({ ...formData, commonNotes: newNotes });
                  }}
                  placeholder="Note Category"
                />
                <textarea
                  value={note.text}
                  onChange={(e) => {
                    const newNotes = [...formData.commonNotes];
                    newNotes[index].text = e.target.value;
                    setFormData({ ...formData, commonNotes: newNotes });
                  }}
                  placeholder="Enter common note text"
                />
                <button
                  type="button"
                  className="btn remove"
                  onClick={() => {
                    const newNotes = formData.commonNotes.filter((_, i) => i !== index);
                    setFormData({ ...formData, commonNotes: newNotes });
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
};

TemplateForm.propTypes = {
  template: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default TemplateForm; 