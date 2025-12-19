<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

## Deploy

### Server
Serve is deployed using cloud run so every commit to github will automatically deploy the server

### Deploy UI
1. Build the app first: `npm run build`
2. Deploy to firebase: `firebase deploy`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run API Locally

1. `cd server`
2. Install dependencies:
   `npm install`
3. `npm run build` builds updated code
4. `npm start` run the recently built files

The endpoints will be under `/api/` path.