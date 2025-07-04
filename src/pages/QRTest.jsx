import React, { useState } from 'react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'qrcode.react';

const QRTest = () => {
  const { events, markAttendance, regenerateQRCodes } = useEvents();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [selectedQR, setSelectedQR] = useState('');

  const handleTestScan = async () => {
    if (!selectedQR) return;
    
    console.log('Testing QR code:', selectedQR);
    const result = await markAttendance(selectedQR);
    setTestResult(result);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">QR Code Testing</h1>
      
      {/* Available Events and Attendees */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Available Events & QR Codes</h2>
        
        {events.map(event => (
          <div key={event.id} className="mb-6 border-b pb-4">
            <h3 className="text-lg font-medium mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Event ID: {event.id}</p>
            
            {event.attendees.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium">Attendees:</p>
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{attendee.userName}</p>
                        <p className="text-sm text-gray-600">User ID: {attendee.userId}</p>
                        <p className="text-xs text-gray-500 font-mono">{attendee.qrCode}</p>
                        <p className="text-sm mt-1">
                          Status: {attendee.attended ? 
                            <span className="text-green-600">✓ Attended</span> : 
                            <span className="text-orange-600">○ Not attended</span>
                          }
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          QR Format: {attendee.qrCode?.startsWith('ATTEND-') ? 'Valid' : 'Invalid'}
                        </p>
                      </div>
                      <div className="ml-4">
                        <QRCode value={attendee.qrCode} size={80} />
                        <button
                          onClick={() => setSelectedQR(attendee.qrCode)}
                          className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mr-1"
                        >
                          Select for Test
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(attendee.qrCode);
                            alert('QR code copied to clipboard!');
                          }}
                          className="mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                        >
                          Copy QR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No attendees yet</p>
            )}
          </div>
        ))}
      </div>

      {/* QR Code Testing */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Test QR Code Scanning</h2>
        
        <div className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={regenerateQRCodes}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Regenerate All QR Codes
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected QR Code:
            </label>
            <input
              type="text"
              value={selectedQR}
              onChange={(e) => setSelectedQR(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Select a QR code from above or paste one here"
            />
          </div>
          
          <button
            onClick={handleTestScan}
            disabled={!selectedQR}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            Test Scan QR Code
          </button>
          
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? 'Success!' : 'Error'}
              </h3>
              {testResult.success ? (
                <div className="text-green-700 text-sm mt-1">
                  <p>Attendee: {testResult.attendee?.userName}</p>
                  <p>Event: {testResult.event?.title}</p>
                </div>
              ) : (
                <p className="text-red-700 text-sm mt-1">{testResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current User:</strong> {user?.name} ({user?.id})</p>
          <p><strong>User Role:</strong> {user?.role}</p>
          <p><strong>Total Events:</strong> {events.length}</p>
          <p><strong>Total Attendees Across All Events:</strong> {events.reduce((total, event) => total + event.attendees.length, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default QRTest;
