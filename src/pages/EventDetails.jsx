import React from 'react';
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
  Edit
} from 'lucide-react';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import AttendeeList from '../components/AttendeeList';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registerForEvent } = useEvents();
  const { user } = useAuth();

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
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {event.category}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
              <div className="flex justify-between text-sm">
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
                Attendance QR Code
              </h3>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <QRCode 
                    value={qrCodeValue}
                    size={150}
                    level="M"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Scan this QR code at the event to mark your attendance
                </p>
              </div>
            </div>
          )}

          {/* Event Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-medium">{event.maxAttendees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registered:</span>
                <span className="font-medium">{event.attendees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attended:</span>
                <span className="font-medium">
                  {event.attendees.filter(a => a.attended).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Rate:</span>
                <span className="font-medium">
                  {Math.round((event.attendees.length / event.maxAttendees) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
