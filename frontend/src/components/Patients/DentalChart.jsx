import { useState } from "react";
import PropTypes from "prop-types";
import ToothModal from "./ToothModal";
import ToothTooltip from "./ToothToolTip";

const DentalChart = ({ patientId, initialData, onUpdate }) => {
  // State declarations
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedSurface, setSelectedSurface] = useState(null);
  const [chartData, setChartData] = useState(initialData || {});
  const [viewMode, setViewMode] = useState("surface"); // 'surface' or 'structural'
  const [hoveredTooth, setHoveredTooth] = useState(null);

  // Define tooth quadrants
  const upperTeeth = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  ];
  const lowerTeeth = [
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  ];

  // Event Handlers
  const handleToothClick = (number, e) => {
    e.stopPropagation();
    const toothData = chartData[number] || {};

    if (!viewMode === "structural" && toothData.full === "missing") {
      console.warn(
        "This tooth is marked as missing. Switch to structural view to modify."
      );
      return;
    }

    setSelectedTooth({ number });
    setSelectedSurface(viewMode === "structural" ? "full" : null);
  };

  const handleModalClose = () => {
    setSelectedTooth(null);
    setSelectedSurface(null);
  };

  const handleSaveChanges = (procedure, comment) => {
    if (!selectedTooth) return;

    const newToothData = {
      ...(chartData[selectedTooth.number] || {}),
    };

    // Handle structural view procedures
    if (viewMode === "structural") {
      if (selectedSurface === "full") {
        // If marking as missing, clear other procedures
        if (procedure === "missing") {
          Object.keys(newToothData).forEach((key) => {
            if (key !== "comments") {
              delete newToothData[key];
            }
          });
          newToothData.full = "missing";
        } else if (procedure === null) {
          // If removing missing status
          delete newToothData.full;
        }
      } else {
        // Handle crown/root procedures normally
        if (procedure === null) {
          delete newToothData[selectedSurface];
        } else {
          newToothData[selectedSurface] = procedure;
        }
      }
    } else {
      // Handle surface view procedures
      if (procedure === null) {
        delete newToothData[selectedSurface];
      } else {
        newToothData[selectedSurface] = procedure;
      }
    }

    // Handle comments
    if (comment?.trim()) {
      newToothData.comments = {
        ...(newToothData.comments || {}),
        [selectedSurface]: comment,
      };
    }

    const newChartData = {
      ...chartData,
      [selectedTooth.number]: newToothData,
    };

    setChartData(newChartData);
    if (onUpdate) {
      onUpdate(patientId, newChartData);
    }
  };

  // Add view mode toggle
  const renderViewToggle = () => (
    <div className="mb-6">
      <div className="relative inline-flex bg-gray-100 rounded-lg p-1">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            viewMode === "surface"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setViewMode("surface")}
        >
          Surface View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            viewMode === "structural"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setViewMode("structural")}
        >
          Structural View
        </button>
      </div>
    </div>
  );

  // Render functions
  const renderToothSurfaces = (number, toothData = {}) => {
    const isLowerJaw = number >= 31;
    const isMissing = toothData.full === "missing";

    const surfaceClasses = (surface) => {
      const baseClasses =
        "w-6 h-6 border border-gray-300 cursor-pointer transition-colors";
      const procedureClass = toothData[surface]
        ? `bg-${getProcedureColor(toothData[surface])}`
        : "bg-white";
      const disabledClass = isMissing ? "opacity-50 cursor-not-allowed" : "";
      return `${baseClasses} ${procedureClass} ${disabledClass}`;
    };

    const handleLocalSurfaceClick = (surface, e) => {
      e.stopPropagation();
      if (isMissing) return;
      setSelectedTooth({ number });
      setSelectedSurface(surface);
    };

    return (
      <div
        className={`relative grid grid-cols-3 gap-0.5 w-20 h-20 ${
          isMissing ? "opacity-50" : ""
        }`}
      >
        {!isLowerJaw ? (
          <>
            <div
              className={surfaceClasses("buccal")}
              onClick={(e) => handleLocalSurfaceClick("buccal", e)}
            />
            <div
              className={surfaceClasses("mesial")}
              onClick={(e) => handleLocalSurfaceClick("mesial", e)}
            />
            <div
              className={surfaceClasses("occlusal")}
              onClick={(e) => handleLocalSurfaceClick("occlusal", e)}
            />
            <div
              className={surfaceClasses("distal")}
              onClick={(e) => handleLocalSurfaceClick("distal", e)}
            />
            <div
              className={surfaceClasses("lingual")}
              onClick={(e) => handleLocalSurfaceClick("lingual", e)}
            />
          </>
        ) : (
          <>
            <div
              className={surfaceClasses("buccal")}
              onClick={(e) => handleLocalSurfaceClick("buccal", e)}
            />
            <div
              className={surfaceClasses("mesial")}
              onClick={(e) => handleLocalSurfaceClick("mesial", e)}
            />
            <div
              className={surfaceClasses("occlusal")}
              onClick={(e) => handleLocalSurfaceClick("occlusal", e)}
            />
            <div
              className={surfaceClasses("distal")}
              onClick={(e) => handleLocalSurfaceClick("distal", e)}
            />
            <div
              className={surfaceClasses("lingual")}
              onClick={(e) => handleLocalSurfaceClick("lingual", e)}
            />
          </>
        )}
        {isMissing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-red-500 transform rotate-45" />
          </div>
        )}
      </div>
    );
  };

  const renderToothStructural = (number, toothData = {}) => {
    const isMissing = toothData.full === "missing";
    const structuralClasses = (part) => {
      const baseClasses = "w-full cursor-pointer transition-colors";
      const procedureClass = toothData[part]
        ? `bg-${getProcedureColor(toothData[part])}`
        : "bg-white";
      return `${baseClasses} ${procedureClass}`;
    };

    return (
      <div
        className={`relative w-16 h-24 ${isMissing ? "opacity-50" : ""}`}
        onClick={(e) => handleToothClick(number, e)}
      >
        <div
          className={`${structuralClasses(
            "crown"
          )} h-1/2 border border-gray-300 rounded-t-lg`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTooth({ number });
            setSelectedSurface("crown");
          }}
        />
        <div className="h-1/2 flex justify-center">
          <div
            className={`${structuralClasses(
              "root"
            )} w-1/2 border-x border-b border-gray-300 rounded-b-lg`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTooth({ number });
              setSelectedSurface("root");
            }}
          />
        </div>
        {isMissing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-red-500 transform rotate-45" />
          </div>
        )}
      </div>
    );
  };

  const renderTooth = (number, toothData) => {
    return (
      <div
        key={number}
        className="relative"
        onMouseEnter={() => setHoveredTooth(number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        <div className="text-center text-sm text-gray-600 mb-1">{number}</div>
        {viewMode === "surface"
          ? renderToothSurfaces(number, toothData)
          : renderToothStructural(number, toothData)}
        {hoveredTooth === number && (
          <ToothTooltip
            toothNumber={number}
            toothData={toothData}
            className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          />
        )}
      </div>
    );
  };

  const renderJaw = (teeth, isUpperJaw) => (
    <div className={`grid grid-cols-8 gap-4 ${isUpperJaw ? "mb-12" : "mt-12"}`}>
      {teeth.map((number) => renderTooth(number, chartData[number] || {}))}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {renderViewToggle()}
      <div className="max-w-4xl mx-auto">
        {renderJaw(upperTeeth, true)}
        {renderJaw(lowerTeeth, false)}
      </div>
      {selectedTooth && (
        <ToothModal
          tooth={selectedTooth}
          surface={selectedSurface}
          data={chartData[selectedTooth.number] || {}}
          onClose={handleModalClose}
          onSave={handleSaveChanges}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

const getProcedureColor = (procedure) => {
  const colors = {
    caries: "yellow-200",
    filling: "blue-200",
    crown: "gray-200",
    missing: "red-200",
    bridge: "purple-200",
    implant: "green-200",
    root_canal: "orange-200",
  };
  return colors[procedure] || "white";
};

DentalChart.propTypes = {
  patientId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  onUpdate: PropTypes.func,
};

export default DentalChart;
