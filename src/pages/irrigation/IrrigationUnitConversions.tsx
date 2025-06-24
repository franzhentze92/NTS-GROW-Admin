import React, { useState } from 'react';

// Conversion factors and helper functions for each category
const conversions = {
  'Flow Rate': {
    'lps': 1,
    'lpm': 1/60,
    'lph': 1/3600,
    'gpm': 0.0630902,
    'gph': 0.0010515,
    'gpd': 0.0000438125,
    'cf/s': 0.0283168,
    'cfm': 0.000471947,
    'cu. m/hr': 0.000277778,
    'cu. yd/min': 0.0127426,
    'mgd': 0.0438125,
    'acre-in/day': 0.0142764,
    'acre-in/hour': 0.342634,
    'acre-ft/day': 0.0142764,
    'cms': 0.001
  },
  'Area': {
    'sq. meter': 1,
    'acre': 4046.86,
    'sq. in.': 0.00064516,
    'sq. ft.': 0.092903,
    'hectare': 10000,
    'sq. cm.': 0.0001,
    'sq. yd': 0.836127,
    'sq. km': 1000000,
    'sq. mile': 2589988.11
  },
  'Distance': {
    'm': 1,
    'ft': 0.3048,
    'in': 0.0254,
    'mm': 0.001,
    'cm': 0.01,
    'yd': 0.9144,
    'mile': 1609.344,
    'km': 1000
  },
  'Time': {
    'sec': 1,
    'min': 60,
    'hr': 3600,
    'day': 86400,
    'week': 604800,
    'month': 2592000,
    'yr': 31536000
  },
  'Volume': {
    'cu. meter': 1,
    'cu. in.': 0.0000163871,
    'cu. ft.': 0.0283168,
    'cu. yd': 0.764555,
    'gal': 0.00378541,
    'gal UK': 0.00454609,
    'ml': 0.000001,
    'liter': 0.001,
    'acre-in': 102.790,
    'acre-ft': 1233.48,
    'hectare-mm': 10,
    'hectare-m': 10000,
    'cups': 0.000236588,
    'quarts': 0.000946353
  },
  'Pressure': {
    'psi': 6894.76,
    'bar': 100000,
    'milli bar': 100,
    'kPa': 1000,
    'atm': 101325,
    'in of Mercury': 3386.39,
    'ft of water': 2989.07,
    'm of water': 9806.65
  },
  'Power': {
    'hp': 745.7,
    'kW': 1000,
    'BTU/min': 17.5843,
    'BTU/hr': 0.293071
  },
  'Precipitation': {
    'mm/hr': 1,
    'mm/month': 1/720,
    'mm/day': 1/24,
    'in/hr': 25.4,
    'in/day': 1.05833,
    'in/month': 0.0352778,
    'gpm/acre': 0.00160417,
    'cfs/acre': 0.09625,
    'lps/ha': 0.0001,
    'cms/ha': 0.1
  },
  'Salinity': {
    'dS/m': 1,
    'mS/cm': 1,
    'microS/cm': 0.001,
    'mg/l': 0.001,
    'ppm': 0.001,
    'tons/acre-ft': 0.000001
  },
  'Speed': {
    'meters/sec': 1,
    'meters/min': 1/60,
    'meters/hr': 1/3600,
    'ft/min': 0.00508,
    'ft/sec': 0.3048,
    'ft/hr': 0.0000846667,
    'in/min': 0.000423333,
    'mph': 0.44704,
    'km/hr': 0.277778
  }
};
const unitCategories = [
  {
    label: 'Flow Rate',
    units: [
      'lps', 'lpm', 'lph', 'gpm', 'gph', 'gpd', 'cf/s', 'cfm', 'cu. m/hr', 'cu. yd/min', 'mgd', 'acre-in/day', 'acre-in/hour', 'acre-ft/day', 'cms'
    ]
  },
  {
    label: 'Area',
    units: [
      'acre', 'sq. in.', 'sq. ft.', 'hectare', 'sq. cm.', 'sq. meter', 'sq. yd', 'sq. km', 'sq. mile'
    ]
  },
  {
    label: 'Distance',
    units: [
      'ft', 'in', 'mm', 'cm', 'm', 'yd', 'mile', 'km'
    ]
  },
  {
    label: 'Time',
    units: [
      'sec', 'min', 'hr', 'day', 'week', 'month', 'yr'
    ]
  },
  {
    label: 'Volume',
    units: [
      'cu. in.', 'cu. ft.', 'cu. yd', 'gal', 'gal UK', 'cu. meter', 'ml', 'liter', 'acre-in', 'acre-ft', 'hectare-mm', 'hectare-m', 'cups', 'quarts'
    ]
  },
  {
    label: 'Pressure',
    units: [
      'psi', 'bar', 'milli bar', 'kPa', 'atm', 'in of Mercury', 'ft of water', 'm of water'
    ]
  },
  {
    label: 'Power',
    units: [
      'hp', 'kW', 'BTU/min', 'BTU/hr'
    ]
  },
  {
    label: 'Precipitation',
    units: [
      'mm/hr', 'mm/month', 'mm/day', 'in/hr', 'in/day', 'in/month', 'gpm/acre', 'cfs/acre', 'lps/ha', 'cms/ha'
    ]
  },
  {
    label: 'Salinity',
    units: [
      'dS/m', 'mS/cm', 'microS/cm', 'mg/l', 'ppm', 'tons/acre-ft'
    ]
  },
  {
    label: 'Speed',
    units: [
      'meters/sec', 'meters/min', 'meters/hr', 'ft/min', 'ft/sec', 'ft/hr', 'in/min', 'mph', 'km/hr'
    ]
  }
];

const IrrigationUnitConversions: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState('');

  const handleConvert = (val: string, from: string, to: string) => {
    if (!val || !from || !to) return '';
    const category = unitCategories[tab].label;
    const base = conversions[category][from];
    const target = conversions[category][to];
    if (!base || !target) return '';
    const baseValue = parseFloat(val) / base;
    const converted = baseValue * target;
    return converted.toString();
  };

  React.useEffect(() => {
    setResult(handleConvert(value, fromUnit, toUnit));
  }, [value, fromUnit, toUnit, tab]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Irrigation Unit Conversions</h2>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {unitCategories.map((cat, idx) => (
          <button
            key={cat.label}
            className={`px-3 py-1 rounded ${tab === idx ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => {
              setTab(idx);
              setFromUnit('');
              setToUnit('');
              setValue('');
              setResult('');
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block mb-1 font-medium">Value</label>
          <input
            className="w-full border rounded px-2 py-1"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">From Unit</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
          >
            <option value="">Select</option>
            {unitCategories[tab].units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">To Unit</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
          >
            <option value="">Select</option>
            {unitCategories[tab].units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      {result && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Converted Value:</h3>
          <p className="text-4xl font-bold text-green-900">
            {result}
          </p>
        </div>
      )}
    </div>
  );
};

export default IrrigationUnitConversions; 