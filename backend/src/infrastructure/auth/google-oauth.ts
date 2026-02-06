import { OAuth2Client } from 'google-auth-library';
import { env } from '@config/env';

export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: state || '',
    });
    return url;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.client.getToken(code);
    return tokens;
  }

  /**
   * Verify ID token and get user info
   */
  async verifyIdToken(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      image: payload.picture,
      emailVerified: payload.email_verified || false,
    };
  }

  /**
   * Get user info from access token
   */
  async getUserInfo(accessToken: string) {
    this.client.setCredentials({ access_token: accessToken });
    
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await userInfoResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
      verified_email: boolean;
    };
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      image: data.picture,
      emailVerified: data.verified_email,
    };
  }
}

export const googleOAuth = new GoogleOAuthService();
