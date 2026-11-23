import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { getSupabaseClient } from "@/lib/supabase";
import { palette } from "@/theme/palette";

export default function SignInScreen() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const supabase=getSupabaseClient();

  const submit=async(mode:"signin"|"signup")=>{
    if(!supabase){Alert.alert("Supabase is not configured","Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your local environment.");return;}
    if(!email.trim()||password.length<8){Alert.alert("Check your details","Enter an email and a password with at least 8 characters.");return;}
    setBusy(true);
    try{
      const result=mode==="signin"
        ? await supabase.auth.signInWithPassword({email:email.trim(),password})
        : await supabase.auth.signUp({email:email.trim(),password});
      if(result.error)throw result.error;
      if(mode==="signup"&&!result.data.session){Alert.alert("Check your email","Confirm your email address, then return here to sign in.");return;}
      router.replace("/");
    }catch(error){Alert.alert("Authentication failed",error instanceof Error?error.message:"Please try again.");}
    finally{setBusy(false);}
  };

  const signInApple=async()=>{
    if(!supabase){Alert.alert("Supabase is not configured","Configure the Supabase app credentials first.");return;}
    setBusy(true);
    try{
      const credential=await AppleAuthentication.signInAsync({requestedScopes:[AppleAuthentication.AppleAuthenticationScope.EMAIL,AppleAuthentication.AppleAuthenticationScope.FULL_NAME]});
      if(!credential.identityToken)throw new Error("Apple did not return an identity token.");
      const {error}=await supabase.auth.signInWithIdToken({provider:"apple",token:credential.identityToken});
      if(error)throw error;
      router.replace("/");
    }catch(error){
      if(typeof error==="object"&&error!==null&&"code" in error&&(error as {code?:string}).code==="ERR_REQUEST_CANCELED")return;
      Alert.alert("Apple sign-in failed",error instanceof Error?error.message:"Please try again.");
    }finally{setBusy(false);}
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <View style={styles.mark}><Text style={styles.markText}>i</Text></View>
      <Text style={styles.title}>Welcome to iBuddy</Text>
      <Text style={styles.subtitle}>Sign in to use private, page-grounded study tools. Browsing remains available without an account.</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={palette.muted} autoCapitalize="none" keyboardType="email-address" style={styles.input}/>
      <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={palette.muted} secureTextEntry style={styles.input}/>
      <Pressable disabled={busy} style={styles.primary} onPress={()=>submit("signin")}><Text style={styles.primaryText}>Sign in</Text></Pressable>
      <Pressable disabled={busy} style={styles.secondary} onPress={()=>submit("signup")}><Text style={styles.secondaryText}>Create account</Text></Pressable>
      {Platform.OS==="ios"?<AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE} cornerRadius={12} style={styles.apple} onPress={signInApple}/>:null}
      {busy?<ActivityIndicator color={palette.blue}/>:null}
      <Pressable onPress={()=>router.back()}><Text style={styles.back}>Continue browsing</Text></Pressable>
      <Text style={styles.footnote}>AI features require sign-in. Provider keys remain on the server. Page content is not saved unless you explicitly choose to save it.</Text>
    </View>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:palette.background,justifyContent:"center",padding:24},
 content:{gap:14},
 mark:{width:54,height:54,borderRadius:17,backgroundColor:palette.blue,alignItems:"center",justifyContent:"center",alignSelf:"center"},
 markText:{fontSize:36,fontWeight:"900",color:"#fff"},
 title:{color:palette.text,fontSize:26,fontWeight:"900",textAlign:"center"},
 subtitle:{color:palette.muted,fontSize:13,lineHeight:20,textAlign:"center",marginBottom:12},
 input:{backgroundColor:palette.surface,borderWidth:1,borderColor:palette.border,borderRadius:12,padding:14,color:palette.text},
 primary:{backgroundColor:palette.blue,borderRadius:12,padding:14,alignItems:"center"},
 primaryText:{color:"#fff",fontWeight:"800"},
 secondary:{borderWidth:1,borderColor:palette.blue,borderRadius:12,padding:14,alignItems:"center"},
 secondaryText:{color:palette.blue,fontWeight:"800"},
 apple:{height:48,width:"100%",marginTop:4},
 back:{color:palette.blue,textAlign:"center",fontWeight:"700",padding:8},
 footnote:{color:palette.muted,fontSize:10,lineHeight:15,textAlign:"center",marginTop:10}
});
