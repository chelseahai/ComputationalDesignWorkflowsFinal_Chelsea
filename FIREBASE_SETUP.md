# Firebase Setup for Poll Component

## Getting Started with Firebase

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "cdw-poll")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "CDW Poll")
6. Click "Register app"
7. Copy the firebaseConfig object

### 3. Update the Code

Replace the placeholder configuration in `script.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 4. Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### 5. Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{document} {
      allow read, write: if true; // For development
      // For production, consider more restrictive rules
    }
  }
}
```

## Poll Data Structure

The poll component creates a document in the `polls` collection with the following structure:

```javascript
{
  "generative": 0,      // Votes for Generative Design
  "parametric": 0,      // Votes for Parametric Modeling
  "dataDriven": 0,      // Votes for Data-Driven Design
  "interactive": 0      // Votes for Interactive Systems
}
```

## Features

- **Real-time Data**: Votes are stored in Firebase Firestore
- **Fallback Support**: Uses localStorage if Firebase is unavailable
- **Visual Results**: Beautiful charts showing voting results
- **Statistics**: Total votes, most popular option, averages
- **Reset Functionality**: Admin can reset poll data

## Privacy and Ethics

This poll collects minimal data:
- Only vote counts (no personal information)
- No user tracking or identification
- Data is aggregated and anonymous
- Users can only vote once per session

## Troubleshooting

### Firebase Not Initializing
- Check your API key and configuration
- Ensure Firestore is enabled in your project
- Check browser console for error messages

### Data Not Saving
- Verify Firestore security rules allow read/write
- Check network connectivity
- Look for console errors

### Local Storage Fallback
If Firebase fails, the poll will automatically use localStorage as a fallback. Data will persist locally but won't sync across devices.

## Next Steps

1. Replace the placeholder Firebase config with your actual configuration
2. Test the poll functionality
3. Consider implementing user authentication for more advanced features
4. Add analytics to track poll engagement
