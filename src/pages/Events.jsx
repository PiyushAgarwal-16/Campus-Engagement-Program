import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Plus
} from 'lucide-react';

const Events = () => {
  const { events, registerForEvent, unregisterFromEvent } = useEvents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const categories = ['all', 'Academic', 'Sports', 'Cultural', 'Social', 'Workshop', 'Study Group'];

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter (including tags)
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.tags && event.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= nextWeek;
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });
    }

    // Sort by date
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, searchTerm, selectedCategory, dateFilter]);

  const handleRegister = (eventId) => {
    registerForEvent(eventId, user);
  };

  const handleUnregister = (eventId) => {
    unregisterFromEvent(eventId, user);
  };

  const isRegistered = (event) => {
    return event.attendees.some(attendee => 
      (attendee.userId || attendee.id) === user.id
    );
  };

  const hasAttended = (event) => {
    const attendee = event.attendees.find(attendee => 
      (attendee.userId || attendee.id) === user.id
    );
    return attendee?.attended || false;
  };

  const getAvailableSpots = (event) => {
    return event.maxAttendees - event.attendees.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          <p className="text-gray-600 mt-1">Discover and join amazing events happening around campus</p>
        </div>
        {user?.role === 'organizer' && (
          <Link
            to="/create-event"
            className="mt-4 sm:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, tags, organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      {events.length > 0 && (() => {
        // Get all tags from events and count their frequency
        const tagCounts = {};
        events.forEach(event => {
          if (event.tags) {
            event.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        // Get top 10 most popular tags
        const popularTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));
          
        return popularTags.length > 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm transition-colors"
                >
                  <span>#{tag}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </button>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const registered = isRegistered(event);
          const attended = hasAttended(event);
          const availableSpots = getAvailableSpots(event);
          const isFull = availableSpots <= 0;

          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {availableSpots} spots left
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-base mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 4).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {event.tags.length > 4 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
                          +{event.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-base text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-base text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time} - {event.endTime || 'TBD'}</span>
                  </div>
                  <div className="flex items-center text-base text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-base text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.attendees.length}/{event.maxAttendees} registered</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </Link>
                  
                  {!registered && !isFull && (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Register
                    </button>
                  )}
                  
                  {registered && !attended && (
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      Unregister
                    </button>
                  )}
                  
                  {registered && attended && (
                    <div className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-center font-medium">
                      Attended ✓
                    </div>
                  )}
                  
                  {!registered && isFull && (
                    <div className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center font-medium">
                      Full
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Link
            to="/create-event"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create the first event</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Events;
