// Test script to verify export functionality includes student IDs
import { exportAttendeeData } from './src/utils/exportUtils.js';

// Mock event with attendees including student IDs
const testEvent = {
  id: 'test-event-1',
  title: 'Test Event',
  description: 'A test event for export verification',
  date: '2025-07-10',
  time: '14:00',
  endTime: '16:00',
  location: 'Test Campus',
  category: 'Academic',
  organizer: 'Test Organizer',
  attendees: [
    {
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john.doe@campus.edu',
      userStudentId: 'STU001',
      userRole: 'student',
      registeredAt: '2025-07-05T10:00:00.000Z',
      attended: true,
      attendedAt: '2025-07-10T14:00:00.000Z',
      qrCode: 'ATTEND-test-event-1-user-1-1234567890'
    },
    {
      userId: 'user-2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@campus.edu',
      userStudentId: 'STU002',
      userRole: 'student',
      registeredAt: '2025-07-05T11:00:00.000Z',
      attended: true,
      attendedAt: '2025-07-10T14:05:00.000Z',
      qrCode: 'ATTEND-test-event-1-user-2-1234567891'
    },
    {
      userId: 'user-3',
      userName: 'Bob Johnson',
      userEmail: 'bob.johnson@campus.edu',
      userStudentId: 'STU003',
      userRole: 'student',
      registeredAt: '2025-07-05T12:00:00.000Z',
      attended: false, // This one didn't attend, so shouldn't be in export
      qrCode: 'ATTEND-test-event-1-user-3-1234567892'
    }
  ]
};

try {
  console.log('Testing CSV export...');
  const csvData = exportAttendeeData(testEvent, 'csv');
  console.log('CSV Export Result:');
  console.log(csvData);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('Testing JSON export...');
  const jsonData = exportAttendeeData(testEvent, 'json');
  console.log('JSON Export Result:');
  console.log(jsonData);
  
  // Check if student IDs are included
  if (csvData.includes('STU001') && csvData.includes('STU002')) {
    console.log('\n✅ SUCCESS: Student IDs are correctly included in CSV export');
  } else {
    console.log('\n❌ ERROR: Student IDs are missing from CSV export');
  }
  
  const jsonObj = JSON.parse(jsonData);
  const hasStudentIds = jsonObj.confirmedAttendees.every(attendee => attendee.studentId);
  if (hasStudentIds) {
    console.log('✅ SUCCESS: Student IDs are correctly included in JSON export');
  } else {
    console.log('❌ ERROR: Student IDs are missing from JSON export');
  }
  
} catch (error) {
  console.error('❌ Export test failed:', error.message);
}
