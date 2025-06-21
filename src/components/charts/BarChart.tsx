import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type DataPoint = {
  name: string;
  [key: string]: string | number;
};

type BarChartProps = {
  data: DataPoint[];
  bars: Array<{
    dataKey: string;
    fill?: string;
    name?: string;
  }>;
  xAxisDataKey?: string;
  title?: string;
  height?: number | string;
  className?: string;
  stacked?: boolean;
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisDataKey = 'name',
  height = 300,
  className,
  stacked = false,
}) => {
  // Create config for the chart
  const chartConfig = bars.reduce((acc, bar) => {
    acc[bar.dataKey] = {
      label: bar.name || bar.dataKey,
      color: bar.fill,
    };
    return acc;
  }, {} as Record<string, { label: string; color?: string }>);

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.fill}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

export default BarChart;
