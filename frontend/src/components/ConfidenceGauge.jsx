import React, { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";

const ConfidenceGauge = ({ value, label = "Decision Confidence" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for "Pro" feel
      onUpdate: (v) => setDisplayValue(Math.round(v))
    });
    return () => controls.stop();
  }, [value]);

  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (v) => {
    if (v > 70) return "var(--accent-neon)";
    if (v > 40) return "#f59e0b";
    return "#ef4444";
  };

  const activeColor = getColor(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', perspective: '1200px' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        
        {/* ✨ HOLOGRAPHIC RINGS */}
        <svg height="140" width="140" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 15px ${activeColor}44)` }}>
          {/* Depth Ring 1 */}
          <circle
            stroke="rgba(255,255,255,0.02)"
            fill="transparent"
            strokeWidth={strokeWidth + 4}
            r={normalizedRadius + 4}
            cx="70"
            cy="70"
          />
          {/* Depth Ring 2 */}
          <circle
            stroke="rgba(255,255,255,0.03)"
            fill="transparent"
            strokeWidth={1}
            r={normalizedRadius - 6}
            cx="70"
            cy="70"
          />
          
          {/* Static Backdrop */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="70"
            cy="70"
          />
          
          {/* Dynamic Progress Ring */}
          <motion.circle
            stroke={activeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="70"
            cy="70"
            style={{ filter: `drop-shadow(0 0 8px ${activeColor}88)` }}
          />
        </svg>

        {/* 🧬 CENTRAL LIQUID DISPLAY */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              fontSize: '1.8rem', 
              fontWeight: 900, 
              color: 'white',
              fontFamily: 'JetBrains Mono, monospace',
              textShadow: `0 0 20px ${activeColor}66`
             }}
          >
            {displayValue}%
          </motion.div>
          <div className="label-mono" style={{ fontSize: '0.45rem', opacity: 0.5, marginTop: '2px' }}>AI Confidence</div>
        </div>
        
        {/* Pulsing Core */}
        <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 3, repeat: Infinity }}
           style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             width: '80px',
             height: '80px',
             background: `radial-gradient(circle, ${activeColor}44 0%, transparent 70%)`,
             borderRadius: '50%',
             pointerEvents: 'none'
           }}
        />
      </div>
      <div className="label-mono" style={{ marginTop: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)' }}>{label}</div>
    </div>
  );
};

export default ConfidenceGauge;
