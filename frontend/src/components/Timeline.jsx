import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, ShieldCheck, CreditCard } from 'lucide-react';

const Timeline = ({ currentStep = 0 }) => {
  const steps = [
    { label: "Extraction", icon: <Send size={14} />, detail: "Clinical OCR & Entity Mapping" },
    { label: "Policy Match", icon: <ShieldCheck size={14} />, detail: "Star/HDFC Rule Reconciliation" },
    { label: "Adjudication", icon: <Clock size={14} />, detail: "Multi-Agent Graph Reasoning" },
    { label: "Auth Ready", icon: <CreditCard size={14} />, detail: "Cashless Authorization Issued" }
  ];

  return (
    <div className="glass-card" style={{ padding: '32px', height: '100%' }}>
      <div className="label-mono" style={{ marginBottom: '24px', fontSize: '0.7rem' }}>Adjudication Lifecycle</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
               opacity: 1, 
               x: 0,
               scale: i === currentStep ? 1.05 : 1,
               background: i === currentStep ? "rgba(0, 255, 204, 0.08)" : "transparent"
            }}
            transition={{ delay: i * 0.1 }}
            style={{ 
               padding: '16px', 
               borderRadius: '16px', 
               border: i === currentStep ? '1px solid var(--accent-neon)' : '1px solid transparent',
               display: 'flex',
               alignItems: 'center',
               gap: '16px'
            }}
          >
            <div style={{ 
               width: '32px', 
               height: '32px', 
               borderRadius: '50%', 
               background: i <= currentStep ? 'var(--accent-neon)' : 'rgba(255,255,255,0.05)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               color: i <= currentStep ? '#020617' : 'rgba(255,255,255,0.3)',
               boxShadow: i <= currentStep ? '0 0 15px var(--accent-neon)' : 'none'
            }}>
               {s.icon}
            </div>
            <div>
               <div style={{ fontWeight: 800, fontSize: '0.9rem', color: i <= currentStep ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.label}</div>
               <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{s.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
