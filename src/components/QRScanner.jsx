import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import toast from 'react-hot-toast';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRScanner = ({ isOpen, onClose, eventId }) => {
  const { markAttendance, events } = useEvents();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Debug: Get current event and attendees
  const currentEvent = events.find(e => e.id === eventId);

  // Initialize QR code reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  // Start camera and QR scanning
  const startCamera = async () => {
    // Set loading state first to render video element
    setCameraLoading(true);
    setError(null);
    setScanResult(null);
    
    // Wait a bit for React to render the video element
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      if (!codeReaderRef.current) {
        throw new Error('QR code reader not initialized');
      }

      // Wait for video element to be ready in DOM
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video element not found in DOM after 5 seconds'));
        }, 5000);
        
        const checkVideoElement = () => {
          if (videoRef.current && videoRef.current.isConnected) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkVideoElement, 100);
          }
        };
        checkVideoElement();
      });

      // Try multiple camera constraints for better compatibility
      const constraints = [
        {
          video: { 
            facingMode: 'environment', // Prefer back camera
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        {
          video: { 
            facingMode: 'user', // Front camera fallback
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        {
          video: true // Basic fallback
        }
      ];

      let stream = null;
      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          console.warn('Camera constraint failed:', constraint, err.message);
          continue;
        }
      }

      if (!stream) {
        throw new Error('Unable to access camera with any configuration');
      }

      // Set video stream to show camera feed
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Make video visible and start scanning state
      setCameraLoading(false);
      setScanning(true);
      
      // Make video element visible
      if (videoRef.current) {
        videoRef.current.style.opacity = '1';
      }
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const video = videoRef.current;
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout'));
        }, 10000);

        const onLoadedMetadata = () => {
          clearTimeout(timeout);
          resolve();
        };

        if (video.readyState >= 2) {
          // Video already loaded
          onLoadedMetadata();
        } else {
          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        }
      });

      // Wait a bit more for video to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now start QR code detection using ZXing
      try {
        await codeReaderRef.current.decodeFromVideoDevice(
          undefined, // Use default video input
          videoRef.current,
          (result, error) => {
            if (result) {
              handleScan(result.getText());
            }
            // Don't log NotFoundException errors as they're normal during scanning
            if (error && error.name !== 'NotFoundException') {
              console.warn('QR Scanner error:', error);
            }
          }
        );
      } catch (zxingError) {
        console.warn('ZXing initialization error, but camera feed should still work:', zxingError);
        // Camera feed will still be visible even if ZXing has issues
        setError('QR detection may not work automatically. Please use manual input if needed.');
      }
      
    } catch (err) {
      console.error('Error starting camera:', err);
      setCameraLoading(false);
      setScanning(false);
      
      let errorMessage = 'Camera error: ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please make sure a camera is connected.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser. Try Chrome or Firefox.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    }
  };

  // Stop camera and scanning
  const stopCamera = () => {
    // Stop ZXing scanner
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
        console.warn('Error stopping ZXing scanner:', err);
      }
    }
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };

  // Handle manual QR code input
  const handleManualInput = async (qrCode) => {
    if (!qrCode.trim()) return;
    
    const result = await markAttendance(qrCode.trim());
    setScanResult(result);
    
    if (result.success) {
      // Auto-close after successful scan
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  // Handle QR code scan (now actually called when QR code is detected)
  const handleScan = async (data) => {
    if (data && !scanResult && !processing) { // Only process if we haven't already processed a result
      setProcessing(true);
      stopCamera(); // Stop scanning immediately
      
      const result = await markAttendance(data);
      setScanResult(result);
      setProcessing(false);
      
      if (result.success) {
        toast.success('Attendance marked successfully!');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    setProcessing(false);
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
          {!scanning && !scanResult && !cameraLoading && (
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

          {cameraLoading && (
            <div className="text-center">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4">Loading camera...</p>
                
                {/* Hidden video element that will be used once camera starts */}
                <div className="bg-black rounded-lg p-2 relative mx-auto max-w-sm">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-lg opacity-0"
                    style={{ 
                      minHeight: '256px',
                      maxHeight: '256px',
                      backgroundColor: '#000000',
                      display: 'block'
                    }}
                    onLoadedMetadata={() => {
                      // Video metadata loaded during loading state
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {scanning && (
            <div className="text-center">
              <div className="bg-black rounded-lg p-2 mb-4 relative mx-auto max-w-sm">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg opacity-100"
                  style={{ 
                    minHeight: '256px',
                    maxHeight: '256px',
                    backgroundColor: '#000000',
                    display: 'block'
                  }}
                  onLoadedMetadata={() => {
                    // Video metadata loaded - camera feed should be visible
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    setError('Video display error. Please try again.');
                  }}
                />
                {/* Scanning overlay */}
                <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-green-400 border-dashed rounded-lg w-40 h-40 flex items-center justify-center bg-green-400/10">
                    <div className="text-green-400 text-xs font-medium text-center bg-black/50 px-2 py-1 rounded">
                      Position QR Code Here
                    </div>
                  </div>
                </div>
                {/* Corner indicators */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-green-400"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-green-400"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-green-400"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-green-400"></div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                📱 Point camera at QR code - Detection is automatic
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Camera feed visible? {scanning ? 'Yes' : 'No'} | 
                Video ready: {videoRef.current?.readyState >= 2 ? 'Yes' : 'No'}
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
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <div className="text-xs text-red-600">
                <p>💡 Common solutions:</p>
                <ul className="text-left mt-2 space-y-1">
                  <li>• Make sure you're using HTTPS (camera requires secure context)</li>
                  <li>• Allow camera permissions when prompted</li>
                  <li>• Try refreshing the page</li>
                  <li>• Check if another app is using the camera</li>
                  <li>• Use manual input below as backup</li>
                </ul>
                {!location.protocol.includes('https') && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-yellow-800 font-semibold">⚠️ HTTP Detected</p>
                    <p className="text-yellow-700 text-xs">
                      Camera access requires HTTPS. For testing, you can:
                      <br />• Use manual QR input below
                      <br />• Access via https://localhost:3001 (if SSL enabled)
                      <br />• Deploy to a secure server
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {processing && (
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Processing QR Code...
                </h4>
                <p className="text-blue-700 text-sm">
                  Marking attendance, please wait...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Input Option */}
        {!scanning && !scanResult && !cameraLoading && (
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
