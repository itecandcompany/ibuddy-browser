import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getSupabaseClient } from "@/lib/supabase";
import { useBrowserStore } from "@/state/browser-store";
import { palette } from "@/theme/palette";

export default function SettingsScreen(){
 const [email,setEmail]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const lockedDomains=useBrowserStore(s=>s.lockedDomains);
 const supabase=getSupabaseClient();
 useEffect(()=>{let live=true;if(supabase)supabase.auth.getUser().then(({data})=>{if(live)setEmail(data.user?.email??null);});return()=>{live=false;};},[supabase]);
 const syncLocks=async()=>{
  if(!supabase){Alert.alert("Not connected","Configure Supabase before syncing Assessment Lock domains.");return;}
  setBusy(true);
  try{
   const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Sign in first.");
   const {error:delError}=await supabase.from("locked_domains").delete().eq("user_id",user.id);if(delError)throw delError;
   if(lockedDomains.length){const {error}=await supabase.from("locked_domains").upsert(lockedDomains.map(domain=>({user_id:user.id,domain,is_locked:true})),{onConflict:"user_id,domain"});if(error)throw error;}
   Alert.alert("Assessment Lock synced","Your manually locked domains are now checked by the server before AI requests.");
  }catch(error){Alert.alert("Could not sync",error instanceof Error?error.message:"Please try again.");}
  finally{setBusy(false);}
 };
 const signOut=async()=>{if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)Alert.alert("Sign out failed",error.message);else{setEmail(null);router.replace("/");}};
 const deleteAccount=()=>{
  Alert.alert("Delete your iBuddy account?","This permanently deletes your account and server-side data. This cannot be undone.",[
   {text:"Cancel",style:"cancel"},
   {text:"Delete account",style:"destructive",onPress:async()=>{
    if(!supabase)return;setBusy(true);
    try{const {error}=await supabase.functions.invoke("delete-account",{body:{confirm:"DELETE_MY_ACCOUNT"}});if(error)throw error;await supabase.auth.signOut({scope:"local"});setEmail(null);Alert.alert("Account deleted","Your iBuddy account deletion was confirmed by the server.");router.replace("/");}
    catch(error){Alert.alert("Deletion failed",error instanceof Error?error.message:"The server did not confirm deletion.");}
    finally{setBusy(false);}
   }}
  ]);
 };
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
  <Pressable onPress={()=>router.back()}><Text style={styles.back}>‹ Browser</Text></Pressable>
  <Text style={styles.title}>Settings & privacy</Text>
  <View style={styles.card}><Text style={styles.label}>ACCOUNT</Text><Text style={styles.value}>{email??"Not signed in"}</Text><Pressable style={styles.button} onPress={()=>router.push("/sign-in")}><Text style={styles.buttonText}>{email?"Switch account":"Sign in / create account"}</Text></Pressable>{email?<Pressable style={styles.secondary} onPress={signOut}><Text style={styles.secondaryText}>Sign out</Text></Pressable>:null}</View>
  <View style={styles.card}><Text style={styles.label}>ASSESSMENT LOCK</Text><Text style={styles.value}>{lockedDomains.length} manually locked domain(s)</Text>{lockedDomains.map(domain=><Text key={domain} style={styles.domain}>• {domain}</Text>)}<Text style={styles.note}>Automatic protected-domain rules remain active. Manual locks are local until synced.</Text><Pressable disabled={busy||!email} style={styles.button} onPress={syncLocks}><Text style={styles.buttonText}>Sync locked domains to server</Text></Pressable></View>
  <View style={styles.card}><Text style={styles.label}>DATA & RETENTION</Text><Text style={styles.note}>AI requests are not stored by the AI functions. Browsing history and bookmarks currently remain in local app storage. Private tabs do not add history. Saved cloud analyses and history sync are not enabled by default.</Text><Text style={styles.note}>You can delete your account and server-owned records below. Clearing local app storage is separate and can be done from iOS Settings by removing the app.</Text></View>
  {email?<View style={styles.card}><Text style={styles.label}>DANGER ZONE</Text><Text style={styles.note}>Account deletion is irreversible. The server deletes the Auth user; rows linked with ON DELETE CASCADE are removed with it.</Text><Pressable disabled={busy} style={styles.danger} onPress={deleteAccount}><Text style={styles.dangerText}>Delete my account and data</Text></Pressable></View>:null}
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:palette.background},content:{padding:18,paddingBottom:40,gap:14},
 back:{color:palette.blue,fontWeight:"700",paddingVertical:8},title:{color:palette.text,fontSize:26,fontWeight:"900",marginBottom:4},
 card:{backgroundColor:palette.surface,borderColor:palette.border,borderWidth:1,borderRadius:16,padding:16,gap:10},
 label:{color:palette.blue,fontSize:10,fontWeight:"900",letterSpacing:1.3},value:{color:palette.text,fontSize:15,fontWeight:"700"},
 domain:{color:palette.textSecondary,fontSize:12},note:{color:palette.muted,fontSize:12,lineHeight:18},
 button:{backgroundColor:palette.blue,borderRadius:11,padding:12,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"800"},
 secondary:{borderColor:palette.border,borderWidth:1,borderRadius:11,padding:12,alignItems:"center"},secondaryText:{color:palette.text,fontWeight:"700"},
 danger:{backgroundColor:"#51272D",borderRadius:11,padding:12,alignItems:"center"},dangerText:{color:"#FFB8BE",fontWeight:"800"}
});
