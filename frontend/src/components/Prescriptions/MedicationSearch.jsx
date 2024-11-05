import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { COMMON_MEDICATIONS } from '../../data/medications';
import './MedicationSearch.scss';

const MedicationSearch = ({ onSelect, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.length > 1) {
      const filteredSuggestions = COMMON_MEDICATIONS.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (medication) => {
    setSearchTerm(medication.name);
    setShowSuggestions(false);
    onSelect(medication);
  };

  return (
    <div className="medication-search" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search medication..."
        onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((med) => (
            <li 
              key={med.name} 
              onClick={() => handleSelect(med)}
              className="suggestion-item"
            >
              <div className="medication-name">{med.name}</div>
              <div className="medication-info">
                <span className="type">{med.type}</span>
                <span className="dosages">
                  Common dosages: {med.commonDosages.join(', ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

MedicationSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
  initialValue: PropTypes.string
};

export default MedicationSearch; 