
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContributionForm from '@/components/ContributionForm';
import ContributionList from '@/components/ContributionList';
import ReportsSection from '@/components/ReportsSection';

import { Button } from "@/components/ui/button";
import { LogOut, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Umetoka kikamilifu",
      description: "Karibu tena kwenye Mchango"
    });
    // In a real app, this would handle actual logout
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mchango</h1>
                <p className="text-sm text-gray-600">Mkusanyiko wa Fedha wa Kikundi</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Toka</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">

          {/* Main Tabs */}
          <Tabs defaultValue="contribute" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contribute">Changia</TabsTrigger>
              <TabsTrigger value="history">Historia</TabsTrigger>
              <TabsTrigger value="reports">Ripoti</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contribute" className="space-y-4">
              <ContributionForm />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <ContributionList />
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <ReportsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Mchango - Mkusanyiko wa Fedha wa Kikundi 🇹🇿</p>
            <p className="mt-1">Usalama wa malipo kwa njia ya simu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
