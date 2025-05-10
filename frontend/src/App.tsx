
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import CampaignCreatePage from "./pages/CampaignCreatePage";
import CampaignListPage from "./pages/CampaignListPage";
import NotFound from "./pages/NotFound";

// Components
import AuthGuard from "./components/AuthGuard";
import AppLayout from "./components/AppLayout";
import CustomerIngestion from "./pages/CustomerIngestion";
import DeliveryStatus from "./pages/DeliveryStatus";
import CustomerList from "./pages/CustomerList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="/campaigns/create" element={<CampaignCreatePage />} />
            <Route path="/campaigns" element={<CampaignListPage />} />
            <Route path="/ingestion" element={<CustomerIngestion />} />
            <Route path="/status" element={<DeliveryStatus />} />
            <Route path="/ingest-customer" element={<CustomerList />} />

          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
