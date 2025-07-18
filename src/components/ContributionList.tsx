
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  phone_number: string;
  payment_method: string;
  purpose: string | null;
  timestamp: string | null;
  status: string;
}

const ContributionList = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    // Fetch contributions from Supabase
    const fetchContributions = async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        setContributions(data as Contribution[]);
        setFilteredContributions(data as Contribution[]);
      } else {
        setContributions([]);
        setFilteredContributions([]);
      }
    };
    fetchContributions();
  }, []);

  useEffect(() => {
    // Filter contributions based on search term (by name or purpose)
    const filtered = contributions.filter(contribution =>
      (contribution.contributor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contribution.purpose || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContributions(filtered);
  }, [searchTerm, contributions]);

  const formatTSH = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (timestamp: string | null) => {
    return timestamp
      ? new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMobileMoneyIcon = (provider: string) => {
    return <Smartphone className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contribution History</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredContributions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No contributions found</p>
              <p className="text-sm">Make your first contribution to get started!</p>
            </div>
          ) : (
            filteredContributions.map((contribution) => (
              <Card key={contribution.id} className="border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{contribution.contributor_name}</span>
                        {getStatusIcon(contribution.status)}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatTSH(contribution.amount)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {getMobileMoneyIcon(contribution.payment_method)}
                        <span>{contribution.phone_number}</span>
                        <span>•</span>
                        <span>{formatDate(contribution.timestamp)}</span>
                      </div>
                      {contribution.purpose && (
                        <p className="text-xs text-gray-600 mt-1">{contribution.purpose}</p>
                      )}
                    </div>
                    <div className="ml-3">
                      {getStatusBadge(contribution.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionList;
