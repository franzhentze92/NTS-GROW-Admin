import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets } from 'lucide-react';

const flowRateUnits = [
  { label: 'gpm', value: 'gpm' },
  { label: 'lps', value: 'lps' },
  { label: 'gph', value: 'gph' },
  { label: 'lph', value: 'lph' },
];

const areaUnits = [
  { label: 'sq. ft', value: 'sqft' },
  { label: 'acres', value: 'acres' },
  { label: 'hectares', value: 'hectares' },
  { label: 'sq. meters', value: 'sqm' },
  { label: 'sq. yd', value: 'sqyd' },
];

const appRateUnits = [
  { label: 'in/hr', value: 'inhr' },
  { label: 'mm/hr', value: 'mmhr' },
  { label: 'cm/hr', value: 'cmhr' },
  { label: 'in/day', value: 'inday' },
  { label: 'mm/day', value: 'mmday' },
  { label: 'cm/day', value: 'cmday' },
];

const WaterApplicationRateCalculator = () => {
  const [flowRate, setFlowRate] = useState('');
  const [flowRateUnit, setFlowRateUnit] = useState(flowRateUnits[0].value);
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState(areaUnits[0].value);
  const [appRateUnit, setAppRateUnit] = useState(appRateUnits[0].value);
  const [result, setResult] = useState<number | null>(null);

  const calculateApplicationRate = () => {
    if (!flowRate || !area || Number(flowRate) <= 0 || Number(area) <= 0) {
      setResult(null);
      return;
    }

    // Convert flow rate to GPM
    let flowRateInGpm = Number(flowRate);
    switch (flowRateUnit) {
      case 'lps':
        flowRateInGpm = Number(flowRate) * 15.85; // Convert L/s to GPM
        break;
      case 'gph':
        flowRateInGpm = Number(flowRate) / 60; // Convert GPH to GPM
        break;
      case 'lph':
        flowRateInGpm = (Number(flowRate) * 15.85) / 60; // Convert LPH to GPM
        break;
    }

    // Convert area to square feet
    let areaInSqFt = Number(area);
    switch (areaUnit) {
      case 'acres':
        areaInSqFt = Number(area) * 43560; // Convert acres to sq ft
        break;
      case 'hectares':
        areaInSqFt = Number(area) * 107639; // Convert hectares to sq ft
        break;
      case 'sqm':
        areaInSqFt = Number(area) * 10.764; // Convert sq meters to sq ft
        break;
      case 'sqyd':
        areaInSqFt = Number(area) * 9; // Convert sq yards to sq ft
        break;
    }

    // Calculate application rate in inches per hour
    const appRateInInHr = (96.25 * flowRateInGpm) / areaInSqFt;

    // Convert to selected unit
    let finalResult = appRateInInHr;
    switch (appRateUnit) {
      case 'mmhr':
        finalResult = appRateInInHr * 25.4; // Convert inches to mm
        break;
      case 'cmhr':
        finalResult = appRateInInHr * 2.54; // Convert inches to cm
        break;
      case 'inday':
        finalResult = appRateInInHr * 24; // Convert per hour to per day
        break;
      case 'mmday':
        finalResult = appRateInInHr * 25.4 * 24; // Convert to mm/day
        break;
      case 'cmday':
        finalResult = appRateInInHr * 2.54 * 24; // Convert to cm/day
        break;
    }

    setResult(finalResult);
  };

  React.useEffect(() => {
    calculateApplicationRate();
  }, [flowRate, flowRateUnit, area, areaUnit, appRateUnit]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Water Application Rate Calculator</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Calculate the application rate using the flow rate on an area. This helps determine how much water is being applied to a specific area over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="flowRate">Flow Rate</Label>
            <Input
              id="flowRate"
              type="number"
              value={flowRate}
              onChange={(e) => setFlowRate(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="flowRateUnit">Flow Rate Unit</Label>
            <Select value={flowRateUnit} onValueChange={setFlowRateUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flowRateUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="areaUnit">Area Unit</Label>
            <Select value={areaUnit} onValueChange={setAreaUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areaUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="appRateUnit">Application Rate Unit</Label>
            <Select value={appRateUnit} onValueChange={setAppRateUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appRateUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Water Application Rate:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result.toFixed(4)} {appRateUnit}
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          Application Rate = (96.25 × Flow Rate) / Area
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: Flow Rate is in GPM, Area is in square feet, and Application Rate is in inches per hour
        </p>
      </div>
    </div>
  );
};

export default WaterApplicationRateCalculator; 