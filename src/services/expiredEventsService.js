import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { isEventExpired } from '../utils/exportUtils';

/**
 * Service for managing expired events and their attendee data
 */
export class ExpiredEventsService {
  
  /**
   * Archive an expired event to the expired_events collection
   * @param {Object} event - The event to archive
   * @returns {Promise<string>} - The archived event ID
   */
  static async archiveExpiredEvent(event) {
    try {
      // Prepare data for archiving
      const archivedEvent = {
        ...event,
        archivedAt: new Date().toISOString(),
        originalEventId: event.id,
        confirmedAttendees: event.attendees ? event.attendees.filter(a => a.attended) : [],
        totalRegistered: event.attendees ? event.attendees.length : 0,
        attendanceRate: event.attendees && event.attendees.length > 0 
          ? ((event.attendees.filter(a => a.attended).length / event.attendees.length) * 100).toFixed(2)
          : 0
      };

      // Add to expired_events collection
      const docRef = await addDoc(collection(db, 'expired_events'), archivedEvent);
      
      return docRef.id;
    } catch (error) {
      console.error('Error archiving expired event:', error);
      // Fallback to local storage
      this.archiveToLocalStorage(event);
      throw error;
    }
  }

  /**
   * Get all archived events
   * @returns {Promise<Array>} - Array of archived events
   */
  static async getArchivedEvents() {
    try {
      const q = query(collection(db, 'expired_events'), orderBy('archivedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching archived events:', error);
      // Fallback to local storage
      return this.getArchivedFromLocalStorage();
    }
  }

  /**
   * Delete an archived event permanently
   * @param {string} archivedEventId - The ID of the archived event
   */
  static async deleteArchivedEvent(archivedEventId) {
    try {
      await deleteDoc(doc(db, 'expired_events', archivedEventId));
    } catch (error) {
      console.error('Error deleting archived event:', error);
      throw error;
    }
  }

  /**
   * Process expired events - archive them and remove from active events
   * @param {Array} events - Array of all events
   * @returns {Promise<Object>} - Summary of processed events
   */
  static async processExpiredEvents(events) {
    const expiredEvents = events.filter(event => isEventExpired(event));
    
    if (expiredEvents.length === 0) {
      return { processed: 0, archived: 0, errors: [] };
    }

    const results = {
      processed: expiredEvents.length,
      archived: 0,
      errors: []
    };

    for (const event of expiredEvents) {
      try {
        await this.archiveExpiredEvent(event);
        results.archived++;
      } catch (error) {
        results.errors.push({
          eventId: event.id,
          eventTitle: event.title,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Fallback: Archive to local storage
   */
  static archiveToLocalStorage(event) {
    try {
      const archivedEvents = JSON.parse(localStorage.getItem('archived_events') || '[]');
      const archivedEvent = {
        ...event,
        archivedAt: new Date().toISOString(),
        originalEventId: event.id,
        confirmedAttendees: event.attendees ? event.attendees.filter(a => a.attended) : []
      };
      
      archivedEvents.push(archivedEvent);
      localStorage.setItem('archived_events', JSON.stringify(archivedEvents));
    } catch (error) {
      console.error('Error archiving to local storage:', error);
    }
  }

  /**
   * Fallback: Get archived events from local storage
   */
  static getArchivedFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('archived_events') || '[]');
    } catch (error) {
      console.error('Error reading archived events from local storage:', error);
      return [];
    }
  }

  /**
   * Clean up old archived events (older than specified days)
   * @param {number} daysToKeep - Number of days to keep archived events
   */
  static async cleanupOldArchivedEvents(daysToKeep = 365) {
    try {
      const archivedEvents = await this.getArchivedEvents();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const eventsToDelete = archivedEvents.filter(event => {
        const archivedDate = new Date(event.archivedAt);
        return archivedDate < cutoffDate;
      });

      for (const event of eventsToDelete) {
        await this.deleteArchivedEvent(event.id);
      }

      return {
        cleaned: eventsToDelete.length,
        remaining: archivedEvents.length - eventsToDelete.length
      };
    } catch (error) {
      console.error('Error cleaning up old archived events:', error);
      throw error;
    }
  }
}
