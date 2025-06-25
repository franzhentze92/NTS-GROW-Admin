import React from 'react';
import FieldDesigner from '@/components/fieldTrials/FieldDesigner';

const FieldDesignerPage: React.FC = () => {
  // You can pass a dummy trialId and a no-op onSave for standalone use
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Advanced Map & Plot Design</h1>
      <FieldDesigner trialId="standalone" onSave={() => {}} />
    </div>
  );
};

export default FieldDesignerPage; 