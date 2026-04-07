import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Cpu, CheckCircle, AlertTriangle, Zap, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

const API_BASE = "http://localhost:8001/api";

const SyntheaLab = ({ onAnalyze }) => {
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get(`${API_BASE}/synthea-cases`);
      setCases(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSelect = (c) => {
    setSelectedId(c.id);
    if (onAnalyze) onAnalyze(c);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={16} color="var(--accent-neon)" /> Synthea-MIMIC Demo Deck
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {cases.map((c) => (
          <motion.div 
            key={c.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(c)}
            style={{ 
               cursor: 'pointer',
               padding: '16px', 
               borderRadius: '16px', 
               background: selectedId === c.id ? 'rgba(0, 255, 204, 0.08)' : 'rgba(255,255,255,0.02)',
               border: selectedId === c.id ? '1px solid var(--accent-neon)' : '1px solid rgba(255,255,255,0.05)',
               textAlign: 'center',
               position: 'relative',
               overflow: 'hidden'
            }}
          >
            {selectedId === c.id && (
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-neon)' }} />
            )}
            <FileText size={20} color={selectedId === c.id ? 'var(--accent-neon)' : 'rgba(255,255,255,0.2)'} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.id}</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '4px' }}>{c.diagnosis}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px', flex: 1, background: 'rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedId ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="label-mono" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '16px' }}>MIMIC-III SOURCE REPORT</div>
            <pre style={{ 
               flex: 1, 
               margin: 0, 
               fontSize: '0.8rem', 
               lineHeight: '1.5',
               color: 'rgba(255,255,255,0.8)',
               fontFamily: 'var(--font-mono)',
               whiteSpace: 'pre-wrap',
               overflowY: 'auto'
            }}>
               {cases.find(c => c.id === selectedId)?.notes}
            </pre>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="glow-btn" onClick={() => handleSelect(cases.find(c => c.id === selectedId))} style={{ fontSize: '0.75rem' }}>
                 Adjudicate Case <ArrowRight size={14} />
               </button>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
             <ShieldCheck size={48} style={{ marginBottom: '20px' }} />
             <p className="label-mono">Select a Synthea Persona to begin Adjudication Lab</p>
          </div>
        )}
      </div>
      
      <div style={{ fontSize: '0.65rem', opacity: 0.4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
         <ShieldCheck size={12} /> Data Source: Synthetic clinical records generated via MITRE Synthea (MIT) and de-identified patterns from MIMIC-III.
      </div>
    </div>
  );
};

export default SyntheaLab;
