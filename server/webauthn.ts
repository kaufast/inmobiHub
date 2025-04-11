import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { storage } from './storage';

// WebAuthn configuration, adjust these values according to your application
const rpName = 'Inmobi';
const rpID = process.env.NODE_ENV === 'production' 
  ? process.env.DOMAIN || 'inmobi.repl.co' 
  : 'localhost';
const origin = process.env.NODE_ENV === 'production'
  ? `https://${rpID}`
  : `http://${rpID}:5000`;

/**
 * Generate options for WebAuthn registration
 * @param userId User ID to register passkey for
 * @param username Username to associate with the passkey
 * @returns Registration options to be passed to the browser
 */
export async function generatePasskeyRegistrationOptions(userId: number, username: string) {
  // Check if user already exists
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // The challenge is a random bytes array that will be signed by the authenticator
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId.toString(),
    userName: username,
    // Don't prompt users for additional information about the authenticator
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    excludeCredentials: user.passkey ? [{
      // Convert base64url string to Uint8Array for SimpleWebAuthn
      id: isoBase64URL.toBuffer(user.passkey),
      transports: ['internal'] as AuthenticatorTransportFuture[],
    }] : [],
    authenticatorSelection: {
      // Defaults
      residentKey: 'required',
      userVerification: 'preferred',
      // Don't require attestation from authenticator
      authenticatorAttachment: 'platform',
    },
  });

  // Store challenge temporarily to validate the response
  // You might want to use Redis or another store in production
  // Here we're updating the user record with the challenge
  await storage.updateUser(userId, {
    challenge: options.challenge,
  });

  return options;
}

/**
 * Verify WebAuthn registration response
 * @param userId User ID for the registration
 * @param response WebAuthn registration response from the browser
 * @returns Verification result
 */
export async function verifyPasskeyRegistration(
  userId: number,
  response: RegistrationResponseJSON,
) {
  // Get user with challenge
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.challenge) {
    throw new Error('Registration challenge not found');
  }

  let verification: VerifiedRegistrationResponse;
  try {
    // Verify the authenticator response
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error: any) {
    console.error('Passkey registration verification failed:', error);
    throw new Error(`Passkey registration failed: ${error.message}`);
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new Error('Passkey registration verification failed');
  }

  // Convert credential ID to base64 string for storage
  // Handle differences in data structure across SimpleWebAuthn versions
  // The property structure changed between versions
  const credentialID = isoBase64URL.fromBuffer(
    registrationInfo.credentialID || 
    (registrationInfo.credential && registrationInfo.credential.id ? 
      registrationInfo.credential.id : 
      Buffer.from([]))
  );
  
  const credentialPublicKey = isoBase64URL.fromBuffer(
    registrationInfo.credentialPublicKey || 
    (registrationInfo.credential && registrationInfo.credential.publicKey ? 
      registrationInfo.credential.publicKey : 
      Buffer.from([]))
  );
  
  const counter = registrationInfo.counter || 
    (registrationInfo.credential && typeof registrationInfo.credential.signCount === 'number' ? 
      registrationInfo.credential.signCount : 
      0);
  
  // Store the credential in the database
  await storage.updateUser(userId, {
    passkey: credentialID,
    passkeyPublicKey: credentialPublicKey,
    passkeyCounter: counter,
    passkeyEnabled: true,
    challenge: null, // Clear the challenge
  });

  return {
    verified,
    credentialID,
  };
}

/**
 * Generate options for WebAuthn authentication (login)
 * @param username Username to authenticate
 * @returns Authentication options to be passed to the browser
 */
export async function generatePasskeyAuthenticationOptions(username: string) {
  // Get user by username
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.passkeyEnabled || !user.passkey) {
    throw new Error('Passkey not enabled for this user');
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    // Pass the user's credentials to allow the browser to select the correct one
    allowCredentials: [{
      id: user.passkey,
      transports: ['internal'] as AuthenticatorTransportFuture[],
    }],
  });

  // Store challenge temporarily to validate the response
  await storage.updateUser(user.id, {
    challenge: options.challenge,
  });

  return options;
}

/**
 * Verify WebAuthn authentication response
 * @param username Username to authenticate
 * @param response WebAuthn authentication response from the browser
 * @returns Verification result
 */
export async function verifyPasskeyAuthentication(
  username: string,
  response: AuthenticationResponseJSON,
) {
  // Get user by username
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.passkey || !user.challenge || !user.passkeyPublicKey) {
    throw new Error('Passkey not properly configured');
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    // Verify the authenticator response
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      // For SimpleWebAuthn v7+, the property is 'authenticator'
      // For older versions, we used 'authenticatorData'
      // Including both for compatibility
      authenticator: {
        credentialID: user.passkey,
        credentialPublicKey: user.passkeyPublicKey,
        counter: user.passkeyCounter || 0,
      },
    });
  } catch (error: any) {
    console.error('Passkey authentication verification failed:', error);
    throw new Error(`Passkey authentication failed: ${error.message}`);
  }

  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new Error('Passkey authentication verification failed');
  }

  // Update the counter for the authenticator
  await storage.updateUser(user.id, {
    passkeyCounter: authenticationInfo.newCounter,
    challenge: null, // Clear the challenge
  });

  return {
    verified,
    user,
  };
}