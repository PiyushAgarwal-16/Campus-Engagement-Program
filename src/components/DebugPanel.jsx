import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugPanel = () => {
  const { user, refreshUserData } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-mono"
      >
        DEBUG
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black text-green-400 p-4 rounded-lg max-w-md text-xs font-mono">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-400">User Debug Info</span>
            <button
              onClick={refreshUserData}
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-1">
            <div><span className="text-blue-400">ID:</span> {user?.id || 'null'}</div>
            <div><span className="text-blue-400">Email:</span> {user?.email || 'null'}</div>
            <div><span className="text-blue-400">Name:</span> {user?.name || 'null'}</div>
            <div><span className="text-yellow-400">Role:</span> {user?.role || 'null'}</div>
            <div><span className="text-blue-400">Student ID:</span> {user?.studentId || 'null'}</div>
            <div><span className="text-blue-400">Organization:</span> {user?.organizationName || 'null'}</div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-yellow-400 mb-1">Raw User Object:</div>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
