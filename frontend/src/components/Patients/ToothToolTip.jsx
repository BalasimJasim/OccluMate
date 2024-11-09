import React from "react";
import "./ToothTooltip.scss";

const ToothTooltip = ({ procedures, comments, viewMode }) => {
  if (!procedures && !comments) return null;

  const formatProcedure = (key, value) => {
    const formatted = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    return `${formatted}: ${value}`;
  };

  const getToothProcedures = () => {
    if (!procedures) return [];

    return Object.entries(procedures)
      .filter(([key]) => key !== "comments")
      .map(([location, procedure]) => {
        const formattedLocation =
          location.charAt(0).toUpperCase() + location.slice(1);
        return `${formattedLocation}: ${procedure}`;
      });
  };

  const getToothComments = () => {
    if (!comments) return [];
    return Object.entries(comments).map(([surface, comment]) => {
      const formattedSurface =
        surface.charAt(0).toUpperCase() + surface.slice(1);
      return `${formattedSurface} Note: ${comment}`;
    });
  };

  const proceduresList = getToothProcedures();
  const commentsList = getToothComments();

  return (
    <div className="tooth-tooltip">
      <div className="tooltip-content">
        {proceduresList.length > 0 && (
          <div className="section">
            <div className="section-title procedures">Procedures</div>
            <ul className="section-list">
              {proceduresList.map((proc, idx) => (
                <li key={idx}>{proc}</li>
              ))}
            </ul>
          </div>
        )}

        {commentsList.length > 0 && (
          <div className="section">
            <div className="section-title notes">Notes</div>
            <ul className="section-list">
              {commentsList.map((comment, idx) => (
                <li key={idx}>{comment}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToothTooltip;

// Usage in your DentalChart component:
const renderTooth = (number, toothData) => {
  const hasActiveTreatment = toothData.status === "in-progress";
  const needsAttention = toothData.status === "needs-attention";

  return (
    <div className="tooth-wrapper">
      {viewMode === "surface"
        ? renderToothSurfaces(number, toothData)
        : renderToothStructural(number, toothData)}
      <ToothTooltip
        procedures={toothData}
        comments={toothData.comments}
        viewMode={viewMode}
      />
      {hasActiveTreatment && <div className="tooth-status active-treatment" />}
      {needsAttention && <div className="tooth-status needs-attention" />}
    </div>
  );
};
