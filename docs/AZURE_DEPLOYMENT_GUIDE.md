# 🚀 Azure Deployment Guide - Budget Tracker

Complete guide to deploy your Budget Tracker application on Azure using Docker containers.

## 📋 Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Docker Desktop** - [Install Docker](https://www.docker.com/products/docker-desktop/)
4. **MongoDB Atlas** - [Free tier](https://www.mongodb.com/cloud/atlas) (recommended) or Azure Cosmos DB

---

## 🎯 Deployment Options

### Option 1: Azure Container Apps (Recommended - Easiest)
- Serverless containers
- Auto-scaling
- Built-in HTTPS
- Pay only for what you use

### Option 2: Azure App Service (Web App for Containers)
- Fully managed platform
- Easy scaling
- Built-in CI/CD
- Custom domains included

### Option 3: Azure Container Instances
- Simple container deployment
- Good for testing
- No orchestration

---

## 🚀 Option 1: Deploy with Azure Container Apps (RECOMMENDED)

### Step 1: Install Azure CLI and Login

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create Resource Group

```bash
# Create a resource group
az group create \
  --name budget-tracker-rg \
  --location eastus
```

### Step 3: Create Azure Container Registry (ACR)

```bash
# Create container registry (name must be globally unique)
az acr create \
  --resource-group budget-tracker-rg \
  --name budgettrackeracr \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name budgettrackeracr
```

### Step 4: Build and Push Docker Images

```bash
# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name budgettrackeracr --query loginServer --output tsv)

# Build and push backend
cd backend
docker build -t $ACR_LOGIN_SERVER/budget-backend:latest .
docker push $ACR_LOGIN_SERVER/budget-backend:latest

# Build and push frontend
cd ../frontend
docker build \
  --build-arg VITE_API_URL=https://budget-backend.YOUR_REGION.azurecontainerapps.io \
  --build-arg VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  -t $ACR_LOGIN_SERVER/budget-frontend:latest .
docker push $ACR_LOGIN_SERVER/budget-frontend:latest

cd ..
```

### Step 5: Create Container Apps Environment

```bash
# Install Container Apps extension
az extension add --name containerapp --upgrade

# Create Container Apps environment
az containerapp env create \
  --name budget-tracker-env \
  --resource-group budget-tracker-rg \
  --location eastus
```

### Step 6: Deploy Backend Container App

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name budgettrackeracr --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name budgettrackeracr --query passwords[0].value --output tsv)

# Deploy backend
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
    MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING \
    SESSION_SECRET=YOUR_SESSION_SECRET_HERE \
    BETTER_AUTH_SECRET=YOUR_AUTH_SECRET_HERE \
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET \
    FRONTEND_URL=https://budget-frontend.YOUR_REGION.azurecontainerapps.io

# Get backend URL
az containerapp show \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### Step 7: Update and Deploy Frontend

```bash
# Rebuild frontend with correct backend URL
BACKEND_URL=$(az containerapp show --name budget-backend --resource-group budget-tracker-rg --query properties.configuration.ingress.fqdn --output tsv)

cd frontend
docker build \
  --build-arg VITE_API_URL=https://$BACKEND_URL \
  --build-arg VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  -t $ACR_LOGIN_SERVER/budget-frontend:latest .
docker push $ACR_LOGIN_SERVER/budget-frontend:latest

# Deploy frontend
az containerapp create \
  --name budget-frontend \
  --resource-group budget-tracker-rg \
  --environment budget-tracker-env \
  --image $ACR_LOGIN_SERVER/budget-frontend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi

# Get frontend URL
az containerapp show \
  --name budget-frontend \
  --resource-group budget-tracker-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### Step 8: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add these to **Authorized JavaScript origins:**
   - `https://budget-frontend.YOUR_REGION.azurecontainerapps.io`
   - `https://budget-backend.YOUR_REGION.azurecontainerapps.io`
5. Add to **Authorized redirect URIs:**
   - `https://budget-backend.YOUR_REGION.azurecontainerapps.io/api/auth/google/callback`

### Step 9: Update Backend Environment Variables

```bash
# Update backend with correct redirect URI
FRONTEND_URL=$(az containerapp show --name budget-frontend --resource-group budget-tracker-rg --query properties.configuration.ingress.fqdn --output tsv)
BACKEND_URL=$(az containerapp show --name budget-backend --resource-group budget-tracker-rg --query properties.configuration.ingress.fqdn --output tsv)

az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --set-env-vars \
    FRONTEND_URL=https://$FRONTEND_URL \
    BETTER_AUTH_URL=https://$BACKEND_URL \
    GOOGLE_REDIRECT_URI=https://$BACKEND_URL/api/auth/google/callback
```

---

## 🔄 Option 2: Deploy with Azure App Service

### Quick Deploy

