import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getTemplates } from "../../api";

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
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize form data with template's default values
    const initialData = {};
    template.fields.forEach((field) => {
      initialData[field.label] = field.defaultValue || "";
    });
    setFormData(initialData);
  };

  const handleFieldChange = (fieldLabel, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      templateId: selectedTemplate._id,
      data: formData,
    });
  };

  const renderField = (field) => {
    const baseInputClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={formData[field.label] || ""}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={formData[field.label] || ""}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={formData[field.label] || false}
            onChange={(e) => handleFieldChange(field.label, e.target.checked)}
            required={field.required}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );

      case "select":
        return (
          <select
            value={formData[field.label] || ""}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          >
            <option value="">Select...</option>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            value={formData[field.label] || ""}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            value={formData[field.label] || ""}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            rows={4}
            className={baseInputClasses}
          />
        );

      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        Loading templates...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Select Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className={`p-4 border rounded-lg cursor-pointer transition-all
                ${
                  selectedTemplate?._id === template._id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <span className="text-sm text-gray-500">{template.category}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
            {selectedTemplate.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedTemplate.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {selectedTemplate.commonNotes.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-800">Common Notes</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {selectedTemplate.commonNotes.map((note, index) => (
                  <button
                    key={index}
                    type="button"
                    className="px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    onClick={() => {
                      const notesField = selectedTemplate.fields.find(
                        (f) => f.type === "textarea"
                      );
                      if (notesField) {
                        handleFieldChange(
                          notesField.label,
                          (formData[notesField.label] || "") + "\n" + note.text
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

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Save Record
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

TemplatedRecordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default TemplatedRecordForm;
