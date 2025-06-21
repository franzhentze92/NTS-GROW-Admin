import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
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

type AreaChartProps = {
  data: DataPoint[];
  areas: Array<{
    dataKey: string;
    stroke?: string;
    fill?: string;
    name?: string;
  }>;
  xAxisDataKey?: string;
  title?: string;
  height?: number | string;
  className?: string;
  stacked?: boolean;
};

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
  xAxisDataKey = 'name',
  height = 300,
  className,
  stacked = false,
}) => {
  // Create config for the chart
  const chartConfig = areas.reduce((acc, area) => {
    acc[area.dataKey] = {
      label: area.name || area.dataKey,
      color: area.stroke || area.fill,
    };
    return acc;
  }, {} as Record<string, { label: string; color?: string }>);

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.stroke}
            fill={area.fill}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
};

export default AreaChart;