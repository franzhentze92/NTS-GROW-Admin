import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import AreaChart from '@/components/charts/AreaChart';
import DonutChart from '@/components/charts/DonutChart';
import FilterBar from '@/components/filters/FilterBar';
import TaskCalendar from '@/components/TaskCalendar';
import { format, subDays } from 'date-fns';

// Re-export WebTrafficPage from the dedicated file
export { default as WebTrafficPage } from './WebTrafficAnalyticsPage';

// Re-export FinancialAnalysisPage from the dedicated file
export { default as FinancialAnalysisPage } from './FinancialAnalysisPage';

// Re-export TaskCalendarPage from the dedicated file
export { default as TaskCalendarPage } from './TaskCalendarPage';
