import React, { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [ollamaStatus, setOllamaStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('http://localhost:8000/health', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setBackendStatus('ok');

          const isOllamaOk = data.ollama_status === 'ok' || data.ollama === true || data.status === 'ok';
          setOllamaStatus(isOllamaOk ? 'ok' : 'error');
        } else {
          setBackendStatus('error');
          setOllamaStatus('error');
        }
      } catch (error) {
        setBackendStatus('error');
        setOllamaStatus('error');
      }
    };

    checkHealth();
  }, []);

  return (
    <header className="header">
      <div className="status-pills">
        {/* Backend Pill */}
        {backendStatus === 'ok' ? (
          <span className="pill green mono">Backend ✓</span>
        ) : backendStatus === 'checking' ? (
          <span className="pill amber mono">Backend ···</span>
        ) : (
          <span className="pill red mono">Backend ✗</span>
        )}

        {/* Ollama Pill */}
        {ollamaStatus === 'ok' ? (
          <span className="pill green mono">Ollama ✓</span>
        ) : ollamaStatus === 'checking' ? (
          <span className="pill amber mono">Ollama ···</span>
        ) : (
          <span className="pill red mono">Ollama ✗</span>
        )}

        {/* Odoo Pill (Static) */}
        <span className="pill green mono">Odoo ✓</span>
      </div>
    </header>
  );
}
