# CIVIL AI - Vercel Deploy Guide

Developed by: Montu Soni, Priyanshu Koushal, Lalit Patil & Manoj Lovanshi

## Folder structure
```
public/            -> website (index.html, firebase-config.js)
api/chat.js        -> chatbot backend (Gemini)
api/image.js       -> diagram generator backend
lib/gemini.js      -> shared code
vercel.json, package.json
```

## Deploy: GitHub -> Vercel
1. GitHub par naya repository banayein (jaise `civil-ai`).
2. **Add file -> Upload files**: is ZIP ke andar ki saari files/folders (api, lib, public, package.json, vercel.json...) drag karke daalein -> **Commit changes**.
3. https://vercel.com -> **Add New -> Project** -> apni repo ke saamne **Import**.
4. Framework Preset: **Other**. Root Directory: khali chhodein.
5. **Environment Variables** mein: Name `GEMINI_API_KEY`, Value = aapki key -> **Add**.
6. **Deploy** dabayein.

Key badalne ya add karne ke baad **Deployments -> latest ke ... -> Redeploy** zaroor karein.
Agar Google model band kar de, to `GEMINI_MODEL` (aur diagram ke liye `GEMINI_IMAGE_MODEL`) naam ke variable mein naya model naam daalein.

## Firebase (optional: login + cloud history)
1. Firebase Console par project banayein, Authentication mein Email/Password aur Google enable karein.
2. Firestore Database banayein, rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
3. Web app config `public/firebase-config.js` mein paste karein.
4. Firebase -> Authentication -> Settings -> Authorized domains mein apna Vercel domain add karein.

## Limits (Vercel)
- Photo/PDF upload ka total size max ~3MB (Vercel ki 4.5MB request limit ki wajah se).
- Free plan par function time limited hota hai; lambe jawab kabhi time-out ho sakte hain.
- Rate limit basic hai (30 requests/min per IP).

## Security
API key sirf Vercel Environment Variables mein rakhein, kabhi `index.html` mein nahi.
