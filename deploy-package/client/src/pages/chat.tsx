import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, MoreVertical, X, RotateCcw, Flag, Send, Paperclip } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useChat } from "@/hooks/use-chat";
import { format } from "date-fns";

export default function Chat() {
  const [location, setLocation] = useLocation();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isConnected } = useWebSocket();
  const { messages, partner, isActive, clearChat } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected || !isActive) return;

    sendMessage({
      type: 'send_message',
      content: messageInput.trim(),
    });
    setMessageInput("");
  };

  const handleFindNewPartner = () => {
    clearChat();
    sendMessage({ type: 'find_partner' });
    setLocation('/');
  };

  const handleReportUser = () => {
    // TODO: Implement reporting system
    alert('User reported. Thank you for keeping our community safe.');
  };

  const handleEndChat = () => {
    sendMessage({ type: 'disconnect' });
    clearChat();
    setLocation('/');
  };

  if (!isActive) {
    setLocation('/');
    return null;
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-background flex flex-col">
      {/* Chat header */}
      <div className="bg-secondary p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-highlight-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-foreground">Anonymous User</h3>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEndChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === partner?.id ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.senderId === partner?.id
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(message.createdAt), 'h:mm a')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="bg-secondary p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 bg-background rounded-full px-4 py-2 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
              disabled={!isConnected || !isActive}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            type="submit"
            disabled={!messageInput.trim() || !isConnected || !isActive}
            className="bg-accent hover:bg-accent/80 text-accent-foreground p-2 rounded-full transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="flex justify-center space-x-4 mt-3">
          <Button 
            variant="link" 
            onClick={handleFindNewPartner}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Find New Partner
          </Button>
          <Button 
            variant="link" 
            onClick={handleReportUser}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <Flag className="w-4 h-4 mr-1" />
            Report
          </Button>
        </div>
      </div>
    </div>
  );
}
