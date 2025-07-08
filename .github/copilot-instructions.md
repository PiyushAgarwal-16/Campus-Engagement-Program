<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Campus Engagement Platform

This is a React-based campus engagement platform prototype that helps solve student engagement issues on campus by providing:

## Project Overview
- **Frontend**: React.js with Vite build tool
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Key Features**: Event management, attendance tracking, real-time notifications

## Architecture & Code Style
- Use functional components with React hooks
- Implement proper error handling and loading states
- Follow responsive design principles with Tailwind CSS
- Use semantic HTML and accessibility best practices
- Maintain consistent file and component naming conventions

## Key Features Implemented
1. **Centralized Event Management**: Unified platform for all campus events
2. **QR Code Attendance Tracking**: Automated check-ins and attendance sheet generation
3. **Real-time Updates**: Live event information and notifications
4. **User Profiles**: Student profiles with activity tracking and achievements

## Firebase Integration Notes
- Configure Firebase config in `src/config/firebase.js`
- Use Firestore for event data, user profiles, and attendance records
- Implement Firebase Authentication for user management
- Set up Cloud Functions for backend logic and notifications

## Component Structure
- `src/pages/`: Main page components (Dashboard, Events, etc.)
- `src/components/`: Reusable UI components
- `src/contexts/`: React context providers for state management
- `src/config/`: Configuration files for Firebase and AI services

## Development Guidelines
- Always implement proper loading and error states
- Use TypeScript-style prop validation where possible
- Implement responsive design for mobile and desktop
- Follow accessibility guidelines (ARIA labels, keyboard navigation)
- Use meaningful commit messages and component documentation
