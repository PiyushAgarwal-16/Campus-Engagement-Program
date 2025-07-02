# Campus Engagement Platform

A modern, AI-powered campus engagement platform that centralizes event management, improves communication, and tracks attendance for educational institutions.

## 🎯 Problem Statement

Low student engagement in campus activities due to:
- Poor communication and scattered event information
- Lack of centralized, real-time information platform
- Difficulty tracking attendance and generating reports
- Students missing important events and deadlines

## 🚀 Solution

Our platform provides:
- **Centralized Event Hub**: All campus events in one unified platform
- **AI-Powered Recommendations**: Personalized event suggestions using Google Gemini API
- **QR Code Attendance**: Automated check-ins and attendance sheet generation
- **Real-time Notifications**: Instant updates about relevant events
- **Comprehensive Analytics**: Event performance and engagement metrics

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **AI Integration**: Google Gemini API, Vertex AI
- **Additional Libraries**: 
  - React Router for navigation
  - QRCode.react for QR code generation
  - React Hot Toast for notifications
  - Lucide React for icons

## ✨ Key Features

### 1. Centralized Event Management
- Unified platform for all campus events
- Easy event creation and management
- Real-time event updates and notifications
- Category-based event organization

### 2. AI-Powered Event Recommendations
- Personalized event suggestions using Gemini API
- Machine learning-based preference analysis
- Smart event matching based on user behavior
- Confidence scoring for recommendations

### 3. QR Code Attendance Tracking
- Automated attendance marking via QR codes
- Real-time attendance monitoring
- Downloadable attendance sheets (CSV format)
- Attendance analytics and insights

### 4. User Profiles & Analytics
- Comprehensive user activity tracking
- Achievement system for engagement
- Event history and statistics
- Personalized dashboards

### 5. Modern UI/UX
- Responsive design for all devices
- Intuitive navigation and user experience
- Accessibility-compliant interface
- Modern design with Tailwind CSS

## 📱 Screenshots

### Dashboard
- Overview of upcoming events
- AI-powered event recommendations
- Quick action buttons
- Activity statistics

### Event Management
- Browse and filter events
- Detailed event information
- Registration and attendance tracking
- QR code generation for attendance

### Attendance System
- Real-time attendance monitoring
- Attendance analytics
- Downloadable reports
- QR code scanning interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Cloud account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-engagement-program
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication
   - Copy your Firebase config to `src/config/firebase.js`

4. **Configure Google AI (Gemini)**
   - Enable Vertex AI API in Google Cloud Console
   - Generate API key for Gemini
   - Add your API key to `src/config/gemini.js`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 📖 Usage

### For Students:
1. **Login** with your university email
2. **Browse Events** on the Events page
3. **Register** for events you're interested in
4. **Get AI Recommendations** on your dashboard
5. **Mark Attendance** by scanning QR codes at events
6. **Track Your Activity** on your profile page

### For Event Organizers:
1. **Create Events** using the event creation form
2. **Manage Registrations** and track attendance
3. **Generate QR Codes** for attendance tracking
4. **Download Attendance Reports** in CSV format
5. **View Analytics** on event performance

### For Administrators:
1. **Monitor Platform Usage** through analytics
2. **Manage User Accounts** and permissions
3. **Configure AI Recommendations** parameters
4. **Export Platform Data** for reporting

## 🔧 Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable required services:
   - Firestore Database
   - Authentication (Email/Password)
   - Cloud Functions (optional)
4. Copy configuration to `src/config/firebase.js`

### Gemini AI Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Vertex AI API
3. Create API credentials
4. Add API key to `src/config/gemini.js`

## 🤖 AI Features

### Event Recommendations
- Analyzes user event history and preferences
- Uses Gemini API for intelligent matching
- Provides confidence scores for recommendations
- Continuously learns from user interactions

### Smart Notifications
- AI-powered timing optimization
- Personalized notification content
- Preference-based filtering
- Engagement analytics

## 📊 Analytics & Reporting

### Event Analytics
- Registration and attendance rates
- Popular event categories
- Time-based engagement patterns
- User participation metrics

### Attendance Reports
- CSV export functionality
- Real-time attendance tracking
- Historical attendance data
- Custom report generation

## 🔐 Security & Privacy

- Firebase Authentication for secure user management
- Role-based access control
- Data encryption in transit and at rest
- Privacy-compliant user data handling
- GDPR compliance considerations

## 🚦 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile app development (React Native)
- Advanced AI features with Vertex AI
- Integration with university systems (LMS, ERP)
- Multi-language support
- Advanced analytics dashboard
- Social features and event reviews
- Calendar integrations
- Push notification system

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google AI (Gemini) for recommendation engine
- Tailwind CSS for styling framework
- React ecosystem for frontend development
- Open source community for various libraries

---

**Note**: This is a prototype demonstrating key features. For production deployment, additional security measures, error handling, and performance optimizations should be implemented.
