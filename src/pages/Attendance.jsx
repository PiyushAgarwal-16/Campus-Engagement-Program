import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  Download, 
  Check,
  X,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, markAttendance } = useEvents();
  const { user } = useAuth();
  
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    // Simulate QR code scan - in real app, this would be triggered by QR scanner
    if (event && user) {
      const isRegistered = event.attendees.some(attendee => attendee.userId === user.id);
      const hasAttended = event.attendees.some(attendee => 
        attendee.userId === user.id && attendee.attended
      );

      if (isRegistered && !hasAttended) {
        // Mark attendance automatically for demo
        markAttendance(eventId, user.id);
        setAttendanceMarked(true);
        toast.success('Attendance marked successfully!');
      } else if (hasAttended) {
        setAttendanceMarked(true);
      } else if (!isRegistered) {
        toast.error('You are not registered for this event');
      }
    }
  }, [event, user, eventId, markAttendance]);

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
        <button
          onClick={() => navigate('/events')}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to events
        </button>
      </div>
    );
  }

  const attendedCount = event.attendees.filter(a => a.attended).length;
  const registeredCount = event.attendees.length;

  const downloadAttendanceSheet = () => {
    const attendanceData = event.attendees.map(attendee => ({
      userId: attendee.userId,
      registeredAt: new Date(attendee.registeredAt).toLocaleString(),
      attended: attendee.attended ? 'Yes' : 'No',
      attendedAt: attendee.attendedAt ? new Date(attendee.attendedAt).toLocaleString() : 'N/A'
    }));

    const csvContent = [
      ['User ID', 'Registered At', 'Attended', 'Attended At'],
      ...attendanceData.map(row => [row.userId, row.registeredAt, row.attended, row.attendedAt])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}_attendance.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance sheet downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Event Attendance</h1>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            {event.category}
          </span>
        </div>
      </div>

      {/* Attendance Status */}
      {attendanceMarked && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 rounded-full p-2">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Attendance Confirmed!</h3>
              <p className="text-green-700">
                Your attendance has been recorded for this event.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Statistics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
              <button
                onClick={downloadAttendanceSheet}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Sheet</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{registeredCount}</div>
                <div className="text-sm text-gray-600">Registered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                <div className="text-sm text-gray-600">Attended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {registeredCount > 0 ? Math.round((attendedCount / registeredCount) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${registeredCount > 0 ? (attendedCount / registeredCount) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Attendee List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee List</h3>
            
            {event.attendees.length > 0 ? (
              <div className="space-y-3">
                {event.attendees.map((attendee, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                        {attendee.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">User {attendee.userId}</div>
                        <div className="text-sm text-gray-500">
                          Registered: {new Date(attendee.registeredAt).toLocaleString()}
                        </div>
                        {attendee.attended && attendee.attendedAt && (
                          <div className="text-sm text-green-600">
                            Attended: {new Date(attendee.attendedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {attendee.attended ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Present</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <X className="w-5 h-5" />
                          <span className="text-sm">Absent</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No registrations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              QR Code Check-in
            </h3>
            
            <div className="text-center">
              <div className="bg-gray-100 p-6 rounded-lg mb-4">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Students can scan this QR code to mark their attendance
              </p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                URL: {window.location.href}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Event Capacity:</span>
                <span className="font-medium">{event.maxAttendees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Rate:</span>
                <span className="font-medium">
                  {Math.round((registeredCount / event.maxAttendees) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Show-up Rate:</span>
                <span className="font-medium">
                  {registeredCount > 0 ? Math.round((attendedCount / registeredCount) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
