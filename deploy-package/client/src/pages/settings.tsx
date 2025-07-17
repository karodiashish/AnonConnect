import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Shield, Smartphone, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: () => apiRequest("GET", "/api/users/me", {}, {
      "x-session-id": sessionStorage.getItem("sessionId") || "",
    }).then(res => res.json()),
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      return apiRequest("PUT", "/api/users/email", { email: newEmail }, {
        "x-session-id": sessionStorage.getItem("sessionId") || "",
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    },
  });

  const removeEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/users/email", {}, {
        "x-session-id": sessionStorage.getItem("sessionId") || "",
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Removed",
        description: "Your email has been removed from your account.",
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove email",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    updateEmailMutation.mutate(email);
  };

  const handleRemoveEmail = () => {
    removeEmailMutation.mutate();
  };

  const handleBack = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Account Status */}
        <Card className="bg-secondary border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-success" />
              <span>Account Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <div className="flex items-center space-x-1">
                {user?.isPremium ? (
                  <>
                    <Crown className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">Premium</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">Free</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Device ID</span>
              <span className="text-sm font-mono text-foreground">
                {getDeviceFingerprint().substring(0, 8)}...
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-secondary border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-highlight" />
              <span>Email Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add email to recover premium features if you lose access to this device
              </p>
            </div>
            
            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-input"
              />
              
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={updateEmailMutation.isPending || !email.trim()}
                  className="flex-1 bg-highlight hover:bg-highlight/80"
                >
                  {updateEmailMutation.isPending ? (
                    <LoadingSpinner className="mr-2" />
                  ) : null}
                  {user?.email ? 'Update' : 'Add'} Email
                </Button>
                
                {user?.email && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveEmail}
                    disabled={removeEmailMutation.isPending}
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="bg-secondary border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-accent" />
              <span>Device Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Browser</span>
              <span className="text-sm text-foreground">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm text-foreground">{navigator.platform}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Language</span>
              <span className="text-sm text-foreground">{navigator.language}</span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-semibold text-accent mb-1">Privacy First</h4>
                <p className="text-sm text-muted-foreground">
                  Your email is only used for premium feature recovery. 
                  We never share your information and all chats remain completely anonymous.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}