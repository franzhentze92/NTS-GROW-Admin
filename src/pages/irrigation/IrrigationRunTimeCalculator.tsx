import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

const intervalUnits = [
  { label: 'days', value: 1 },
  { label: 'hr', value: 1 / 24 },
];

const cropWaterUseUnits = [
  { label: 'in/day', value: 1 },
  { label: 'mm/day', value: 1 / 25.4 },
  { label: 'cm/day', value: 1 / 2.54 },
  { label: 'in/month', value: 1 / 30 },
  { label: 'mm/month', value: 1 / (25.4 * 30) },
  { label: 'cm/month', value: 1 / (2.54 * 30) },
];

const appRateUnits = [
  { label: 'in/hr', value: 1 },
  { label: 'in/day', value: 1 / 24 },
  { label: 'mm/hr', value: 1 / 25.4 },
  { label: 'mm/day', value: 1 / (25.4 * 24) },
  { label: 'cm/hr', value: 1 / 2.54 },
  { label: 'cm/day', value: 1 / (2.54 * 24) },
];

const efficiencyUnits = [
  { label: '%', value: 0.01 },
  { label: 'decimal', value: 1 },
];

const outputUnits = [
  { label: 'min', value: 1 },
  { label: 'hr', value: 1 / 60 },
  { label: 'days', value: 1 / (60 * 24) },
];

const IrrigationRunTimeCalculator = () => {
  const [interval, setInterval] = useState('');
  const [intervalUnit, setIntervalUnit] = useState(intervalUnits[0].label);
  const [waterUse, setWaterUse] = useState('');
  const [waterUseUnit, setWaterUseUnit] = useState(cropWaterUseUnits[0].label);
  const [appRate, setAppRate] = useState('');
  const [appRateUnit, setAppRateUnit] = useState(appRateUnits[0].label);
  const [efficiency, setEfficiency] = useState('');
  const [efficiencyUnit, setEfficiencyUnit] = useState(efficiencyUnits[0].label);
  const [outputUnit, setOutputUnit] = useState(outputUnits[0].label);

  // Calculate run time in minutes
  let result = '';
  const valid = interval && waterUse && appRate && efficiency && Number(efficiency) !== 0;
  if (valid) {
    // Convert all to base units: days, in/day, in/hr, decimal
    const I = parseFloat(interval) * intervalUnits.find(u => u.label === intervalUnit)!.value;
    const W = parseFloat(waterUse) * cropWaterUseUnits.find(u => u.label === waterUseUnit)!.value;
    const AR = parseFloat(appRate) * appRateUnits.find(u => u.label === appRateUnit)!.value;
    const E = parseFloat(efficiency) * efficiencyUnits.find(u => u.label === efficiencyUnit)!.value;
    if (AR > 0 && E > 0) {
      const T_min = (60 * I * W) / (AR * E);
      const outFactor = outputUnits.find(u => u.label === outputUnit)!.value;
      const T_out = T_min * outFactor;
      result = T_out.toFixed(4).replace(/\.?0+$/, '');
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Irrigation Run Time Calculator</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Use this calculator to determine the length of time that an irrigation system must run to apply enough water to replace the water lost to evapotranspiration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="interval">Watering Interval</Label>
            <Input
              id="interval"
              type="number"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="intervalUnit">Interval Unit</Label>
            <Select value={intervalUnit} onValueChange={setIntervalUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervalUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="waterUse">Crop Water Use</Label>
            <Input
              id="waterUse"
              type="number"
              value={waterUse}
              onChange={(e) => setWaterUse(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="waterUseUnit">Water Use Unit</Label>
            <Select value={waterUseUnit} onValueChange={setWaterUseUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cropWaterUseUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="appRate">Application Rate</Label>
            <Input
              id="appRate"
              type="number"
              value={appRate}
              onChange={(e) => setAppRate(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="appRateUnit">Application Rate Unit</Label>
            <Select value={appRateUnit} onValueChange={setAppRateUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appRateUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="efficiency">Irrigation Efficiency</Label>
            <Input
              id="efficiency"
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="efficiencyUnit">Efficiency Unit</Label>
            <Select value={efficiencyUnit} onValueChange={setEfficiencyUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {efficiencyUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="outputUnit">Output Unit</Label>
            <Select value={outputUnit} onValueChange={setOutputUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Irrigation Run Time:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result} {outputUnit}
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          T = (60 × I × W) / (AR × E)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: T = Time (minutes), I = Interval (days), W = Water Use (in/day), AR = Application Rate (in/hr), E = Efficiency (decimal)
        </p>
      </div>
    </div>
  );
};

export default IrrigationRunTimeCalculator; 