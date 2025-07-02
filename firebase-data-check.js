import { auth, db } from './src/config/firebase.js';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Simple script to check Firebase connection and data
async function checkFirebaseData() {
  console.log('🔥 Checking Firebase Connection...');
  
  try {
    // Check if Firebase is properly initialized
    console.log('Firebase Config:');
    console.log('- Project ID:', auth.app.options.projectId);
    console.log('- Auth Domain:', auth.app.options.authDomain);
    console.log('- Current User:', auth.currentUser?.email || 'No user signed in');
    
    // Try to check if Firestore is accessible
    console.log('\n📊 Checking Firestore Access...');
    
    // Check for users collection (common in most apps)
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(5));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log(`- Users collection: ${usersSnapshot.size} documents found`);
      
      usersSnapshot.forEach((doc) => {
        console.log(`  - User ID: ${doc.id}`);
        console.log(`  - Data:`, doc.data());
      });
    } catch (error) {
      console.log('- Users collection: Not accessible or empty');
      console.log('- Error:', error.message);
    }
    
    // Check for events collection
    try {
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(eventsRef, limit(3));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      console.log(`- Events collection: ${eventsSnapshot.size} documents found`);
    } catch (error) {
      console.log('- Events collection: Not accessible or empty');
    }
    
    console.log('\n✅ Firebase connection successful!');
    console.log('\n📍 To view your data:');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Select project: campusconnect-dbb08');
    console.log('3. Check Authentication → Users for user accounts');
    console.log('4. Check Firestore → Data for app data');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

// Usage: Run this in browser console or as a test
console.log('Run checkFirebaseData() to test your Firebase connection');
window.checkFirebaseData = checkFirebaseData;
