import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function VideoRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const createPeerConnection = useCallback((remoteId: string) => {
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('new-ice-candidate', { candidate: event.candidate, to: remoteId });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    remoteSocketIdRef.current = remoteId;
    return pc;
  }, [localStream, socket]);

  useEffect(() => {
    // Initialize Local Media
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join signaling room once media is ready
        if (socket && roomId) {
          socket.emit('joinVideoRoom', roomId);
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        toast.error('Could not access camera or microphone.');
      }
    };

    initMedia();

    return () => {
      // Cleanup on unmount
      localStream?.getTracks().forEach((t) => t.stop());
      peerConnectionRef.current?.close();
      if (socket && roomId) {
        socket.emit('leaveVideoRoom', roomId);
      }
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (!socket || !localStream) return;

    // A new user joined the room, we should initiate the call (send offer)
    const handleUserJoined = async (userId: string) => {
      console.log('User joined room:', userId);
      const pc = createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('video-offer', { offer, to: userId });
    };

    // Received an offer, create a connection and answer
    const handleReceiveOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      console.log('Received offer from:', from);
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('video-answer', { answer, to: from });
    };

    // Received an answer, set it as remote description
    const handleReceiveAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer');
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    // Received a new ICE candidate
    const handleReceiveCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    };

    const handleUserLeft = (userId: string) => {
      if (remoteSocketIdRef.current === userId) {
        toast.info('The other user left the call.');
        setRemoteStream(null);
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        remoteSocketIdRef.current = null;
      }
    };

    socket.on('user-joined-video', handleUserJoined);
    socket.on('video-offer', handleReceiveOffer);
    socket.on('video-answer', handleReceiveAnswer);
    socket.on('new-ice-candidate', handleReceiveCandidate);
    socket.on('user-left-video', handleUserLeft);
    socket.on('user-disconnected', handleUserLeft);

    return () => {
      socket.off('user-joined-video', handleUserJoined);
      socket.off('video-offer', handleReceiveOffer);
      socket.off('video-answer', handleReceiveAnswer);
      socket.off('new-ice-candidate', handleReceiveCandidate);
      socket.off('user-left-video', handleUserLeft);
      socket.off('user-disconnected', handleUserLeft);
    };
  }, [socket, localStream, createPeerConnection]);

  // Handle remote stream attachment
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const endCall = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', 
      background: '#0f172a', color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem', background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.9rem'
          }}>S</div>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Collab Room: {roomId?.substring(0, 8)}...</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Logged in as: <span style={{ color: 'white', fontWeight: 600 }}>{user?.name}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div style={{
        flex: 1, display: 'flex', gap: '1rem', padding: '1rem',
        justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden'
      }}>
        {/* Remote Video (Main) */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: '800px', 
          aspectRatio: '16/9', background: '#1e293b', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', color: '#64748b'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Waiting for others to join...</p>
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '1rem', left: '1rem',
            background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: 8, fontSize: '0.85rem'
          }}>
            Peer
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div style={{
          position: 'absolute', bottom: '100px', right: '2rem',
          width: '240px', aspectRatio: '16/9', background: '#1e293b', 
          borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)', zIndex: 10
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror local video
            }}
          />
          <div style={{
            position: 'absolute', bottom: '0.5rem', left: '0.5rem',
            background: 'rgba(0,0,0,0.6)', padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.75rem'
          }}>
            You
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{
        height: '80px', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', zIndex: 10
      }}>
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          style={{
            width: 50, height: 50, borderRadius: '50%',
            background: isMicMuted ? '#ef4444' : 'rgba(255,255,255,0.1)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}
        >
          {isMicMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          style={{
            width: 50, height: 50, borderRadius: '50%',
            background: isCameraOff ? '#ef4444' : 'rgba(255,255,255,0.1)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}
        >
          {isCameraOff ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          )}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          style={{
            height: 50, padding: '0 1.5rem', borderRadius: 25,
            background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
          End Call
        </button>
      </div>
    </div>
  );
}
