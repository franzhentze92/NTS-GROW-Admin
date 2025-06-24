import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Square } from 'lucide-react';

interface CalculatorInputs {
  systemCapacity: number;
  waterNeeds: number;
  operationHours: number;
  systemEfficiency: number;
  capacityUnit: string;
  waterNeedsUnit: string;
  operationHoursUnit: string;
  areaUnit: string;
}

const IrrigatableAreaCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    systemCapacity: 0,
    waterNeeds: 0,
    operationHours: 0,
    systemEfficiency: 0.75,
    capacityUnit: 'gpm',
    waterNeedsUnit: 'in/day',
    operationHoursUnit: 'hr',
    areaUnit: 'sq. ft',
  });

  const [result, setResult] = useState<number | null>(null);

  const handleInputChange = (field: keyof CalculatorInputs) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }
  ) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: field.includes('Unit') ? value : Number(value),
    }));
  };

  const calculateArea = () => {
    const { systemCapacity, waterNeeds, operationHours, systemEfficiency } = inputs;
    
    // Convert all units to consistent base units
    let capacityInGpm = systemCapacity;
    if (inputs.capacityUnit === 'lps') {
      capacityInGpm = systemCapacity * 15.85; // Convert L/s to GPM
    }

    let waterNeedsInInches = waterNeeds;
    if (inputs.waterNeedsUnit === 'mm/day') {
      waterNeedsInInches = waterNeeds * 0.0393701; // Convert mm to inches
    }

    let hours = operationHours;
    if (inputs.operationHoursUnit === 'min') {
      hours = operationHours / 60;
    } else if (inputs.operationHoursUnit === 'sec') {
      hours = operationHours / 3600;
    }

    // Correct formula: Area (sq ft) = (96.25 * S * hrs * E) / Wn
    const area = (96.25 * capacityInGpm * hours * systemEfficiency) / waterNeedsInInches;

    // Convert to selected area unit
    let finalArea = area;
    switch (inputs.areaUnit) {
      case 'acres':
        finalArea = area / 43560; // 1 acre = 43,560 sq ft
        break;
      case 'hectares':
        finalArea = area / 107639; // 1 hectare = 107,639 sq ft
        break;
      case 'sq. meters':
        finalArea = area * 0.092903; // 1 sq ft = 0.092903 sq meters
        break;
      case 'sq. yd':
        finalArea = area / 9; // 1 sq yd = 9 sq ft
        break;
      case 'sq. km':
        finalArea = area * 0.000000092903; // 1 sq ft = 0.000000092903 sq km
        break;
      case 'sq. mile':
        finalArea = area * 0.0000000358701; // 1 sq ft = 0.0000000358701 sq miles
        break;
    }

    setResult(finalArea);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Irrigatable Area As Limited By Water Supply</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          This calculator finds the land area that can be irrigated with a given flow of water. The minimum system capacity (supply) is the available water from the supply. The water needs is the peak crop water need during a specific time period. The available hours of operation per day is measured as the available hours for irrigation on a worst case day. The system efficiency is based on the irrigation efficiency and distribution uniformity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="systemCapacity">Minimum System Capacity (Supply)</Label>
            <Input
              id="systemCapacity"
              type="number"
              value={inputs.systemCapacity}
              onChange={(e) => {
                setInputs(prev => ({ ...prev, systemCapacity: Number(e.target.value) }));
                calculateArea();
              }}
              onBlur={calculateArea}
            />
          </div>
          <div>
            <Label htmlFor="capacityUnit">Capacity Unit</Label>
            <Select value={inputs.capacityUnit} onValueChange={(value) => {
              setInputs(prev => ({ ...prev, capacityUnit: value }));
              calculateArea();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpm">GPM</SelectItem>
                <SelectItem value="lps">LPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="waterNeeds">Water Needs</Label>
            <Input
              id="waterNeeds"
              type="number"
              value={inputs.waterNeeds}
              onChange={(e) => {
                setInputs(prev => ({ ...prev, waterNeeds: Number(e.target.value) }));
                calculateArea();
              }}
              onBlur={calculateArea}
            />
          </div>
          <div>
            <Label htmlFor="waterNeedsUnit">Water Needs Unit</Label>
            <Select value={inputs.waterNeedsUnit} onValueChange={(value) => {
              setInputs(prev => ({ ...prev, waterNeedsUnit: value }));
              calculateArea();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in/day">inches/day</SelectItem>
                <SelectItem value="mm/day">mm/day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="operationHours">Operation Hours Per Day</Label>
            <Input
              id="operationHours"
              type="number"
              value={inputs.operationHours}
              onChange={(e) => {
                setInputs(prev => ({ ...prev, operationHours: Number(e.target.value) }));
                calculateArea();
              }}
              onBlur={calculateArea}
            />
          </div>
          <div>
            <Label htmlFor="operationHoursUnit">Time Unit</Label>
            <Select value={inputs.operationHoursUnit} onValueChange={(value) => {
              setInputs(prev => ({ ...prev, operationHoursUnit: value }));
              calculateArea();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">Hours</SelectItem>
                <SelectItem value="min">Minutes</SelectItem>
                <SelectItem value="sec">Seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="systemEfficiency">System Efficiency (%)</Label>
            <Input
              id="systemEfficiency"
              type="number"
              value={inputs.systemEfficiency * 100}
              onChange={(e) => {
                setInputs(prev => ({ ...prev, systemEfficiency: Number(e.target.value) / 100 }));
                calculateArea();
              }}
              onBlur={calculateArea}
            />
          </div>
          <div>
            <Label htmlFor="areaUnit">Area Unit</Label>
            <Select value={inputs.areaUnit} onValueChange={(value) => {
              setInputs(prev => ({ ...prev, areaUnit: value }));
              calculateArea();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sq. ft">Square Feet</SelectItem>
                <SelectItem value="acres">Acres</SelectItem>
                <SelectItem value="hectares">Hectares</SelectItem>
                <SelectItem value="sq. meters">Square Meters</SelectItem>
                <SelectItem value="sq. yd">Square Yards</SelectItem>
                <SelectItem value="sq. km">Square Kilometers</SelectItem>
                <SelectItem value="sq. mile">Square Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Calculated Irrigatable Area:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result.toFixed(2)} {inputs.areaUnit}
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          Area (sq ft) = (96.25 × System Capacity × Operation Hours × System Efficiency) ÷ Water Needs
        </p>
      </div>
    </div>
  );
};

export default IrrigatableAreaCalculator; 