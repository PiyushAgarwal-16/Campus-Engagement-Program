// Test script to create expired events for testing
// This can be run in the browser console

const createTestExpiredEvent = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const testEvent = {
    title: "Test Expired Event",
    description: "This is a test event that has already ended",
    date: yesterday.toISOString().split('T')[0],
    time: "10:00",
    endTime: "12:00", 
    location: "Test Location",
    category: "Academic",
    maxAttendees: 50,
    organizer: "Test Organizer",
    organizerId: "test-organizer-123",
    isPublic: true,
    tags: ["test", "expired"],
    attendees: [
      {
        userId: "user1",
        userName: "John Doe",
        userEmail: "john@example.com",
        studentId: "ST001",
        qrCode: "ATTEND-test-event-user1-123456",
        registeredAt: new Date(yesterday.getTime() - 86400000).toISOString(), // Day before
        attended: true,
        attendedAt: yesterday.toISOString()
      },
      {
        userId: "user2", 
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        studentId: "ST002",
        qrCode: "ATTEND-test-event-user2-123457",
        registeredAt: new Date(yesterday.getTime() - 86400000).toISOString(),
        attended: true,
        attendedAt: yesterday.toISOString()
      },
      {
        userId: "user3",
        userName: "Bob Wilson", 
        userEmail: "bob@example.com",
        studentId: "ST003",
        qrCode: "ATTEND-test-event-user3-123458",
        registeredAt: new Date(yesterday.getTime() - 86400000).toISOString(),
        attended: false // Registered but didn't attend
      }
    ],
    createdAt: new Date(yesterday.getTime() - 172800000).toISOString() // Two days before
  };
  
  console.log('Test expired event created:', testEvent);
  return testEvent;
};

// Instructions:
// 1. Open browser console on the app
// 2. Run: createTestExpiredEvent()
// 3. Copy the event object and manually add it to Firestore or local storage for testing
// 4. The expired event processing should automatically detect and archive it
