# Connect Project to GitHub Repository

## Steps to connect your project to GitHub:

1. **Initialize Git (if not already done):**
   ```bash
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Make your first commit:**
   ```bash
   git commit -m "Initial commit: Ecommerce web application"
   ```

4. **Add your remote repository:**
   ```bash
   git remote add origin https://github.com/Ms-Mohamed/Ecommerce-web.git
   ```

5. **Rename branch to main (if needed):**
   ```bash
   git branch -M main
   ```

6. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

## If you get authentication errors:

You may need to use a Personal Access Token instead of your password:
- Go to GitHub Settings > Developer settings > Personal access tokens
- Generate a new token with `repo` permissions
- Use the token as your password when pushing

## Notes:
- Your `.env` file is already in `.gitignore` (won't be committed)
- Your `.gitignore` is already configured properly
- Your README.md will be pushed with the project