```bash
# Create App Service Plan
az appservice plan create \
  --name budget-tracker-plan \
  --resource-group budget-tracker-rg \
  --is-linux \
  --sku B1

# Create backend web app
az webapp create \
  --resource-group budget-tracker-rg \
  --plan budget-tracker-plan \
  --name budget-tracker-backend \
  --deployment-container-image-name $ACR_LOGIN_SERVER/budget-backend:latest

# Configure backend
az webapp config appsettings set \
  --resource-group budget-tracker-rg \
  --name budget-tracker-backend \
  --settings \
    NODE_ENV=production \
    MONGODB_URI=YOUR_MONGODB_URI \
    SESSION_SECRET=YOUR_SECRET \
    GOOGLE_CLIENT_ID=YOUR_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Create frontend web app
az webapp create \
  --resource-group budget-tracker-rg \
  --plan budget-tracker-plan \
  --name budget-tracker-frontend \
  --deployment-container-image-name $ACR_LOGIN_SERVER/budget-frontend:latest
```

---

## 🧪 Test Locally with Docker Compose

Before deploying to Azure, test locally:

```bash
# Create .env file in root
cat > .env << EOF
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_at_least_32_chars
BETTER_AUTH_SECRET=your_auth_secret_at_least_32_chars
EOF

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017

# Stop services
docker-compose down
```

---

## 🔐 Environment Variables Required

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/budget-tracker
SESSION_SECRET=generate_random_32_char_secret
BETTER_AUTH_SECRET=generate_random_32_char_secret
BETTER_AUTH_URL=https://your-backend.azurecontainerapps.io
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend.azurecontainerapps.io/api/auth/google/callback
FRONTEND_URL=https://your-frontend.azurecontainerapps.io
```

### Frontend (build args)
```env
VITE_API_URL=https://your-backend.azurecontainerapps.io
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📊 Monitoring and Logs

```bash
# View backend logs
az containerapp logs show \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --follow

# View frontend logs
az containerapp logs show \
  --name budget-frontend \
  --resource-group budget-tracker-rg \
  --follow

# View metrics
az monitor metrics list \
  --resource budget-backend \
  --resource-group budget-tracker-rg \
  --resource-type Microsoft.App/containerApps
```

---

## 🔄 Update Deployment

```bash
# Update backend
cd backend
docker build -t $ACR_LOGIN_SERVER/budget-backend:latest .
docker push $ACR_LOGIN_SERVER/budget-backend:latest

az containerapp update \
  --name budget-backend \
  --resource-group budget-tracker-rg \
  --image $ACR_LOGIN_SERVER/budget-backend:latest

# Update frontend
cd frontend
docker build \
  --build-arg VITE_API_URL=https://your-backend-url \
  -t $ACR_LOGIN_SERVER/budget-frontend:latest .
docker push $ACR_LOGIN_SERVER/budget-frontend:latest

az containerapp update \
  --name budget-frontend \
  --resource-group budget-tracker-rg \
  --image $ACR_LOGIN_SERVER/budget-frontend:latest
```

---

## 💰 Cost Estimation

**Azure Container Apps (Pay-as-you-go):**
- Backend (1 instance): ~$30-40/month
- Frontend (1 instance): ~$15-20/month
- Container Registry: ~$5/month
- **Total: ~$50-65/month**

**Free Tier Options:**
- Use MongoDB Atlas Free Tier (512MB)
- Azure gives $200 credit for 30 days for new accounts

---

## 🐛 Troubleshooting

### Issue: Container fails to start
```bash
# Check logs
az containerapp logs show --name budget-backend --resource-group budget-tracker-rg --tail 100

# Check container status
az containerapp show --name budget-backend --resource-group budget-tracker-rg
```

### Issue: Cannot connect to MongoDB
- Ensure MongoDB Atlas allows connections from Azure IPs
- Add `0.0.0.0/0` to IP whitelist (or specific Azure region IPs)

### Issue: CORS errors
- Verify `FRONTEND_URL` in backend environment variables
- Check `VITE_API_URL` was set correctly during frontend build

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Google OAuth credentials configured with Azure URLs
- [ ] Azure Container Registry created
- [ ] Backend Docker image built and pushed
- [ ] Frontend Docker image built with correct API URL
- [ ] Container Apps environment created
- [ ] Backend container app deployed with env vars
- [ ] Frontend container app deployed
- [ ] Google OAuth redirect URIs updated
- [ ] Test login functionality
- [ ] Test transaction creation
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (auto with Container Apps)

---

## 🎉 Success!

Your application should now be running at:
- **Frontend:** `https://budget-frontend.YOUR_REGION.azurecontainerapps.io`
- **Backend:** `https://budget-backend.YOUR_REGION.azurecontainerapps.io`

**Next Steps:**
1. Configure custom domain (optional)
2. Set up monitoring and alerts
3. Configure auto-scaling rules
4. Set up CI/CD pipeline with GitHub Actions

---

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
