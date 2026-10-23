# Showmi Backend Upgrade Plan: Phase 1 (Auth & Security)

This plan details the first phase of migrating Showmi to a multi-user Firebase environment. We will replace mock identity toggles with real Firebase Authentication and establish a "Fortress" Security Rules baseline.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Simplest Reliable Auth Setup**: We will use **Firebase Google Authentication with `signInWithPopup`**. 
> - **Demo Access**: Judges and users sign in with their own Google accounts.
> - **Bootstrap Admin**: Your email (`nisabardien@gmail.com`) will be auto-assigned the `admin` role upon first login via a hardcoded check in the registration logic.
> - **Seller Mapping**: Existing mock IDs (e.g., `seller-karoo-leather`) will be mapped to real users by setting the `sellerId` field in the `users/{uid}` document. For the demo, we will provide a "Claim Profile" button visible only to admins to link a signed-in UID to a mock seller profile.

---

## 1. Firestore Data Model (Detailed)

### `users` (Collection)
- **Document ID**: `request.auth.uid`
- **Fields**:
    - `email`: string
    - `displayName`: string
    - `role`: "buyer" | "seller" | "admin"
    - `sellerId`: string (optional, links to `sellers` collection)
    - `createdAt`: timestamp

### `sellers` (Collection)
- **Document ID**: Mock ID (e.g., `seller-glow-theory`)
- **Fields**:
    - `ownerUid`: string (The Firebase UID authorized to edit this profile)
    - `name`: string
    - `handle`: string
    - `bio`: string
    - `moderatorUids`: array<string> (Global moderators for this seller's streams)

### `live_sessions` (Collection)
- **Document ID**: `sessionId`
- **Fields**:
    - `sellerId`: string
    - `isLive`: boolean
    - `featuredProductId`: string
    - `moderatorUids`: array<string> (Session-specific moderators)
    - `viewerCount`: number

### `live_sessions/{sessionId}/comments` (Sub-collection)
- **Fields**:
    - `text`: string
    - `senderUid`: string
    - `userName`: string
    - `isHost`: boolean
    - `isModerator`: boolean
    - `timestamp`: timestamp

---

## 2. Security Rules Enforcement

1. **Identity Integrity**: Every write to `users/{uid}` must match `request.auth.uid`.
2. **Product/Inventory Ownership**: 
    - `allow update: if request.auth.uid == get(/databases/$(database)/documents/sellers/$(resource.data.sellerId)).data.ownerUid`
3. **Moderator Authority**:
    - A comment can only be deleted if `request.auth.uid` exists in the `live_sessions/{sessionId}` document's `moderatorUids` array or if the user is the Host.
4. **No Self-Assignment**: The `role` field in `users/{uid}` is immutable by the client during `update`. Only a manual change in the Firebase Console or an `admin` user can elevate a role.

---

## 3. Phase 1 Implementation Steps

1.  **Firebase Provisioning**: 
    - Use `ProvisionFirebase` RPC to enable Auth and Firestore.
    - **Console Action Required**: You must enable the **Google Sign-In provider** in the Firebase Console (Authentication > Sign-in method).
2.  **SDK Initialization**:
    - Update `src/lib/firebase.ts` to use the provisioned config.
3.  **Authentication Integration**:
    - Modify `App.tsx` to replace `useState` mock roles with `onAuthStateChanged`.
    - Implement `handleSignIn` and `handleSignOut` using `signInWithPopup`.
4.  **Secure Registration**:
    - Implement a `syncUserRecord()` function that creates the `users/{uid}` document if it doesn't exist.
5.  **Deploy Fortress Rules**:
    - Write and deploy the initial `firestore.rules` enforcing identity and `users` collection privacy.

---

## 4. Phase 1 Acceptance Tests

- [ ] **Login Test**: User signs in with Google; `auth.currentUser` is populated.
- [ ] **Persistence Test**: Refreshing the page keeps the user signed in (no flash of "Signed Out" state).
- [ ] **Identity Sync**: A document is automatically created in `users/$(uid)` with the correct email and default `buyer` role.
- [ ] **Security Block**: An authenticated user attempts to write to `users/another-uid` and is rejected by Firestore.
- [ ] **Admin Bootstrap**: Signing in with `nisabardien@gmail.com` grants access to the `AdminRoleSwitcher` (verified via Firestore `role` check).

---

## 5. Required Environment Variables (.env.example)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## 6. Maintenance of Existing Features
- The `memoryStorageFallback` and `safeStorage` in `App.tsx` will be kept as a secondary cache, but Firestore will become the primary source of truth.
- No changes to `LiveRoomView.tsx` video logic or CSS animations will be made in Phase 1.
