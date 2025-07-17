import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Crown, MessageCircle, Shield, KeyRound, Users, Search, Settings } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const { sendMessage, isConnected } = useWebSocket();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const handleStartChat = () => {
    if (!isConnected) {
      return;
    }
    
    setIsSearching(true);
    sendMessage({ type: 'find_partner' });
  };

  const handleGetPremium = () => {
    setLocation('/premium');
  };

  const handleSettings = () => {
    setLocation('/settings');
  };

  if (isSearching) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-background flex flex-col justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Finding someone for you...</h2>
          
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-accent rounded-full flex items-center justify-center">
              <Search className="w-16 h-16 text-accent-foreground" />
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-success border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div className="space-y-4 mb-8">
            <Card className="bg-secondary border-secondary">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-secondary-foreground">Searching for anonymous users...</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary border-secondary">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4 text-warning" />
                  <span className="text-sm text-secondary-foreground">
                    {stats?.onlineUsers || 0} users online
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsSearching(false)}
            className="bg-muted hover:bg-muted/80"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="p-6 text-center min-h-screen flex flex-col justify-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-accent rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-12 h-12 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">AnonTalk</h1>
          <p className="text-muted-foreground">Anonymous one-on-one conversations</p>
        </div>

        <div className="space-y-4 mb-8">
          <Card className="bg-secondary border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold mb-1 text-secondary-foreground">Completely Anonymous</h3>
              <p className="text-sm text-muted-foreground">No registration required. Your identity stays hidden.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold mb-1 text-secondary-foreground">Instant Matching</h3>
              <p className="text-sm text-muted-foreground">Press a button and we find a new person for you.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-highlight" />
              </div>
              <h3 className="font-semibold mb-1 text-secondary-foreground">Privacy First</h3>
              <p className="text-sm text-muted-foreground">Your conversations are secure and private.</p>
            </CardContent>
          </Card>
        </div>

        <Button 
          onClick={handleStartChat}
          disabled={!isConnected || isSearching}
          className="bg-accent hover:bg-accent/80 text-accent-foreground py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 mb-4"
        >
          {!isConnected ? (
            <>
              <LoadingSpinner className="mr-2" />
              Connecting...
            </>
          ) : (
            "Start Anonymous Chat"
          )}
        </Button>
        
        <div className="flex space-x-4">
          <Button 
            variant="link" 
            onClick={handleGetPremium}
            className="text-highlight hover:text-highlight/80 transition-colors duration-200"
          >
            <Crown className="w-4 h-4 mr-1" />
            Get Premium Features
          </Button>
          
          <Button 
            variant="link" 
            onClick={handleSettings}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
