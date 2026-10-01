// AI Fleet Copilot — grounded in application state, with actionable responses
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { CopilotMessage } from '../types';

const QUICK_QUESTIONS = [
  'Which vessel should I assign to Mumbai–Kochi?',
  'Why did the optimizer select LNG?',
  'How much can emissions change if we switch to ammonia?',
  'What happens if cargo demand increases by 20%?',
  "Why is Vessel 04 showing a risk alert?",
  'Compare the current fleet with the optimized fleet.',
  'Explain the Pareto solutions.',
];

function MessageBubble({ msg }: { msg: CopilotMessage }) {
  const { runWhatIf, runOptimization, setStep, focusVessel } = useAppStore();
  const isUser = msg.role === 'user';

  const handleAction = async (action: NonNullable<CopilotMessage['actions']>[0]) => {
    switch(action.action) {
      case 'runOptimization':
        await runOptimization();
        setStep('optimization');
        break;
      case 'runWhatIf':
        if (action.payload?.fuel_type) {
          await runWhatIf({
            id: `wi-${Date.now()}`,
            name: `${action.payload.fuel_type} scenario (Copilot)`,
            fuel_type: action.payload.fuel_type as import('../types').FuelType,
            speed_delta_knots: (action.payload.speed_delta_knots as number) || 0,
            cargo_delta_pct: (action.payload.cargo_delta_pct as number) || 0,
            weather_scenario: 'moderate',
            shore_power: false,
            fleet_size_delta: 0,
          });
          setStep('whatif');
        }
        break;
      case 'openPareto':
        setStep('pareto');
        break;
      case 'focusVessel':
        if (action.payload?.vessel_id) {
          focusVessel(action.payload.vessel_id as string);
          setStep('digital_twin');
        }
        break;
      case 'compareFleet':
        setStep('optimization');
        break;
      case 'explainDecision':
        setStep('explainability');
        break;
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5"
             style={{ background:'rgba(26,166,159,0.2)', color:'var(--accent-primary)', border:'1px solid rgba(26,166,159,0.3)', flexShrink:0 }}>
          GF
        </div>
      )}
      <div className={`max-w-lg ${isUser ? 'ml-8' : 'mr-8'}`}>
        <div className="rounded-lg px-4 py-3 text-sm"
             style={{
               background: isUser ? 'var(--accent-secondary)' : 'var(--bg-surface)',
               color: isUser ? 'white' : 'var(--text-primary)',
               border: isUser ? 'none' : '1px solid var(--border-default)',
               borderRadius: isUser ? '12px 12px 3px 12px' : '3px 12px 12px 12px',
             }}>
          {/* Render markdown-like content */}
          {msg.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1' : ''}
               dangerouslySetInnerHTML={{
                 __html: line
                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.*?)\*/g, '<em>$1</em>'),
               }}
            />
          ))}

          {/* Action buttons */}
          {msg.actions && msg.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {msg.actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(26,166,159,0.15)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(26,166,159,0.3)',
                    fontSize:'0.75rem',
                  }}
                >
                  {action.label} →
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data sources */}
        {!isUser && msg.data_sources && msg.data_sources.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {msg.data_sources.slice(0,3).map(src => (
              <span key={src} className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background:'var(--bg-raised)', color:'var(--text-muted)', border:'1px solid var(--border-subtle)' }}>
                {src}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs mt-1" style={{ color:'var(--text-placeholder)' }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function CopilotView() {
  const { copilotMessages, copilotLoading, sendCopilotMessage, clearCopilot, setStep } = useAppStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [copilotMessages]);

  const handleSend = async () => {
    if (!input.trim() || copilotLoading) return;
    const msg = input.trim();
    setInput('');
    await sendCopilotMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ minHeight:'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
           style={{ background:'var(--bg-surface)', borderColor:'var(--border-default)' }}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:'var(--status-success)' }}></div>
            <h2 className="font-semibold text-sm">Jalmarg Copilot</h2>
            <span className="badge badge-derived text-xs">State-Grounded AI</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
            Answers from real fleet data · optimization results · simulation state
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearCopilot} className="btn btn-sm btn-ghost">Clear</button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep('report')}>Report →</button>
        </div>
      </div>

      {/* Quick questions */}
      {copilotMessages.length === 0 && (
        <div className="px-5 py-4 flex-shrink-0" style={{ background:'var(--bg-canvas)', borderBottom:'1px solid var(--border-subtle)' }}>
          <div className="text-label mb-2">Quick Questions</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendCopilotMessage(q)}
                className="px-3 py-1.5 rounded border text-xs"
                style={{
                  background:'var(--bg-surface)',
                  borderColor:'var(--border-default)',
                  color:'var(--text-secondary)',
                  cursor:'pointer',
                  transition:'all 0.15s',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {copilotMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4" style={{ opacity:0.15 }}>⊙</div>
            <h3 className="font-display text-lg mb-1" style={{ color:'var(--text-primary)' }}>Jalmarg Copilot</h3>
            <p className="text-sm" style={{ color:'var(--text-muted)', maxWidth:'400px' }}>
              Ask me about vessel assignments, fuel choices, optimization results, risk alerts,
              or emission scenarios. I respond with data from your actual fleet.
            </p>
          </div>
        ) : (
          copilotMessages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))
        )}

        {copilotLoading && (
          <div className="flex items-center gap-2 ml-9 mb-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full"
                     style={{ background:'var(--accent-primary)', opacity:0.6, animation:`pulse ${0.6 + i*0.2}s ease-in-out infinite` }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color:'var(--text-muted)' }}>Copilot is thinking…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 flex-shrink-0"
           style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border-default)' }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="input flex-1"
            placeholder="Ask about vessel assignment, fuel choices, optimization results…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={copilotLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || copilotLoading}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color:'var(--text-placeholder)' }}>
          Grounded in optimization run data · deterministic fallback active · no external LLM required
        </p>
      </div>
    </div>
  );
}
