import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Layers } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const RuleEditor = ({ onUpdate }) => {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rules`);
      setRules(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (key, val) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/rules`, { key, value: parseInt(val) });
      setRules(prev => ({ ...prev, [key]: parseInt(val) }));
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="glass-card" style={{ padding: '32px', height: '100%', minHeight: '340px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={16} color="var(--accent-neon)" /> Policy Rule Lab (v5.d)
        </div>
        {loading && <RefreshCw size={14} className="processing" />}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(rules).slice(0, 5).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{key.replace(/_/g, ' ')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="number" 
                value={val} 
                onChange={(e) => handleUpdate(key, e.target.value)}
                style={{ 
                   width: '60px', 
                   background: 'rgba(0,0,0,0.3)', 
                   border: '1px solid var(--accent-neon)', 
                   color: 'var(--accent-neon)', 
                   borderRadius: '6px', 
                   textAlign: 'center',
                   fontSize: '0.9rem',
                   fontWeight: 700
                }}
              />
              <span className="label-mono" style={{ fontSize: '0.6rem' }}>MON</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0, 255, 204, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
           <p style={{ fontSize: '0.7rem', opacity: 0.5 }}><Layers size={12} /> Modifications take effect immediately across all Agent Nodes.</p>
        </div>
      </div>
    </div>
  );
};

export default RuleEditor;
