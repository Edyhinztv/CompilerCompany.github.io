// ========================================
// DISCORD OAUTH2 CONFIGURATION
// ========================================

const DISCORD_CONFIG = {
    // STEP 1: Create Discord Application
    // Go to: https://discord.com/developers/applications
    // Click "New Application" → Name it "Lua Compiler"

    // STEP 2: Get your CLIENT_ID
    // In your application → General Information → Copy "APPLICATION ID"
    CLIENT_ID: '1443871922633965739',

    // STEP 3: Set Redirect URI
    // In your application → OAuth2 → Redirects → Add Redirect
    // Use the exact URL where you're hosting this (e.g., http://localhost:8080 or your domain)
    REDIRECT_URI: 'https://compilercompany.netlify.app',

    // STEP 4: Permissions (Scopes)
    // These are the minimum required permissions
    SCOPES: ['identify'], // Gets username, ID, avatar

    // Optional: Add 'email' if you want to get user's email
    // SCOPES: ['identify', 'email'],
};

// ========================================
// ADMIN CONFIGURATION
// ========================================

const ADMIN_CONFIG = {
    // Add your Discord User ID here
    // How to get: Enable Developer Mode in Discord → Right click yourself → Copy ID
    ADMIN_ID: '1357141184631279656', // Replace with Edyhinz's Discord ID
};

// ========================================
// INSTRUCTIONS
// ========================================

/*
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it whatever you want (e.g., "Lua Compiler")
4. Copy the "APPLICATION ID" and paste it in CLIENT_ID above
5. Go to OAuth2 → Redirects
6. Add your redirect URL (where you're hosting this page)
7. Get your Discord User ID (Developer Mode → Right click yourself → Copy ID)
8. Replace ADMIN_ID with your Discord ID
9. Save this file
10. You're ready to go!

PERMISSIONS EXPLANATION:
- identify: Gets user's Discord username, ID, discriminator, avatar
- email (optional): Gets user's email address

SECURITY NOTE:
- This auth system is CLIENT-SIDE ONLY
- Do NOT use for critical applications
- Works well for personal/private tools
*/
