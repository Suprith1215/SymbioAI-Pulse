import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// 🌌 3D Background Particles
export const Particles = () => {
  const particles = Array.from({ length: 40 });
  return (
    <div className="particles">
      {particles.map((_, i) => (
        <div 
          key={i} 
          className="particle" 
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            "--dr": `${Math.random() * 15 + 10}s`,
            animationDelay: `${Math.random() * 10}s`
          } }
        />
      ))}
    </div>
  );
};

// 🧊 3D Tilt Wrapper
export const TiltCard = ({ children, className = "", style = {} }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d", ...style }}
      className={`glass-card ${className}`}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

// 🧬 3D Rule Stepper
export const RuleStepper = ({ currentStep }) => {
  const rules = ["Extract", "Validity", "Accident", "Exclusion", "Auto", "Wait", "PED", "Audit", "Necessity", "Final"];
  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '24px', justifyContent: 'space-between' }}>
      {rules.map((rule, i) => (
        <div key={rule} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
          <motion.div 
            animate={{ 
              scale: i <= currentStep ? 1.2 : 1,
              background: i < currentStep ? "var(--accent-neon)" : i === currentStep ? "var(--accent-cyan)" : "rgba(255,255,255,0.1)",
              boxShadow: i <= currentStep ? "0 0 15px var(--accent-neon)" : "none"
            }}
            className="progress-node"
          />
          <div className="label-mono" style={{ fontSize: '0.45rem', marginTop: '8px', opacity: i <= currentStep ? 1 : 0.3 }}>{rule}</div>
          {i < rules.length - 1 && (
            <div style={{ 
              position: 'absolute', 
              top: '6px', 
              left: 'calc(50% + 10px)', 
              width: 'calc(100% - 20px)', 
              height: '1px', 
              background: i < currentStep ? "var(--accent-neon)" : "rgba(255,255,255,0.1)" 
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

// 💎 Specialized GlassCard
export const GlassCard = ({ children, className = "", style = {}, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`glass-card ${className}`}
    style={style}
  >
    {children}
  </motion.div>
);

// 🧠 Floating Asset
export const FloatingAsset = ({ variant = "brain" }) => {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], rotateX: [0, 15, 0], rotateY: [0, -15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: "1200px" }}
    >
      <svg width="140" height="140" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad-3d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-neon)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-electric)" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <path 
           d={variant === "brain" ? "M30 60 C30 40 40 30 50 30 C60 30 70 40 70 60 C70 80 60 85 50 85 C40 85 30 80 30 60 Z" : "M50 15 L85 35 L85 70 L50 90 L15 70 L15 35 Z"} 
           fill="url(#grad-3d)" 
           style={{ filter: "drop-shadow(0 0 20px var(--accent-neon))" }}
        />
        <circle cx="50" cy="50" r="10" fill="white">
           <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
};
