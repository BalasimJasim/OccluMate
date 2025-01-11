import api from "../api";

// Get all templates
export const fetchTemplates = async () => {
  const response = await api.get("/templates");
  return response.data;
};

// Get a single template by ID
export const getTemplate = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

// Create a new template
export const createTemplate = async (templateData) => {
  const response = await api.post("/templates", templateData);
  return response.data;
};

// Update an existing template
export const updateTemplate = async (id, templateData) => {
  const response = await api.put(`/templates/${id}`, templateData);
  return response.data;
};

// Delete a template
export const deleteTemplate = async (id) => {
  const response = await api.delete(`/templates/${id}`);
  return response.data;
};
