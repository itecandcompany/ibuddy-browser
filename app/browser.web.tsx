import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/palette';

const features = [
  ['01', 'Private browsing', 'A focused browser experience designed around local-first privacy.'],
  ['02', 'Read pages on demand', 'Choose when iBuddy reads visible webpage content.'],
  ['03', 'Assessment Lock', 'Protected assessment pages stay excluded from page analysis.'],
];

export default function BrowserWebScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.nav}>
        <View style={styles.mark}><Text style={styles.markText}>i</Text></View>
        <Text style={styles.brand}>iBuddy</Text>
        <Text style={styles.pill}>WEB PREVIEW</Text>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>YOUR BROWSER. WITH A BUDDY.</Text>
        <Text style={styles.title}>Browse with{"\n"}a little more{"\n"}understanding.</Text>
        <Text style={styles.description}>iBuddy is an iPhone-first browser concept with user-controlled page reading and privacy safeguards built into its design.</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>iPhone app in development</Text>
          <Text style={styles.noticeText}>This Vercel deployment is the web preview. The full browser uses native iOS WebView capabilities and must be installed as an iPhone build.</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Built around your control</Text>
        {features.map(([number, title, body]) => (
          <View key={number} style={styles.feature}>
            <Text style={styles.number}>{number}</Text>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureBody}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>iBuddy · Privacy-first by design · iTec & Company</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: palette.background, paddingHorizontal: 22, paddingBottom: 36, maxWidth: 820, width: '100%', alignSelf: 'center' },
  nav: { height: 76, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 11, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontSize: 23, fontWeight: '800' },
  brand: { color: palette.text, fontSize: 19, fontWeight: '800' },
  pill: { marginLeft: 'auto', color: '#AFC8FF', backgroundColor: '#1B3159', overflow: 'hidden', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  hero: { paddingTop: 66, paddingBottom: 50 },
  eyebrow: { color: '#78A8FF', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: palette.text, fontSize: 54, lineHeight: 60, fontWeight: '900', letterSpacing: -2, marginTop: 18 },
  description: { color: palette.textSecondary, fontSize: 17, lineHeight: 27, maxWidth: 570, marginTop: 22 },
  notice: { backgroundColor: '#142747', borderColor: '#2D7BFF', borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 30 },
  noticeTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  noticeText: { color: '#C2D2EA', fontSize: 13, lineHeight: 20, marginTop: 7 },
  section: { borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 28 },
  sectionTitle: { color: palette.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  feature: { flexDirection: 'row', gap: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: palette.border },
  number: { color: '#78A8FF', fontSize: 12, fontWeight: '900', paddingTop: 3 },
  featureCopy: { flex: 1 },
  featureTitle: { color: palette.text, fontSize: 16, fontWeight: '800' },
  featureBody: { color: palette.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 5 },
  footer: { color: palette.muted, fontSize: 11, marginTop: 36 },
});
