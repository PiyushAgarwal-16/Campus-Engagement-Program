import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  QrCode,
  Share2,
  Edit,
  Trash2,
  Scan,
  Download
} from 'lucide-react';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import AttendeeList from '../components/AttendeeList';
import QRScanner from '../components/QRScanner';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registerForEvent, canModifyEvent, deleteEvent, exportEventAttendees } = useEvents();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const event = events.find(e => e.id === id);

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

  const isRegistered = event.attendees.some(attendee => 
    (attendee.userId || attendee.id) === user.id
  );
  const availableSpots = event.maxAttendees - event.attendees.length;
  const isFull = availableSpots <= 0;

  const handleRegister = () => {
    registerForEvent(event.id, user);
    toast.success('Successfully registered for the event!');
  };

  const handleEdit = () => {
    navigate(`/edit-event/${event.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id, user.id, user.role);
      navigate('/events');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete event: ' + error.message);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleExportAttendees = async (format) => {
    try {
      const confirmedAttendees = event.attendees.filter(attendee => attendee.attended);
      
      if (confirmedAttendees.length === 0) {
        toast.error('No confirmed attendees to export');
        return;
      }

      await exportEventAttendees(event.id, format);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export attendee data');
    }
  };

  const qrCodeValue = `${window.location.origin}/attendance/${event.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {event.category}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Share event"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {canModifyEvent(event, user?.id, user?.role) && (
                  <>
                    <button 
                      onClick={handleEdit}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit event"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3" />
                <span>{event.time} - {event.endTime || 'TBD'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-3" />
                <span>{event.attendees.length}/{event.maxAttendees} registered</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Organizer</h2>
              <p className="text-gray-600">{event.organizer}</p>
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Attendees ({event.attendees.length})
            </h2>
            <AttendeeList attendees={event.attendees} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Available spots:</span>
                <span className="font-medium">{availableSpots}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${(event.attendees.length / event.maxAttendees) * 100}%` }}
                ></div>
              </div>

              {!isRegistered && !isFull && (
                <button
                  onClick={handleRegister}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Register for Event
                </button>
              )}
              
              {isRegistered && (
                <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg text-center font-medium">
                  ✓ You're registered!
                </div>
              )}
              
              {!isRegistered && isFull && (
                <div className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg text-center font-medium">
                  Event is full
                </div>
              )}
            </div>
          </div>

          {/* QR Code for Attendance */}
          {isRegistered && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Your QR Code
              </h3>
              
              <div className="text-center">
                <p className="text-base text-gray-600 mb-4">
                  Access your unique QR code for attendance
                </p>
                
                {/* Debug info */}
                {(() => {
                  const currentAttendee = event.attendees.find(a => a.userId === (user?.id || user?.uid));
                  return currentAttendee ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                      <p className="text-xs text-gray-600">Debug Info:</p>
                      <p className="text-xs text-gray-500">User ID: {user?.id || user?.uid}</p>
                      <p className="text-xs text-gray-500">
                        QR Code: {currentAttendee.qrCode ? 
                          <span className="text-green-600">Available</span> : 
                          <span className="text-red-600">Missing</span>
                        }
                      </p>
                      {currentAttendee.qrCode && (
                        <p className="text-xs font-mono text-gray-400 break-all">
                          {currentAttendee.qrCode}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
                
                <button
                  onClick={() => navigate(`/qr-code/${event.id}`)}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>View My QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* QR Scanner for Organizers */}
          {user?.role === 'organizer' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Scan className="w-5 h-5 mr-2" />
                Attendance Scanner
              </h3>
              
              <div className="text-center">
                <p className="text-base text-gray-600 mb-4">
                  Scan attendee QR codes to mark attendance
                </p>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Scan className="w-5 h-5" />
                  <span>Start QR Scanner</span>
                </button>
              </div>
            </div>
          )}

          {/* Export Data for Organizers */}
          {user?.role === 'organizer' && event.attendees.some(a => a.attended) && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Export Attendee Data
              </h3>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Export data for {event.attendees.filter(a => a.attended).length} confirmed attendee(s)
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleExportAttendees('csv')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  
                  <button
                    onClick={() => handleExportAttendees('json')}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Event Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-medium">{event.maxAttendees}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Registered:</span>
                <span className="font-medium">{event.attendees.length}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Attended:</span>
                <span className="font-medium">
                  {event.attendees.filter(a => a.attended).length}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Registration Rate:</span>
                <span className="font-medium">
                  {Math.round((event.attendees.length / event.maxAttendees) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          eventId={event.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
