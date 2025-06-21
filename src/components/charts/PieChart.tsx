import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type DataPoint = {
  name: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  data: DataPoint[];
  dataKey?: string;
  nameKey?: string;
  title?: string;
  height?: number | string;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
};

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  className,
  innerRadius = 0,
  outerRadius = 80,
  colors = DEFAULT_COLORS,
}) => {
  // Create config for the chart
  const chartConfig = data.reduce((acc, entry, index) => {
    acc[entry.name] = {
      label: entry.name,
      color: entry.color || colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};

export default PieChart;
