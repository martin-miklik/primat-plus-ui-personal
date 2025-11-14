# Branching Strategy

## Branch Overview

### `main` (Production)
- **Purpose**: Production-ready code
- **Deployment**: Manual deployment to production on Vercel
- **Protection**: Auto-deployment disabled via `vercel.json`
- **Merge Policy**: Only merge from `stage` after thorough testing

### `stage` (Staging)
- **Purpose**: Pre-production testing and QA
- **Deployment**: Auto-deploys to Vercel staging environment
- **Testing**: All features should be tested here before merging to `main`
- **Merge Policy**: Merge feature branches here first

### Feature Branches
- **Naming**: `feature/feature-name`, `fix/bug-name`, `chore/task-name`
- **Purpose**: Development of new features or fixes
- **Deployment**: Auto-deploys to Vercel preview environments
- **Merge Target**: Always merge into `stage` first

## Workflow

```
feature/new-feature → stage → main
                        ↓        ↓
                   [Staging]  [Production]
```

### Standard Development Flow

1. **Create Feature Branch**
   ```bash
   git checkout stage
   git pull origin stage
   git checkout -b feature/my-new-feature
   ```

2. **Develop and Test Locally**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-new-feature
   ```
   - Creates a Vercel preview deployment automatically

3. **Merge to Stage**
   ```bash
   git checkout stage
   git pull origin stage
   git merge feature/my-new-feature
   git push origin stage
   ```
   - Deploys to staging environment automatically
   - Test thoroughly on staging

4. **Promote to Production**
   ```bash
   git checkout main
   git pull origin main
   git merge stage
   git push origin main
   ```
   - Trigger manual deployment on Vercel dashboard
   - Or use Vercel CLI: `vercel --prod`

## Vercel Configuration

### Current Setup
- **Production Branch**: `main` (manual deployment)
- **Staging Branch**: `stage` (auto-deployment)
- **Preview Branches**: All other branches (auto-deployment)

### Deployment Settings
Configure in Vercel Dashboard → Project Settings → Git:
1. Set "Production Branch" to `main`
2. Disable auto-deployment for `main` (controlled via `vercel.json`)
3. `stage` will auto-deploy to a staging URL
4. Feature branches will auto-deploy to preview URLs

## Manual Production Deployment

### Option 1: Vercel Dashboard
1. Go to Vercel Dashboard → Your Project
2. Navigate to "Deployments"
3. Find the latest `main` deployment
4. Click "Promote to Production"

### Option 2: Vercel CLI
```bash
# Deploy to production
vercel --prod

# Or force deploy specific branch
git checkout main
vercel --prod --force
```

### Option 3: Re-enable Auto-Deployment Temporarily
Remove the `main: false` setting from `vercel.json` temporarily.

## Environment Variables

Ensure environment variables are properly configured for each environment:
- **Production**: Set in Vercel → Project Settings → Environment Variables (Production)
- **Staging**: Use Preview/Development environment variables
- **Local**: Use `.env.local`

## Best Practices

1. **Never commit directly to `main`** - Always go through `stage`
2. **Test on `stage` first** - Catch issues before production
3. **Use descriptive branch names** - Follow the naming convention
4. **Keep branches updated** - Regularly pull from `stage`/`main`
5. **Clean up old branches** - Delete merged feature branches
6. **Review before merging** - Use pull requests for code review

## Emergency Hotfixes

For critical production fixes:

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "fix: critical bug"

# Merge back to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Backport to stage
git checkout stage
git merge hotfix/critical-bug
git push origin stage

# Manual deploy to production via Vercel
```

## Questions?

- **Q**: How do I test a feature in staging?
  - **A**: Merge your feature branch to `stage`, it will auto-deploy

- **Q**: How do I deploy to production?
  - **A**: Merge `stage` to `main`, then manually deploy via Vercel dashboard or CLI

- **Q**: Can I still use preview deployments?
  - **A**: Yes! Any branch (except `main`) will create preview deployments

- **Q**: How do I revert a production deployment?
  - **A**: Use Vercel dashboard to redeploy a previous successful deployment

