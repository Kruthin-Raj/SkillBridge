import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function WorkspaceChat({ listingId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await api.messages.get(listingId);
      setMessages(data.messages);
      setError('');
    } catch (err) {
      if (err.status !== 403) {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // In a real app we'd use SSE or WebSockets. Here we poll every 5s.
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const data = await api.messages.send(listingId, content);
      setMessages((prev) => [...prev, data.message]);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="card text-center text-sm text-cw-text-3">Loading chat...</div>;

  return (
    <div className="card flex flex-col h-[500px]">
      <h3 className="font-semibold text-cw-text-1 mb-3 border-b border-cw-border pb-2">Workspace Chat</h3>
      
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-cw-text-3 my-10">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === user.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {!isMe && (
                    <span className="text-xs font-medium text-cw-text-2">
                      {msg.sender.full_name || 'User'}
                    </span>
                  )}
                  <span className="text-[10px] text-cw-text-3">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                    isMe
                      ? 'bg-freelance text-white rounded-tr-sm'
                      : 'bg-cw-bg border border-cw-border text-cw-text-1 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-auto pt-2 border-t border-cw-border">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 input-field py-2"
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="btn-primary py-2 px-4 whitespace-nowrap"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
