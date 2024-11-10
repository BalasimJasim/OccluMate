import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DentalChart.scss';
import ToothModal from './ToothModal';
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
      // You could show a toast notification or alert here
      console.warn(
        "This tooth is marked as missing. Switch to structural view to modify."
      );
      return;
    }

    setSelectedTooth({ number });
    setSelectedSurface(viewMode === "structural" ? "full" : null);
  };

  const handleSurfaceClick = (toothNumber, surface, event) => {
    event.stopPropagation();
    setSelectedTooth({ number: toothNumber });
    setSelectedSurface(surface);
  };

  const handleModalClose = () => {
    setSelectedTooth(null);
    setSelectedSurface(null);
  };

  const handleStructuralClick = (toothNumber, part) => {
    setSelectedTooth({ number: toothNumber });
    setSelectedSurface(part); // 'crown', 'root', or 'full'
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
    <div className="view-toggle">
      <div className="toggle-container">
        <button
          className={`toggle-btn ${viewMode === "surface" ? "active" : ""}`}
          onClick={() => setViewMode("surface")}
        >
          Surface View
        </button>
        <button
          className={`toggle-btn ${viewMode === "structural" ? "active" : ""}`}
          onClick={() => setViewMode("structural")}
        >
          Structural View
        </button>
        <div
          className="toggle-slider"
          style={{
            transform: `translateX(${viewMode === "surface" ? "0" : "100%"})`,
          }}
        />
      </div>
    </div>
  );

  // Render functions
  const renderToothSurfaces = (number, toothData = {}) => {
    const isAnterior = [
      13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33,
    ].includes(number);
    const isLowerJaw = number >= 31;
    const isMissing = toothData.full === "missing";

    const handleSurfaceClick = (surface, e) => {
      e.stopPropagation();
      if (isMissing) return;
      setSelectedTooth({ number });
      setSelectedSurface(surface);
    };

    return (
      <div className={`tooth-surfaces ${isMissing ? "missing" : ""}`}>
        {!isLowerJaw ? (
          <>
            <div
              className={`surface buccal ${
                toothData.buccal ? `procedure-${toothData.buccal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("buccal", e)}
            />
            <div
              className={`surface mesial ${
                toothData.mesial ? `procedure-${toothData.mesial}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("mesial", e)}
            />
            <div
              className={`surface occlusal ${
                toothData.occlusal ? `procedure-${toothData.occlusal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("occlusal", e)}
            />
            <div
              className={`surface distal ${
                toothData.distal ? `procedure-${toothData.distal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("distal", e)}
            />
            <div
              className={`surface lingual ${
                toothData.lingual ? `procedure-${toothData.lingual}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("lingual", e)}
            />
          </>
        ) : (
          <>
            <div
              className={`surface buccal ${
                toothData.buccal ? `procedure-${toothData.buccal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("buccal", e)}
            />
            <div
              className={`surface mesial ${
                toothData.mesial ? `procedure-${toothData.mesial}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("mesial", e)}
            />
            <div
              className={`surface occlusal ${
                toothData.occlusal ? `procedure-${toothData.occlusal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("occlusal", e)}
            />
            <div
              className={`surface distal ${
                toothData.distal ? `procedure-${toothData.distal}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("distal", e)}
            />
            <div
              className={`surface lingual ${
                toothData.lingual ? `procedure-${toothData.lingual}` : ""
              } ${isMissing ? "disabled" : ""}`}
              onClick={(e) => handleSurfaceClick("lingual", e)}
            />
          </>
        )}
        {isMissing && <div className="missing-indicator" />}
      </div>
    );
  };

  const renderToothStructural = (number, toothData = {}) => {
    return (
      <div
        className={`tooth-structural ${
          toothData.full === "missing" ? "missing" : ""
        }`}
        onClick={(e) => handleToothClick(number, e)}
      >
        <div
          className={`crown ${
            toothData.crown ? `procedure-${toothData.crown}` : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTooth({ number });
            setSelectedSurface("crown");
          }}
        />
        <div className="root-container">
          <div
            className={`root ${
              toothData.root ? `procedure-${toothData.root}` : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTooth({ number });
              setSelectedSurface("root");
            }}
          >
            {toothData.root === "rootcanal" && (
              <div className="root-canal-indicator" />
            )}
            {toothData.root === "implant" && (
              <div className="implant-indicator" />
            )}
          </div>
        </div>
        {toothData.full === "missing" && <div className="missing-indicator" />}
      </div>
    );
  };

  // Add this new function before renderJaw
  const renderTooth = (number, toothData) => {
    const hasComments =
      toothData.comments && Object.keys(toothData.comments).length > 0;
    const procedures = Object.keys(toothData).filter(
      (key) => key !== "comments" && toothData[key]
    );

    return (
      <div
        className="tooth-wrapper"
        onMouseEnter={() => setHoveredTooth(number)} // Set hovered tooth on mouse enter
        onMouseLeave={() => setHoveredTooth(null)} // Clear hovered tooth on mouse leave
      >
        <div
          className={`tooth ${
            toothData.status ? `procedure-${toothData.status}` : ""
          } ${hasComments ? "has-comments" : ""}`}
        >
          <div className="tooth-number">{number}</div>
          {viewMode === "surface"
            ? renderToothSurfaces(number, toothData) // Render surfaces in surface view
            : renderToothStructural(number, toothData)}
          {hasComments && <div className="comment-indicator" />}
        </div>
        {hoveredTooth === number && (
          <ToothTooltip
            procedures={toothData} // Pass the entire toothData to get procedures
            comments={toothData.comments} // Pass comments
            viewMode={viewMode} // Pass the current view mode
          />
        )}
      </div>
    );
  };

  // Simplified render function for the entire jaw
  const renderJaw = (teeth, isUpperJaw) => {
    return (
      <div className={`jaw ${isUpperJaw ? "upper-jaw" : "lower-jaw"}`}>
        {teeth.map((number) => {
          const toothData = chartData[number] || {};
          return renderTooth(number, toothData); // Call renderTooth for each tooth
        })}
      </div>
    );
  };

  // Main render
  return (
    <div className="dental-chart">
      {renderViewToggle()}
      {renderJaw(upperTeeth, true)} {/* Render upper jaw */}
      <div className="jaw-separator">
        <div className="separator-label right">Right</div>
        <div className="midline"></div>
        <div className="separator-label left">Left</div>
      </div>
      {renderJaw(lowerTeeth, false)} {/* Render lower jaw */}
      {selectedTooth && (
        <ToothModal
          toothNumber={selectedTooth.number}
          surface={selectedSurface || "full"}
          toothData={chartData[selectedTooth.number] || {}}
          onClose={handleModalClose}
          onSave={handleSaveChanges}
          isStructural={viewMode === "structural"}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

DentalChart.propTypes = {
  patientId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  onUpdate: PropTypes.func
};

export default DentalChart;
