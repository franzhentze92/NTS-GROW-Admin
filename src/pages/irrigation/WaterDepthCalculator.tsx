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

const timeUnits = [
  { label: 'hr', value: 'hr' },
  { label: 'min', value: 'min' },
  { label: 'sec', value: 'sec' },
  { label: 'days', value: 'days' },
];

const depthUnits = [
  { label: 'in', value: 'in' },
  { label: 'mm', value: 'mm' },
  { label: 'cm', value: 'cm' },
  { label: 'ft', value: 'ft' },
  { label: 'm', value: 'm' },
];

const WaterDepthCalculator = () => {
  const [flowRate, setFlowRate] = useState('');
  const [flowRateUnit, setFlowRateUnit] = useState(flowRateUnits[0].value);
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState(areaUnits[0].value);
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState(timeUnits[0].value);
  const [depthUnit, setDepthUnit] = useState(depthUnits[0].value);
  const [result, setResult] = useState<number | null>(null);

  const calculateWaterDepth = () => {
    if (!flowRate || !area || !time || Number(flowRate) <= 0 || Number(area) <= 0 || Number(time) <= 0) {
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

    // Convert time to hours
    let timeInHours = Number(time);
    switch (timeUnit) {
      case 'min':
        timeInHours = Number(time) / 60; // Convert minutes to hours
        break;
      case 'sec':
        timeInHours = Number(time) / 3600; // Convert seconds to hours
        break;
      case 'days':
        timeInHours = Number(time) * 24; // Convert days to hours
        break;
    }

    // Calculate water depth in inches
    const depthInInches = (96.25 * flowRateInGpm * timeInHours) / areaInSqFt;

    // Convert to selected depth unit
    let finalResult = depthInInches;
    switch (depthUnit) {
      case 'mm':
        finalResult = depthInInches * 25.4; // Convert inches to mm
        break;
      case 'cm':
        finalResult = depthInInches * 2.54; // Convert inches to cm
        break;
      case 'ft':
        finalResult = depthInInches / 12; // Convert inches to feet
        break;
      case 'm':
        finalResult = depthInInches * 0.0254; // Convert inches to meters
        break;
    }

    setResult(finalResult);
  };

  React.useEffect(() => {
    calculateWaterDepth();
  }, [flowRate, flowRateUnit, area, areaUnit, time, timeUnit, depthUnit]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Water Depth Calculator</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Calculate the depth of water applied to a specified area over the specified time span based on the given flow rate onto the field.
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
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="timeUnit">Time Unit</Label>
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="depthUnit">Depth Unit</Label>
            <Select value={depthUnit} onValueChange={setDepthUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {depthUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Water Depth:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result.toFixed(4)} {depthUnit}
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          Water Depth = (96.25 × Flow Rate × Time) / Area
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: Flow Rate is in GPM, Time is in hours, Area is in square feet, and Water Depth is in inches
        </p>
      </div>
    </div>
  );
};

export default WaterDepthCalculator; 