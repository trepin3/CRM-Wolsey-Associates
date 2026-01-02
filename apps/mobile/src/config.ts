// Minimal runtime config for the mobile app.
// Set `API_URL` to your backend's LAN address when testing on device/emulator.

// Default: use localhost for simulator; override with env or edit this file for device testing.
export const API_URL = (global as any).API_URL || 'http://192.168.0.57:4000';

// If you prefer to read from process.env during build, you can replace the above with
// `export const API_URL = process.env.API_URL || 'http://192.168.0.57:4000'` and
// configure dotenv or Expo's app config.

export default {
  API_URL,
};
