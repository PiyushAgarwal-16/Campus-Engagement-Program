import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Settings,
  Bell,
  Shield,
  Edit2
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Passionate student interested in technology and campus activities.',
    interests: ['Technology', 'Sports', 'Academic Events']
  });

  // Calculate user statistics
  const registeredEvents = events.filter(event => 
    event.attendees.some(attendee => attendee.userId === user?.id)
  );
  
  const attendedEvents = events.filter(event => 
    event.attendees.some(attendee => attendee.userId === user?.id && attendee.attended)
  );

  const createdEvents = events.filter(event => event.organizerId === user?.id);

  const handleSave = () => {
    // In a real app, this would update the user profile in the database
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start space-x-6">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-primary-100"
              />
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <button
                      onClick={handleSave}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {profileData.name}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-3">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{profileData.email}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{profileData.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{registeredEvents.length}</div>
                <div className="text-sm text-blue-700">Registered Events</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{attendedEvents.length}</div>
                <div className="text-sm text-green-700">Events Attended</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{createdEvents.length}</div>
                <div className="text-sm text-purple-700">Events Created</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900">
                  {registeredEvents.length > 0 ? Math.round((attendedEvents.length / registeredEvents.length) * 100) : 0}%
                </div>
                <div className="text-sm text-yellow-700">Attendance Rate</div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
            
            {registeredEvents.slice(0, 3).length > 0 ? (
              <div className="space-y-3">
                {registeredEvents.slice(0, 3).map((event) => {
                  const attended = event.attendees.find(a => a.userId === user?.id)?.attended;
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attended 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {attended ? 'Attended' : 'Registered'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No events registered yet. <a href="/events" className="text-primary-600 hover:text-primary-700">Browse events</a>
              </p>
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Quick Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Email Updates</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Public Profile</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            
            <div className="space-y-3">
              {attendedEvents.length >= 5 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-900">Event Enthusiast</div>
                    <div className="text-xs text-yellow-700">Attended 5+ events</div>
                  </div>
                </div>
              )}
              
              {createdEvents.length >= 1 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Event Organizer</div>
                    <div className="text-xs text-blue-700">Created your first event</div>
                  </div>
                </div>
              )}
              
              {registeredEvents.length >= 10 && (
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">Active Participant</div>
                    <div className="text-xs text-purple-700">Registered for 10+ events</div>
                  </div>
                </div>
              )}
              
              {(attendedEvents.length === 0 && registeredEvents.length === 0 && createdEvents.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Start participating in events to earn achievements!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
