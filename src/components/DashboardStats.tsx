
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

const DashboardStats = () => {
  // Mock data - in real app this would come from backend
  const stats = {
    totalContributions: 2450000,
    totalMembers: 156,
    monthlyTarget: 3000000,
    currentProgress: 81.7
  };

  const formatTSH = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Total Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTSH(stats.totalContributions)}</div>
          <p className="text-green-100 text-xs">This month</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-gray-500">Active contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-orange-500" />
              Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatTSH(stats.monthlyTarget)}</div>
            <p className="text-xs text-gray-500">Monthly goal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
            Monthly Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={stats.currentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{stats.currentProgress}% completed</span>
            <span>{formatTSH(stats.monthlyTarget - stats.totalContributions)} remaining</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-blue-800">Quick Tip</h3>
            <p className="text-sm text-blue-600">
              Set up automatic monthly contributions to never miss a payment!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
