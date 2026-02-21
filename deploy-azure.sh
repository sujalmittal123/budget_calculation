#!/bin/bash

# Quick Azure deployment script for Budget Tracker
# This script automates the deployment to Azure Container Apps

set -e

echo "🚀 Budget Tracker - Azure Deployment Script"
echo "============================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Configuration
read -p "Enter Azure Resource Group name [budget-tracker-rg]: " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-budget-tracker-rg}

read -p "Enter Azure region [eastus]: " LOCATION
LOCATION=${LOCATION:-eastus}

read -p "Enter Container Registry name [budgettrackeracr]: " ACR_NAME
ACR_NAME=${ACR_NAME:-budgettrackeracr}

read -p "Enter MongoDB connection string: " MONGODB_URI
read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
read -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "Enter Session Secret (min 32 chars): " SESSION_SECRET
read -p "Enter Auth Secret (min 32 chars): " BETTER_AUTH_SECRET

echo ""
echo "📋 Configuration Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  ACR Name: $ACR_NAME"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Login to Azure
echo "🔐 Logging in to Azure..."
az login

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
echo "🏗️  Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Login to ACR
echo "🔑 Logging in to ACR..."
az acr login --name $ACR_NAME

# Get ACR details
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

echo "📦 ACR Login Server: $ACR_LOGIN_SERVER"

# Build and push backend
echo "🔨 Building backend Docker image..."
cd backend
docker build -t $ACR_LOGIN_SERVER/budget-backend:latest .
echo "⬆️  Pushing backend image to ACR..."
docker push $ACR_LOGIN_SERVER/budget-backend:latest
cd ..

# Create Container Apps environment
echo "🌍 Creating Container Apps environment..."
az extension add --name containerapp --upgrade
az containerapp env create \
  --name budget-tracker-env \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy backend
echo "🚀 Deploying backend Container App..."
az containerapp create \
  --name budget-backend \
  --resource-group $RESOURCE_GROUP \
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
    MONGODB_URI="$MONGODB_URI" \
    SESSION_SECRET="$SESSION_SECRET" \
    BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
    GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"

# Get backend URL
BACKEND_URL=$(az containerapp show --name budget-backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)
echo "✅ Backend deployed at: https://$BACKEND_URL"

# Build and push frontend with backend URL
echo "🔨 Building frontend Docker image..."
cd frontend
docker build \
  --build-arg VITE_API_URL=https://$BACKEND_URL \
  --build-arg VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
  -t $ACR_LOGIN_SERVER/budget-frontend:latest .
echo "⬆️  Pushing frontend image to ACR..."
docker push $ACR_LOGIN_SERVER/budget-frontend:latest
cd ..

# Deploy frontend
echo "🚀 Deploying frontend Container App..."
az containerapp create \
  --name budget-frontend \
  --resource-group $RESOURCE_GROUP \
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
FRONTEND_URL=$(az containerapp show --name budget-frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)

# Update backend with frontend URL
echo "🔄 Updating backend with frontend URL..."
az containerapp update \
  --name budget-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    FRONTEND_URL=https://$FRONTEND_URL \
    BETTER_AUTH_URL=https://$BACKEND_URL \
    GOOGLE_REDIRECT_URI=https://$BACKEND_URL/api/auth/google/callback

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📱 Application URLs:"
echo "  Frontend: https://$FRONTEND_URL"
echo "  Backend:  https://$BACKEND_URL"
echo ""
echo "⚠️  IMPORTANT: Update Google OAuth Settings"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Navigate to APIs & Services → Credentials"
echo "3. Add these Authorized JavaScript origins:"
echo "   - https://$FRONTEND_URL"
echo "   - https://$BACKEND_URL"
echo "4. Add this Authorized redirect URI:"
echo "   - https://$BACKEND_URL/api/auth/google/callback"
echo ""
echo "✅ After updating Google OAuth, your app will be ready!"
