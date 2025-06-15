
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!isLogin && !formData.name.trim()) {
      toast({
        title: "Jina linahitajika",
        description: "Tafadhali ingiza jina lako kamili",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: "Barua pepe si sahihi",
        description: "Tafadhali ingiza barua pepe sahihi",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin && (!formData.phone.trim() || formData.phone.length < 10)) {
      toast({
        title: "Nambari ya simu si sahihi",
        description: "Tafadhali ingiza nambari ya simu sahihi",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Nywila ni fupi",
        description: "Nywila lazima iwe na angalau herufi 6",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Nywila hazifanani",
        description: "Tafadhali hakikisha nywila zinafanana",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: isLogin ? "Umeingia kikamilifu!" : "Umejiandikisha kikamilifu!",
        description: isLogin ? "Karibu tena kwenye Mchango" : "Akaunti yako imetengenezwa kikamilifu",
      });

      // Here you would typically handle the authentication
      console.log('Auth data:', formData);
      
    } catch (error) {
      toast({
        title: "Hitilafu imetokea",
        description: "Tafadhali jaribu tena baadaye",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Mchango</h1>
          </div>
          <p className="text-gray-600">
            {isLogin ? "Karibu tena!" : "Jiunge na jamii yetu"}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl font-semibold">
              {isLogin ? "Ingia Akaunti" : "Tengeneza Akaunti"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Jina Kamili
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ingiza jina lako kamili"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Barua Pepe
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="mfano@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone field for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Nambari ya Simu
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+255 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Nywila
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingiza nywila"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Thibitisha Nywila
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Rudia nywila"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? "Inaingia..." : "Inajiandikisha..."}</span>
                  </div>
                ) : (
                  isLogin ? "Ingia" : "Jiandikishe"
                )}
              </Button>
            </form>

            {/* Toggle between login and register */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {isLogin ? "Huna akaunti?" : "Una akaunti tayari?"}
                <button
                  onClick={toggleAuthMode}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  disabled={isLoading}
                >
                  {isLogin ? "Jiandikishe" : "Ingia"}
                </button>
              </p>
            </div>

            {/* Forgot Password for login */}
            {isLogin && (
              <div className="text-center">
                <button
                  onClick={() => toast({
                    title: "Rudisha Nywila",
                    description: "Funguo za kurejesha nywila zimetumwa kwenye barua pepe yako"
                  })}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Umesahau nywila?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Mchango - Mkusanyiko wa Fedha wa Kikundi 🇹🇿</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
