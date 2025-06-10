import { getAccessToken } from '@/lib/gcs-auth';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request) {
  try {
    const { path, operation, expiresIn = 3600, bucketName } = await request.json();
    
    if (!path || !operation || !bucketName) {
      return Response.json({ 
        error: 'Missing required fields: path, operation, and bucketName are required' 
      }, { status: 400 });
    }
    
    // Get short-lived access token
    const accessToken = await getAccessToken();
    
    // Create signed URL for specific operations
    const { Storage } = await import('@google-cloud/storage');
    
    let storage;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Use JSON credentials from environment
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials
      });
    } else {
      // Use default credentials or key file
      storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
    }
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);
    
    // Validate operation type
    const validOperations = ['read', 'write', 'delete', 'resumable'];
    if (!validOperations.includes(operation)) {
      return Response.json({ 
        error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` 
      }, { status: 400 });
    }
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: operation, // 'read', 'write', 'delete', 'resumable'
      expires: Date.now() + (expiresIn * 1000),
      ...(operation === 'write' && {
        conditions: [
          ['content-length-range', 0, 100 * 1024 * 1024] // 100MB max
        ]
      })
    });
    
    return Response.json({ 
      signedUrl,
      accessToken,
      expiresIn,
      operation,
      path,
      bucketName
    });
  } catch (error) {
    console.error('GCS token generation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate GCS token' 
    }, { status: 500 });
  }
} 