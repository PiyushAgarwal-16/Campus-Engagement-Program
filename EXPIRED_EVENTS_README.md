# Expired Events Management & Data Export

## Overview

The campus engagement platform now automatically manages expired events and provides comprehensive data export capabilities for organizers.

## Features

### 1. Automatic Event Expiration
- **Automatic Detection**: Events are automatically detected as expired after their end date/time
- **Hourly Processing**: System checks for expired events every hour
- **Graceful Archiving**: Expired events are moved to an archived collection with full attendee data preserved

### 2. Data Export Capabilities
- **CSV Export**: Export attendee data in comma-separated values format
- **JSON Export**: Export structured data in JSON format for programmatic use
- **Individual Event Export**: Export data for specific events from event details page
- **Bulk Archive Export**: Export summary data for all archived events

### 3. Archived Events Management
- **Dedicated Page**: `/archived-events` route for organizers to view past events
- **Summary Statistics**: Total archived events, confirmed attendees, and attendance rates
- **Data Retention**: Archived events are kept for reporting and compliance purposes

## How It Works

### Event Lifecycle
1. **Active Event**: Event is live and accepting registrations
2. **Event Ends**: After the event end time passes
3. **Auto-Detection**: System detects the event has expired
4. **Archiving**: Event data is moved to `expired_events` collection
5. **Removal**: Event is removed from active events list
6. **Export Available**: Attendee data becomes available for export

### Data Export Process
1. **Confirmed Attendees Only**: Only exports data for attendees who actually attended (scanned QR code)
2. **Complete Information**: Includes name, email, student ID, attendance time, etc.
3. **Event Metadata**: Includes event details, attendance rates, and summary statistics
4. **Multiple Formats**: CSV for spreadsheet use, JSON for data analysis

### Data Security
- **Organizer Only**: Only organizers can access archived events and export data
- **GDPR Compliant**: Data export includes only necessary information
- **Audit Trail**: All exports are logged with timestamps

## Usage Instructions

### For Organizers

#### Viewing Archived Events
1. Navigate to "Archived Events" in the main navigation
2. View summary statistics and list of all archived events
3. See attendance rates and confirmed attendee counts

#### Exporting Individual Event Data
1. Go to any event details page
2. If the event has confirmed attendees, export buttons will appear
3. Choose CSV or JSON format
4. File will be automatically downloaded

#### Exporting All Archived Data
1. Go to "Archived Events" page
2. Click "Export CSV" or "Export JSON" button
3. Get comprehensive report of all archived events

#### Manual Processing
1. Click "Process Expired" button on archived events page
2. Manually trigger check for expired events
3. Useful for immediate processing instead of waiting for hourly check

### File Formats

#### CSV Export
```csv
Event: Sample Event
Date: 2025-01-15
Location: Main Hall
Total Confirmed Attendees: 25

Name,Email,Student ID,Registration Date,Attendance Date,QR Code
"John Doe","john@university.edu","ST001","2025-01-14 10:00","2025-01-15 14:30","ATTEND-123-456-789"
```

#### JSON Export
```json
{
  "event": {
    "id": "event-123",
    "title": "Sample Event",
    "date": "2025-01-15",
    "location": "Main Hall"
  },
  "summary": {
    "totalConfirmedAttendees": 25,
    "attendanceRate": "83.33%"
  },
  "confirmedAttendees": [
    {
      "name": "John Doe",
      "email": "john@university.edu",
      "studentId": "ST001",
      "attendanceDate": "2025-01-15T14:30:00Z"
    }
  ]
}
```

## Technical Implementation

### Files Added/Modified
- `src/utils/exportUtils.js` - Export utility functions
- `src/services/expiredEventsService.js` - Expired events management
- `src/pages/ArchivedEvents.jsx` - Archived events page
- `src/contexts/EventContext.jsx` - Added export functions
- `src/pages/EventDetails.jsx` - Added export buttons

### Database Collections
- `events` - Active events
- `expired_events` - Archived event data

### Key Functions
- `isEventExpired()` - Check if event has ended
- `exportAttendeeData()` - Generate export data
- `downloadFile()` - Handle file downloads
- `processExpiredEvents()` - Archive expired events

## Configuration

### Automatic Processing Interval
By default, expired events are checked every hour. To modify:
```javascript
// In EventContext.jsx
const interval = setInterval(processExpiredEvents, 60 * 60 * 1000); // 1 hour
```

### Data Retention
Archived events are kept indefinitely. To enable cleanup:
```javascript
// Call this function periodically
ExpiredEventsService.cleanupOldArchivedEvents(365); // Keep for 1 year
```

## Troubleshooting

### No Export Button Visible
- Ensure you're logged in as an organizer
- Event must have at least one confirmed attendee (someone who scanned QR code)

### Export Download Not Working
- Check browser popup/download blocker settings
- Ensure sufficient permissions for file downloads

### Events Not Auto-Archiving
- Check browser console for errors
- Manually trigger with "Process Expired" button
- Verify event dates are in the past

## Privacy & Compliance

### Data Handling
- Only confirmed attendee data is exported
- Personal information is limited to event-relevant details
- No sensitive data like passwords or personal documents

### Access Control
- Only organizers can export data
- Each export is for specific events they have access to
- No cross-organization data access

### Data Retention
- Archived events contain full attendee records
- Data can be permanently deleted by administrators
- Export logs are maintained for audit purposes
