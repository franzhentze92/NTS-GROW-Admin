import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  change,
  icon,
  className,
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {change && (
              <span className={`mr-1 flex items-center ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : ''}`}>
                {isPositive && <ArrowUpIcon className="h-3 w-3 mr-1" />}
                {isNegative && <ArrowDownIcon className="h-3 w-3 mr-1" />}
                {Math.abs(change)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;