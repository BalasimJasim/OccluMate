import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import TemplateForm from "./TemplateForm";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../services/templateService";

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
      setError(null);
    } catch (error) {
      console.error("Error loading templates:", error);
      setError("Failed to load templates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      const newTemplate = await createTemplate(templateData);
      setTemplates([...templates, newTemplate]);
      setShowTemplateForm(false);
    } catch (error) {
      console.error("Error creating template:", error);
      setError("Failed to create template. Please try again.");
    }
  };

  const handleUpdateTemplate = async (templateData) => {
    try {
      const updatedTemplate = await updateTemplate(
        selectedTemplate.id,
        templateData
      );
      setTemplates(
        templates.map((template) =>
          template.id === selectedTemplate.id ? updatedTemplate : template
        )
      );
      setShowTemplateForm(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
      setError("Failed to update template. Please try again.");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      setTemplates(templates.filter((template) => template.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
      setError("Failed to delete template. Please try again.");
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateForm(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading templates..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Template Management
        </h1>
        <button
          onClick={() => setShowTemplateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2 -ml-1 h-4 w-4" />
          Add Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {template.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Edit Template"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Template"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            {template.description && (
              <p className="text-sm text-gray-600 mb-3">
                {template.description}
              </p>
            )}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Fields:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {template.fields.map((field, index) => (
                  <li key={index} className="flex items-center">
                    <span className="font-medium">{field.name}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-500">{field.type}</span>
                    {field.required && (
                      <span className="ml-2 text-xs text-red-500">
                        Required
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {showTemplateForm && (
        <TemplateForm
          template={selectedTemplate}
          onSave={
            selectedTemplate ? handleUpdateTemplate : handleCreateTemplate
          }
          onClose={() => {
            setShowTemplateForm(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default TemplateManager;
