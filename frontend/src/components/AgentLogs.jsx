import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal } from "lucide-react";

const AgentLogs = ({ logs }) => {
  return (
    <div className="glass-card" style={{ padding: '36px', height: '100%', minHeight: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
          <Cpu size={18} color="var(--accent-neon)" />
          Orchestration Nodes (v5.b)
        </div>
        <div className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.4 }}>
          Live Adjudication Stream
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
        {/* Holographic Timeline Line */}
        <div style={{ 
          position: 'absolute', 
          left: '7px', 
          top: '0', 
          bottom: '0', 
          width: '2px', 
          background: 'linear-gradient(to bottom, var(--accent-neon), transparent)', 
          opacity: 0.15 
        }}></div>

        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}
            >
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: 'var(--bg-deep)', 
                border: '2px solid var(--accent-neon)',
                boxShadow: '0 0 15px rgba(0, 255, 204, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ width: '6px', height: '6px', background: 'var(--accent-neon)', borderRadius: '50%' }}
                />
              </div>
              <div style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '0.9rem', 
                color: 'white', 
                opacity: 0.9,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: '1.4'
              }}>
                {log}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '16px', opacity: 0.2 }}>
             <Terminal size={40} />
             <div className="label-mono" style={{ fontSize: '0.6rem' }}>Awaiting LangGraph Signal Ingestion...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLogs;
