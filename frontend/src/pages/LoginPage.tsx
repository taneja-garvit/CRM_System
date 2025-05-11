import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const backend = import.meta.env.VITE_BACKEND_URL;


  // Check for token in URL after Google OAuth redirect
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/campaigns/create');
    }
  }, [location, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = `${backend}/api/auth/google`;
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-crm-background px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-crm-darkPurple">SegmentSpark CRM</CardTitle>
          <CardDescription>Sign in to access your campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full bg-crm-purple hover:bg-crm-darkPurple text-white h-12"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader size="small" className="mr-2" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <span>Login with Google</span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground flex justify-center">
          <p>Secure login powered by Google OAuth 2.0</p>
        </CardFooter>
      </Card>
    </div>
  );
}