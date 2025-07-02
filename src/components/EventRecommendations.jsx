import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { Sparkles, Calendar, MapPin, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventRecommendations = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // Mock AI recommendation algorithm
  const generateRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get user's event history
    const userEvents = events.filter(event => 
      event.attendees.some(attendee => attendee.userId === user.id)
    );

    // Extract user preferences from past events
    const userCategories = userEvents.map(event => event.category);
    const mostCommonCategory = userCategories.length > 0 
      ? userCategories.sort((a, b) =>
          userCategories.filter(v => v === a).length - userCategories.filter(v => v === b).length
        ).pop()
      : 'Academic';

    // Filter available events (not registered and in future)
    const availableEvents = events.filter(event => {
      const isNotRegistered = !event.attendees.some(attendee => attendee.userId === user.id);
      const isFuture = new Date(event.date) > new Date();
      return isNotRegistered && isFuture;
    });

    // Score events based on user preferences
    const scoredEvents = availableEvents.map(event => {
      let score = 0;
      
      // Category match
      if (event.category === mostCommonCategory) score += 3;
      
      // Popularity (more attendees = higher score)
      score += (event.attendees.length / event.maxAttendees) * 2;
      
      // Recency (sooner events get higher score)
      const daysUntilEvent = (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilEvent <= 7) score += 2;
      else if (daysUntilEvent <= 14) score += 1;
      
      // Available spots
      const availableSpots = event.maxAttendees - event.attendees.length;
      if (availableSpots > event.maxAttendees * 0.5) score += 1;
      
      return { ...event, score };
    });

    // Sort by score and take top 3
    const topRecommendations = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setRecommendations(topRecommendations);

    // Generate AI insight
    const insights = [
      `Based on your interest in ${mostCommonCategory} events, I've found some great matches for you!`,
      `You seem to enjoy campus activities! Here are some events that align with your preferences.`,
      `I noticed you're an active participant - these events match your engagement pattern.`,
      `Perfect timing! These upcoming events match your activity history and schedule.`
    ];
    
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
    setIsLoading(false);
  };

  useEffect(() => {
    generateRecommendations();
  }, [events, user.id]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
          AI Recommendations
        </h2>
        <button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {aiInsight && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-6 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-800">{aiInsight}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-yellow-600">
                        #{index + 1} Match
                      </span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, Math.ceil(event.score)))].map((_, i) => (
                        <Sparkles key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees.length}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                      AI Confidence: {Math.round(event.score * 20)}%
                    </div>
                    <span className="text-xs text-gray-500">
                      {event.maxAttendees - event.attendees.length} spots left
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No recommendations available</p>
                <p className="text-gray-400 text-sm">
                  Attend some events to help our AI learn your preferences!
                </p>
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                to="/events"
                className="text-primary-600 text-sm font-medium hover:text-primary-700"
              >
                View all events →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventRecommendations;
