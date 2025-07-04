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
            ...doc.data()
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

  // Auto-fix missing QR codes when events are loaded
  useEffect(() => {
    // Auto-fix missing QR codes when events are loaded
    if (!loading && events.length > 0) {
      let needsUpdate = false;
      const updatedEvents = events.map(event => {
        const updatedAttendees = event.attendees.map(attendee => {
          if (!attendee.qrCode || !attendee.qrCode.startsWith('ATTEND-')) {
            needsUpdate = true;
            const timestamp = Date.now() + Math.random() * 1000; // Add some randomness
            const newQRCode = `ATTEND-${event.id}-${attendee.userId}-${Math.floor(timestamp)}`;
            console.log(`Auto-fixing QR code for ${attendee.userName}: ${newQRCode}`);
            return {
              ...attendee,
              qrCode: newQRCode
            };
          }
          return attendee;
        });
        
        return {
          ...event,
          attendees: updatedAttendees
        };
      });

      if (needsUpdate) {
        console.log('Auto-fixing missing QR codes...');
        setEvents(updatedEvents);
        localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
        
        // Update Firebase in the background
        updatedEvents.forEach(async (event) => {
          if (event.attendees.some(a => !a.qrCode || !a.qrCode.startsWith('ATTEND-'))) {
            try {
              await updateDoc(doc(db, 'events', event.id), {
                attendees: event.attendees
              });
            } catch (error) {
              console.error(`Error updating event ${event.id}:`, error);
            }
          }
        });
      }
    }
  }, [loading, events.length]); // Run when loading changes or when events are first loaded

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
        attendees: []
      };
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      // Fallback to local storage
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        attendees: []
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

    // Generate unique QR code for this specific attendee-event combination
    // Format: ATTEND-{eventId}-{userId}-{timestamp}
    const timestamp = Date.now();
    const attendeeQRCode = `ATTEND-${eventId}-${userId}-${timestamp}`;

    console.log('Generating QR code for attendee:', {
      eventId,
      userId,
      qrCode: attendeeQRCode
    });

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
      attended: false,
      qrCode: attendeeQRCode // Unique QR code for this attendee
    };

    const updatedAttendees = [...event.attendees, newAttendee];

    try {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: updatedAttendees
      });
      
      // Update local state immediately
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees }
          : event
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
      
      toast.success('Successfully registered for the event!');
      console.log('Registration successful, QR code generated:', attendeeQRCode);
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

  // Mark attendance using scanned QR code
  const markAttendance = async (qrCodeData) => {
    try {
      console.log('Marking attendance for QR code:', qrCodeData);
      
      // Parse QR code to extract eventId and userId
      // QR code format: ATTEND-eventId-userId-timestamp
      if (!qrCodeData.startsWith('ATTEND-')) {
        throw new Error('Invalid QR code format - must be an attendance QR code');
      }

      const parts = qrCodeData.replace('ATTEND-', '').split('-');
      if (parts.length < 3) {
        throw new Error('Invalid QR code format');
      }
      
      const eventId = parts[0];
      const userId = parts[1];
      const timestamp = parts[2];
      
      console.log('Parsed QR code - EventID:', eventId, 'UserID:', userId, 'Timestamp:', timestamp);
      
      if (!eventId || !userId) {
        throw new Error('Invalid QR code format');
      }

      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.log('Available events:', events.map(e => e.id));
        throw new Error('Event not found');
      }

      const attendeeIndex = event.attendees.findIndex(
        attendee => attendee.userId === userId && attendee.qrCode === qrCodeData
      );

      console.log('Looking for attendee with userId:', userId, 'and qrCode:', qrCodeData);
      console.log('Available attendees:', event.attendees.map(a => ({ userId: a.userId, qrCode: a.qrCode })));

      if (attendeeIndex === -1) {
        throw new Error('Attendee not found or invalid QR code');
      }

      if (event.attendees[attendeeIndex].attended) {
        throw new Error('Attendance already marked for this attendee');
      }

      // Update attendee's attendance status
      const updatedAttendees = [...event.attendees];
      updatedAttendees[attendeeIndex] = {
        ...updatedAttendees[attendeeIndex],
        attended: true,
        attendedAt: new Date().toISOString()
      };

      // Update in Firebase
      await updateDoc(doc(db, 'events', eventId), {
        attendees: updatedAttendees
      });

      // Update local state
      const updatedEvents = events.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees }
          : e
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));

      toast.success(`Attendance marked for ${updatedAttendees[attendeeIndex].userName}`);
      return {
        success: true,
        attendee: updatedAttendees[attendeeIndex],
        event: event
      };
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Function to regenerate QR codes for existing attendees (migration helper)
  const regenerateQRCodes = async () => {
    try {
      let updated = false;
      const updatedEvents = events.map(event => {
        const updatedAttendees = event.attendees.map(attendee => {
          // Check if QR code needs to be regenerated
          if (!attendee.qrCode || !attendee.qrCode.startsWith('ATTEND-')) {
            const timestamp = Date.now();
            const newQRCode = `ATTEND-${event.id}-${attendee.userId}-${timestamp}`;
            console.log(`Regenerating QR code for ${attendee.userName}: ${newQRCode}`);
            updated = true;
            return {
              ...attendee,
              qrCode: newQRCode
            };
          }
          return attendee;
        });
        
        return {
          ...event,
          attendees: updatedAttendees
        };
      });

      if (updated) {
        setEvents(updatedEvents);
        localStorage.setItem('campus-events', JSON.stringify(updatedEvents));
        
        // Update Firebase for each event
        const updatePromises = updatedEvents.map(async (event) => {
          try {
            await updateDoc(doc(db, 'events', event.id), {
              attendees: event.attendees
            });
          } catch (error) {
            console.error(`Error updating event ${event.id}:`, error);
          }
        });
        
        await Promise.all(updatePromises);
        toast.success('QR codes regenerated successfully!');
      } else {
        toast.info('All QR codes are already up to date');
      }
    } catch (error) {
      console.error('Error regenerating QR codes:', error);
      toast.error('Failed to regenerate QR codes');
    }
  };

  // Function to fix QR code for a specific attendee
  const fixAttendeeQRCode = async (eventId, userId) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const attendeeIndex = event.attendees.findIndex(a => a.userId === userId);
      if (attendeeIndex === -1) {
        throw new Error('Attendee not found');
      }

      const attendee = event.attendees[attendeeIndex];
      if (attendee.qrCode && attendee.qrCode.startsWith('ATTEND-')) {
        // QR code already exists and is valid
        return attendee.qrCode;
      }

      // Generate new QR code
      const timestamp = Date.now();
      const newQRCode = `ATTEND-${eventId}-${userId}-${timestamp}`;
      
      const updatedAttendees = [...event.attendees];
      updatedAttendees[attendeeIndex] = {
        ...attendee,
        qrCode: newQRCode
      };

      // Update Firebase
      await updateDoc(doc(db, 'events', eventId), {
        attendees: updatedAttendees
      });

      // Update local state
      const updatedEvents = events.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees }
          : e
      );
      setEvents(updatedEvents);
      localStorage.setItem('campus-events', JSON.stringify(updatedEvents));

      console.log('QR code fixed for attendee:', newQRCode);
      return newQRCode;
    } catch (error) {
      console.error('Error fixing QR code:', error);
      // Return a temporary QR code as fallback
      const timestamp = Date.now();
      return `ATTEND-${eventId}-${userId}-${timestamp}`;
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
    clearAllEvents,
    regenerateQRCodes,
    fixAttendeeQRCode
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
