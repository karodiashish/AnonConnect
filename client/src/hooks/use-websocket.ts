import { useEffect, useState, useCallback } from "react";
import { WebSocketClient } from "@/lib/websocket";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

let wsClient: WebSocketClient | null = null;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sessionId", id);
    }
    return id;
  });
  
  const [deviceFingerprint] = useState(() => getDeviceFingerprint());

  useEffect(() => {
    if (!wsClient) {
      wsClient = new WebSocketClient(sessionId, deviceFingerprint);
      
      wsClient.on('joined', () => {
        setIsConnected(true);
      });

      wsClient.on('error', (data) => {
        console.error("WebSocket error:", data.message);
      });

      wsClient.connect();
    }

    return () => {
      if (wsClient) {
        wsClient.disconnect();
        wsClient = null;
      }
    };
  }, [sessionId, deviceFingerprint]);

  const sendMessage = useCallback((message: any) => {
    if (wsClient) {
      wsClient.send(message);
    }
  }, []);

  const addEventListener = useCallback((type: string, handler: (data: any) => void) => {
    if (wsClient) {
      wsClient.on(type, handler);
    }
  }, []);

  const removeEventListener = useCallback((type: string) => {
    if (wsClient) {
      wsClient.off(type);
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    addEventListener,
    removeEventListener,
  };
}
