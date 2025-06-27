
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIStatus {
  network: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

const MobileMoneyAPI: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { network: 'Vodacom M-Pesa', status: 'connected', lastSync: new Date().toISOString() },
    { network: 'Airtel Money', status: 'connected', lastSync: new Date().toISOString() },
    { network: 'Tigo Pesa', status: 'disconnected', lastSync: new Date(Date.now() - 3600000).toISOString() },
    { network: 'HaloPesa', status: 'connected', lastSync: new Date().toISOString() }
  ]);

  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    toast({
      title: isLive ? 'API Disabled' : 'API Enabled',
      description: isLive ? 'App is now in demo mode' : 'App is now live with mobile money integration'
    });
  };

  const syncNetwork = (networkIndex: number) => {
    const newStatuses = [...apiStatuses];
    newStatuses[networkIndex] = {
      ...newStatuses[networkIndex],
      status: 'connected',
      lastSync: new Date().toISOString()
    };
    setApiStatuses(newStatuses);
    toast({ title: 'Success', description: `${newStatuses[networkIndex].network} synced successfully` });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <Smartphone className="h-5 w-5" />
            Mobile Money API
          </div>
          <Button
            onClick={toggleLiveMode}
            variant={isLive ? 'destructive' : 'default'}
            size="sm"
            className={isLive ? '' : 'bg-green-600 hover:bg-green-700'}
          >
            {isLive ? 'Disable' : 'Go Live'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {isLive ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Live Mode Active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Demo Mode</span>
              </>
            )}
          </div>
          
          <div className="space-y-3">
            {apiStatuses.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{api.network}</span>
                    <Badge className={getStatusColor(api.status)}>
                      {api.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last sync: {new Date(api.lastSync).toLocaleString()}
                  </div>
                </div>
                {api.status !== 'connected' && (
                  <Button
                    onClick={() => syncNetwork(index)}
                    size="sm"
                    variant="outline"
                  >
                    Sync
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileMoneyAPI;
