import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Bell, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome to Campus Engage!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Centralized Events',
      description: 'All campus events in one place - no more scattered information'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Get instant updates about events you care about'
    },
    {
      icon: Users,
      title: 'Easy Registration',
      description: 'Register for events with just one click'
    },
    {
      icon: BarChart3,
      title: 'Attendance Tracking',
      description: 'QR code check-ins and automated attendance sheets'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Features */}
            <div className="lg:w-1/2 bg-primary-600 p-8 lg:p-12 text-white">
              <div className="flex items-center space-x-2 mb-8">
                <Calendar className="w-8 h-8" />
                <h1 className="text-2xl font-bold">Campus Engage</h1>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Connect. Engage. Participate.
              </h2>
              
              <p className="text-primary-100 mb-8">
                The ultimate platform for campus life - bringing students and events together through smart technology.
              </p>
              
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-primary-500 rounded-lg p-2 mt-1">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-primary-100 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="student@university.edu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
                  <p className="text-xs text-gray-500">Email: student@university.edu</p>
                  <p className="text-xs text-gray-500">Password: any password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
