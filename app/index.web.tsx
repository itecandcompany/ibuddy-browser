import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Dedicated Vercel entry screen.
 * Keep this route independent of native browser APIs so the web preview
 * always has a visible first paint, even while the iPhone app is in development.
 */
export default function IndexWebScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.page}>
      <View style={styles.nav}>
        <View style={styles.logo}><Text style={styles.logoText}>i</Text></View>
        <Text style={styles.brand}>iBuddy</Text>
        <View style={styles.preview}><Text style={styles.previewText}>WEB PREVIEW</Text></View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>YOUR BROWSER. WITH A BUDDY.</Text>
        <Text style={styles.heading}>Browse with a little more understanding.</Text>
        <Text style={styles.copy}>A privacy-first, AI-assisted browser being built for iPhone. Read and understand pages when you choose, with safeguards that keep protected assessments off limits.</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>The iPhone app is in development</Text>
          <Text style={styles.noticeCopy}>This website is the iBuddy product preview. The full browsing experience uses native iOS capabilities and will be delivered as an iPhone app.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Built around your control</Text>
        <View style={styles.feature}>
          <Text style={styles.number}>01</Text>
          <View style={styles.featureBody}>
            <Text style={styles.featureTitle}>Private browsing</Text>
            <Text style={styles.featureCopy}>A focused browser experience designed around privacy and user control.</Text>
          </View>
        </View>
        <View style={styles.feature}>
          <Text style={styles.number}>02</Text>
          <View style={styles.featureBody}>
            <Text style={styles.featureTitle}>Read pages on demand</Text>
            <Text style={styles.featureCopy}>Choose when iBuddy reads visible webpage content and helps explain it.</Text>
          </View>
        </View>
        <View style={styles.feature}>
          <Text style={styles.number}>03</Text>
          <View style={styles.featureBody}>
            <Text style={styles.featureTitle}>Assessment Lock</Text>
            <Text style={styles.featureCopy}>Protected assessment pages stay excluded from page reading and AI analysis.</Text>
          </View>
        </View>
      </View>
      <Text style={styles.footer}>iBuddy · Privacy-first by design · iTec & Company</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1128' },
  page: { flexGrow: 1, width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 48 },
  nav: { height: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#2D7BFF', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  brand: { color: '#F5F7FF', fontSize: 20, fontWeight: '800' },
  preview: { marginLeft: 'auto', backgroundColor: '#1B3159', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  previewText: { color: '#BBD0FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  hero: { paddingTop: 64, paddingBottom: 48 },
  eyebrow: { color: '#78A8FF', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#F5F7FF', fontSize: 52, lineHeight: 59, fontWeight: '900', letterSpacing: -1.8, maxWidth: 720, marginTop: 18 },
  copy: { color: '#A8B4CC', fontSize: 17, lineHeight: 28, maxWidth: 650, marginTop: 22 },
  notice: { backgroundColor: '#142747', borderColor: '#2D7BFF', borderWidth: 1, borderRadius: 16, padding: 20, marginTop: 30, maxWidth: 650 },
  noticeTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  noticeCopy: { color: '#C2D2EA', fontSize: 13, lineHeight: 21, marginTop: 8 },
  section: { borderTopWidth: 1, borderTopColor: '#263657', paddingTop: 28 },
  sectionTitle: { color: '#F5F7FF', fontSize: 23, fontWeight: '800', marginBottom: 8 },
  feature: { flexDirection: 'row', gap: 18, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#263657' },
  number: { color: '#78A8FF', fontSize: 12, fontWeight: '900', paddingTop: 3 },
  featureBody: { flex: 1 },
  featureTitle: { color: '#F5F7FF', fontSize: 16, fontWeight: '800' },
  featureCopy: { color: '#A8B4CC', fontSize: 13, lineHeight: 21, marginTop: 5 },
  footer: { color: '#71809D', fontSize: 11, marginTop: 36 },
});
