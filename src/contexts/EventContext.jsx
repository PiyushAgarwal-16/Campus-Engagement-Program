import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  // Mock events data for initial setup
  const mockEvents = [
    {
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
      createdAt: new Date().toISOString()
    },
    {
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
      createdAt: new Date().toISOString()
    },
    {
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
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Set up real-time listener for events collection
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        if (snapshot.empty) {
          // If no events exist, add mock data
          console.log('No events found, adding mock data...');
          try {
            for (const mockEvent of mockEvents) {
              await addDoc(collection(db, 'events'), mockEvent);
            }
          } catch (error) {
            console.error('Error adding mock events:', error);
            // Fallback to localStorage if Firestore fails
            const savedEvents = localStorage.getItem('campus-events');
            if (savedEvents) {
              setEvents(JSON.parse(savedEvents));
            } else {
              setEvents(mockEvents.map((event, index) => ({
                ...event,
                id: `mock-${index}`,
                qrCode: `${event.title.toLowerCase().replace(/\s+/g, '-')}-qr`
              })));
              localStorage.setItem('campus-events', JSON.stringify(events));
            }
            setLoading(false);
          }
        } else {
          const eventsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            qrCode: `${doc.data().title?.toLowerCase().replace(/\s+/g, '-')}-${doc.id}`
          }));
          setEvents(eventsData);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching events:', error);
        // Fallback to localStorage
        const savedEvents = localStorage.getItem('campus-events');
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        } else {
          setEvents(mockEvents.map((event, index) => ({
            ...event,
            id: `mock-${index}`,
            qrCode: `${event.title.toLowerCase().replace(/\s+/g, '-')}-qr`
          })));
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addEvent = async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        attendees: [],
        createdAt: new Date().toISOString()
      });
      
      const newEvent = {
        id: docRef.id,
        ...eventData,
        attendees: [],
        qrCode: `${eventData.title.toLowerCase().replace(/\s+/g, '-')}-${docRef.id}`
      };
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      // Fallback to local storage
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        attendees: [],
        qrCode: `${eventData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      };
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      toast.success('Event created successfully (offline mode)!');
      return newEvent;
    }
  };

  const updateEvent = async (eventId, updates) => {
    try {
      await updateDoc(doc(db, 'events', eventId), updates);
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      // Fallback to local update
      const updatedEvents = events.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      toast.success('Event updated successfully (offline mode)!');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      // Fallback to local deletion
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      toast.success('Event deleted successfully (offline mode)!');
    }
  };

  const registerForEvent = async (eventId, userId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const isAlreadyRegistered = event.attendees.some(attendee => attendee.userId === userId);
    if (isAlreadyRegistered) {
      toast.error('You are already registered for this event!');
      return;
    }

    if (event.attendees.length >= event.maxAttendees) {
      toast.error('This event is full!');
      return;
    }

    const newAttendee = {
      userId,
      registeredAt: new Date().toISOString(),
      attended: false
    };

    const updatedAttendees = [...event.attendees, newAttendee];

    try {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: updatedAttendees
      });
      toast.success('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      // Fallback to local update
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees }
          : event
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      toast.success('Successfully registered for the event (offline mode)!');
    }
  };

  const markAttendance = async (eventId, userId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedAttendees = event.attendees.map(attendee => 
      attendee.userId === userId 
        ? { ...attendee, attended: true, attendedAt: new Date().toISOString() }
        : attendee
    );

    try {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: updatedAttendees
      });
      toast.success('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      // Fallback to local update
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees }
          : event
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      toast.success('Attendance marked successfully (offline mode)!');
    }
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
