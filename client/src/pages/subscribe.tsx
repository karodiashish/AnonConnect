import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { ArrowLeft, Lock, Shield, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Subscribe() {
  const [location, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId") || crypto.randomUUID();
    sessionStorage.setItem("sessionId", sessionId);

    apiRequest("POST", "/api/create-subscription", {}, {
      "x-session-id": sessionId,
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to create subscription",
          variant: "destructive",
        });
      });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to premium features!",
      });
      setLocation('/');
    }

    setIsProcessing(false);
  };

  const handleBack = () => {
    setLocation('/premium');
  };

  if (!clientSecret) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Payment</h2>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
      
      <Card className="bg-secondary border-secondary mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 text-secondary-foreground">Selected Plan</h3>
          <div className="flex items-center justify-between">
            <span className="text-secondary-foreground">Monthly Premium</span>
            <span className="text-xl font-bold text-secondary-foreground">$4.99</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Includes all premium features</p>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-foreground">Payment Details</h3>
        <Card className="bg-secondary border-secondary">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit}>
              <PaymentElement />
              <Button 
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-success hover:bg-success/80 text-success-foreground py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 mt-6"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-accent/20 border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-success">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Secure Payment</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your payment information is encrypted and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
