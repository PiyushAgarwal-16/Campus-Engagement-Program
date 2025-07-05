import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Download, Share2, Calendar, Clock, MapPin } from 'lucide-react';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

const AttendeeQRCode = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, fixAttendeeQRCode } = useEvents();
  const { user } = useAuth();

  const event = events.find(e => e.id === eventId);
  const attendee = event?.attendees?.find(a => a.userId === (user?.id || user?.uid));

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

  if (!attendee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Not registered</h2>
        <p className="text-gray-600 mb-4">You are not registered for this event.</p>
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          View Event Details
        </button>
      </div>
    );
  }

  if (!attendee.qrCode) {
    // Try to fix the QR code automatically
    const handleFixQRCode = async () => {
      try {
        await fixAttendeeQRCode(eventId, user.id || user.uid);
        toast.success('QR code generated successfully!');
        // Refresh the page to show the new QR code
        window.location.reload();
      } catch (error) {
        toast.error('Failed to generate QR code');
      }
    };

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code Not Available</h2>
        <p className="text-gray-600 mb-4">Your QR code needs to be generated.</p>
        <div className="space-y-3">
          <button
            onClick={handleFixQRCode}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Generate QR Code
          </button>
          <br />
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const canvas = document.querySelector('#attendee-qr-code canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `${event.title}-${attendee.userName}-QR.png`;
      link.href = url;
      link.click();
      toast.success('QR code downloaded!');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.title} - My QR Code`,
          text: `My attendance QR code for ${event.title}`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My QR Code</h1>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{event.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{event.time} - {event.endTime || 'TBD'}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Your Attendance QR Code
        </h3>
        
        <div id="attendee-qr-code" className="mb-6">
          <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-xl">
            <QRCode
              value={attendee.qrCode}
              size={200}
              level="M"
              includeMargin
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono break-all">
            QR Data: {attendee.qrCode}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Show this QR code to the organizer at the event
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <div className="font-medium">Attendee: {attendee.userName}</div>
            <div>
              {attendee.userRole === 'student' 
                ? `Student ID: ${attendee.userStudentId}` 
                : attendee.userOrganization
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Registered: {new Date(attendee.registeredAt).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-mono">
              QR Code: {attendee.qrCode}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          {attendee.attended ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-green-800 font-medium">✓ Attendance Confirmed</div>
              <div className="text-green-600 text-sm">
                Attended on {new Date(attendee.attendedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 font-medium">Pending Attendance</div>
              <div className="text-blue-600 text-sm">
                Show this QR code at the event
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">How to use your QR code:</h4>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>• Save or screenshot this QR code on your phone</li>
          <li>• Present it to the event organizer when you arrive</li>
          <li>• The organizer will scan it to mark your attendance</li>
          <li>• Each QR code is unique and can only be used once</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendeeQRCode;
