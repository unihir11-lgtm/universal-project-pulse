import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/universal-software-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const handleCompanyClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#0C2B56] to-[#1a4d7a] p-4">
      <div className="text-center w-full max-w-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Select Your Company</h1>
        
        <Card 
          onClick={handleCompanyClick}
          className="w-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white border-0"
        >
          <CardContent className="p-6 md:p-8 flex flex-col items-center gap-3 md:gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#0A2540] to-[#0C2B56] flex items-center justify-center">
              <img 
                src={logo} 
                alt="Universal Software Logo" 
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-semibold text-[#0C2B56]">Universal Software</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Project Tracking System</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
