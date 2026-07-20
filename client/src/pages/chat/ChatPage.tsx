import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../api/chat';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {type Conversation,type Message } from '../../types';

export default function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Fetch conversations
  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
    select: r => r.data.conversations as Conversation[],
  });
  const conversations = convData || [];

  // Set initial active conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0]._id);
    }
  }, [conversations, activeConvId]);

  // Fetch messages for active conversation
  const { data: messagesData, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => chatApi.getMessages(activeConvId!),
    select: r => r.data.messages as Message[],
    enabled: !!activeConvId,
  });
  const messages = messagesData || [];

  // Socket event listeners
  useEffect(() => {
    if (!socket || !activeConvId) return;
    
    socket.emit('joinChat', activeConvId);

    const handleMessage = (msg: Message) => {
      qc.setQueryData(['messages', activeConvId], (old: Message[] | undefined) => {
        if (!old) return [msg];
        return [...old, msg];
      });
      // Also update conversation lastMessage
      qc.invalidateQueries({ queryKey: ['conversations'] });
      
      if (msg.sender !== user?.id) {
        chatApi.markSeen(msg._id).catch(() => {});
      }
    };

    socket.on('newMessage', handleMessage);

    return () => {
      socket.off('newMessage', handleMessage);
      socket.emit('leaveChat', activeConvId);
    };
  }, [socket, activeConvId, qc, user?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => chatApi.sendMessage({ conversationId: activeConvId!, message: text }),
    onSuccess: (res) => {
      setNewMessage('');
      const sentMsg = res.data.data;
      qc.setQueryData(['messages', activeConvId], (old: Message[] | undefined) => old ? [...old, sentMsg] : [sentMsg]);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;
    sendMutation.mutate(newMessage.trim());
  };

  const getOtherUser = (conv: Conversation) => {
    if (user?.role === 'client') return conv.freelancer;
    return conv.client;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      
      {/* Sidebar: Conversations */}
      <div style={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Messages</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convLoading ? (
            <LoadingSpinner />
          ) : conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No conversations yet</div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              const isActive = conv._id === activeConvId;
              
              return (
                <div key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  style={{
                    padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center',
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#6366f1' : 'transparent'}`,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => { if(!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if(!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {otherUser?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser?.name}</span>
                      {conv.lastMessageAt && (
                        <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {conv.gig && <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.gig.title}</div>}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {(() => {
                  const conv = conversations.find(c => c._id === activeConvId);
                  const other = conv ? getOtherUser(conv) : null;
                  return (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                        {other?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{other?.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{conv?.gig?.title}</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Video Call Button */}
              <button
                onClick={() => window.open(`/room/${activeConvId}`, '_blank')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(99, 102, 241, 0.1)', color: '#a78bfa',
                  border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.5rem 1rem',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99, 102, 241, 0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99, 102, 241, 0.1)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Join Collab Room
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {msgsLoading ? <LoadingSpinner /> : messages.map((msg, i) => {
                const isMe = typeof msg.sender === 'object' ? msg.sender._id === user?.id : msg.sender === user?.id;
                // handle case where backend might not populate sender properly in all cases
                const actualSender = (typeof msg.sender === 'object') ? msg.sender : { _id: msg.sender };
                const actuallyIsMe = actualSender._id === user?.id || (actualSender as any).id === user?.id;

                return (
                  <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: actuallyIsMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: 16,
                      background: actuallyIsMe ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      borderBottomRightRadius: actuallyIsMe ? 4 : 16,
                      borderBottomLeftRadius: actuallyIsMe ? 16 : 4,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      border: actuallyIsMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                    }}>
                      {msg.message}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ flex: 1, borderRadius: 999, padding: '0.75rem 1.25rem' }}
                />
                <button type="submit" className="btn-primary" disabled={!newMessage.trim() || sendMutation.isPending} style={{ borderRadius: 999, padding: '0.75rem 1.5rem' }}>
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
