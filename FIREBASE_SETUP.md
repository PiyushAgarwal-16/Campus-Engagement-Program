# Firebase Setup Instructions

## 🔥 Your Firebase Configuration is Ready!

Your Firebase configuration has been successfully integrated into the Campus Engagement Platform. Here's what you need to do to complete the setup:

### 1. Enable Required Firebase Services

Go to your [Firebase Console](https://console.firebase.google.com/project/campusconnect-dbb08) and enable:

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable **Google** sign-in for easier access

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose your preferred location

### 2. Firestore Security Rules (Development)

For development, use these permissive rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read access to events (for browsing without login)
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Test the Integration

1. **Start the development server** (already running)
2. **Create a test account**:
   - Go to `http://localhost:3000`
   - Try logging in with any email (e.g., `test@university.edu`)
   - The system will automatically create an account if it doesn't exist
3. **Test event creation**:
   - Create a new event using the "Create Event" form
   - The event should appear in Firestore Database
4. **Test real-time updates**:
   - Open the app in multiple browser tabs
   - Create an event in one tab and see it appear in others

### 4. Current Features with Firebase Integration

✅ **Real-time Authentication**: Users are authenticated with Firebase Auth
✅ **Real-time Events**: Events are stored and synced with Firestore
✅ **Offline Fallback**: App works offline with localStorage backup
✅ **Auto-Registration**: New users are automatically created on first login
✅ **Live Updates**: Changes sync across all connected clients

### 5. Database Structure

The app creates these Firestore collections:

#### `events` Collection
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-07-15",
  "time": "09:00",
  "location": "Event Location",
  "organizer": "Organizer Name",
  "organizerId": "user_id",
  "category": "Academic",
  "maxAttendees": 100,
  "isPublic": true,
  "attendees": [
    {
      "userId": "user_id",
      "registeredAt": "2025-07-02T12:00:00.000Z",
      "attended": false,
      "attendedAt": null
    }
  ],
  "createdAt": "2025-07-02T12:00:00.000Z"
}
```

### 6. Testing Different User Scenarios

#### Student Flow:
1. Login with `student@university.edu`
2. Browse events on the Events page
3. Register for events
4. Check Dashboard for AI recommendations
5. View Profile for statistics

#### Organizer Flow:
1. Login with `organizer@university.edu`
2. Create events using "Create Event"
3. Monitor attendance on event details pages
4. Download attendance reports

### 7. Production Security Rules

For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events are readable by all authenticated users
    // Only event creators can modify their events
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.organizerId;
    }
  }
}
```

### 8. Monitoring and Analytics

Your Firebase project includes Google Analytics. Monitor:
- User engagement and retention
- Event creation and attendance rates
- Popular event categories
- User authentication patterns

### 🎉 You're All Set!

Your Campus Engagement Platform is now fully integrated with Firebase and ready for real-world testing. The app will automatically:

- Create mock events if the database is empty
- Handle authentication seamlessly
- Sync data in real-time across devices
- Provide offline functionality as backup

**Next Steps:**
1. Test all features with real Firebase data
2. Invite other users to test the platform
3. Monitor usage in Firebase Console
4. Configure production security rules when ready to deploy
