# How to View Your Firebase Data

## 🔍 Checking Firebase Authentication Users

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project:**
   - Click on "campusconnect-dbb08" project

3. **View Authentication Users:**
   - In left sidebar, click "Authentication"
   - Click "Users" tab
   - You'll see all registered users with:
     - Email addresses
     - User IDs (UID)
     - Creation date
     - Last sign-in time
     - Provider (Email/Password)

## 🗄️ Checking Firestore Database

1. **From Firebase Console:**
   - Click "Firestore Database" in left sidebar
   - Click "Data" tab

2. **Collections You Might See:**
   - `users` - User profiles and settings
   - `events` - Campus events data
   - `attendance` - Event attendance records
   - `notifications` - User notifications

## 🔐 Data Security in Firebase

### Authentication Data:
- **Passwords:** Encrypted using industry-standard hashing
- **Email addresses:** Stored securely
- **User tokens:** Auto-generated and secure
- **Session management:** Handled by Firebase

### Firestore Data:
- **Security Rules:** Control who can read/write data
- **Encryption:** All data encrypted in transit and at rest
- **Backups:** Automatic backups available
- **Access Control:** User-based permissions

## 📊 What Data is Being Saved

When users sign up or sign in, Firebase stores:

### Authentication Table:
```
User ID (UID) | Email Address        | Created      | Last Sign In | Provider
-------------|---------------------|--------------|--------------|----------
abc123...    | student@university  | 2025-07-02   | 2025-07-02   | Email/Password
def456...    | demo@university.edu | 2025-07-01   | 2025-07-02   | Email/Password
```

### User Profiles (in Firestore):
```javascript
// Document: users/[userID]
{
  id: "abc123...",
  email: "student@university.edu",
  name: "John Doe",
  role: "student",
  avatar: "https://ui-avatars.com/api/?name=John+Doe",
  createdAt: "2025-07-02T10:30:00Z",
  preferences: {
    notifications: true,
    eventCategories: ["academic", "social"]
  }
}
```

## 🚨 Privacy & GDPR Compliance

Firebase provides:
- **Data Export:** Users can request their data
- **Data Deletion:** Users can delete their accounts
- **Data Portability:** Export data in standard formats
- **Audit Logs:** Track data access and changes
- **Geographic Controls:** Data location controls

## 📱 Real-time Data Sync

Your app uses Firebase's real-time features:
- **Live Updates:** Changes sync instantly across devices
- **Offline Support:** Data cached locally when offline
- **Conflict Resolution:** Automatic merge of conflicting changes
- **Scalability:** Handles millions of users automatically

## 🔧 Managing Your Data

### To view/manage users:
1. Firebase Console → Authentication → Users
2. Search, filter, disable, or delete users
3. Export user lists
4. Set custom claims or roles

### To manage database:
1. Firebase Console → Firestore → Data
2. View, edit, or delete documents
3. Set up security rules
4. Monitor usage and performance

## 🛡️ Security Best Practices

Your current setup includes:
- ✅ Email/Password authentication
- ✅ Secure API keys
- ✅ HTTPS-only connections
- ✅ Input validation
- ✅ Error handling
- ✅ Session management

## 📈 Analytics & Monitoring

Firebase also provides:
- **Google Analytics:** User behavior tracking
- **Performance Monitoring:** App performance metrics
- **Crash Reporting:** Error tracking
- **Usage Statistics:** Database and auth usage
