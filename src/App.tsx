import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import WebTrafficAnalyticsPage from "@/pages/WebTrafficAnalyticsPage";
import { 
  FinancialAnalysisPage, 
  MonthlyStrategiesPage, 
  StrategyManagementPage,
  TaskCalendarPage
} from "@/pages/UpdatedPages";
import InboxPage from "@/pages/InboxPage";
import NotFound from "@/pages/NotFound";
import TaskManagementPage from "@/pages/TaskManagementPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ProfilePage from "@/pages/ProfilePage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import GManChatPage from "@/pages/GManChatPage";
import EnterAnalysisPage from "@/pages/EnterAnalysisPage";
import AnalysisReportsPage from '@/pages/AnalysisReportsPage';
import ChatPage from "@/pages/ChatPage";
import SatelliteImageryPage from "@/pages/SatelliteImageryPage";
import WeatherPage from "@/pages/WeatherPage";
import GeneralWeatherPage from "@/pages/GeneralWeatherPage";
import FieldVisitsPage from "@/pages/FieldVisitsPage";
import FieldVisitAnalyticsPage from "@/pages/FieldVisitAnalyticsPage";
import IrrigationCalculatorPage from "@/pages/IrrigationCalculatorPage";
import NTSProductRecommendatorPage from "@/pages/NTSProductRecommendatorPage";
import GrowingDegreeDaysPage from '@/pages/GrowingDegreeDaysPage';
import CropHealth from "@/components/satellite/CropHealth";
import { useEffect } from 'react';

// Create a client
const queryClient = new QueryClient();

// Configure React Router future flags to suppress deprecation warnings
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function App() {
  useEffect(() => {
    // This effect runs once on app startup to clean up old data formats.
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        // If the ID is a number, it's the old format.
        if (typeof user.id === 'number') {
          console.log('Old user data format detected. Clearing localStorage.');
          localStorage.removeItem('currentUser');
          // Optional: force a reload to ensure the user is logged out.
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router {...router}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  {/* Legacy routes - keeping for backward compatibility */}
                  <Route index element={<DashboardPage />} />
                  <Route path="/web-traffic" element={<WebTrafficAnalyticsPage />} />
                  <Route path="/financial" element={<FinancialAnalysisPage />} />
                  <Route path="/task-management" element={<TaskManagementPage />} />
                  <Route path="/task-calendar" element={<TaskCalendarPage />} />
                  <Route path="/monthly-strategies" element={<MonthlyStrategiesPage />} />
                  <Route path="/strategy-management" element={<StrategyManagementPage />} />
                  <Route path="/inbox" element={<InboxPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* G.R.O.W Agronomist Routes */}
                  <Route path="/agronomist/soil/create-chart" element={<ComingSoonPage title="Create Soil Chart" description="Create detailed soil analysis charts for agricultural planning." />} />
                  <Route path="/agronomist/soil/create-report" element={<ComingSoonPage title="Create Soil Report" description="Generate comprehensive soil analysis reports." />} />
                  <Route path="/agronomist/soil/reports" element={<ComingSoonPage title="View Saved Reports" description="Access and review previously created soil analysis reports." />} />
                  <Route path="/agronomist/plant/create-chart" element={<ComingSoonPage title="Create Leaf Chart" description="Create detailed leaf analysis charts for plant health assessment." />} />
                  <Route path="/agronomist/plant/create-report" element={<ComingSoonPage title="Create Leaf Report" description="Generate comprehensive leaf analysis reports." />} />
                  <Route path="/agronomist/plant/reports" element={<ComingSoonPage title="View Saved Reports" description="Access and review previously created leaf analysis reports." />} />
                  <Route path="/agronomist/analysis/enter" element={<EnterAnalysisPage />} />
                  <Route path="/agronomist/analysis/reports" element={<AnalysisReportsPage />} />
                  <Route path="/agronomist/chat" element={<ChatPage />} />
                  
                  {/* Satellite Imagery Routes */}
                  <Route path="/agronomist/satellite/crop-health" element={<CropHealth />} />
                  <Route path="/agronomist/satellite/weather" element={<WeatherPage />} />
                  <Route path="/agronomist/weather" element={<GeneralWeatherPage />} />

                  {/* G.R.O.W Smart Tools Routes */}
                  <Route path="/agronomist/smart-tools/irrigation/calculation" element={<IrrigationCalculatorPage />} />
                  <Route path="/agronomist/smart-tools/crop-nutrition/recommendator" element={<NTSProductRecommendatorPage />} />
                  <Route path="/agronomist/smart-tools/crop-protection/gdd" element={<GrowingDegreeDaysPage />} />

                  <Route path="/agronomist/inbox" element={<ComingSoonPage title="G.R.O.W Messaging" description="Access your G.R.O.W messaging inbox." />} />
                  <Route path="/agronomist/fertiliser-prices" element={<ComingSoonPage title="Fertiliser Prices" description="Current market prices and trends for fertilisers." />} />
                  <Route path="/agronomist/documents" element={<DocumentsPage />} />
                  <Route path="/agronomist/crop-nutrition" element={<ComingSoonPage title="Crop Nutrition Thresholds" description="Monitor and manage crop nutrition thresholds and guidelines." />} />

                  {/* G.R.O.W Admin Routes */}
                  <Route path="/admin/overview" element={<DashboardPage />} />
                  <Route path="/admin/web-traffic" element={<WebTrafficAnalyticsPage />} />
                  <Route path="/admin/financial" element={<FinancialAnalysisPage />} />
                  <Route path="/admin/task-calendar" element={<TaskCalendarPage />} />
                  <Route path="/admin/monthly-strategies" element={<MonthlyStrategiesPage />} />
                  <Route path="/admin/inbox" element={<InboxPage />} />

                  {/* G.R.O.W Super Admin Routes */}
                  <Route path="/super-admin/task-management" element={<TaskManagementPage />} />
                  <Route path="/super-admin/strategy-management" element={<StrategyManagementPage />} />
                  <Route path="/super-admin/cost-management" element={<ComingSoonPage title="Cost Management" description="Manage and track operational costs and budgets." />} />
                  <Route path="/super-admin/income-management" element={<ComingSoonPage title="Income Management" description="Track and manage income streams and revenue." />} />

                  {/* G.R.O.W Agronomist Field Visit Routes */}
                  <Route path="/agronomist/field-visits" element={<FieldVisitsPage />} />
                  <Route path="/agronomist/field-visits/analytics" element={<FieldVisitAnalyticsPage />} />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;