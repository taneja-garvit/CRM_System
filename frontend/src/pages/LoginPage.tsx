import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const backend = import.meta.env.VITE_BACKEND_URL;

  const handleGoogleLogin = () => {
    setIsLoading(true);

    // Open a popup window for Google OAuth
    const width = 600;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const popup = window.open(
      `${backend}/api/auth/google`,
      "Google OAuth",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Listen for messages from the popup
    const handleMessage = (event) => {
      // Ensure the message is from the expected origin (backend)
      if (event.origin !== backend) return;

      const { success, token, error } = event.data;

      if (error) {
        toast({
          title: "Authentication failed",
          description: error || "Please try again later",
          variant: "destructive",
        });
        setIsLoading(false);
        popup?.close();
        return;
      }

      if (success && token) {
        localStorage.setItem('auth_token', token);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/campaigns/create');
        setIsLoading(false);
        popup?.close();
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener when popup closes
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);
        if (isLoading) {
          setIsLoading(false);
          toast({
            title: "Authentication cancelled",
            description: "Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 500);
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
             <img 
                  className="h-5 w-5"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                />
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