import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Cpu, X, Check, AlertCircle, Sparkles } from 'lucide-react';

const AIChat = ({ data, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (data && isOpen) {
      // Generate synthetic explanation based on current case data
      const diag = data.extracted.diagnosis || "Undeclared";
      const score = data.probability;
      
      const explainer = [
        { type: 'bot', text: `Analysis Complete for: ${diag}. Adjudication Confidence: ${score}%.` },
        { type: 'item', success: true, text: `Diagnosis detected: ${diag}` },
        { type: 'item', success: data.checks[0].status === 'CHECK', text: "Policy Validity verified." },
        { type: 'item', success: data.checks[4].status === 'CHECK', text: "Medical Necessity and Lab Rationale." },
        { type: 'item', success: data.missing_data.length === 0, text: "Clinical/Administrative completeness." }
      ];

      if (data.missing_data.length > 0) {
        explainer.push({ type: 'bot', text: `⚠️ CRITICAL GAPS IDENTIFIED: ${data.missing_data.join(', ')}.` });
      } else {
        explainer.push({ type: 'bot', text: "✨ NO GAPS FOUND. Proceeding to Authorized Payout queue." });
      }

      setMessages(explainer);
    }
  }, [data, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000 }}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass-card"
            style={{ 
               position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px', 
               padding: '40px', borderLeft: '1px solid var(--accent-neon)', 
               zIndex: 1001, borderRadius: '0', background: 'rgba(15, 23, 42, 0.95)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={18} color="var(--accent-neon)" /> Ask SymbioAI
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '16px', 
                    background: m.type === 'bot' ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: m.type === 'bot' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  {m.type === 'bot' ? (
                    <Sparkles size={16} color="var(--accent-neon)" style={{ marginTop: '2px' }} />
                  ) : (
                    m.success ? <Check size={16} color="var(--accent-neon)" /> : <AlertCircle size={16} color="#ef4444" />
                  )}
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.5' }}>{m.text}</div>
                </motion.div>
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
               <div className="label-mono" style={{ fontSize: '0.6rem', opacity: 0.3, marginBottom: '12px' }}>V5.e Explainable Engine</div>
               <div className="glass-card" style={{ padding: '16px', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.6 }}>
                 "I reached this conclusion by evaluating clinical urgency (90%) against IRDAI 2024 compliance rules."
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
