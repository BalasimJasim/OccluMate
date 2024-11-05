import React, { useState, useEffect } from 'react';
import { FaUpload, FaDownload, FaEye, FaTrash } from 'react-icons/fa';
import './DocumentManager.scss';
import ConfirmDialog from '../common/ConfirmDialog';
import api from '../../api';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, document: null });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/patient-portal/documents');
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents');
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/patient-portal/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchDocuments();
      setError('');
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/patient-portal/documents/${document._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download document');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patient-portal/documents/${deleteConfirm.document._id}`);
      await fetchDocuments();
      setDeleteConfirm({ show: false, document: null });
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleView = async (document) => {
    try {
      const response = await api.get(`/patient-portal/documents/${document._id}/view`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to view document');
    }
  };

  return (
    <div className="document-manager">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept=".pdf,.jpg,.png,.dcm"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="upload-label">
          <FaUpload />
          <span>
            {uploading ? 'Uploading...' : 'Drag & drop files here or click to browse'}
          </span>
        </label>
      </div>

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc._id} className="document-item">
            <div className="document-info">
              <span className="name">{doc.name}</span>
              <span className="date">{new Date(doc.uploadDate).toLocaleDateString()}</span>
              <span className="type">{doc.type}</span>
            </div>
            <div className="document-actions">
              <button 
                className="btn view" 
                onClick={() => handleView(doc)}
                title="View Document"
              >
                <FaEye />
              </button>
              <button 
                className="btn download" 
                onClick={() => handleDownload(doc)}
                title="Download Document"
              >
                <FaDownload />
              </button>
              <button 
                className="btn delete" 
                onClick={() => setDeleteConfirm({ show: true, document: doc })}
                title="Delete Document"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, document: null })}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default DocumentManager; 