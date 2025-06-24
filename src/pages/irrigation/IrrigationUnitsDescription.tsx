import React from 'react';

const units = [
  {
    title: 'Area',
    items: [
      { unit: 'acre', desc: '43,560 square feet' },
      { unit: 'hectare', desc: 'metric measure of area = 10,000 square meters (100m x 100m area). There are about 2.5 acres in one hectare.' },
      { unit: 'sq. cm', desc: 'square centimeters' },
      { unit: 'sq. ft', desc: 'square feet' },
      { unit: 'sq. in', desc: 'square inches' },
      { unit: 'sq. meter', desc: 'square meters' },
      { unit: 'sq. mile', desc: 'square miles. There are 640 acres in a square mile.' },
    ],
  },
  {
    title: 'Distance',
    items: [
      { unit: 'cm', desc: 'centimeters' },
      { unit: 'ft', desc: 'foot (singular), feet (plural)' },
      { unit: 'in', desc: 'inches' },
      { unit: 'km', desc: 'kilometers' },
      { unit: 'mile', desc: '1 mile = 5280 ft' },
      { unit: 'mm', desc: 'millimeters' },
      { unit: 'm', desc: 'meters' },
      { unit: 'y', desc: 'yard' },
    ],
  },
  {
    title: 'Flow',
    items: [
      { unit: 'acre-ft/day', desc: 'flow that would cover a perfectly flat acre of land one-foot deep in one day' },
      { unit: 'acre-in/day', desc: 'flow that would cover a perfectly flat acre of land one-inch deep in one day' },
      { unit: 'acre-in/hr', desc: 'flow that would cover a perfectly flat acre of land one-inch deep in one hour. This is approximately equal to 1 cfs.' },
      { unit: 'cfs', desc: 'cubic feet per second. There are about 450 gpm in 1 cfs. 1 cfs is about 1 acre-in/hr.' },
      { unit: 'cfm', desc: 'cubic feet per minute' },
      { unit: 'cms', desc: 'cubic meters per second (1 cms is a lot of water! About 16,000 gpm.)' },
      { unit: 'cu. m/hr', desc: 'cubic meters per hour' },
      { unit: 'cu. yd/min', desc: 'cubic yards per minute' },
      { unit: 'gpd', desc: 'gallons per day' },
      { unit: 'gph', desc: 'gallons per hour. Typically used for drip emitter flow rates.' },
      { unit: 'gpm', desc: 'gallons per minute' },
      { unit: 'mgd', desc: 'million gallons per day' },
      { unit: 'lph', desc: 'liters per hour' },
      { unit: 'lpm', desc: 'liters per minute' },
      { unit: 'lps', desc: 'metric liters per second. 1 lps is about 16 gallons per minute.' },
    ],
  },
  {
    title: 'Power',
    items: [
      { unit: 'btu', desc: 'British thermal units per hour' },
      { unit: 'btm', desc: 'British thermal units per minute' },
      { unit: 'hp', desc: 'horsepower' },
      { unit: 'kw', desc: 'kilowatts' },
    ],
  },
  {
    title: 'Precipitation',
    items: [
      { unit: 'cfs/acre', desc: 'cubic feet per second per acre' },
      { unit: 'cm/day', desc: 'centimeters per day' },
      { unit: 'cm/hr', desc: 'centimeters per hour' },
      { unit: 'cm/month', desc: 'centimeters per month' },
      { unit: 'cms/ha', desc: 'cubic meters per second per hectare' },
      { unit: 'gpm/acre', desc: 'gallons per minute per acre. This is commonly used to design irrigation systems.' },
      { unit: 'in/day', desc: 'inches per day' },
      { unit: 'in/hr', desc: 'inches per hour. This is a common measurement of an irrigation system\'s application rate.' },
      { unit: 'in/month', desc: 'inches per month' },
      { unit: 'lps/ha', desc: 'liters per second per hectare' },
      { unit: 'mm/day', desc: 'millimeters per day' },
      { unit: 'mm/hr', desc: 'millimeters per hour' },
      { unit: 'mm/month', desc: 'millimeters per month' },
    ],
  },
  {
    title: 'Pressure',
    items: [
      { unit: 'atm', desc: 'Atmospheres. Equal to about 14.7 pounds per square inch.' },
      { unit: 'bars', desc: '1 bar is 100 kilopascals of pressure.' },
      { unit: 'ft of water', desc: 'Feet of water. Also known as feet of head. The pressure at the bottom of the given depth of water in feet.' },
      { unit: 'in of Mercury', desc: 'Inches of mercury. Pressure at the bottom of the given depth of mercury in inches.' },
      { unit: 'in of water', desc: 'Inches of water. Pressure at the bottom of the given depth of water in inches.' },
      { unit: 'kPa', desc: 'Kilopascals. 1000 pascals.' },
      { unit: 'm of water', desc: 'meters of water. The pressure at the bottom of the given depth of water in meters.' },
      { unit: 'psi', desc: 'pounds per square inch. Sometimes referred to colloquially as "pounds of pressure".' },
    ],
  },
  {
    title: 'Salinity',
    items: [
      { unit: 'dS/m', desc: 'deci-siemens per meter. A measurement of electrical conductivity (EC).' },
      { unit: 'microS/cm', desc: 'micro-siemens per centimeter' },
      { unit: 'mg/l', desc: 'milligrams of dissolved salt per liter of liquid.' },
      { unit: 'mS/cm', desc: 'milli-siemens per centimeter' },
      { unit: 'ppm', desc: 'parts per million. Parts of salt per million parts of the total solution.' },
      { unit: 'tons/acre-ft', desc: 'tons of salt per acre-foot of water' },
    ],
  },
  {
    title: 'Speed',
    items: [
      { unit: 'ft/hr', desc: 'feet per hour' },
      { unit: 'ft/min', desc: 'feet per minute' },
      { unit: 'ft/sec', desc: 'feet per second' },
      { unit: 'in/min', desc: 'inches per minute' },
      { unit: 'km/hr', desc: 'kilometers per hour' },
      { unit: 'meters/hr', desc: 'meters per hour' },
      { unit: 'meters/min', desc: 'meters per minute' },
      { unit: 'meters/sec', desc: 'meters per second' },
      { unit: 'mph', desc: 'miles per hour' },
    ],
  },
  {
    title: 'Volume',
    items: [
      { unit: 'acre-ft', desc: 'amount of water that would cover a perfectly flat acre of land one-foot deep' },
      { unit: 'acre-in', desc: 'amount of water that would cover a perfectly flat acre of land one-inch deep' },
      { unit: 'cu. ft.', desc: 'cubic foot of water' },
      { unit: 'cu. in', desc: 'cubic inches' },
      { unit: 'cu. meter', desc: 'cubic meters' },
      { unit: 'cu. yd', desc: 'cubic yards' },
      { unit: 'gals', desc: 'gallons' },
      { unit: 'gal UK', desc: 'United Kingdom (UK) gallons' },
      { unit: 'hectare - mm', desc: 'Amount of water that would cover a perfectly flat hectare that is one millimeter deep.' },
      { unit: 'hectare - m', desc: 'Amount of water that would cover a perfectly flat hectare that is one meter deep.' },
      { unit: 'liter', desc: 'liters. 1000 liters fit inside a cubic meter.' },
      { unit: 'ml', desc: 'milliliters, a thousandths of a liter' },
    ],
  },
];

const IrrigationUnitsDescription = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Irrigation Unit Descriptions</h2>
      </div>
      <div className="space-y-8">
        {units.map((group, idx) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800 mb-2">{group.title}</h3>
            {group.items.map((item) => (
              <div key={item.unit} className="flex mb-1">
                <span className="min-w-[120px] font-semibold">{item.unit}</span>
                <span className="ml-2">{item.desc}</span>
              </div>
            ))}
            {idx < units.length - 1 && <hr className="my-3" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IrrigationUnitsDescription; 