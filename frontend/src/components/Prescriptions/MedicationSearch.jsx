import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { COMMON_MEDICATIONS } from "../../data/medications";

const MedicationSearch = ({ onSelect, initialValue = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      const filteredSuggestions = COMMON_MEDICATIONS.filter((med) =>
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
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search medication..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((med) => (
            <li
              key={med.name}
              onClick={() => handleSelect(med)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{med.name}</div>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {med.type}
                </span>
                <span className="mt-1 sm:mt-0 sm:ml-2">
                  Common dosages: {med.commonDosages.join(", ")}
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