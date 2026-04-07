import React from "react";

const GlassCard = ({ children, style = {} }) => {
  return (
    <div className="glass-card" style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
