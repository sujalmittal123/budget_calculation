# Azure Deployment Guide - Budget Tracker Backend

Deploy the backend API to **Azure Container Apps** while keeping the frontend on **Vercel**.

| Component | Host | URL |
|-----------|------|-----|
| Frontend | Vercel (free) | `https://budget-calculation.vercel.app` |
| Backend | Azure Container Apps | `https://budget-backend.<region>.azurecontainerapps.io` |
| Database | MongoDB Atlas | Cloud cluster |

---

## Prerequisites

1. **Azure Account** with active subscription ([sign up free](https://azure.microsoft.com/free/))
2. **Azure CLI** installed ([install guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
   - Arch Linux: `yay -S azure-cli`
   - Ubuntu/Debian: `curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash`
3. **Docker** installed and running
4. **MongoDB Atlas** cluster configured (already have this)
5. **Google OAuth** credentials (already have this)

---

## Quick Deploy (Automated Script)

The fastest way to deploy:

```bash
./deploy-azure.sh
```

The script will prompt for your secrets, create all Azure resources, build the Docker image, and deploy. Takes about 10-15 minutes.

---

## Manual Step-by-Step

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Create Resource Group

```bash
az group create \
  --name budget-tracker-rg \
  --location centralindia
```

### Step 3: Create Container Registry (ACR)

```bash
az acr create \
  --resource-group budget-tracker-rg \
  --name budgettrackeracr \
  --sku Basic \
  --admin-enabled true

az acr login --name budgettrackeracr
```

### Step 4: Build and Push Backend Image

```bash
ACR_LOGIN_SERVER=$(az acr show --name budgettrackeracr --query loginServer --output tsv)

docker build -t $ACR_LOGIN_SERVER/budget-backend:latest ./backend
docker push $ACR_LOGIN_SERVER/budget-backend:latest
```

### Step 5: Create Container Apps Environment

```bash
az extension add --name containerapp --upgrade --yes

az containerapp env create \
  --name budget-tracker-env \
  --resource-group budget-tracker-rg \
  --location centralindia
```

### Step 6: Deploy Backend

```bash
ACR_USERNAME=$(az acr credential show --name budgettrackeracr --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name budgettrackeracr --query "passwords[0].value" --output tsv)

az containerapp create \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --environment budget-tracker-env \
  --image $ACR_LOGIN_SERVER/budget-backend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 5000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --env-vars \
    NODE_ENV=production \
    PORT=5000 \
    MONGODB_URI="YOUR_MONGODB_URI" \
    SESSION_SECRET="YOUR_SESSION_SECRET" \
    BETTER_AUTH_SECRET="YOUR_AUTH_SECRET" \
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET" \
    FRONTEND_URL="https://budget-calculation.vercel.app"
```

### Step 7: Get Backend URL and Set Redirect URI

```bash
BACKEND_URL=$(az containerapp show \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "Backend URL: https://$BACKEND_URL"

az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --set-env-vars \
    BETTER_AUTH_URL="https://$BACKEND_URL" \
    GOOGLE_REDIRECT_URI="https://$BACKEND_URL/api/auth/google/callback"
```

---

## Post-Deployment Configuration

### 1. Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials:

**Authorized JavaScript origins:**
```
https://budget-calculation.vercel.app
https://budget-backend.<region>.azurecontainerapps.io
```

**Authorized redirect URIs:**
```
https://budget-backend.<region>.azurecontainerapps.io/api/auth/google/callback
```

### 2. Update Vercel Frontend

Go to [Vercel Dashboard](https://vercel.com/) > budget-calculation > Settings > Environment Variables:

```
VITE_API_URL = https://budget-backend.<region>.azurecontainerapps.io
```

Then trigger a redeployment (Deployments tab > Redeploy).

### 3. MongoDB Atlas Network Access

Ensure MongoDB Atlas allows connections from Azure:
- Go to MongoDB Atlas > Network Access
- Add `0.0.0.0/0` to allow all IPs (or add specific Azure outbound IPs)

---

## Useful Commands

```bash
# View live logs
az containerapp logs show \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --follow

# Check container status
az containerapp show \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --query "{status:properties.runningStatus, url:properties.configuration.ingress.fqdn}"

# Update after code changes
docker build -t $ACR_LOGIN_SERVER/budget-backend:latest ./backend
docker push $ACR_LOGIN_SERVER/budget-backend:latest
az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --image $ACR_LOGIN_SERVER/budget-backend:latest

# Update environment variables
az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --set-env-vars KEY=VALUE

# Scale replicas
az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --min-replicas 0 --max-replicas 5

# Delete everything (careful!)
az group delete --name budget-tracker-rg --yes
```

---

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| Container App (1 replica, 0.5 vCPU, 1GB) | ~$30-40 |
| Container Registry (Basic) | ~$5 |
| **Total** | **~$35-45/month** |

- Azure free tier gives $200 credit for 30 days for new accounts
- MongoDB Atlas has a free tier (512MB)
- Vercel frontend is free

---

## Troubleshooting

### Container fails to start
```bash
az containerapp logs show --name budget-backend --resource-group budget-tracker-rg --tail 100
```

### Health check failing
Test manually: `curl https://<backend-url>/api/health`

### CORS errors
Verify `FRONTEND_URL` env var matches exactly: `https://budget-calculation.vercel.app`

### OAuth redirect mismatch
Verify `GOOGLE_REDIRECT_URI` env var matches what's configured in Google Cloud Console.

### Cannot connect to MongoDB
- Check `MONGODB_URI` env var is correct
- Ensure MongoDB Atlas Network Access allows Azure IPs (`0.0.0.0/0`)

---

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `SESSION_SECRET` | 32+ char random string | Session encryption key |
| `BETTER_AUTH_SECRET` | 32+ char random string | Auth encryption key |
| `GOOGLE_CLIENT_ID` | From Google Console | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | From Google Console | OAuth client secret |
| `GOOGLE_REDIRECT_URI` | `https://<backend>/api/auth/google/callback` | OAuth callback URL |
| `FRONTEND_URL` | `https://budget-calculation.vercel.app` | CORS and redirects |
| `BETTER_AUTH_URL` | `https://<backend-url>` | Auth base URL |
