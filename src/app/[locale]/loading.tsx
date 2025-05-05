import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-full border-t-primary animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
} 