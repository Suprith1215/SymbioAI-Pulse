import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Database, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layout,
  UploadCloud,
  FileText,
  AlertTriangle,
  Zap,
  Target,
  UserPlus,
  ClipboardCheck,
  History,
  Shield,
  Info,
  LineChart,
  Table,
  Cpu as AgentIcon,
  Globe,
  Settings,
  MessageSquare,
  Search,
  CheckCircle,
  FlaskConical
} from 'lucide-react';

import './index.css';
import { TiltCard, FloatingAsset, GlassCard, Particles, RuleStepper } from './components/UI3D';
import ConfidenceGauge from "./components/ConfidenceGauge";
import AgentLogs from "./components/AgentLogs";
import EvolutionGraph from "./components/EvolutionGraph";
import RuleEditor from "./components/RuleEditor";
import Timeline from "./components/Timeline";
import AIChat from "./components/AIChat";
import SyntheaLab from "./components/SyntheaLab";

const API_BASE = "http://localhost:8001/api";

function App() {
  const [activeMode, setActiveMode] = useState("Synthea"); // Default to Synthea Lab for Demo
  const [sector, setSector] = useState("Healthcare");
  const [caseData, setCaseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ruleStep, setRuleStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [file, setFile] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [history, setHistory] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null); // Explicit error state

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) { 
      console.error(err); 
      setErrorInfo(err.response?.data?.detail || "History fetch failed.");
    }
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setResult(null);
    setErrorInfo(null);
    setRuleStep(-1);
    setIsSimulated(false);
  };

  const handleSimulateFix = async (fixType) => {
    setLoading(true);
    setErrorInfo(null);
    try {
      const res = await axios.post(`${API_BASE}/simulate`, {
        current_data: analysisResult || result,
        fix_type: fixType
      });
      if (activeMode === "Analysis" || activeMode === "Synthea" || activeMode === "Scan") setAnalysisResult(res.data);
      else setResult(res.data);
      setIsSimulated(true);
    } catch (err) { 
      console.error(err); 
      setErrorInfo("Simulation fix failed. The decision logic could not be recalculated.");
    } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      const res = await axios.get(`${API_BASE}/generate`);
      setCaseData(res.data.text);
      setActiveMode("Intelligence");
      
      const processRes = await axios.post(`${API_BASE}/process`, { case_data: res.data.text, domain: sector });
      
      setCurrentLogs([]);
      if (processRes.data.logs) {
        let step = 0;
        for (let log of processRes.data.logs) {
          await new Promise(r => setTimeout(r, 400));
          setCurrentLogs(prev => [...prev, log]);
          setRuleStep(step++);
        }
      }
      setResult(processRes.data);
      setRuleStep(9);
      fetchHistory();
    } catch (err) { 
      console.error(err); 
      setErrorInfo(err.response?.data?.detail || "Simulation failed. Please ensure the backend is running.");
    } finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErrorInfo(null);
    setAnalysisResult(null);
    setResult(null);
    setRuleStep(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Explicit multipart/form-data for wider browser support
      const res = await axios.post(`${API_BASE}/analyze-report`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setCurrentLogs([]);
      if (res.data.logs) {
        let step = 0;
        for (let log of res.data.logs) {
          await new Promise(r => setTimeout(r, 400));
          setCurrentLogs(prev => [...prev, log]);
          setRuleStep(step++);
        }
      }
      setAnalysisResult(res.data);
      setRuleStep(9);
      fetchHistory();
    } catch (err) { 
      console.error(err); 
      setErrorInfo(err.response?.data?.detail || "File analysis failed. Ensure the server is online and the file is a valid PDF or TXT.");
    } finally { setLoading(false); }
  };

  const handleProcess = async () => {
    setLoading(true);
    setErrorInfo(null);
    setCurrentLogs([]);
    setRuleStep(0);
    try {
      const res = await axios.post(`${API_BASE}/process`, { case_data: caseData, domain: sector });
      setResult(res.data);
      setRuleStep(9);
      fetchHistory();
    } catch (err) { 
      console.error(err); 
      setErrorInfo("Processing failed.");
    } finally { setLoading(false); }
  };

  const handleSyntheaAnalyze = async (patient) => {
    setLoading(true);
    setErrorInfo(null);
    setAnalysisResult(null);
    setResult(null);
    setRuleStep(0);
    try {
      const res = await axios.post(`${API_BASE}/analyze-synthea`, { text: patient.notes });
      
      setCurrentLogs([]);
      if (res.data.logs) {
        let step = 0;
        for (let log of res.data.logs) {
          await new Promise(r => setTimeout(r, 400));
          setCurrentLogs(prev => [...prev, log]);
          setRuleStep(step++);
        }
      }
      setAnalysisResult(res.data);
      setRuleStep(9);
      fetchHistory();
    } catch (err) { 
      console.error(err); 
      setErrorInfo("Synthea lab analysis failed.");
    } finally { setLoading(false); }
  };

  const currentData = analysisResult || result;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 60px' }}>
      <Particles />
      
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hologram-overlay">
            <div className="hologram-ring" />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="label-mono" style={{ marginTop: '30px', color: 'var(--accent-neon)' }}>
              Neural Adjudication in Progress...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌌 PLATFORM HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <FloatingAsset variant="shield" />
          <div>
            <div className="label-mono" style={{ color: 'var(--accent-neon)', marginBottom: '6px' }}>
              Decision Intelligence Engine • v5.f (Synthea-MIMIC)
            </div>
            <h1 className="gradient-text" style={{ fontSize: '3.8rem', margin: 0 }}>SymbioAI</h1>
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { id: 'Synthea', label: 'Synthea Lab', icon: <FlaskConical size={18} /> },
            { id: 'Simulation', label: 'Simulation', icon: <Cpu size={18} /> },
            { id: 'Scan', label: 'Upload Scan', icon: <UploadCloud size={18} /> }
          ].map(m => (
            <motion.button 
              key={m.id}
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`mode-btn ${activeMode === m.id ? 'active' : ''}`}
              onClick={() => {
                 setActiveMode(m.id);
                 clearResults();
              }}
            >
              {m.icon} {m.label}
            </motion.button>
          ))}
        </div>

        <button className="glow-btn" onClick={() => setChatOpen(true)}>
          <MessageSquare size={18} /> Ask AI
        </button>
      </div>

      {ruleStep >= 0 && <RuleStepper currentStep={ruleStep} />}

      <AnimatePresence>
        {errorInfo && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginBottom: '20px' }}>
            <GlassCard style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderColor: 'var(--accent-red)' }}>
               <AlertTriangle size={24} color="var(--accent-red)" />
               <div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-red)' }}>PLATFORM ERROR</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{errorInfo}</div>
               </div>
               <button className="glow-btn" onClick={() => setErrorInfo(null)} style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>Dismiss</button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bento-grid">
        {!currentData && activeMode !== "Synthea" ? (
          <div className="cell-full" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <TiltCard style={{ padding: '80px', textAlign: 'center', width: '100%', maxWidth: '800px' }}>
                <FlaskConical size={64} style={{ color: 'var(--accent-neon)', opacity: 0.2, marginBottom: '24px' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Decision Readiness Sandbox</h2>
                <p style={{ opacity: 0.4, marginBottom: '40px', maxWidth: '600px', margin: '0 auto' }}>Generate synthetic data or upload scans to demo decision logic without clinical access barriers.</p>
                
                 <div style={{ display: 'none' }}>
                    <input type="file" id="file-in" onChange={handleFileUpload} />
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '40px' }}>
                    <button className="glow-btn" onClick={() => setActiveMode('Synthea')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)' }}>
                       <FlaskConical size={18} /> Explore Synthea Lab
                    </button>
                    {activeMode === 'Scan' ? (
                       <label htmlFor="file-in" className="glow-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <UploadCloud size={18} /> Upload Manual Report
                       </label>
                    ) : (
                       <button className="glow-btn" onClick={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <Sparkles size={18} /> Synthetic Demo Case
                       </button>
                    )}
                 </div>
             </TiltCard>
          </div>
        ) : !currentData && activeMode === "Synthea" ? (
          <div className="cell-full">
            <SyntheaLab onAnalyze={handleSyntheaAnalyze} />
          </div>
        ) : (
          /* 🏆 RESULT DASHBOARD RENDERS HERE IF currentData IS TRUE */
          <>
            {/* 1. DIGITAL TWIN SYNTHESIS (WIDE) */}
            <div className="cell-wide">
               <TiltCard style={{ padding: '40px', height: '100%', border: '1px solid rgba(0, 255, 204, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                     <div>
                        <div className="label-mono" style={{ color: 'var(--accent-neon)', marginBottom: '8px' }}>Live Digital Twin Synthesis</div>
                        <h2 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                           {currentData?.extracted?.patient_name || "RECOGNIZING..."}
                        </h2>
                     </div>
                     <div className="glass-card" style={{ padding: '12px 20px', borderRadius: '12px' }}>
                        <div className="label-mono" style={{ fontSize: '0.6rem', opacity: 0.5 }}>Clinical Baseline</div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>REAL-TIME NLP</div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                     {currentData?.extracted && Object.entries(currentData.extracted).map(([k, v]) => (
                        <div key={k} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                           <div className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.4, textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</div>
                           <div style={{ fontWeight: 800, marginTop: '4px', fontSize: '1.1rem', color: v === "???" ? "#ff4444" : "white" }}>{v || "---"}</div>
                        </div>
                     ))}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                     <EvolutionGraph 
                        initialScore={isSimulated ? 40 : currentData?.probability} 
                        optimizedScore={currentData?.probability} 
                        isSimulated={isSimulated} 
                     />
                  </div>
                  <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                     <button className="label-mono" onClick={clearResults} style={{ background: 'none', border: 'none', color: 'var(--accent-neon)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <RefreshCw size={14} /> Reset Adjudication Sandbox
                     </button>
                  </div>
               </TiltCard>
            </div>

            {/* 2. GAUGES (TALL) */}
            <div className="cell-half cell-tall">
               <TiltCard style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
                  <ConfidenceGauge value={currentData?.probability || 0} label="Decision Score" />
                  <ConfidenceGauge value={currentData?.clinical_urgency || 0} label="Urgency Factor" />
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center', width: '100%', border: '1px solid var(--accent-neon)' }}>
                     <div className="label-mono" style={{ color: 'var(--accent-neon)', fontSize: '0.6rem' }}>Decision Stability</div>
                     <div style={{ fontWeight: 900, fontSize: '1rem', marginTop: '4px' }}>{isSimulated ? "OPTIMIZED (IRDAI 2024)" : "BASELINE / STABLE"}</div>
                  </div>
               </TiltCard>
            </div>

            {/* 3. RULE LAB (TALL THIRD) */}
            <div className="cell-third cell-tall">
               <RuleEditor 
                  checks={currentData?.checks || []} 
                  isSimulated={isSimulated}
                  onInject={handleSimulateFix}
               />
            </div>

            {/* 4. WHAT-IF ACTION PANEL (WIDE) */}
            <div className="cell-wide">
               <TiltCard style={{ padding: '40px' }}>
                  <div className="label-mono" style={{ marginBottom: '24px' }}>What-If Simulation Engine v4 (Synthea Scenario Fix)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontWeight: 900, opacity: 0.8 }}>Available Patient Record Injections:</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           <button className="glow-btn" onClick={() => handleSimulateFix("hba1c")} style={{ flex: 1, fontSize: '0.8rem' }}>Add Lab (HbA1c/ECG)</button>
                           <button className="glow-btn" onClick={() => handleSimulateFix("history")} style={{ flex: 1, fontSize: '0.8rem' }}>Add Clinical History</button>
                           <button className="glow-btn" onClick={() => handleSimulateFix("signature")} style={{ flex: 1, fontSize: '0.8rem' }}>Sign & Verify</button>
                        </div>
                        <div style={{ marginTop: '12px', padding: '20px', background: 'rgba(0, 255, 204, 0.05)', borderRadius: '14px', borderLeft: '4px solid var(--accent-neon)' }}>
                           <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.9rem' }}>Orchestration Strategy:</div>
                           <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: '1.5' }}>{currentData?.recommendation || 'Analyzing policy compliance path...'}</p>
                        </div>
                     </div>
                     <div style={{ background: 'rgba(0, 255, 204, 0.05)', padding: '24px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(0, 255, 204, 0.1)' }}>
                        <div className="label-mono" style={{ fontSize: '0.55rem' }}>Adjudication Confidence</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-neon)' }}>{currentData?.probability}%</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '8px' }}>Compliant with IRDAI-2024.</div>
                     </div>
                  </div>
               </TiltCard>
            </div>

            {/* 5. HISTORY TABLE / BATCH TEST (WIDE) */}
            <div className="cell-wide">
               <GlassCard style={{ padding: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                     <div className="label-mono"><Activity size={16} /> Regional Comparison Dashboard (Learning Matrix)</div>
                     <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>Showing self-learning experience match results.</div>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                           <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.5 }}>
                              <th style={{ padding: '12px' }}>Case ID</th>
                              <th style={{ padding: '12px' }}>Context</th>
                              <th style={{ padding: '12px' }}>Probability</th>
                              <th style={{ padding: '12px' }}>Auth Status</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(history || []).map((h, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                 <td style={{ padding: '12px', opacity: 0.4 }}>{h.id}</td>
                                 <td style={{ padding: '12px', fontWeight: 800 }}>{h.diagnosis}</td>
                                 <td style={{ padding: '12px', color: 'var(--accent-neon)' }}>{h.score}%</td>
                                 <td style={{ padding: '12px' }}>{h.score > 70 ? 'AUTHORIZED' : 'REVIEW REQ'}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </div>

            {/* 6. TIMELINE (HALF) */}
            <div className="cell-half">
               <Timeline currentStep={isSimulated ? 3 : 2} />
            </div>

            {/* 7. AGENT NODES (HALF) */}
            <div className="cell-half">
               <AgentLogs logs={currentLogs} />
            </div>
          </>
        )}
      </div>

      <AIChat data={currentData} isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* 💣 HONEST POSITIONING FOOTER */}
      <div style={{ marginTop: '80px', padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
         <p style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8', fontSize: '0.85rem', opacity: 0.5 }}>
            “We use synthetic patient data generated using **Synthea from MITRE** and de-identified clinical notes inspired by the **MIMIC-III** dataset. This allows us to simulate real-world healthcare scenarios without accessing private patient data, upholding the highest standards of data privacy and clinical research ethics.”
         </p>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px', opacity: 0.3 }}>
            <div className="label-mono" style={{ fontSize: '0.55rem' }}>Source: Synthea v5.0</div>
            <div className="label-mono" style={{ fontSize: '0.55rem' }}>Pattern: MIMIC-III De-id</div>
            <div className="label-mono" style={{ fontSize: '0.55rem' }}>Compliance: IRDAI 2024</div>
         </div>
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <GlassCard style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '20px', borderColor: 'var(--accent-neon)' }}>
             <Activity size={24} className="processing" color="var(--accent-neon)" />
             <div style={{ fontWeight: 900, color: 'var(--accent-neon)', letterSpacing: '0.1em' }}>SYMBIO CORE ADJUDICATING...</div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

export default App;
