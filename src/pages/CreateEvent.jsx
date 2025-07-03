import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: 'Academic',
    maxAttendees: 50,
    isPublic: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Academic', 'Sports', 'Cultural', 'Social', 'Workshop', 'Study Group'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Event title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Event description is required');
      }
      if (!formData.date) {
        throw new Error('Event date is required');
      }
      if (!formData.time) {
        throw new Error('Event start time is required');
      }
      if (!formData.endTime) {
        throw new Error('Event end time is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Event location is required');
      }

      // Check if date is in the future
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      const eventEndDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      if (eventDateTime <= new Date()) {
        throw new Error('Event date and time must be in the future');
      }
      
      if (eventEndDateTime <= eventDateTime) {
        throw new Error('End time must be after start time');
      }

      const eventData = {
        ...formData,
        organizer: user.name || user.email,
        organizerId: user.id,
        createdAt: new Date().toISOString(),
        maxAttendees: parseInt(formData.maxAttendees)
      };

      const newEvent = addEvent(eventData);
      
      toast.success('Event created successfully!');
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Event location..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category and Max Attendees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Max Attendees
              </label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Public/Private */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                id="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                Make this event public (visible to all students)
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {formData.category}
            </span>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">
            {formData.title || 'Event Title'}
          </h4>
          
          <p className="text-gray-600 text-sm mb-3">
            {formData.description || 'Event description will appear here...'}
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formData.date || 'Date not set'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formData.time || 'Time not set'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{formData.location || 'Location not set'}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>0/{formData.maxAttendees} registered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
