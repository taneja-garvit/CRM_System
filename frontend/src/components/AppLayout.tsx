
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import { useToast } from "@/hooks/use-toast";

export default function AppLayout() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
    </div>
  );
}
