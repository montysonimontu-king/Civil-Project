// Firebase Console -> Project settings -> Your apps -> Web app -> Config yahan paste karein.
// (Firebase web config secret nahi hota, par Firestore/Auth rules zaroor set karein.)
// Khali chhodne par app "Guest mode" mein chalega (login ke bina, history browser mein save hogi).
window.FIREBASE_CONFIG = null;
/* Example:
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "..."
};
*/
