import { useState, useEffect } from "react";
import { FaUpload, FaDownload, FaEye, FaTrash } from "react-icons/fa";
import ConfirmDialog from "../common/ConfirmDialog";
import api from "../../api";

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    document: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get("/patient-portal/documents");
      setDocuments(response.data);
    } catch (error) {
      setError("Failed to fetch documents: " + error.message);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    try {
      setUploading(true);
      const response = await api.post(
        "/patient-portal/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setDocuments([...documents, response.data]);
      setError("");
    } catch (error) {
      setError("Failed to upload document: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(
        `/patient-portal/documents/${document.id}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Failed to download document: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.document) return;

    try {
      await api.delete(
        `/patient-portal/documents/${deleteConfirm.document.id}`
      );
      setDocuments(
        documents.filter((doc) => doc.id !== deleteConfirm.document.id)
      );
      setDeleteConfirm({ show: false, document: null });
    } catch (error) {
      setError("Failed to delete document: " + error.message);
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
      const response = await api.get(
        `/patient-portal/documents/${document.id}/view`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, "_blank");
    } catch (error) {
      setError("Failed to view document: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <FaUpload className="mr-2" />
          Upload Document
          <input
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="space-y-2">
          <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-600">
            Drag and drop your documents here, or click to select files
          </p>
        </div>
      </div>

      {uploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Uploading document...</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li key={doc.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUpload className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded on{" "}
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleView(doc)}
                    className="text-gray-400 hover:text-blue-600"
                    title="View"
                  >
                    <FaEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Download"
                  >
                    <FaDownload className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ show: true, document: doc })
                    }
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, document: null })}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
};

export default DocumentManager;
