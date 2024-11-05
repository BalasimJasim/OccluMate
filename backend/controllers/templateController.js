import DentalTemplate from '../models/DentalTemplate.js';

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await DentalTemplate.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      message: 'Error fetching templates',
      error: error.message 
    });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await DentalTemplate.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ 
      message: 'Error fetching template',
      error: error.message 
    });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const { name, category, fields, commonNotes } = req.body;

    // Validate fields
    if (!fields || fields.length === 0) {
      return res.status(400).json({ 
        message: 'Template must have at least one field' 
      });
    }

    const template = new DentalTemplate({
      name,
      category,
      fields,
      commonNotes: commonNotes || [],
      createdBy: req.user._id
    });

    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ 
      message: 'Error creating template',
      error: error.message 
    });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { name, category, fields, commonNotes } = req.body;
    const template = await DentalTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Validate fields
    if (!fields || fields.length === 0) {
      return res.status(400).json({ 
        message: 'Template must have at least one field' 
      });
    }

    template.name = name;
    template.category = category;
    template.fields = fields;
    template.commonNotes = commonNotes || [];

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ 
      message: 'Error updating template',
      error: error.message 
    });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const template = await DentalTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.remove();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ 
      message: 'Error deleting template',
      error: error.message 
    });
  }
}; 