import { GoogleAuth } from 'google-auth-library';

export function getGoogleAuth() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Parse JSON from environment
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    return new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }
  
  // Fallback to default credentials
  return new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
}

export async function getAccessToken() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}