export function AppleSignInButton(_props: { onPress: () => void }) {
  return null;
}

export async function getAppleIdentityToken(): Promise<string> {
  throw new Error("Apple Sign-In is only available in the native iOS app.");
}
