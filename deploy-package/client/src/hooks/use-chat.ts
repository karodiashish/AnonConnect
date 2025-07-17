import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWebSocket } from "./use-websocket";

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
}

interface Partner {
  id: number;
  isAnonymous: boolean;
}

export function useChat() {
  const [location, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { addEventListener, removeEventListener } = useWebSocket();

  useEffect(() => {
    const handlePartnerFound = (data: any) => {
      setPartner(data.partner);
      setIsActive(true);
      setSessionId(data.sessionId);
      setMessages([]);
      setLocation('/chat');
    };

    const handleMessage = (data: any) => {
      setMessages(prev => [...prev, data.message]);
    };

    const handlePartnerDisconnected = () => {
      setIsActive(false);
      setPartner(null);
      setLocation('/');
    };

    addEventListener('partner_found', handlePartnerFound);
    addEventListener('message', handleMessage);
    addEventListener('partner_disconnected', handlePartnerDisconnected);

    return () => {
      removeEventListener('partner_found');
      removeEventListener('message');
      removeEventListener('partner_disconnected');
    };
  }, [addEventListener, removeEventListener, setLocation]);

  const clearChat = () => {
    setMessages([]);
    setPartner(null);
    setIsActive(false);
    setSessionId(null);
  };

  return {
    messages,
    partner,
    isActive,
    sessionId,
    clearChat,
  };
}
