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

  // Mock events data for initial setup - CLEARED
  const mockEvents = [];

  useEffect(() => {
    // Set up real-time listener for events collection
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        if (snapshot.empty) {
          // No events exist, start with empty array
          console.log('No events found, starting with empty event list...');
          setEvents([]);
          localStorage.removeItem('campus-events'); // Clear any cached events
          setLoading(false);
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
        // Start with empty events list
        setEvents([]);
        localStorage.removeItem('campus-events'); // Clear any cached events
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

  const updateEvent = async (eventId, updates, currentUserId, currentUserRole) => {
    try {
      // Find the event
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is an organizer (organizers can edit any event)
      if (currentUserRole !== 'organizer') {
        throw new Error('Only organizers can edit events');
      }
      
      await updateDoc(doc(db, 'events', eventId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.message.includes('Only organizers')) {
        toast.error(error.message);
        return;
      }
      
      // Fallback to local update for organizers
      if (currentUserRole === 'organizer') {
        const updatedEvents = events.map(event => 
          event.id === eventId ? { ...event, ...updates, updatedAt: new Date().toISOString() } : event
        );
        setEvents(updatedEvents);
        localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
        toast.success('Event updated successfully (offline mode)!');
      } else {
        toast.error('Only organizers can edit events');
      }
    }
  };

  const deleteEvent = async (eventId, currentUserId, currentUserRole) => {
    console.log('deleteEvent called with:', { eventId, currentUserId, currentUserRole });
    
    try {
      // Find the event
      const event = events.find(e => e.id === eventId);
      console.log('Found event:', event);
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is an organizer (organizers can delete any event)
      if (currentUserRole !== 'organizer') {
        throw new Error('Only organizers can delete events');
      }
      
      console.log('Organizer permission confirmed, attempting to delete from Firestore...');
      await deleteDoc(doc(db, 'events', eventId));
      console.log('Delete from Firestore successful');
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.message.includes('Only organizers')) {
        toast.error(error.message);
        return;
      }
      
      // Fallback to local deletion for organizers
      if (currentUserRole === 'organizer') {
        console.log('Falling back to local deletion for organizer');
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
        toast.success('Event deleted successfully (offline mode)!');
      } else {
        toast.error('Only organizers can delete events');
        throw error; // Re-throw so the UI can handle it
      }
    }
  };

  // Check if user can edit/delete an event
  const canModifyEvent = (event, currentUserId, currentUserRole) => {
    const canModify = currentUserRole === 'organizer';
    console.log('canModifyEvent check:', {
      eventId: event?.id,
      currentUserId,
      currentUserRole,
      canModify
    });
    return canModify;
  };

  // Function to clear all events (for admin use)
  const clearAllEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setEvents([]);
      localStorage.removeItem('campus-events');
      toast.success('All events cleared successfully!');
      console.log('All events cleared from Firestore and local storage');
    } catch (error) {
      console.error('Error clearing events:', error);
      // Fallback to local clearing
      setEvents([]);
      localStorage.removeItem('campus-events');
      toast.success('All events cleared locally!');
    }
  };

  const registerForEvent = async (eventId, userObj) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const userId = userObj.id || userObj.uid;
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
      userName: userObj.name || userObj.displayName || userObj.email?.split('@')[0] || 'Unknown User',
      userEmail: userObj.email,
      userRole: userObj.role || 'student',
      ...(userObj.role === 'student' 
        ? { userStudentId: userObj.studentId || '' }
        : { userOrganization: userObj.organizationName || '' }
      ),
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
    markAttendance,
    canModifyEvent,
    clearAllEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
