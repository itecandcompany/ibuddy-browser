import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { palette } from "@/theme/palette";

export default function PrivacyScreen(){
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
  <Pressable onPress={()=>router.back()}><Text style={styles.back}>‹ Settings</Text></Pressable>
  <Text style={styles.title}>iBuddy privacy overview</Text>
  <Text style={styles.updated}>Current implementation disclosure · November 2026</Text>
  <Text style={styles.heading}>What stays on your iPhone</Text>
  <Text style={styles.body}>Browsing history, bookmarks and manually locked domains are stored locally using app storage. Private tabs are not added to browsing history. Use Settings to clear local history and bookmarks, or delete the account to clear local browser data too.</Text>
  <Text style={styles.heading}>When page text is sent for AI</Text>
  <Text style={styles.body}>Nothing is analyzed automatically. When you tap Read page and then request a summary or ask a question, the visible text snapshot you chose to read is sent through an authenticated iBuddy Supabase Edge Function to the configured AI provider. The app does not save the snapshot, prompt or response in its own database by default. The AI provider processes the request under its own service terms and retention policies.</Text>
  <Text style={styles.heading}>Image OCR</Text>
  <Text style={styles.body}>Selected images are processed on-device with Apple Vision first. If you choose Try secure server OCR, iBuddy asks for confirmation before uploading that selected image to the configured vision provider. Do not upload sensitive images. iBuddy does not save the image or OCR response by default.</Text>
  <Text style={styles.heading}>Assessment Lock</Text>
  <Text style={styles.body}>Known protected assessment domains are blocked automatically. You can add manual domain locks in the browser. Manual locks are enforced server-side after you sync them from Settings. Protected pages cannot be read or analyzed inside iBuddy.</Text>
  <Text style={styles.heading}>Account and server data</Text>
  <Text style={styles.body}>If you create an account, Supabase Auth processes your email and authentication data. Optional user-owned data tables are protected with Row Level Security. AI requests are not inserted into saved analyses or chat tables automatically. Account deletion removes your Supabase Auth user and cascade-linked server records, and clears local history, bookmarks and manual locks on this device.</Text>
  <Text style={styles.heading}>What iBuddy does not do</Text>
  <Text style={styles.body}>iBuddy does not monitor other apps, record your screen in the background, read passwords or typed form answers, inject answers into webpages, bypass logins/paywalls/certificates, or automatically analyze pages.</Text>
  <Text style={styles.heading}>Important deployment note</Text>
  <Text style={styles.body}>This is the current software behavior, not a substitute for a final legal privacy policy. Before public release, the publisher must name the actual operator, provide contact details, confirm the selected AI provider&apos;s retention terms, publish a legal privacy policy and complete the App Store privacy disclosures.</Text>
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:palette.background},content:{padding:20,paddingBottom:48},
 back:{color:palette.blue,fontWeight:"800",paddingVertical:8},title:{color:palette.text,fontSize:26,fontWeight:"900",marginTop:8},
 updated:{color:palette.muted,fontSize:10,marginTop:6,marginBottom:16},
 heading:{color:palette.blue,fontSize:13,fontWeight:"900",marginTop:18,marginBottom:6},
 body:{color:palette.textSecondary,fontSize:13,lineHeight:21}
});
