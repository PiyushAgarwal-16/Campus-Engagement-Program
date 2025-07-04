import React, { useState, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import toast from 'react-hot-toast';

const QRScanner = ({ isOpen, onClose, eventId }) => {
  const { markAttendance, events } = useEvents();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Debug: Get current event and attendees
  const currentEvent = events.find(e => e.id === eventId);

  // Start camera for manual QR scanning
  const startCamera = async () => {
    try {
      setError(null);
      setScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Handle manual QR code input
  const handleManualInput = async (qrCode) => {
    if (!qrCode.trim()) return;
    
    console.log('Scanning QR code:', qrCode.trim());
    const result = await markAttendance(qrCode.trim());
    console.log('Scan result:', result);
    setScanResult(result);
    
    if (result.success) {
      // Auto-close after successful scan
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  // Handle QR code scan (this would be integrated with actual QR scanner library)
  const handleScan = async (data) => {
    if (data) {
      stopCamera();
      const result = await markAttendance(data);
      setScanResult(result);
      
      if (result.success) {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="mb-6">
          {!scanning && !scanResult && (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Scan attendee's QR code to mark attendance
                </p>
                <button
                  onClick={startCamera}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-xs mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Point camera at QR code
              </p>
              <button
                onClick={stopCamera}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Stop Camera
              </button>
            </div>
          )}

          {scanResult && (
            <div className="text-center">
              {scanResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-900 mb-2">
                    Attendance Marked!
                  </h4>
                  <p className="text-green-700">
                    {scanResult.attendee?.userName}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {scanResult.attendee?.userRole === 'student' 
                      ? `Student ID: ${scanResult.attendee?.userStudentId}`
                      : scanResult.attendee?.userOrganization
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-red-900 mb-2">
                    Error
                  </h4>
                  <p className="text-red-700 text-sm">
                    {scanResult.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Manual Input Option */}
        {!scanning && !scanResult && (
          <div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Or enter QR code manually:
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Paste QR code here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualInput(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    handleManualInput(input.value);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Scan
                </button>
              </div>
            </div>

            {/* Debug Section - Show Available QR Codes */}
            {currentEvent && currentEvent.attendees.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 mb-2">Debug - Available QR Codes:</p>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                  {currentEvent.attendees.map((attendee, index) => (
                    <div key={index} className="text-xs text-gray-600 mb-1">
                      <div className="font-medium">{attendee.userName}</div>
                      <div className="font-mono text-xs break-all">{attendee.qrCode}</div>
                      <div className="text-green-600">{attendee.attended ? '✓ Attended' : '○ Not attended'}</div>
                      <hr className="my-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {scanResult && (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setScanResult(null);
                setError(null);
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Scan Another
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
