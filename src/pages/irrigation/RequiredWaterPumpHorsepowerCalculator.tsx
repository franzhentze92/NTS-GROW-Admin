import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const pressureUnits = [
  { label: 'psi', toPsi: 1, toMeter: 0.70307 },
  { label: 'kPa', toPsi: 0.145038, toMeter: 0.10197 },
  { label: 'feet of water', toPsi: 0.433527, toMeter: 0.3048 },
  { label: 'm of water', toPsi: 1.42233, toMeter: 1 },
  { label: 'bar', toPsi: 14.5038, toMeter: 10 },
];
const flowUnits = [
  { label: 'gpm', toGpm: 1, toLps: 0.06309 },
  { label: 'cfs', toGpm: 448.831, toLps: 28.3168 },
  { label: 'acre-in/day', toGpm: 18.857, toLps: 1.191 },
  { label: 'acre-in/hour', toGpm: 452.57, toLps: 28.57 },
  { label: 'acre-ft/day', toGpm: 226.6, toLps: 14.32 },
  { label: 'lps', toGpm: 15.8503, toLps: 1 },
  { label: 'lpm', toGpm: 0.264172, toLps: 0.01667 },
  { label: 'cms', toGpm: 15850.3, toLps: 1000 },
  { label: 'cu. m/hr', toGpm: 4.40287, toLps: 0.27778 },
];
const efficiencyUnits = [
  { label: '%', toDecimal: 0.01 },
  { label: 'decimal', toDecimal: 1 },
];
const powerUnits = [
  { label: 'HP', factor: 1 },
  { label: 'kW', factor: 0.7457 },
];

const RequiredWaterPumpHorsepowerCalculator = () => {
  const [pressure, setPressure] = useState('');
  const [pressureUnit, setPressureUnit] = useState(pressureUnits[0].label);
  const [flow, setFlow] = useState('');
  const [flowUnit, setFlowUnit] = useState(flowUnits[0].label);
  const [pumpEff, setPumpEff] = useState('');
  const [pumpEffUnit, setPumpEffUnit] = useState(efficiencyUnits[0].label);
  const [motorEff, setMotorEff] = useState('');
  const [motorEffUnit, setMotorEffUnit] = useState(efficiencyUnits[0].label);
  const [outputUnit, setOutputUnit] = useState(powerUnits[0].label);

  let bhp = '';
  let totalPower = '';
  let bhpKW = '';
  let totalPowerKW = '';
  const valid = pressure && flow && pumpEff && motorEff && Number(pumpEff) !== 0 && Number(motorEff) !== 0;
  if (valid) {
    const pU = pressureUnits.find(u => u.label === pressureUnit)!;
    const fU = flowUnits.find(u => u.label === flowUnit)!;
    const pumpE = parseFloat(pumpEff) * efficiencyUnits.find(u => u.label === pumpEffUnit)!.toDecimal;
    const motorE = parseFloat(motorEff) * efficiencyUnits.find(u => u.label === motorEffUnit)!.toDecimal;
    const isUS = pressureUnit === 'psi' && flowUnit === 'gpm';
    if (isUS) {
      const P = parseFloat(pressure) * pU.toPsi;
      const Q = parseFloat(flow) * fU.toGpm;
      const bhpVal = (Q * P) / (3960 * pumpE);
      const totalPowerVal = bhpVal / motorE;
      bhp = bhpVal.toFixed(4).replace(/\.?0+$/, '');
      totalPower = totalPowerVal.toFixed(4).replace(/\.?0+$/, '');
      bhpKW = (bhpVal * 0.7457).toFixed(4).replace(/\.?0+$/, '');
      totalPowerKW = (totalPowerVal * 0.7457).toFixed(4).replace(/\.?0+$/, '');
    } else {
      const H = parseFloat(pressure) * pU.toMeter;
      const Q = parseFloat(flow) * fU.toLps;
      const kW = (Q * H) / (367 * pumpE);
      const totalKW = kW / motorE;
      bhpKW = kW.toFixed(4).replace(/\.?0+$/, '');
      totalPowerKW = totalKW.toFixed(4).replace(/\.?0+$/, '');
      bhp = (kW / 0.7457).toFixed(4).replace(/\.?0+$/, '');
      totalPower = (totalKW / 0.7457).toFixed(4).replace(/\.?0+$/, '');
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Required Water Pump Horsepower Calculator</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Use this form to estimate the brake horsepower and total power (hp) requirements of the electric motor used to power an irrigation water pump.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pressure">Pressure</Label>
            <Input
              id="pressure"
              type="number"
              value={pressure}
              onChange={e => setPressure(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="pressureUnit">Pressure Unit</Label>
            <Select value={pressureUnit} onValueChange={setPressureUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pressureUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="flow">Flow Rate</Label>
            <Input
              id="flow"
              type="number"
              value={flow}
              onChange={e => setFlow(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="flowUnit">Flow Rate Unit</Label>
            <Select value={flowUnit} onValueChange={setFlowUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flowUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="pumpEff">Pump Efficiency</Label>
            <Input
              id="pumpEff"
              type="number"
              value={pumpEff}
              onChange={e => setPumpEff(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="pumpEffUnit">Pump Efficiency Unit</Label>
            <Select value={pumpEffUnit} onValueChange={setPumpEffUnit}>
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
            <Label htmlFor="motorEff">Drive Motor Efficiency</Label>
            <Input
              id="motorEff"
              type="number"
              value={motorEff}
              onChange={e => setMotorEff(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="motorEffUnit">Motor Efficiency Unit</Label>
            <Select value={motorEffUnit} onValueChange={setMotorEffUnit}>
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
                {powerUnits.map(u => (
                  <SelectItem key={u.label} value={u.label}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {(bhp || totalPower) && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Results:</h3>
          <p className="text-2xl font-bold text-green-900">
            Brake Horsepower: {bhp} HP ({bhpKW} kW)<br />
            Total Power Required: {totalPower} HP ({totalPowerKW} kW)
          </p>
        </div>
      )}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          US: BHP = (Q × P) / (3960 × PumpEff), Metric: kW = (Q × H) / (367 × PumpEff)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: Q = Flow Rate, P = Pressure, H = Head, PumpEff = Pump Efficiency, MotorEff = Motor Efficiency
        </p>
      </div>
    </div>
  );
};

export default RequiredWaterPumpHorsepowerCalculator; 