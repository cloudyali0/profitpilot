import { useState, useRef, useEffect } from 'react';
import { sendBrainChat } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'brain';
  text: string;
  source?: string;
  timestamp: string;
}

const SUGGESTIONS = [
  'Is hafte kya mangau?',
  'Kahan paisa phasa hai?',
  'Profit kyu gira?',
  'Kharche me kya gadbad hai?',
  'Subah ka dimaag summary do',
  'Atta ka stock kab khatam hoga?',
];

export default function AskBrain() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'brain',
      text: 'Namaste! Main **Small Business Brain** hoon. Aapki dukaan ke stock, munafa aur kharche par seedha jawab de sakta hoon. \n\nNeeche diye gaye sawal poochhein ya mic daba kar bolein:',
      source: 'engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendBrainChat(q);
      const brainMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'brain',
        text: res.answer,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, brainMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'brain',
        text: 'Maaf kijiye, server se connect karne me dikkat aayi. Kripya dobara try karein.',
        source: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Browser Web Speech Recognition
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Aapke browser me speech recognition support nahi hai. Chrome browser use karein.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 84px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          💬 Ask Brain (Dukaan Ka Dimaag)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>
          Hinglish conversational business advisor powered by deterministic pandas analytics & AI explanation.
        </p>
      </div>

      {/* Suggestion Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            className="btn btn-secondary"
            onClick={() => handleSend(chip)}
            disabled={loading}
            style={{
              fontSize: '0.78rem', padding: '5px 12px', whiteSpace: 'nowrap', borderRadius: 100,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)'
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              {m.sender === 'brain' && (
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-100)',
                  color: 'var(--brand-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0
                }}>
                  🧠
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                background: m.sender === 'user' ? 'var(--brand-600)' : 'var(--bg-primary)',
                color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-light)',
                borderRadius: 14,
                padding: '14px 18px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* Source pill for Brain messages */}
                {m.sender === 'brain' && m.source && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: m.source.includes('gemini') ? '#EDE9FE' : 'var(--brand-100)',
                      color: m.source.includes('gemini') ? '#6D28D9' : 'var(--brand-700)',
                      textTransform: 'uppercase'
                    }}>
                      {m.source.includes('gemini') ? '✨ Gemini AI' : '⚡ Pandas Engine'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{m.timestamp}</span>
                  </div>
                )}

                <div style={{
                  fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 4 }}>
                    {m.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-100)',
                color: 'var(--brand-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
              }}>
                🧠
              </div>
              <div style={{
                background: 'var(--bg-primary)', padding: '12px 18px', borderRadius: 14,
                border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Decision engine se hisaab nikal raha hai...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: 14, borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
          display: 'flex', gap: 10, alignItems: 'center'
        }}>
          <button
            onClick={toggleVoice}
            className={`btn ${isListening ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6,
              background: isListening ? '#EF4444' : undefined, color: isListening ? '#fff' : undefined,
              animation: isListening ? 'pulse-dot 1.5s infinite' : undefined
            }}
            title="Speech input"
          >
            <span>🎙️</span>
            {isListening ? 'Sun raha hu...' : ''}
          </button>

          <input
            type="text"
            placeholder="Hinglish me sawal poochhein (jaise: 'Is hafte kya mangau?', 'Sugar ka rate kya rakhein?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10,
              border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.9rem'
            }}
          />

          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{ padding: '12px 20px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600 }}
          >
            Send ➔
          </button>
        </div>
      </div>
    </div>
  );
}
