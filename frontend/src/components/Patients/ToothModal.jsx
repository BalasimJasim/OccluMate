import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ToothModal.scss';

const PROCEDURES = {
  surface: [
    { id: 'caries', name: 'Caries', color: '#F56565' },
    { id: 'filling', name: 'Filling', color: '#4299E1' },
    { id: 'periodontal', name: 'Periodontal', color: '#48BB78' }
  ],
  structural: {
    crown: [
      { id: 'crown', name: 'Crown', color: '#ECC94B' },
      { id: 'bridge', name: 'Bridge', color: '#C53030' }
    ],
    root: [
      { id: 'rootcanal', name: 'Root Canal', color: '#B83280' },
      { id: 'implant', name: 'Implant', color: '#2B6CB0' }
    ],
    full: [
      { id: 'missing', name: 'Missing Tooth', color: '#718096' }
    ]
  }
};

const ToothModal = ({ 
  toothNumber, 
  surface, 
  toothData = {}, 
  onClose, 
  onSave, 
  isStructural = false
}) => {
  const [selectedProcedure, setSelectedProcedure] = useState(() => {
    if (isStructural) {
      if (surface === 'full') return toothData.full || '';
      return toothData[surface] || '';
    }
    return toothData[surface] || '';
  });
  const [comment, setComment] = useState(toothData.comments?.[surface] || '');

  const getAvailableProcedures = () => {
    if (!isStructural) return PROCEDURES.surface;
    
    switch(surface) {
      case 'full': return PROCEDURES.structural.full;
      case 'crown': return PROCEDURES.structural.crown;
      case 'root': return PROCEDURES.structural.root;
      default: return [];
    }
  };

  const availableProcedures = getAvailableProcedures();

  const handleSave = () => {
    onSave(selectedProcedure, comment);
    onClose();
  };

  const isMissing = toothData.full === 'missing';

  // Prevent opening modal for missing teeth in surface view
  useEffect(() => {
    if (!isStructural && isMissing) {
      onClose();
    }
  }, [isStructural, isMissing, onClose]);

  // If tooth is missing and we're in surface view, don't render the modal
  if (!isStructural && isMissing) {
    return null;
  }

  return (
    <div className="tooth-modal-overlay" onClick={onClose}>
      <div className="tooth-modal" onClick={e => e.stopPropagation()}>
        <div className="tooth-modal-header">
          <h3>Tooth {toothNumber} - {surface}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="tooth-modal-content">
          {(toothData[surface] || (surface === 'full' && toothData.full)) && (
            <div className="remove-procedure-container">
              <button 
                className="remove-procedure-button"
                onClick={() => {
                  if (surface === 'full') {
                    onSave(null, '');
                  } else {
                    onSave({ [surface]: null });
                  }
                  onClose();
                }}
              >
                Remove Current Procedure
              </button>
            </div>
          )}

          <div className="procedures-grid">
            {availableProcedures.map(procedure => (
              <button
                key={procedure.id}
                className={`procedure-button ${selectedProcedure === procedure.id ? 'selected' : ''}`}
                onClick={() => setSelectedProcedure(procedure.id)}
              >
                <span 
                  className="procedure-indicator"
                  style={{ backgroundColor: procedure.color }}
                />
                {procedure.name}
              </button>
            ))}
          </div>

          <div className="comments-section">
            <h4>Add New Comment:</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comments here..."
              rows={4}
            />
          </div>
        </div>

        <div className="tooth-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={!selectedProcedure && !comment.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

ToothModal.propTypes = {
  toothNumber: PropTypes.number.isRequired,
  surface: PropTypes.string.isRequired,
  toothData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isStructural: PropTypes.bool
};

export default ToothModal;
