import React from 'react';

const AttendeeList = ({ attendees }) => {
  if (!attendees || attendees.length === 0) {
    return <p className="text-gray-500">No attendees yet. Be the first to register!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {attendees.map((attendee, index) => {
        // Handle both old and new attendee data structures
        const name = attendee.userName || attendee.name || attendee.userId || 'Unknown';
        const userId = attendee.userId || attendee.id;
        const role = attendee.userRole || 'student';
        const identifier = role === 'student' 
          ? attendee.userStudentId || attendee.userStudentId
          : attendee.userOrganization || attendee.organizationName;
        
        return (
          <div key={userId || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              role === 'organizer' ? 'bg-green-500' : 'bg-primary-500'
            }`}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  role === 'organizer' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {role === 'organizer' ? 'Organizer' : 'Student'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {identifier && (
                  <span className="text-xs text-gray-500">
                    {role === 'student' ? `ID: ${identifier}` : identifier}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(attendee.registeredAt).toLocaleDateString()}
                </span>
                {attendee.attended && (
                  <span className="text-green-500 text-xs font-medium" title="Attended">
                    ✓ Attended
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendeeList;
