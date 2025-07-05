import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { 
  Clock, 
  MapPin, 
  Users, 
  Download, 
  Calendar,
  FileText,
  Archive,
  Trash2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const ArchivedEvents = () => {
  const { user } = useAuth();
  const { getArchivedEvents, exportArchivedEvents, exportEventAttendees, processExpiredEventsManually } = useEvents();
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Check if user is an organizer
  if (!user || user.role !== 'organizer') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">
            Only organizers can view archived events and export data.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadArchivedEvents();
  }, []);

  const loadArchivedEvents = async () => {
    setLoading(true);
    try {
      const archived = await getArchivedEvents();
      setArchivedEvents(archived);
    } catch (error) {
      console.error('Error loading archived events:', error);
      toast.error('Failed to load archived events');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async (format) => {
    setProcessing(true);
    try {
      await exportArchivedEvents(format);
    } catch (error) {
      console.error('Error exporting all events:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleExportEvent = async (event, format) => {
    setProcessing(true);
    try {
      // For archived events, we need to export directly since the event is no longer active
      const eventData = {
        ...event,
        attendees: event.confirmedAttendees?.map(attendee => ({
          ...attendee,
          attended: true // All archived attendees have confirmed attendance
        })) || []
      };
      
      const { exportAttendeeData, downloadFile, generateExportFilename } = await import('../utils/exportUtils');
      const data = exportAttendeeData(eventData, format);
      const filename = generateExportFilename(eventData, format);
      
      downloadFile(data, filename, format === 'csv' ? 'text/csv' : 'application/json');
      toast.success(`Attendee data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting event:', error);
      toast.error('Failed to export attendee data: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessExpired = async () => {
    setProcessing(true);
    try {
      await processExpiredEventsManually();
      // Reload archived events to show newly processed ones
      await loadArchivedEvents();
    } catch (error) {
      console.error('Error processing expired events:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archived Events</h1>
          <p className="text-gray-600 mt-2">
            View and export data from completed events with confirmed attendees
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessExpired}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            Process Expired
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportAll('csv')}
              disabled={processing || archivedEvents.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            <button
              onClick={() => handleExportAll('json')}
              disabled={processing || archivedEvents.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {archivedEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Archive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Archived Events</p>
                <p className="text-2xl font-bold text-gray-900">{archivedEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Confirmed Attendees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {archivedEvents.reduce((sum, event) => sum + (event.confirmedAttendees?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {archivedEvents.length > 0 
                    ? Math.round(archivedEvents.reduce((sum, event) => sum + (parseFloat(event.attendanceRate) || 0), 0) / archivedEvents.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archived Events List */}
      {archivedEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Archived Events</h3>
          <p className="text-gray-600 mb-4">
            Events will be automatically archived after they end. You can also manually process expired events.
          </p>
          <button
            onClick={handleProcessExpired}
            disabled={processing}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            Check for Expired Events
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {archivedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Archive className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.confirmedAttendees?.length || 0} attended</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Archived {new Date(event.archivedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {event.attendanceRate}% attendance rate
                        </span>
                        <span className="text-sm text-gray-500">
                          {event.totalRegistered} registered • {event.confirmedAttendees?.length || 0} attended
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportEvent(event, 'csv')}
                    disabled={processing || !event.confirmedAttendees?.length}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  
                  <button
                    onClick={() => handleExportEvent(event, 'json')}
                    disabled={processing || !event.confirmedAttendees?.length}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedEvents;
