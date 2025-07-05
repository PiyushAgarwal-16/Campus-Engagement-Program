// Utility functions for exporting event data

/**
 * Export attendee data to CSV format
 * @param {Object} event - The event object with attendee data
 * @param {string} format - Export format ('csv', 'json')
 * @returns {string} - The formatted data
 */
export const exportAttendeeData = (event, format = 'csv') => {
  if (!event || !event.attendees) {
    throw new Error('Invalid event data');
  }

  // Filter only confirmed attendees
  const confirmedAttendees = event.attendees.filter(attendee => attendee.attended);

  if (confirmedAttendees.length === 0) {
    throw new Error('No confirmed attendees to export');
  }

  if (format === 'csv') {
    return exportToCSV(event, confirmedAttendees);
  } else if (format === 'json') {
    return exportToJSON(event, confirmedAttendees);
  } else {
    throw new Error('Unsupported export format');
  }
};

/**
 * Export to CSV format
 */
const exportToCSV = (event, attendees) => {
  const headers = [
    'Name',
    'Email', 
    'Student ID',
    'Registration Date',
    'Attendance Date',
    'QR Code'
  ];

  const csvContent = [
    // Event info header
    `Event: ${event.title}`,
    `Date: ${event.date}`,
    `Location: ${event.location}`,
    `Total Confirmed Attendees: ${attendees.length}`,
    '', // Empty line
    // CSV headers
    headers.join(','),
    // Attendee data
    ...attendees.map(attendee => [
      `"${attendee.userName || 'N/A'}"`,
      `"${attendee.userEmail || 'N/A'}"`,
      `"${attendee.studentId || 'N/A'}"`,
      `"${formatDate(attendee.registeredAt) || 'N/A'}"`,
      `"${formatDate(attendee.attendedAt) || 'N/A'}"`,
      `"${attendee.qrCode || 'N/A'}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Export to JSON format
 */
const exportToJSON = (event, attendees) => {
  const exportData = {
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      organizer: event.organizer,
      exportedAt: new Date().toISOString()
    },
    summary: {
      totalConfirmedAttendees: attendees.length,
      totalRegistered: event.attendees ? event.attendees.length : 0,
      attendanceRate: event.attendees ? ((attendees.length / event.attendees.length) * 100).toFixed(2) + '%' : '0%'
    },
    confirmedAttendees: attendees.map(attendee => ({
      name: attendee.userName,
      email: attendee.userEmail,
      studentId: attendee.studentId,
      registrationDate: attendee.registeredAt,
      attendanceDate: attendee.attendedAt,
      qrCode: attendee.qrCode
    }))
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Download data as file
 */
export const downloadFile = (content, filename, type = 'text/csv') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (event, format) => {
  const eventTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `${eventTitle}_attendees_${date}.${format}`;
};

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return dateString;
  }
};

/**
 * Export multiple events data
 */
export const exportMultipleEvents = (events, format = 'csv') => {
  const expiredEvents = events.filter(event => isEventExpired(event));
  
  if (format === 'csv') {
    let csvContent = 'Events Summary Report\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Total Expired Events: ${expiredEvents.length}\n\n`;
    
    expiredEvents.forEach((event, index) => {
      const confirmedAttendees = event.attendees ? event.attendees.filter(a => a.attended) : [];
      csvContent += `Event ${index + 1}: ${event.title}\n`;
      csvContent += `Date: ${event.date}, Location: ${event.location}\n`;
      csvContent += `Confirmed Attendees: ${confirmedAttendees.length}\n\n`;
      
      if (confirmedAttendees.length > 0) {
        csvContent += 'Name,Email,Student ID,Attendance Date\n';
        confirmedAttendees.forEach(attendee => {
          csvContent += `"${attendee.userName || 'N/A'}","${attendee.userEmail || 'N/A'}","${attendee.studentId || 'N/A'}","${formatDate(attendee.attendedAt) || 'N/A'}"\n`;
        });
      }
      csvContent += '\n';
    });
    
    return csvContent;
  }
  
  // JSON format for multiple events
  return JSON.stringify({
    summary: {
      generatedAt: new Date().toISOString(),
      totalExpiredEvents: expiredEvents.length,
      totalConfirmedAttendees: expiredEvents.reduce((sum, event) => 
        sum + (event.attendees ? event.attendees.filter(a => a.attended).length : 0), 0
      )
    },
    events: expiredEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      confirmedAttendees: event.attendees ? event.attendees.filter(a => a.attended) : []
    }))
  }, null, 2);
};

/**
 * Check if event has expired
 */
export const isEventExpired = (event) => {
  if (!event.date) return false;
  
  try {
    const eventDate = new Date(event.date);
    const endTime = event.endTime ? event.endTime : '23:59';
    const [hours, minutes] = endTime.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 59, 999);
    
    return new Date() > eventDate;
  } catch (error) {
    console.error('Error checking if event expired:', error);
    return false;
  }
};
