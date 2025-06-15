
import React from "react";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex flex-col items-center justify-between">
      {/* Header */}
      <header className="w-full py-6 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center space-x-4 px-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mchango</h1>
        </div>
      </header>
      
      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Karibu kwenye Mchango</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-lg">
          Jukwaa rahisi na salama la kukusanya na kusimamia michango ya fedha kwa vikundi vya kijamii Tanzania. Anzisha, changia, na angalia ripoti kwa urahisi na usalama!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            onClick={() => navigate("/auth")}
          >
            Ingia / Jiunge
          </Button>
          <Button variant="outline" className="px-8 py-3 text-base font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center bg-white border-t text-gray-500 text-sm w-full">
        <p>Mchango - Mkusanyiko wa Fedha wa Kikundi 🇹🇿</p>
        <p className="mt-1">Salama. Rahisi. Kwa jamii.</p>
      </footer>
    </div>
  );
};

export default Home;
