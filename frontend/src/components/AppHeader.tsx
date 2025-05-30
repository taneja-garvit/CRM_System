import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('auth_token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-gray-700 bg-gray-900">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-100">SegmentSpark CRM</h1>
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link
                to="/campaigns/create"
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute('/campaigns/create')
                    ? 'text-crm-purple'
                    : 'text-gray-300 hover:text-crm-purple'
                }`}
              >
                Create Campaign
              </Link>
              <Link
                to="/campaigns/history"
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute('/campaigns/history')
                    ? 'text-crm-purple'
                    : 'text-gray-300 hover:text-crm-purple'
                }`}
              >
                Campaign History
              </Link>
              <Link
                to="/ingestion"
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute('/ingestion')
                    ? 'text-crm-purple'
                    : 'text-gray-300 hover:text-crm-purple'
                }`}
              >
                Customer Ingestion
              </Link>
              <Link
                to="/ingest-customer"
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute('/ingest-customer')
                    ? 'text-crm-purple'
                    : 'text-gray-300 hover:text-crm-purple'
                }`}
              >
                Customers List
              </Link>
              <Link
                to="/status"
                className={`text-sm font-medium transition-colors ${
                  isActiveRoute('/status')
                    ? 'text-crm-purple'
                    : 'text-gray-300 hover:text-crm-purple'
                }`}
              >
                Delivery Status
              </Link>
            </nav>
          )}
        </div>
        {isLoggedIn && (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-gray-100"
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}