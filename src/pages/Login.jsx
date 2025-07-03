import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Bell, BarChart3, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Additional validation before attempting authentication
      if (!email || !password) {
        toast.error('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      console.log(`Attempting ${isSignUp ? 'signup' : 'login'} for:`, email);
      
      if (isSignUp) {
        // Validation for sign up
        if (!name.trim()) {
          toast.error('Please enter your full name');
          setIsLoading(false);
          return;
        }
        if (role === 'student' && !studentId.trim()) {
          toast.error('Please enter your student ID');
          setIsLoading(false);
          return;
        }
        if (role === 'organizer' && !organizationName.trim()) {
          toast.error('Please enter your organization/department name');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match!');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long!');
          setIsLoading(false);
          return;
        }
        
        const additionalData = {
          name: name.trim(),
          role: role,
          ...(role === 'student' ? { studentId: studentId.trim() } : { organizationName: organizationName.trim() })
        };
        
        await signup(email, password, additionalData);
        toast.success(`Account created successfully! Welcome to Campus Engage as ${role === 'student' ? 'a student' : 'an organizer'}!`);
        console.log('Signup successful for:', email);
      } else {
        await login(email, password);
        toast.success('Welcome back to Campus Engage!');
        console.log('Login successful for:', email);
      }
    } catch (error) {
      console.error('Auth error for', email, ':', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please sign up first or check your email.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address. Please check and try again.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. Please check your credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error(isSignUp 
          ? 'Failed to create account. Please try again.' 
          : 'Sign in failed. Please check your email and password.'
        );
      }
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

            {/* Right side - Login/Signup Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome back'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {isSignUp 
                    ? 'Join the campus community today' 
                    : 'Sign in to your account to continue'
                  }
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {isSignUp && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="student"
                              checked={role === 'student'}
                              onChange={(e) => setRole(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              role === 'student' 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}>
                              <div className="text-center">
                                <Users className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                                <div className="font-medium text-gray-900">Student</div>
                                <div className="text-xs text-gray-500">Register for events</div>
                              </div>
                            </div>
                          </label>
                          
                          <label className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="organizer"
                              checked={role === 'organizer'}
                              onChange={(e) => setRole(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              role === 'organizer' 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}>
                              <div className="text-center">
                                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                                <div className="font-medium text-gray-900">Organizer</div>
                                <div className="text-xs text-gray-500">Create & manage events</div>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      {role === 'student' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student ID *
                          </label>
                          <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="ST123456"
                            required
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization/Department *
                          </label>
                          <input
                            type="text"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Computer Science Department"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
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
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                        minLength={isSignUp ? 6 : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isSignUp && (
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                    )}
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading 
                      ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
                      : (isSignUp ? 'Create Account' : 'Sign In')
                    }
                  </button>
                </form>

                {/* Toggle between Sign In and Sign Up */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setPassword('');
                        setConfirmPassword('');
                        setEmail('');
                        setName('');
                        setStudentId('');
                        setOrganizationName('');
                        setRole('student');
                      }}
                      className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>

                {!isSignUp && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Demo Account:</p>
                    <p className="text-xs text-gray-500">Email: demo@university.edu</p>
                    <p className="text-xs text-gray-500">Password: demo123</p>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('demo@university.edu');
                        setPassword('demo123');
                      }}
                      className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Use Demo Credentials
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
