import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, X, Users, Globe, Heart, Ban } from "lucide-react";

export default function Premium() {
  const [location, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const plans = {
    weekly: { name: "Weekly", price: "$1.49", period: "per week" },
    monthly: { name: "Monthly", price: "$4.99", period: "per month" },
    yearly: { name: "Yearly", price: "$29.99", period: "per year", savings: "Save 50%" },
  };

  const handleUpgrade = () => {
    setLocation('/subscribe');
  };

  const handleClose = () => {
    setLocation('/');
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Premium Features</h2>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="space-y-4 mb-8">
        <Card className="bg-secondary border-secondary border-l-4 border-l-highlight">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-highlight" />
              <div>
                <h3 className="font-semibold text-secondary-foreground">Gender Filter</h3>
                <p className="text-sm text-muted-foreground">Choose to chat with specific genders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary border-secondary border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-success" />
              <div>
                <h3 className="font-semibold text-secondary-foreground">Location Filter</h3>
                <p className="text-sm text-muted-foreground">Connect with people from specific regions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary border-secondary border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-warning" />
              <div>
                <h3 className="font-semibold text-secondary-foreground">Interest Matching</h3>
                <p className="text-sm text-muted-foreground">Find people with similar interests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary border-secondary border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Ban className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-semibold text-secondary-foreground">Ad-Free Experience</h3>
                <p className="text-sm text-muted-foreground">Enjoy uninterrupted conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-center text-foreground">Choose Your Plan</h3>
        
        <Card 
          className={`bg-secondary border-2 cursor-pointer transition-all duration-200 ${
            selectedPlan === "weekly" ? "border-highlight" : "border-transparent hover:border-highlight"
          }`}
          onClick={() => setSelectedPlan("weekly")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-secondary-foreground">Weekly</h4>
                <p className="text-sm text-muted-foreground">Perfect for trying out</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-secondary-foreground">$1.49</p>
                <p className="text-sm text-muted-foreground">per week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-secondary border-2 cursor-pointer transition-all duration-200 relative ${
            selectedPlan === "monthly" ? "border-highlight" : "border-highlight"
          }`}
          onClick={() => setSelectedPlan("monthly")}
        >
          <div className="absolute -top-2 -right-2 bg-highlight text-highlight-foreground text-xs px-2 py-1 rounded-full">
            POPULAR
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-secondary-foreground">Monthly</h4>
                <p className="text-sm text-muted-foreground">Most popular choice</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-secondary-foreground">$4.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-secondary border-2 cursor-pointer transition-all duration-200 ${
            selectedPlan === "yearly" ? "border-highlight" : "border-transparent hover:border-success"
          }`}
          onClick={() => setSelectedPlan("yearly")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-secondary-foreground">Yearly</h4>
                <p className="text-sm text-success">Save 50%</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-secondary-foreground">$29.99</p>
                <p className="text-sm text-muted-foreground">per year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleUpgrade}
        className="w-full bg-highlight hover:bg-highlight/80 text-highlight-foreground py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade to Premium
      </Button>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        By purchasing, you agree to our Terms of Service and Privacy Policy. Auto-renewal can be turned off anytime.
      </p>
    </div>
  );
}
