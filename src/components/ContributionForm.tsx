import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CreditCard, Send, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ContributionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    paymentMethod: '',
    contributorName: '',
    purpose: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [contributionId, setContributionId] = useState<string | null>(null);
  const { toast } = useToast();

  const mobileMoneyProviders = [
    { id: 'mpesa', name: 'M-Pesa (Vodacom)', code: '+255' },
    { id: 'airtel', name: 'Airtel Money', code: '+255' },
    { id: 'tigopesa', name: 'Tigo Pesa', code: '+255' },
    { id: 'halopesa', name: 'Halo Pesa', code: '+255' },
    { id: 'ttcl', name: 'TTCL Pesa', code: '+255' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      console.log('Submitting payment request:', formData);

      // Call the initiate-payment API
      const { data, error } = await supabase.functions.invoke('initiate-payment', {
        body: {
          amount: parseInt(formData.amount, 10),
          phoneNumber: formData.phoneNumber,
          paymentMethod: formData.paymentMethod,
          contributorName: formData.contributorName,
          purpose: formData.purpose || null
        }
      });

      console.log('Payment response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      if (data && data.success) {
        setContributionId(data.contributionId);
        toast({
          title: "Payment Request Sent",
          description: data.message || "Payment request sent to your phone",
        });

        // Start polling for payment status
        startPaymentStatusPolling(data.contributionId);
      } else {
        throw new Error(data?.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentStatusPolling = (id: string) => {
    let pollCount = 0;
    const maxPolls = 100; // 5 minutes with 3-second intervals
    
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`Polling payment status (attempt ${pollCount})...`);

        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: { id }
        });

        if (error) {
          console.error('Status check error:', error);
          return;
        }

        console.log('Payment status:', data);

        if (data && data.status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(pollInterval);
          toast({
            title: "Payment Completed",
            description: "Your contribution has been successfully processed!",
          });
          
          // Reset form
          setFormData({
            amount: '',
            phoneNumber: '',
            paymentMethod: '',
            contributorName: '',
            purpose: ''
          });
          
          // Reset status after a delay
          setTimeout(() => {
            setPaymentStatus('idle');
            setContributionId(null);
          }, 3000);
          
        } else if (data && data.status === 'failed') {
          setPaymentStatus('failed');
          clearInterval(pollInterval);
          toast({
            title: "Payment Failed",
            description: "The payment was not completed. Please try again.",
            variant: "destructive"
          });
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          if (paymentStatus === 'processing') {
            setPaymentStatus('failed');
            toast({
              title: "Payment Timeout",
              description: "Payment verification timed out. Please check your transaction status manually.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check every 3 seconds
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <CreditCard className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return "Waiting for payment confirmation on your phone...";
      case 'completed':
        return "Payment completed successfully!";
      case 'failed':
        return "Payment failed. Please try again.";
      default:
        return "Make Contribution";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          {getStatusIcon()}
          <span className="ml-2">{getStatusMessage()}</span>
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
              disabled={isLoading || paymentStatus === 'processing'}
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
              disabled={isLoading || paymentStatus === 'processing'}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Mobile Money Provider</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
              disabled={isLoading || paymentStatus === 'processing'}
            >
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
              disabled={isLoading || paymentStatus === 'processing'}
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
              disabled={isLoading || paymentStatus === 'processing'}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            disabled={isLoading || paymentStatus === 'processing' || paymentStatus === 'completed'}
          >
            {isLoading ? (
              <>Processing...</>
            ) : paymentStatus === 'processing' ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Waiting for Confirmation
              </>
            ) : paymentStatus === 'completed' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Completed
              </>
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
            {paymentStatus === 'processing' && (
              <p className="text-yellow-600 font-medium">
                ⏳ Check your phone for the payment request
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm;
