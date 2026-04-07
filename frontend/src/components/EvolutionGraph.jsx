import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const EvolutionGraph = ({ initialScore = 40, optimizedScore = 80, isSimulated = false }) => {
  const [points, setPoints] = useState([40, 40, 40]);

  useEffect(() => {
    if (isSimulated) {
      setPoints([initialScore, (initialScore + optimizedScore) / 2, optimizedScore]);
    } else {
      setPoints([initialScore, initialScore, initialScore]);
    }
  }, [initialScore, optimizedScore, isSimulated]);

  // SVG dimensions
  const width = 300;
  const height = 80;
  const padding = 10;

  // Map scores (0-100) to SVG Y coordinates (height-0)
  const mapY = (score) => height - (score / 100) * (height - 2 * padding) - padding;
  const mapX = (index) => (width / (points.length - 1)) * index;

  const pathData = points.map((p, i) => `${mapX(i)},${mapY(p)}`).join(' L ');
  const circlePoints = points.map((p, i) => ({ x: mapX(i), y: mapY(p), val: p }));

  return (
    <div style={{ width: '100%', padding: '10px 0' }}>
      <div className="label-mono" style={{ fontSize: '0.6rem', marginBottom: '8px', opacity: 0.6 }}>Confidence Evolution</div>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-neon)" />
          </linearGradient>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Path */}
        <motion.path
          d={`M ${pathData}`}
          fill="none"
          stroke="url(#line-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#line-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Data Points */}
        {circlePoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--bg-deep)"
            stroke="var(--accent-neon)"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
          />
        ))}

        {/* Labels */}
        <text x="0" y={mapY(points[0]) - 10} fill="var(--accent-cyan)" fontSize="10" fontWeight="800">{points[0]}%</text>
        {isSimulated && (
          <motion.text 
            x={width} 
            y={mapY(points[2]) - 10} 
            textAnchor="end" 
            fill="var(--accent-neon)" 
            fontSize="10" 
            fontWeight="800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {points[2]}% Optimized
          </motion.text>
        )}
      </svg>
    </div>
  );
};

export default EvolutionGraph;
