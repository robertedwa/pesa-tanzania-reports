
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContributionForm from "@/components/ContributionForm";
import ContributionList from "@/components/ContributionList";
import ReportsSection from "@/components/ReportsSection";
import DashboardStats from "@/components/DashboardStats";
import { Smartphone, Users, TrendingUp, FileText } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Mchango</h1>
          </div>
          <p className="text-sm text-gray-600">Community Money Contribution Platform</p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="text-xs">
              <TrendingUp className="w-4 h-4 mb-1" />
              Home
            </TabsTrigger>
            <TabsTrigger value="contribute" className="text-xs">
              <Smartphone className="w-4 h-4 mb-1" />
              Pay
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Users className="w-4 h-4 mb-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">
              <FileText className="w-4 h-4 mb-1" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardStats />
          </TabsContent>

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

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Supporting Tanzanian Communities 🇹🇿</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
