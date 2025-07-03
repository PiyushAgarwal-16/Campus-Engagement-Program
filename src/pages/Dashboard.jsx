import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Plus,
  TrendingUp,
  Bell,
  Star
} from 'lucide-react';
import EventRecommendations from '../components/EventRecommendations';

const Dashboard = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    registeredEvents: 0,
    attendedEvents: 0
  });

  useEffect(() => {
    // Filter upcoming events (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= nextWeek;
    }).slice(0, 3);
    
    setUpcomingEvents(upcoming);

    // Calculate stats
    const registered = events.filter(event => 
      event.attendees.some(attendee => attendee.userId === user.id)
    ).length;
    
    const attended = events.filter(event => 
      event.attendees.some(attendee => attendee.userId === user.id && attendee.attended)
    ).length;

    setStats({
      totalEvents: events.length,
      registeredEvents: registered,
      attendedEvents: attended
    });
  }, [events, user.id]);

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Registered',
      value: stats.registeredEvents,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Attended',
      value: stats.attendedEvents,
      icon: Star,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100">
              Stay connected with campus life and never miss an event again.
            </p>
          </div>
          <Link
            to="/create-event"
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <Link
              to="/events"
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time} - {event.endTime || 'TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {event.category}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events this week</p>
                <Link
                  to="/events"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  Browse all events
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* AI Event Recommendations */}
        <EventRecommendations />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/events"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-center"
          >
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Browse Events</span>
          </Link>
          
          <Link
            to="/create-event"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-center"
          >
            <Plus className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Event</span>
          </Link>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-center">
            <Bell className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Notifications</span>
          </button>
          
          <Link
            to="/profile"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-center"
          >
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
