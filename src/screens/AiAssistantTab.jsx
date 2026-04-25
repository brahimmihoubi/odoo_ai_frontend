import React, { useState, useRef, useEffect } from 'react';
import './AiAssistantTab.css';

export default function AiAssistantTab() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your OdooAI assistant. / Bonjour! Je suis votre assistant OdooAI." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState(null);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendChat = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:8000/ai/chat?message=${encodeURIComponent(userMessage)}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response || data.message || JSON.stringify(data) 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Error: Could not reach backend. / Erreur: impossible de joindre le serveur.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendChat();
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setReportError(null);
    try {
      const response = await fetch('http://localhost:8000/ai/generate-report', {
        method: 'POST'
      });
      const data = await response.json();
      setReport(data.report || data.content || JSON.stringify(data, null, 2));
    } catch (error) {
      setReportError("Error: Could not generate report. / Erreur de génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="tab-panel active">
      <div className="ai-grid">
        
        {/* Chatbot */}
        <div className="card">
          <div className="card-title">AI Chat / Chat IA</div>
          <div className="chat-box">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg-${msg.role}`} style={msg.isError ? { color: '#991b1b' } : {}}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="msg-thinking">Thinking / Réflexion en cours…</div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-wrap">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question / Posez une question…"
            />
            <button className="btn dark" onClick={handleSendChat} disabled={!input.trim() || isTyping}>
              Send
            </button>
          </div>
        </div>

        {/* Daily Report */}
        <div className="card">
          <div className="card-title">Daily Report / Rapport journalier</div>
          <button 
            className="btn dark" 
            style={{ width: '100%' }} 
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating… / Génération en cours…' : 'Generate Report / Générer un rapport'}
          </button>
          <div className="report-box">
            {isGenerating ? (
              <span className="empty-state">Generating report… / Génération du rapport…</span>
            ) : reportError ? (
              <span className="empty-state" style={{ color: '#991b1b' }}>{reportError}</span>
            ) : report ? (
              report
            ) : (
              <span className="empty-state">No report yet. Click above to generate. / Aucun rapport. Cliquez ci-dessus pour générer.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
