import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const netWaterUnits = [
  { label: 'mm', value: 'mm' },
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' },
];
const areaUnits = [
  { label: 'acres', value: 'acres' },
  { label: 'sq. in.', value: 'sqin' },
  { label: 'sq. ft.', value: 'sqft' },
  { label: 'hectares', value: 'hectares' },
  { label: 'sq. cm.', value: 'sqcm' },
  { label: 'sq. meters', value: 'sqm' },
  { label: 'sq. mile', value: 'sqmile' },
];
const flowRateUnits = [
  { label: 'lps', value: 'lps' },
  { label: 'lpm', value: 'lpm' },
  { label: 'lph', value: 'lph' },
  { label: 'gpm', value: 'gpm' },
  { label: 'gph', value: 'gph' },
  { label: 'gpd', value: 'gpd' },
  { label: 'cfs', value: 'cfs' },
  { label: 'cfm', value: 'cfm' },
  { label: 'cu. m/hr', value: 'cumhr' },
  { label: 'cu. yd/min', value: 'cuym' },
  { label: 'mgd', value: 'mgd' },
  { label: 'acre-in/day', value: 'acreinday' },
  { label: 'acre-in/hr', value: 'acreinhr' },
  { label: 'acre-ft/day', value: 'acrefday' },
  { label: 'cms', value: 'cms' },
];
const setTimeUnits = [
  { label: 'hr', value: 'hr' },
  { label: 'min', value: 'min' },
];

function convertNetWaterToInches(value: number, unit: string): number {
  switch (unit) {
    case 'mm': return value * 0.0393701;
    case 'cm': return value * 0.393701;
    case 'in': return value;
    default: return value;
  }
}
function convertAreaToAcres(value: number, unit: string): number {
  switch (unit) {
    case 'acres': return value;
    case 'sqin': return value / 6272640;
    case 'sqft': return value / 43560;
    case 'hectares': return value * 2.47105;
    case 'sqcm': return value / 40468564.224;
    case 'sqm': return value / 4046.86;
    case 'sqmile': return value * 640;
    default: return value;
  }
}
function convertFlowRateToGpm(value: number, unit: string): number {
  switch (unit) {
    case 'gpm': return value;
    case 'lps': return value * 15.8503;
    case 'lpm': return value * 0.264172;
    case 'lph': return value * 0.00440287;
    case 'gph': return value / 60;
    case 'gpd': return value / 1440;
    case 'cfs': return value * 448.831;
    case 'cfm': return value * 7.48052;
    case 'cumhr': return value * 4.40287;
    case 'cuym': return value * 201.974;
    case 'mgd': return value * 694.444;
    case 'acreinday': return value * 27154;
    case 'acreinhr': return value * 651696;
    case 'acrefday': return value * 271540;
    case 'cms': return value * 15850.3;
    default: return value;
  }
}

const IrrigationTimesCalculator = () => {
  const [inputs, setInputs] = useState({
    netWater: 0,
    netWaterUnit: 'mm',
    systemEfficiency: 80,
    irrigatedArea: 0,
    areaUnit: 'acres',
    flowRate: 0,
    flowRateUnit: 'gpm',
    setTimeUnit: 'hr',
  });
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    calculateSetTime();
  }, [inputs]);

  const calculateSetTime = () => {
    const netWaterInches = convertNetWaterToInches(inputs.netWater, inputs.netWaterUnit);
    const areaAcres = convertAreaToAcres(inputs.irrigatedArea, inputs.areaUnit);
    const flowGpm = convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit);
    const efficiency = inputs.systemEfficiency / 100;
    if (netWaterInches <= 0 || areaAcres <= 0 || flowGpm <= 0 || efficiency <= 0) {
      setResult(null);
      return;
    }
    let setTimeHr = (netWaterInches * areaAcres * 43560) / (96.3 * flowGpm * efficiency);
    let finalTime = setTimeHr;
    if (inputs.setTimeUnit === 'min') {
      finalTime = setTimeHr * 60;
    }
    setResult(finalTime);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Set Irrigation Times</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Use this form to determine the set time required to fulfill a given water application, irrigation area, and flow rate.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="netWater">Net Water Application</Label>
            <Input
              id="netWater"
              type="number"
              value={inputs.netWater}
              onChange={e => setInputs(prev => ({ ...prev, netWater: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="netWaterUnit">Unit</Label>
            <Select value={inputs.netWaterUnit} onValueChange={value => setInputs(prev => ({ ...prev, netWaterUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {netWaterUnits.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
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
              value={inputs.systemEfficiency}
              onChange={e => setInputs(prev => ({ ...prev, systemEfficiency: Number(e.target.value) }))}
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="irrigatedArea">Irrigated Area</Label>
            <Input
              id="irrigatedArea"
              type="number"
              value={inputs.irrigatedArea}
              onChange={e => setInputs(prev => ({ ...prev, irrigatedArea: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="areaUnit">Area Unit</Label>
            <Select value={inputs.areaUnit} onValueChange={value => setInputs(prev => ({ ...prev, areaUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areaUnits.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="flowRate">Flow Rate</Label>
            <Input
              id="flowRate"
              type="number"
              value={inputs.flowRate}
              onChange={e => setInputs(prev => ({ ...prev, flowRate: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="flowRateUnit">Flow Rate Unit</Label>
            <Select value={inputs.flowRateUnit} onValueChange={value => setInputs(prev => ({ ...prev, flowRateUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flowRateUnits.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="setTimeUnit">Set Time Unit</Label>
            <Select value={inputs.setTimeUnit} onValueChange={value => setInputs(prev => ({ ...prev, setTimeUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setTimeUnits.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Set Time:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result.toFixed(2)} {inputs.setTimeUnit}
          </p>
        </div>
      )}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          Set Time = (Net Water × Area × 43,560) / (96.3 × Flow Rate × Efficiency)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: Net Water is in inches, Area is in acres, Flow Rate is in GPM, Efficiency is decimal
        </p>
      </div>
    </div>
  );
};

export default IrrigationTimesCalculator; 