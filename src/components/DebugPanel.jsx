import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';

const DebugPanel = () => {
  const { user, refreshUserData } = useAuth();
  const { clearAllEvents, events, deleteEvent } = useEvents();
  const [isVisible, setIsVisible] = useState(false);

  const testDeleteFunction = () => {
    if (events.length > 0 && user) {
      const firstEvent = events[0];
      console.log('Testing delete function with first event:');
      console.log('Event:', firstEvent);
      console.log('User:', user);
      console.log('Can modify?', user.role === 'organizer');
      
      // Try to delete the first event as a test
      deleteEvent(firstEvent.id, user.id, user.role);
    }
  };

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
        <div className="absolute bottom-12 right-0 bg-black text-green-400 p-4 rounded-lg max-w-md text-xs font-mono max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-400">Debug Info</span>
            <div className="space-x-1">
              <button
                onClick={refreshUserData}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Refresh
              </button>
              <button
                onClick={clearAllEvents}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                title="Clear all events"
              >
                Clear Events
              </button>
              <button
                onClick={testDeleteFunction}
                className="bg-purple-600 text-white px-2 py-1 rounded text-xs"
                title="Test delete first event"
              >
                Test Delete
              </button>
              {events.length > 0 && user?.role === 'organizer' && (
                <button
                  onClick={() => deleteEvent(events[0].id, user.id, user.role)}
                  className="bg-orange-600 text-white px-2 py-1 rounded text-xs"
                  title="Force delete first event"
                >
                  Force Delete
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-yellow-400 mb-1">User Info:</div>
            <div className="space-y-1">
              <div><span className="text-blue-400">ID:</span> {user?.id || 'null'}</div>
              <div><span className="text-blue-400">Email:</span> {user?.email || 'null'}</div>
              <div><span className="text-blue-400">Name:</span> {user?.name || 'null'}</div>
              <div><span className="text-yellow-400">Role:</span> {user?.role || 'null'}</div>
              <div><span className="text-blue-400">Student ID:</span> {user?.studentId || 'null'}</div>
              <div><span className="text-blue-400">Organization:</span> {user?.organizationName || 'null'}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-yellow-400 mb-1">Events ({events?.length || 0}):</div>
            {events?.map(event => (
              <div key={event.id} className="mb-2 p-2 border border-gray-600 rounded">
                <div><span className="text-blue-400">Title:</span> {event.title}</div>
                <div><span className="text-blue-400">ID:</span> {event.id}</div>
                <div><span className="text-blue-400">Organizer ID:</span> {event.organizerId}</div>
                <div><span className="text-blue-400">Organizer:</span> {event.organizer}</div>
              </div>
            )) || <div>No events</div>}
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
