import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

const CameraTest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [cameraInfo, setCameraInfo] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Get list of video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices);
      setCameraInfo({
        deviceCount: videoDevices.length,
        devices: videoDevices.map(d => ({ label: d.label || 'Camera', id: d.deviceId }))
      });

      // Try to get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
      
    } catch (err) {
      console.error('Camera test error:', err);
      setError(err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setError(null);
    setCameraInfo(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Test Camera"
      >
        <Camera className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Camera Test</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* System Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium mb-2">System Information:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>Protocol: {location.protocol}</li>
              <li>Secure Context: {window.isSecureContext ? 'Yes' : 'No'}</li>
              <li>User Agent: {navigator.userAgent.substring(0, 50)}...</li>
              <li>Media Devices API: {navigator.mediaDevices ? 'Available' : 'Not supported'}</li>
            </ul>
          </div>

          {/* Camera Info */}
          {cameraInfo && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Camera Information:</h4>
              <p>Found {cameraInfo.deviceCount} camera(s):</p>
              <ul className="mt-1 space-y-1">
                {cameraInfo.devices.map((device, index) => (
                  <li key={index} className="text-blue-700">
                    • {device.label || `Camera ${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video Feed */}
          {cameraActive && (
            <div className="bg-black rounded-lg p-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 object-cover rounded"
                onLoadedMetadata={() => {
                  console.log('Camera test video loaded successfully');
                }}
                onError={(e) => {
                  console.error('Camera test video error:', e);
                }}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-900 mb-1">Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-3">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTest;
