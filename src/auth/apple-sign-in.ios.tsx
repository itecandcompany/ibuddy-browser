import * as AppleAuthentication from "expo-apple-authentication";

export function AppleSignInButton() {
  return <AppleAuthentication.AppleAuthenticationButton
    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
    cornerRadius={12}
    style={{ height: 48, width: "100%" }}
    onPress={() => undefined}
  />;
}

export async function getAppleIdentityToken(): Promise<string> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });
  if (!credential.identityToken) throw new Error("Apple did not return an identity token.");
  return credential.identityToken;
}
