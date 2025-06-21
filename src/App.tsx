import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import { WebTrafficPage, FinancialAnalysisPage, TaskCalendarPage } from "@/pages/UpdatedPages";
import MonthlyStrategiesPage from "@/pages/MonthlyStrategiesPage";
import InboxPage from "@/pages/InboxPage";
import NotFound from "@/pages/NotFound";
import TaskManagementPage from "@/pages/TaskManagementPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/traffic" element={<WebTrafficPage />} />
                <Route path="/financial" element={<FinancialAnalysisPage />} />
                <Route path="/tasks" element={<TaskCalendarPage />} />
                <Route path="/task-management" element={<TaskManagementPage />} />
                <Route path="/strategies" element={<MonthlyStrategiesPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;