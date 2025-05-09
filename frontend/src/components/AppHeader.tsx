
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AppHeader() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('auth_token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-crm-darkPurple">SegmentSpark CRM</h1>
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <a 
                href="/campaigns/create" 
                className="text-sm font-medium transition-colors hover:text-crm-purple"
              >
                Create Campaign
              </a>
              <a 
                href="/campaigns" 
                className="text-sm font-medium transition-colors hover:text-crm-purple"
              >
                Campaign History
              </a>
              <a 
                href="/ingestion" 
                className="text-sm font-medium transition-colors hover:text-crm-purple"
              >
                Customer Ingestion
              </a>
              <a 
                href="/status" 
                className="text-sm font-medium transition-colors hover:text-crm-purple"
              >
                Delivery Status
              </a>
            </nav>
          )}
        </div>
        {isLoggedIn && (
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
