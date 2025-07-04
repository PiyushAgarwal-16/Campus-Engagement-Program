import React from 'react';

const AttendeeList = ({ attendees }) => {
  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">No attendees yet. Be the first to register!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attendees.map((attendee, index) => {
        // Handle both old and new attendee data structures
        const name = attendee.userName || attendee.name || attendee.userId || 'Unknown';
        const userId = attendee.userId || attendee.id;
        const role = attendee.userRole || 'student';
        const identifier = role === 'student' 
          ? attendee.userStudentId || attendee.userStudentId
          : attendee.userOrganization || attendee.organizationName;
        
        return (
          <div key={userId || index} className="flex items-center space-x-6 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ${
              role === 'organizer' ? 'bg-green-500' : 'bg-primary-500'
            }`}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4 mb-3">
                <h3 className="attendee-name truncate">{name}</h3>
                <span className={`text-sm px-3 py-1.5 rounded-full font-bold shadow-sm ${
                  role === 'organizer' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {role === 'organizer' ? 'Organizer' : 'Student'}
                </span>
              </div>
              <div className="space-y-2">
                {identifier && (
                  <div className="attendee-info text-gray-700 font-semibold">
                    {role === 'student' ? `Student ID: ${identifier}` : identifier}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <span className="attendee-info text-readable">
                    Registered: {new Date(attendee.registeredAt).toLocaleDateString()}
                  </span>
                  {attendee.attended && (
                    <span className="text-green-600 attendee-info font-bold bg-green-50 px-2 py-1 rounded-md" title="Attended">
                      ✓ Attended
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendeeList;
