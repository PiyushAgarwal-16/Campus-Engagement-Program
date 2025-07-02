import React, { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock events data
  const mockEvents = [
    {
      id: '1',
      title: 'Tech Symposium 2025',
      description: 'Annual technology symposium featuring latest innovations and research presentations.',
      date: '2025-07-15',
      time: '09:00',
      location: 'Main Auditorium',
      organizer: 'Computer Science Department',
      category: 'Academic',
      attendees: [],
      maxAttendees: 200,
      isPublic: true,
      qrCode: 'tech-symposium-2025-qr'
    },
    {
      id: '2',
      title: 'Basketball Championship',
      description: 'Inter-college basketball tournament finals.',
      date: '2025-07-08',
      time: '16:00',
      location: 'Sports Complex',
      organizer: 'Sports Committee',
      category: 'Sports',
      attendees: [],
      maxAttendees: 500,
      isPublic: true,
      qrCode: 'basketball-championship-qr'
    },
    {
      id: '3',
      title: 'Study Group - Data Structures',
      description: 'Weekly study group for data structures and algorithms.',
      date: '2025-07-05',
      time: '14:00',
      location: 'Library Room 204',
      organizer: 'CS Study Group',
      category: 'Study Group',
      attendees: [],
      maxAttendees: 25,
      isPublic: true,
      qrCode: 'study-group-ds-qr'
    }
  ];

  useEffect(() => {
    // Load events from localStorage or use mock data
    const savedEvents = localStorage.getItem('campus-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(mockEvents);
      localStorage.setItem('campus-events', JSON.stringify(mockEvents));
    }
  }, []);

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      attendees: [],
      qrCode: `${eventData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    };
    
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
    return newEvent;
  };

  const updateEvent = (eventId, updates) => {
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    );
    setEvents(updatedEvents);
    localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
  };

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
  };

  const registerForEvent = (eventId, userId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const isAlreadyRegistered = event.attendees.some(attendee => attendee.userId === userId);
        if (!isAlreadyRegistered && event.attendees.length < event.maxAttendees) {
          return {
            ...event,
            attendees: [...event.attendees, {
              userId,
              registeredAt: new Date().toISOString(),
              attended: false
            }]
          };
        }
      }
      return event;
    });
    
    setEvents(updatedEvents);
    localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
  };

  const markAttendance = (eventId, userId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          attendees: event.attendees.map(attendee => 
            attendee.userId === userId 
              ? { ...attendee, attended: true, attendedAt: new Date().toISOString() }
              : attendee
          )
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
    localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
  };

  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    markAttendance
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
