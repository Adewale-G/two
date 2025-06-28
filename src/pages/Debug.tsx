import React from 'react';
import DatabaseTest from '../components/Debug/DatabaseTest';

const Debug: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <DatabaseTest />
    </div>
  );
};

export default Debug;