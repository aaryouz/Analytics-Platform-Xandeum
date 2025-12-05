# Deployment Guide - Xandeum pNode Analytics Platform

This guide provides step-by-step instructions for deploying the Xandeum pNode Analytics Platform to production.

## Prerequisites

- Node.js 18.x or higher (20.x recommended)
- npm or yarn package manager
- Git
- A Vercel, Railway, or AWS account (for deployment)

## Environment Variables

The application requires the following environment variables:

### Required

```env
# Solana RPC Endpoint
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Recommended for Production

For production deployments, use a dedicated RPC provider with higher rate limits:

- **Helius**: https://api.helius.xyz/v0/
- **QuickNode**: https://solana-mainnet.quic

knode.pro/
- **Alchemy**: https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-configuration Next.js deployment
- Automatic SSL certificates
- Global CDN with edge caching
- Serverless functions for API routes
- Free tier available

**Steps:**

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Xandeum pNode Analytics Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Analytics-Platform-Xandeum.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to Settings → Environment Variables
   - Add `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`
   - Value: `https://api.mainnet-beta.solana.com` (or your dedicated RPC endpoint)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - You'll receive a production URL (e.g., `your-project.vercel.app`)

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Railway

**Why Railway?**
- Simple deployment process
- Built-in PostgreSQL and Redis if needed later
- Automatic HTTPS
- GitHub integration

**Steps:**

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"

2. **Configure Build**
   - Railway will auto-detect Next.js
   - Set build command: `npm run build`
   - Set start command: `npm start`

3. **Add Environment Variables**
   - Click on your service
   - Go to Variables tab
   - Add `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`

4. **Deploy**
   - Railway will automatically deploy on every git push
   - Access your app at the provided Railway URL

### Option 3: AWS Amplify

**Why AWS Amplify?**
- Enterprise-grade infrastructure
- Scalable and secure
- Integration with other AWS services

**Steps:**

1. **Connect Repository**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**
   - In App settings → Environment variables
   - Add `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`

4. **Deploy**
   - Click "Save and deploy"
   - AWS will build and deploy your application

## Post-Deployment

### Verify Deployment

1. **Check Application Health**
   ```bash
   curl -I https://your-domain.com/api/pnodes
   ```
   Should return `200 OK`

2. **Test pNode Fetching**
   - Visit your deployed URL
   - Verify that pNodes are loading
   - Check browser console for any errors

3. **Monitor Performance**
   - Use Vercel Analytics (if on Vercel)
   - Set up Sentry for error tracking (optional)
   - Monitor API response times

### Performance Optimization

1. **Enable Caching**
   - The API routes already include cache headers
   - Ensure your CDN/edge network is configured to respect them

2. **Use Dedicated RPC Provider**
   - Public Solana RPCs have rate limits
   - For production, use Helius, QuickNode, or Alchemy
   - Costs: ~$50-200/month depending on usage

3. **Monitor Costs**
   - Most providers offer free tiers:
     - Vercel: Free for personal projects
     - Railway: $5/month after free credits
     - Helius: 100k credits/month free

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Monitor Logs

- **Vercel**: Dashboard → Logs
- **Railway**: Project → Deployments → Logs
- **AWS**: CloudWatch Logs

### Scaling

The application is designed to scale horizontally:
- Vercel automatically scales serverless functions
- Railway can be configured for autoscaling
- AWS Amplify supports auto-scaling

## Troubleshooting

### Build Failures

**Issue**: "Module not found"
```bash
npm install
npm run build
```

**Issue**: "Out of memory"
- Increase Node.js heap size:
  ```json
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  ```

### Runtime Errors

**Issue**: "Failed to fetch pNodes"
- Verify `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT` is set correctly
- Check RPC endpoint is accessible
- Verify program address is correct

**Issue**: "Circuit breaker is open"
- RPC endpoint is experiencing issues
- Wait 60 seconds for circuit breaker to reset
- Check RPC provider status page

### Performance Issues

**Issue**: Slow API responses
- Use a dedicated RPC provider
- Implement Redis caching (optional enhancement)
- Enable CDN caching

**Issue**: High bandwidth costs
- Reduce cache TTL to lower refresh frequency
- Implement request coalescing

## Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use platform-specific secret management
   - Rotate API keys regularly

2. **CORS Configuration**
   - API routes are server-side, CORS not needed
   - If adding client-side RPC calls, configure CORS properly

3. **Rate Limiting**
   - Implement rate limiting for production (optional)
   - Use Vercel Edge Middleware or similar

4. **Monitoring**
   - Set up uptime monitoring (UptimeRobot, Better Uptime)
   - Configure error alerts (Sentry)
   - Monitor RPC usage to avoid overage charges

## Support

For deployment issues:
1. Check deployment platform documentation
2. Review application logs
3. Test locally first: `npm run build && npm start`
4. Open an issue on GitHub

---

**Ready for Production!** 🚀

This platform is built with NASA-quality standards and is ready for deployment to production. The architecture is robust, scalable, and designed for reliability.
