# Benaam - An Anonymous Tweet App

A **React Native anonymous-style social media application** built with **Expo, Expo Router, Firebase Authentication, and Cloud Firestore**.

Benaam allows authenticated users to share text posts, search through posts, like posts, comment on posts, like comments, and delete their own content. The application also includes push-notification token registration, persistent login through Firebase Authentication, light/dark theme support, and a settings screen.

> **Project status:** Educational/mobile application project built with Expo and React Native.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Posts](#posts)
- [Comments](#comments)
- [Likes](#likes)
- [Search](#search)
- [Content Censoring](#content-censoring)
- [Push Notifications](#push-notifications)
- [Theme System](#theme-system)
- [Settings](#settings)
- [Firebase Integration](#firebase-integration)
- [Firestore Data Model](#firestore-data-model)
- [Navigation](#navigation)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running on Android](#running-on-android)
- [Running on iOS](#running-on-ios)
- [Running on Web](#running-on-web)
- [Firebase Setup](#firebase-setup)
- [Push Notification Setup](#push-notification-setup)
- [Environment and Security](#environment-and-security)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Learning Objectives](#learning-objectives)
- [License](#license)

---

## Overview

Benaam is designed as a lightweight social platform where users can create accounts and participate in a shared post feed.

The application uses:

- **Firebase Authentication** for account registration and login.
- **Cloud Firestore** for real-time posts, comments, likes, and user notification tokens.
- **Expo Router** for file-based navigation.
- **React Native Paper** for UI components and theming.
- **AsyncStorage** for authentication persistence and saving the selected theme.
- **Expo Notifications** for push-notification registration.
- **React Native Gesture Handler** for swipe and long-press interactions.

The main application screen is a real-time posts feed. Users can create posts, search posts, expand posts to view comments, like posts through long press, comment, like comments through long press, and delete their own posts or comments.

---

# Features

## 1. User Registration

New users can create an account using an email address and password.

The registration flow uses Firebase Authentication:

```text
Sign Up
   |
   v
Enter Email + Password
   |
   v
Firebase Authentication
   |
   v
Account Created
   |
   v
Posts Screen
```

The application handles common registration errors such as:

- Email already in use
- Invalid email
- Weak password
- General authentication errors

Firebase's weak-password error is handled with a minimum password length message of six characters.

---

## 2. User Login

Existing users can sign in using their email and password.

The login screen handles:

- Incorrect password
- User not found
- Invalid email
- General authentication errors

After successful authentication, the user is redirected to the main posts screen.

Firebase Authentication persistence is configured using React Native AsyncStorage, allowing the authentication state to persist across application sessions.

---

## 3. Logout

The main screen provides a logout button.

When the user logs out:

1. Firebase signs out the current user.
2. The application redirects the user to the Sign In screen.

---

# Posts

The main screen provides a real-time feed of posts.

Users can:

- Create a text post
- View posts
- Search posts
- Expand a post
- Like a post
- Comment on a post
- Delete their own posts

A post contains information such as:

```text
Post
├── id
├── text
├── timestamp
├── uid
└── likes[]
```

When a post is created, it is stored in the Firestore `posts` collection.

The application uses a Firestore query ordered by timestamp in descending order so newer posts appear first.

---

## Creating a Post

Users enter text into the:

```text
What's on your mind?
```

input field.

When the Post button is pressed:

1. The text is trimmed.
2. The content censoring function is applied.
3. Empty content is rejected.
4. A new Firestore document is created.
5. The current user's UID is stored with the post.
6. The creation timestamp is stored using Firestore `serverTimestamp()`.
7. The post's likes array starts empty.
8. The input field is cleared.

Example Firestore structure:

```javascript
{
  text: "Hello everyone!",
  timestamp: serverTimestamp(),
  uid: "firebase-user-id",
  likes: []
}
```

---

# Real-Time Feed

Posts are loaded using Firestore's `onSnapshot()` listener.

This means changes in the `posts` collection can be reflected in the application without manually refreshing the feed.

The feed is displayed using React Native's `FlatList`.

The posts are ordered using:

```javascript
orderBy('timestamp', 'desc')
```

so the newest posts are displayed first.

---

# Search

The home screen includes a search input.

Search is performed locally against the currently loaded posts:

```javascript
posts.filter(
  p => p.text.toLowerCase().includes(search.toLowerCase())
)
```

The search is case-insensitive.

For example:

```text
Search: hello
```

can match:

```text
Hello everyone!
HELLO WORLD
This is a hello message
```

---

# Likes

Posts support likes.

A user can long press a post to toggle their like.

The application checks whether the current user's UID already exists in the post's `likes` array.

If it exists:

```text
User is unliked
```

If it does not exist:

```text
User is liked
```

Conceptually:

```text
likes = [user1, user2, user3]

Long press by user2

        ↓

likes = [user1, user3]
```

The updated array is saved to Firestore.

The post displays the number of likes:

```text
❤ 5
```

---

# Comments

Each post can contain a separate comments subcollection.

When a post is expanded, its comments are loaded from:

```text
posts/{postId}/comments
```

Comments are ordered by timestamp in ascending order.

Users can:

- Add comments
- View comments
- Like comments
- Delete their own comments

A comment contains:

```text
Comment
├── id
├── text
├── timestamp
├── uid
└── likes[]
```

Example:

```javascript
{
  text: "Nice post!",
  timestamp: serverTimestamp(),
  uid: "firebase-user-id",
  likes: []
}
```

---

# Comment Likes

Users can long press a comment to toggle its like state.

The application updates the comment's `likes` array in Firestore.

Example:

```text
posts
└── postId
    └── comments
        └── commentId
            ├── text
            ├── uid
            ├── timestamp
            └── likes[]
```

---

# Delete Functionality

Users can delete content that belongs to them.

## Delete Posts

A user's own post is visually highlighted and can be deleted by swiping the post to the right.

The application shows a confirmation dialog:

```text
Delete post?

Cancel
Delete
```

The post is removed using Firestore's `deleteDoc()`.

## Delete Comments

Users can delete their own comments using the Delete button displayed on their comments.

The application checks ownership using the current user's UID.

---

# Content Censoring

Benaam includes a simple client-side content censoring mechanism.

The application maintains a list of sensitive words:

```javascript
const SENSITIVE = [
  'kill',
  'suicide',
  'bomb',
  'blast',
  'murdered',
  'rape'
];
```

When a post or comment is submitted, matching words are partially replaced with asterisks.

For example:

```text
Original:
ExampleWord

Censored:
E*********
```

The censoring function:

1. Splits the input into word boundaries.
2. Converts the word to lowercase for comparison.
3. Removes non-alphabetic characters for matching.
4. Checks the sensitive-word list.
5. Preserves the first character.
6. Replaces the remaining characters with `*`.

### Important limitation

This is a basic client-side filter and should not be considered a complete moderation or safety system.

A production application should use server-side validation, stronger moderation rules, abuse reporting, rate limiting, and appropriate Firestore security rules.

---

# Push Notifications

The application integrates Expo Notifications.

On a physical device, the application:

1. Checks notification permissions.
2. Requests permission when necessary.
3. Retrieves an Expo push token.
4. Stores the token in the current user's Firestore document.

The token is stored using:

```text
users/{uid}
```

with a field such as:

```javascript
{
  expoPushToken: "ExponentPushToken[...]"
}
```

The project also configures a global notification handler.

## Physical Device Requirement

Push notification token registration requires a physical device.

The application checks:

```javascript
Device.isDevice
```

before attempting to register for push notifications.

Notification behavior is configured globally in `app/_layout.js`.

---

# Theme System

Benaam supports:

- Light Mode
- Dark Mode

The application uses:

- React Native Paper
- `ThemeContext`
- AsyncStorage

The selected theme is stored locally.

The theme configuration defines custom light and dark colors.

## Light Theme

The light theme uses:

```text
Background: #FFFFFF
Surface:    #F5F5F5
Primary:    #1E88E5
Text:       Black
```

## Dark Theme

The dark theme uses:

```text
Background: #121212
Surface:    #1E1E1E
Primary:    #90CAF9
Text:       White
```

The selected mode is stored using:

```text
AsyncStorage
```

with the key:

```text
theme
```

---

# Settings

The Settings screen can be opened from the gear icon on the main Posts screen.

The settings screen displays:

- The currently authenticated user's email
- Current theme
- Dark Mode switch

The theme can be changed using the switch.

The Settings screen also includes a back button that returns to the previous route.

---

# Authentication Architecture

Authentication is handled by Firebase Authentication.

The main authentication functions used by the application are:

```javascript
signInWithEmailAndPassword()
createUserWithEmailAndPassword()
```

The application uses:

```text
Firebase Auth
       |
       v
AsyncStorage Persistence
       |
       v
Persistent Authentication State
```

The Firebase authentication instance is initialized with React Native persistence.

---

# Firebase Integration

Firebase is initialized in:

```text
firebaseConfig.js
```

The application uses two primary Firebase services:

## Firebase Authentication

Used for:

- User registration
- User login
- User logout
- Persistent authentication state

## Cloud Firestore

Used for:

- Posts
- Comments
- Likes
- Expo push notification tokens

The Firebase initialization exports:

```javascript
auth
db
```

These are imported throughout the application.

---

# Firestore Data Model

The application uses the following conceptual Firestore structure:

```text
Firestore
│
├── users
│   └── {uid}
│       └── expoPushToken
│
└── posts
    └── {postId}
        ├── text
        ├── timestamp
        ├── uid
        ├── likes[]
        │
        └── comments
            └── {commentId}
                ├── text
                ├── timestamp
                ├── uid
                └── likes[]
```

## Users Collection

```text
users/{uid}
```

Currently used to store the Expo push token associated with the authenticated user.

## Posts Collection

```text
posts/{postId}
```

Stores post content and metadata.

## Comments Subcollection

```text
posts/{postId}/comments/{commentId}
```

Stores comments belonging to a specific post.

---

# Navigation

The application uses **Expo Router** and file-based routing.

Main routes include:

```text
app/
├── _layout.js
├── index.js
├── SignIn.js
├── SignUp.js
└── settings.js
```

The routes represent:

| File | Purpose |
|---|---|
| `index.js` | Main posts feed |
| `SignIn.js` | User login |
| `SignUp.js` | Account registration |
| `settings.js` | Account and theme settings |
| `_layout.js` | Global providers and notification handling |

---

# Global Application Layout

The root layout is responsible for setting up:

- Gesture Handler
- Theme Provider
- React Native Paper
- Notification handling
- Expo Router's route slot

The application hierarchy is approximately:

```text
GestureHandlerRootView
        |
        v
ThemeProvider
        |
        v
PaperProvider
        |
        v
Expo Router Slot
        |
        +---- Sign In
        |
        +---- Sign Up
        |
        +---- Posts
        |
        +---- Settings
```

---

# Project Structure

```text
Benaam/
│
├── app/
│   ├── _layout.js
│   ├── index.js
│   ├── SignIn.js
│   ├── SignUp.js
│   └── settings.js
│
├── assets/
│   ├── images/
│   │   ├── icon.png
│   │   ├── adaptive-icon.png
│   │   ├── splash-icon.png
│   │   ├── favicon.png
│   │   └── React/Expo assets
│   │
│   └── fonts/
│       └── SpaceMono-Regular.ttf
│
├── components/
│   └── Loading.js
│
├── constants/
│   └── Colors.ts
│
├── hooks/
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
│
├── scripts/
│   └── reset-project.js
│
├── firebaseConfig.js
├── notifications.js
├── theme.js
├── styles.js
├── metro.config.js
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

---

# Important Files

## `app/index.js`

This is the primary application screen.

It handles:

- Post creation
- Post retrieval
- Search
- Post likes
- Post deletion
- Comments
- Comment likes
- Comment deletion
- Push token registration
- Post expansion
- Content censoring

---

## `app/SignIn.js`

Handles Firebase email/password authentication.

Responsibilities include:

- Email input
- Password input
- Firebase login
- Error handling
- Navigation to Sign Up
- Navigation to the Posts screen after login

---

## `app/SignUp.js`

Handles new user registration.

Responsibilities include:

- Email input
- Password input
- Firebase account creation
- Registration error handling
- Navigation to Sign In
- Navigation to Posts after successful registration

---

## `app/settings.js`

Provides:

- Current account email
- Dark Mode switch
- Theme persistence
- Navigation back to the previous screen

---

## `app/_layout.js`

Provides global application configuration.

It initializes:

- Notification handlers
- Notification listeners
- Gesture Handler root
- Theme Provider
- React Native Paper Provider
- Expo Router

---

## `firebaseConfig.js`

Initializes Firebase and exports:

```javascript
auth
db
```

It configures:

```text
Firebase App
Firebase Authentication
Cloud Firestore
React Native Authentication Persistence
```

---

## `theme.js`

Contains:

- Theme Context
- Custom Light Theme
- Custom Dark Theme
- Theme persistence
- Theme switching logic

---

## `notifications.js`

Contains reusable push-notification registration functionality.

It handles:

- Device detection
- Notification permissions
- Expo push token generation
- Android notification channel configuration

---

# Technology Stack

## Frontend

### React Native

Used to build the mobile application interface.

### Expo

Provides the development environment and native APIs used by the application.

### Expo Router

Provides file-based routing.

### React Native Paper

Provides Material Design components such as:

- Buttons
- Cards
- App bars
- Lists
- Switches
- Text components

### React Native Gesture Handler

Used for gesture-based interactions such as:

- Swipe-to-delete
- Long press

---

# Backend and Cloud Services

## Firebase Authentication

Provides email/password authentication.

## Cloud Firestore

Provides real-time NoSQL data storage.

Firestore listeners allow posts and comments to update dynamically.

## Expo Notifications

Provides push-notification token registration.

---

# Local Storage

The application uses:

```text
@react-native-async-storage/async-storage
```

for local persistence.

It is used for:

1. Firebase authentication persistence.
2. Saving the selected theme.

---

# Installation

## Prerequisites

Install the following before starting:

- Node.js
- npm
- Expo-compatible development environment
- Android Studio for Android emulator development, if required
- Xcode for iOS simulator development on macOS, if required
- A Firebase project
- A physical device for testing push notifications

---

## Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd Benaam
```

---

## Install Dependencies

Run:

```bash
npm install
```

This installs the dependencies defined in `package.json`.

---

# Running the Application

Start the Expo development server:

```bash
npm start
```

or:

```bash
npx expo start
```

Expo will display development options in the terminal.

---

# Android

To run the application on an Android emulator:

```bash
npm run android
```

or:

```bash
npx expo start --android
```

Make sure an Android emulator is running or a compatible Android development environment is available.

---

# iOS

On macOS with Xcode installed:

```bash
npm run ios
```

or:

```bash
npx expo start --ios
```

The project configuration indicates iOS tablet support.

---

# Web

The project also includes web support:

```bash
npm run web
```

or:

```bash
npx expo start --web
```

---

# Linting

Run the project's lint command with:

```bash
npm run lint
```

---

# Firebase Setup

Before using the application with your own Firebase project, create a Firebase project.

## Step 1: Create Firebase Project

Create a project through the Firebase Console.

## Step 2: Enable Authentication

Enable:

```text
Authentication
    └── Sign-in method
        └── Email/Password
```

The application uses email/password authentication.

## Step 3: Create Firestore Database

Create a Cloud Firestore database.

The application expects collections similar to:

```text
users
posts
```

with comments stored as a subcollection under each post.

## Step 4: Configure Firebase

Update:

```text
firebaseConfig.js
```

with the configuration for your Firebase project.

Example structure:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

# Firestore Security

For a production application, Firestore Security Rules should be configured carefully.

Recommended rules should ensure that:

- Only authenticated users can create posts.
- Users can modify or delete their own posts.
- Only authenticated users can create comments.
- Users can modify or delete their own comments.
- Users cannot arbitrarily modify another user's content.
- User documents cannot be modified by unauthorized users.
- Push tokens are only writable by the appropriate authenticated user.

The exact security rules are not included in the supplied project files, so they should be created separately before production deployment.

---

# Push Notification Setup

The project uses:

```text
expo-notifications
expo-device
```

Push notifications require additional configuration depending on the target platform and deployment method.

For basic token registration, the application:

```text
Check physical device
        |
        v
Check permission
        |
        v
Request permission if necessary
        |
        v
Get Expo Push Token
        |
        v
Store token in Firestore
```

The push token is associated with the authenticated user's UID.

### Important

The current project registers and stores Expo push tokens, but the supplied source does not contain a complete backend notification-sending service for sending a notification whenever a post or comment is created.

A future backend or Firebase Cloud Function can use the stored token to send notifications.

---

# Environment and Security

The project currently contains Firebase configuration directly in:

```text
firebaseConfig.js
```

For a production project, configuration management should be improved.

Recommended improvements include:

- Use environment variables where appropriate.
- Do not commit private service-account credentials.
- Never place Firebase Admin SDK credentials in a mobile application.
- Configure strict Firestore Security Rules.
- Add server-side moderation.
- Add rate limiting and abuse protection.

### Firebase API Key Note

Firebase web configuration values such as the API key are generally designed to be included in client applications. However, exposing the configuration does **not** replace the need for proper Firebase Authentication and Firestore Security Rules.

Never place Firebase Admin SDK private keys or service-account JSON files inside the mobile application or public repository.

---

# Dependencies

The project uses Expo SDK 53 and React Native.

Major dependencies include:

```text
expo
expo-router
expo-notifications
expo-device
firebase
react
react-native
react-native-paper
react-native-gesture-handler
react-native-reanimated
@react-native-async-storage/async-storage
@react-navigation/native
```

The exact versions are defined in:

```text
package.json
```

and locked in:

```text
package-lock.json
```

---

# User Flow

The main user flow is:

```text
                 ┌──────────────┐
                 │   Launch App │
                 └──────┬───────┘
                        │
                        v
                 ┌──────────────┐
                 │    Sign In   │
                 └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              v                   v
        Existing User         New User
              │                   │
              │                   v
              │              ┌──────────┐
              │              │ Sign Up  │
              │              └────┬─────┘
              │                   │
              └─────────┬─────────┘
                        v
                 ┌──────────────┐
                 │ Posts Screen │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          v             v             v
       Create         Search       Settings
        Post            │             │
          │             │             v
          v             v         Dark / Light
       Comments       Results         Mode
          │
          v
        Likes
```

---

# Post Interaction Flow

```text
Post
 │
 ├── Tap
 │     └── Expand / Collapse
 │
 ├── Long Press
 │     └── Like / Unlike
 │
 ├── Swipe Right
 │     └── Delete if Owner
 │
 └── Expanded
       │
       ├── View Likes
       ├── Add Comment
       ├── Like Comment
       └── Delete Own Comment
```

---

# Real-Time Data Flow

The application's Firestore interaction can be summarized as:

```text
                 Firebase Authentication
                          │
                          v
                    Current User
                          │
                          v
                    React Native App
                          │
              ┌───────────┴───────────┐
              │                       │
              v                       v
        Cloud Firestore         Expo Notifications
              │                       │
       ┌──────┴──────┐                v
       │             │          Expo Push Token
       v             v                │
     Posts        Comments            v
       │             │             users/{uid}
       │             │
       └──────┬──────┘
              v
         Real-Time Feed
```

---

# UI and User Experience

The application uses React Native Paper and custom styling to provide:

- Material-style buttons
- Cards for posts
- App bars
- Settings list items
- Theme-aware colors
- Swipe interactions
- Animated post expansion
- Search input
- Comment input
- Confirmation dialogs

Posts expand with an animated height transition.

The application also uses `GestureHandlerRootView` to support gesture interactions.

---

# Error Handling

Authentication screens include handling for common Firebase Authentication errors.

Examples include:

```text
auth/wrong-password
auth/user-not-found
auth/invalid-email
auth/email-already-in-use
auth/weak-password
```

The application displays these errors through React Native `Alert` dialogs.

---

# Limitations

The current implementation has several limitations that should be considered before production use.

## 1. Client-Side Moderation

The sensitive-word filter is implemented locally and can be bypassed by a modified client.

## 2. Firestore Security Rules

Security rules are not included in the supplied project files.

## 3. Push Notifications

Push tokens are registered and stored, but a complete server-side notification delivery workflow is not included.

## 4. Search

Search is performed against posts already loaded into the application rather than through a dedicated server-side search system.

## 5. Anonymous Identity

Although the application is named Benaam and has an anonymous-style concept, users still authenticate using email/password. The supplied implementation does not implement Firebase Anonymous Authentication.

## 6. Moderation

There is no complete reporting, blocking, moderation dashboard, or server-side content review system in the supplied source.

---

# Future Improvements

Potential improvements include:

### Authentication

- Password reset
- Email verification
- Google authentication
- Apple authentication
- Firebase Anonymous Authentication
- Profile management

### Social Features

- User profiles
- Following/followers
- Reactions
- Post sharing
- Bookmarks
- Hashtags
- Media posts
- User mentions

### Moderation

- Report post
- Report user
- Block user
- Server-side content moderation
- Admin moderation dashboard
- Rate limiting

### Notifications

- New comment notifications
- Like notifications
- Mention notifications
- Push notification backend
- Firebase Cloud Functions integration

### Search

- Firestore-compatible indexed search
- Full-text search
- Hashtag search
- Search history
- Search suggestions

### UI

- Improved animations
- Custom app branding
- Better loading states
- Empty-state screens
- Error-state screens
- Skeleton loaders
- Improved accessibility

### Backend

- Firestore Security Rules
- Cloud Functions
- Server-side validation
- Analytics
- Abuse prevention

---

# Learning Objectives

This project demonstrates practical development using modern React Native technologies.

It provides experience with:

- React Native
- Expo
- Expo Router
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Real-time database listeners
- AsyncStorage
- Push notifications
- React Native Paper
- React Context
- Light/dark themes
- Mobile navigation
- Gesture handling
- CRUD operations
- Nested Firestore collections
- Authentication state
- Local persistence
- Responsive mobile UI

---

# Development Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm start` | Start Expo development server |
| `npm run android` | Start Android development |
| `npm run ios` | Start iOS development |
| `npm run web` | Start web development |
| `npm run lint` | Run Expo ESLint |

---

# Recommended Git Workflow

Create a feature branch before making major changes:

```bash
git checkout -b feature/my-feature
```

After making changes:

```bash
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
```

Then create a Pull Request if the project uses collaborative development.

---

# Important Files to Keep Private

Do not commit sensitive backend credentials such as:

```text
serviceAccountKey.json
firebase-adminsdk-*.json
.env
.env.local
```

The mobile Firebase configuration can be included in a client application, but backend administrative credentials must never be shipped with the application.

---

# Troubleshooting

## Dependencies are missing

Run:

```bash
npm install
```

Then restart Expo:

```bash
npx expo start
```

## Metro cache problems

Try:

```bash
npx expo start -c
```

## Android does not launch

Make sure:

- Android Studio is installed.
- An emulator is running.
- Android SDK is configured.
- A physical device has USB debugging enabled if using a device.

## iOS does not launch

Make sure:

- You are using macOS.
- Xcode is installed.
- An iOS simulator is available.

## Push notifications do not work

Check:

- The application is running on a physical device.
- Notification permissions are granted.
- Expo notification configuration is correct.
- The device has network access.
- The Expo push token is successfully generated.

---

# License

This project is intended for **educational and academic purposes**.

If you plan to publish or distribute the application, add an appropriate open-source license such as MIT, Apache 2.0, or another license that matches your requirements.

---

# Author

Developed as a React Native / Expo mobile application project.

**Project Name:** Benaam

**Platform:** React Native + Expo

**Backend:** Firebase Authentication + Cloud Firestore

**Navigation:** Expo Router

**UI:** React Native Paper

---

## Summary

Benaam is a Firebase-powered React Native social application focused on simple text-based social interaction. It combines authentication, real-time Firestore data, posts, comments, likes, search, content filtering, push-token registration, gestures, and persistent light/dark themes into a single mobile application.

The project provides a strong foundation for extending the application into a more complete social platform with profiles, notifications, moderation, media sharing, advanced search, and server-side functionality.
