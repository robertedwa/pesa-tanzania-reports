
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CreditCard, Send } from "lucide-react";

const ContributionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    paymentMethod: '',
    contributorName: '',
    purpose: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mobileMoneyProviders = [
    { id: 'mpesa', name: 'M-Pesa (Vodacom)', code: '+255' },
    { id: 'tigopesa', name: 'Tigo Pesa', code: '+255' },
    { id: 'airtel', name: 'Airtel Money', code: '+255' },
    { id: 'halopesa', name: 'Halo Pesa', code: '+255' },
    { id: 'ttcl', name: 'TTCL Pesa', code: '+255' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to process mobile money payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store contribution locally (in real app, this would go to backend)
      const contribution = {
        id: Date.now().toString(),
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      const existingContributions = JSON.parse(localStorage.getItem('contributions') || '[]');
      existingContributions.push(contribution);
      localStorage.setItem('contributions', JSON.stringify(existingContributions));

      toast({
        title: "Payment Initiated",
        description: `Payment request sent to ${formData.phoneNumber}. Please complete the transaction on your phone.`,
      });

      // Reset form
      setFormData({
        amount: '',
        phoneNumber: '',
        paymentMethod: '',
        contributorName: '',
        purpose: ''
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CreditCard className="w-5 h-5 mr-2 text-green-600" />
          Make Contribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contributorName">Your Name</Label>
            <Input
              id="contributorName"
              value={formData.contributorName}
              onChange={(e) => setFormData({...formData, contributorName: e.target.value})}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (TZS)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Enter amount in Tanzanian Shillings"
              min="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Mobile Money Provider</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select your mobile money provider" />
              </SelectTrigger>
              <SelectContent>
                {mobileMoneyProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      {provider.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="e.g., 0755123456"
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="Brief description of the contribution purpose"
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Payment Request
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>🔒 Secure mobile money transaction</p>
            <p>You will receive a payment prompt on your phone</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm;
