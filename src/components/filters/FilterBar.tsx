import React from 'react';
import DateRangeFilter from './DateRangeFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type FilterOption = {
  label: string;
  value: string;
};

type FilterBarProps = {
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onCategoryChange?: (category: string) => void;
  onSearchChange?: (search: string) => void;
  categories?: FilterOption[];
  showDateFilter?: boolean;
  showCategoryFilter?: boolean;
  showSearch?: boolean;
  className?: string;
};

const FilterBar: React.FC<FilterBarProps> = ({
  onDateRangeChange,
  onCategoryChange,
  onSearchChange,
  categories = [],
  showDateFilter = true,
  showCategoryFilter = true,
  showSearch = true,
  className,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 mb-6 ${className}`}>
      {showDateFilter && onDateRangeChange && (
        <DateRangeFilter onRangeChange={onDateRangeChange} />
      )}
      
      {showCategoryFilter && onCategoryChange && categories.length > 0 && (
        <Select onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {showSearch && onSearchChange && (
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;