import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePasskeyAuth } from '@/hooks/use-passkey-auth';
import { Loader2, KeyRound, Fingerprint } from 'lucide-react';

export function PasskeyAuthForm() {
  const [username, setUsername] = useState('');
  const { authenticateWithPasskey, isAuthenticating, isPasskeySupported } = usePasskeyAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    await authenticateWithPasskey(username);
  };

  if (!isPasskeySupported()) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in with Passkey</CardTitle>
          <CardDescription>
            Your browser doesn't support passkeys yet. Please use password authentication.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Sign in with Passkey
        </CardTitle>
        <CardDescription>
          Use your passkey for quick and secure authentication
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isAuthenticating}
                autoComplete="webauthn"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isAuthenticating || !username.trim()}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" /> Continue with Passkey
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function PasskeyRegistration() {
  const { registerPasskey, disablePasskey, isRegistering, isPasskeySupported } = usePasskeyAuth();

  if (!isPasskeySupported()) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>
            Your browser doesn't support passkeys yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Passkey Management
        </CardTitle>
        <CardDescription>
          Create or manage your passkey for quick and secure authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <p className="text-sm text-muted-foreground">
          Passkeys are a more secure alternative to passwords. They use biometric authentication 
          (like fingerprint or face recognition) or your device PIN to verify your identity.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          variant="default"
          className="w-full"
          onClick={registerPasskey}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" /> Create Passkey
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={disablePasskey}
          disabled={isRegistering}
        >
          Disable Passkey
        </Button>
      </CardFooter>
    </Card>
  );
}