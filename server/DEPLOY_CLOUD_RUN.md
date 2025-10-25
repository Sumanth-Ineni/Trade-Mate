# Deploying the Node backend to Google Cloud Run

This file describes how to build and deploy the `server/` Node/TypeScript API to Google Cloud Run.

Prerequisites
- gcloud SDK installed and authenticated (run `gcloud auth login`)
- A Google Cloud project selected (`gcloud config set project PROJECT_ID`)
- APIs enabled: Cloud Build, Cloud Run, Artifact Registry (or Container Registry)

Quick deploy (manual using gcloud)

1. From repository root, build and submit with Cloud Build (this runs the pipeline in `cloudbuild.yaml`):

```bash
gcloud builds submit --config=cloudbuild.yaml --substitutions=_REGION=us-central1,_SERVICE=trade-mate-backend,_API_KEY=$API_KEY
```

2. Alternatively, build and deploy locally with Docker + gcloud:

```bash
# Build local image
docker build -t gcr.io/PROJECT_ID/trade-mate-backend:latest -f server/Dockerfile server
# Push (option 1) to Container Registry
docker push gcr.io/PROJECT_ID/trade-mate-backend:latest
# Deploy to Cloud Run
gcloud run deploy trade-mate-backend --image gcr.io/PROJECT_ID/trade-mate-backend:latest --region us-central1 --platform managed --allow-unauthenticated --set-env-vars API_KEY=$API_KEY
```

Environment variables
- The server reads `process.env.API_KEY` for the Gemini API key. Do NOT commit secrets to the repo. Set them via `--set-env-vars` during deploy or configure them in Cloud Run revisions.

Notes and recommendations
- Use Artifact Registry for new projects (adjust `cloudbuild.yaml` if you prefer Artifact Registry).
- Make sure to restrict who can invoke the Cloud Run service if the API should not be public (remove `--allow-unauthenticated` and configure IAM).
- If you add other sensitive environment variables, pass them via Cloud Build substitutions or via `gcloud run services update --update-env-vars`.

Verify

After deploy, you'll get the service URL. Try:

```bash
curl <SERVICE_URL>/api/trades
```
