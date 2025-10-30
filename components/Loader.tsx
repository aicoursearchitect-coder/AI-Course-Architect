
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-secondary"></div>
      <p className="text-lg text-text-secondary animate-pulse">
        Generating your course...
      </p>
    </div>
  );
};

export default Loader;
