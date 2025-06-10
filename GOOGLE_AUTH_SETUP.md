# Google OAuth Authentication Setup

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Google OAuth (for user authentication)
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Google Cloud Storage (for file operations)
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json_as_string
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

## How It Works

1. **Authentication Modal**: When users visit the app without being signed in, they'll see a modal with "Continue with Google" button
2. **Protected Routes**: All main functionality is protected by the `AuthGuard` component
3. **User Profile**: Once authenticated, users can see their profile in Settings and sign out
4. **GCS Integration**: Authenticated users can generate ephemeral tokens for Google Cloud Storage operations

## API Endpoints

### `/api/auth/[...nextauth]`
- Handles Google OAuth flow
- Managed by NextAuth.js

### `/api/gcs-token` (POST)
- Generates ephemeral GCS tokens and signed URLs
- Requires authentication
- Body: `{ path, operation, bucketName, expiresIn? }`

## Usage Example

```javascript
// Generate a signed URL for file upload
const response = await fetch('/api/gcs-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'uploads/my-file.jpg',
    operation: 'write',
    bucketName: 'my-bucket',
    expiresIn: 3600 // 1 hour
  })
});

const { signedUrl } = await response.json();

// Use signedUrl for direct upload to GCS
```

## Components

- `AuthModal`: Shows Google sign-in modal
- `AuthGuard`: Protects routes and shows auth modal when needed
- `UserProfile`: Displays user info and sign-out option
- `useAuth`: Hook for managing authentication state 