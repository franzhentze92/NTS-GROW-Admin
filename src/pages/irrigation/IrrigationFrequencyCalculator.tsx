import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

const awcUnits = [
  { label: 'in/ft', value: 'inft' },
  { label: 'mm/m', value: 'mmm' },
];

const rzUnits = [
  { label: 'ft', value: 'ft' },
  { label: 'm', value: 'm' },
  { label: 'cm', value: 'cm' },
  { label: 'mm', value: 'mm' },
  { label: 'in', value: 'in' },
];

const madUnits = [
  { label: 'decimal', value: 'decimal' },
  { label: '%', value: 'percent' },
];

const etcUnits = [
  { label: 'in/day', value: 'inday' },
  { label: 'mm/day', value: 'mmday' },
  { label: 'cm/day', value: 'cmday' },
  { label: 'in/month', value: 'inmonth' },
  { label: 'mm/month', value: 'mmmonth' },
  { label: 'cm/month', value: 'cmmonth' },
];

const freqUnits = [
  { label: 'day', value: 'day' },
  { label: 'hr', value: 'hr' },
];

interface Inputs {
  awc: number;
  awcUnit: string;
  rz: number;
  rzUnit: string;
  mad: number;
  madUnit: string;
  etc: number;
  etcUnit: string;
  freqUnit: string;
}

function convertAwcToInFt(value: number, unit: string): number {
  switch (unit) {
    case 'inft': return value;
    case 'mmm': return value * 0.012;
    default: return value;
  }
}

function convertRzToFt(value: number, unit: string): number {
  switch (unit) {
    case 'ft': return value;
    case 'm': return value * 3.28084;
    case 'cm': return value * 0.0328084;
    case 'mm': return value * 0.00328084;
    case 'in': return value / 12;
    default: return value;
  }
}

function convertMadToDecimal(value: number, unit: string): number {
  switch (unit) {
    case 'decimal': return value;
    case 'percent': return value / 100;
    default: return value;
  }
}

function convertEtcToInDay(value: number, unit: string): number {
  switch (unit) {
    case 'inday': return value;
    case 'mmday': return value * 0.0393701;
    case 'cmday': return value * 0.393701;
    case 'inmonth': return value / 30;
    case 'mmmonth': return (value * 0.0393701) / 30;
    case 'cmmonth': return (value * 0.393701) / 30;
    default: return value;
  }
}

function convertDayToOutputUnit(value: number, unit: string): number {
  switch (unit) {
    case 'day': return value;
    case 'hr': return value * 24;
    default: return value;
  }
}

const IrrigationFrequencyCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>({
    awc: 0,
    awcUnit: 'inft',
    rz: 0,
    rzUnit: 'ft',
    mad: 0,
    madUnit: 'decimal',
    etc: 0,
    etcUnit: 'inday',
    freqUnit: 'day',
  });
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    calculateFrequency();
  }, [inputs]);

  const calculateFrequency = () => {
    const awcInFt = convertAwcToInFt(inputs.awc, inputs.awcUnit);
    const rzFt = convertRzToFt(inputs.rz, inputs.rzUnit);
    const madDecimal = convertMadToDecimal(inputs.mad, inputs.madUnit);
    const etcInDay = convertEtcToInDay(inputs.etc, inputs.etcUnit);
    if (awcInFt <= 0 || rzFt <= 0 || madDecimal <= 0 || etcInDay <= 0) {
      setResult(null);
      return;
    }
    // F = (AWC * Rz * MAD) / ETc
    const freqDay = (awcInFt * rzFt * madDecimal) / etcInDay;
    const finalFreq = convertDayToOutputUnit(freqDay, inputs.freqUnit);
    setResult(finalFreq);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Irrigation Frequency Calculator</h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          This calculates the maximum interval allowed between irrigations. This is dependent on soil type, root zone depth, and the water use rate of the crop.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="awc">Soil's Available Water Holding Capacity</Label>
            <Input
              id="awc"
              type="number"
              value={inputs.awc}
              onChange={(e) => setInputs(prev => ({ ...prev, awc: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="awcUnit">AWC Unit</Label>
            <Select value={inputs.awcUnit} onValueChange={(value) => setInputs(prev => ({ ...prev, awcUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {awcUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rz">Root Zone Depth</Label>
            <Input
              id="rz"
              type="number"
              value={inputs.rz}
              onChange={(e) => setInputs(prev => ({ ...prev, rz: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="rzUnit">Root Zone Unit</Label>
            <Select value={inputs.rzUnit} onValueChange={(value) => setInputs(prev => ({ ...prev, rzUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rzUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="mad">Management Allowed Depletion</Label>
            <Input
              id="mad"
              type="number"
              value={inputs.mad}
              onChange={(e) => setInputs(prev => ({ ...prev, mad: Number(e.target.value) }))}
              min="0"
              max={inputs.madUnit === 'percent' ? 100 : 1}
            />
          </div>
          <div>
            <Label htmlFor="madUnit">MAD Unit</Label>
            <Select value={inputs.madUnit} onValueChange={(value) => setInputs(prev => ({ ...prev, madUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {madUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="etc">Crop Evapotranspiration</Label>
            <Input
              id="etc"
              type="number"
              value={inputs.etc}
              onChange={(e) => setInputs(prev => ({ ...prev, etc: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="etcUnit">ETc Unit</Label>
            <Select value={inputs.etcUnit} onValueChange={(value) => setInputs(prev => ({ ...prev, etcUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {etcUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="freqUnit">Frequency Unit</Label>
            <Select value={inputs.freqUnit} onValueChange={(value) => setInputs(prev => ({ ...prev, freqUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {freqUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Irrigation Frequency:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result.toFixed(2)} {inputs.freqUnit}
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used:</h3>
        <p className="text-sm text-gray-600 font-mono">
          F = (AWC × Rz × MAD) / ETc
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Where: F = Frequency, AWC = Available Water Capacity, Rz = Root Zone Depth, MAD = Management Allowed Depletion, ETc = Crop Evapotranspiration
        </p>
      </div>
    </div>
  );
};

export default IrrigationFrequencyCalculator; 