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

## Vercel par deploy (easy way)
1. Gemini API key lein: https://aistudio.google.com/apikey
2. Is ZIP ko extract karein (folder ke andar `api`, `public`, `vercel.json` dikhne chahiye).
3. https://vercel.com par login karein -> **Add New -> Project**.
   - GitHub par is folder ko upload/push karke import karein, YA
   - Terminal se: `npm i -g vercel` phir folder ke andar `vercel` chalayein (ZIP seedha upload ka option Vercel website par nahi hota).
4. **Environment Variables** mein add karein:
   - `GEMINI_API_KEY` = aapki key
5. Deploy dabayein. Link milega, jaise `https://civil-ai.vercel.app`.

Key badalne ya add karne ke baad **Redeploy** zaroor karein.

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
