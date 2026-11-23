import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import { palette } from '@/theme/palette';
import { resolveAddressInput } from '@/browser/url';
import { getHostname, isDomainLocked } from '@/policy/assessment-lock';
import { useBrowserStore, type Bookmark, type HistoryEntry } from '@/state/browser-store';

type ListMode = 'history' | 'bookmarks' | null;

export default function BrowserScreen() {
  const webViewRef = useRef<WebViewType>(null);
  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const history = useBrowserStore((state) => state.history);
  const bookmarks = useBrowserStore((state) => state.bookmarks);
  const lockedDomains = useBrowserStore((state) => state.lockedDomains);
  const addTab = useBrowserStore((state) => state.addTab);
  const closeTab = useBrowserStore((state) => state.closeTab);
  const setActiveTab = useBrowserStore((state) => state.setActiveTab);
  const updateActiveTab = useBrowserStore((state) => state.updateActiveTab);
  const addHistory = useBrowserStore((state) => state.addHistory);
  const toggleBookmark = useBrowserStore((state) => state.toggleBookmark);
  const toggleDomainLock = useBrowserStore((state) => state.toggleDomainLock);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]!;
  const [address, setAddress] = useState(activeTab.url);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [listMode, setListMode] = useState<ListMode>(null);

  useEffect(() => {
    setAddress(activeTab.url);
    setErrorMessage(null);
    setSecurityMessage(null);
  }, [activeTab.id, activeTab.url]);

  const locked = useMemo(() => isDomainLocked(activeTab.url, lockedDomains), [activeTab.url, lockedDomains]);
  const hostname = getHostname(activeTab.url);
  const isBookmarked = bookmarks.some((item) => item.url === activeTab.url);

  const navigate = (value: string) => {
    const result = resolveAddressInput(value);
    Keyboard.dismiss();
    if (!result.ok) {
      setSecurityMessage(
        result.reason === 'insecure-http'
          ? 'This browser only loads HTTPS pages. The HTTP address was blocked; iBuddy will not silently downgrade or bypass transport security.'
          : result.reason === 'unsupported-scheme'
            ? 'That link type is not supported. Use an HTTPS website address or a search query.'
            : 'Enter a website address or search phrase.',
      );
      return;
    }
    setSecurityMessage(null);
    setErrorMessage(null);
    setAddress(result.url);
    updateActiveTab({ url: result.url, title: 'Loading…' });
  };

  const onNavigationStateChange = (state: WebViewNavigation) => {
    if (state.url.startsWith('https://')) {
      updateActiveTab({ url: state.url, title: state.title || state.url });
      setAddress(state.url);
    }
    setLoading(state.loading);
    if (!state.loading && state.url.startsWith('https://')) {
      addHistory({ url: state.url, title: state.title || state.url });
    }
  };

  const selectEntry = (entry: HistoryEntry | Bookmark) => {
    setListMode(null);
    setAddress(entry.url);
    updateActiveTab({ url: entry.url, title: entry.title });
    setErrorMessage(null);
  };

  const showLockInfo = () => {
    if (!hostname) return;
    const isManual = lockedDomains.includes(hostname);
    if (locked && !isManual) {
      Alert.alert('Assessment Lock is active', 'This page matches iBuddy’s protected assessment-domain policy. Page analysis features are disabled on protected pages and cannot be bypassed.');
      return;
    }
    Alert.alert(
      isManual ? 'Unlock this domain?' : 'Lock this domain?',
      isManual
        ? 'Remove your manual Assessment Lock for this domain? Automatic protection rules still apply.'
        : `Add ${hostname} to your protected-domain list? Pages on this domain will be marked as locked.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isManual ? 'Unlock' : 'Lock domain',
          style: isManual ? 'destructive' : 'default',
          onPress: () => toggleDomainLock(hostname),
        },
      ],
    );
  };

  const renderListItem = ({ item }: { item: HistoryEntry | Bookmark }) => (
    <Pressable style={styles.listItem} onPress={() => selectEntry(item)}>
      <Text numberOfLines={1} style={styles.listTitle}>{item.title || item.url}</Text>
      <Text numberOfLines={1} style={styles.listUrl}>{item.url}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>i</Text></View>
          <View>
            <Text style={styles.brand}>iBuddy</Text>
            <Text style={styles.tagline}>PRIVATE BY DESIGN</Text>
          </View>
          <View style={styles.headerSpacer} />
          <Pressable accessibilityRole="button" accessibilityLabel="Open tabs" style={styles.headerButton} onPress={() => Alert.alert('Your tabs', tabs.map((tab, index) => `${index + 1}. ${tab.privateMode ? 'Private · ' : ''}${tab.title}`).join('\n'), [{ text: 'Close' }, { text: 'New tab', onPress: () => addTab(false) }, { text: 'Private tab', onPress: () => addTab(true) }])}>
            <Text style={styles.headerButtonText}>{tabs.length} ▢</Text>
          </Pressable>
        </View>

        <View style={styles.addressRow}>
          <TextInput
            accessibilityLabel="Website address or search"
            value={address}
            onChangeText={setAddress}
            onSubmitEditing={() => navigate(address)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
            placeholder="Search or enter website"
            placeholderTextColor={palette.muted}
            style={styles.addressInput}
          />
          <Pressable style={styles.goButton} onPress={() => navigate(address)} accessibilityRole="button" accessibilityLabel="Go to address">
            <Text style={styles.goText}>Go</Text>
          </Pressable>
        </View>

        {loading && <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(5, progress * 100)}%` }]} /></View>}
      </View>

      {activeTab.privateMode && (
        <View style={styles.privateBanner}><Text style={styles.privateText}>PRIVATE TAB · This session is not added to browsing history.</Text></View>
      )}
      {locked && (
        <View style={styles.lockBanner}>
          <Text style={styles.lockText}>ASSESSMENT LOCK · Page analysis is disabled on this protected page.</Text>
        </View>
      )}
      {!!securityMessage && (
        <View style={styles.warningBanner}><Text style={styles.warningText}>{securityMessage}</Text></View>
      )}

      <View style={styles.webArea}>
        {errorMessage ? (
          <View style={styles.errorView}>
            <Text style={styles.errorTitle}>This page couldn’t be loaded</Text>
            <Text style={styles.errorBody}>{errorMessage}</Text>
            <Pressable style={styles.primaryButton} onPress={() => { setErrorMessage(null); webViewRef.current?.reload(); }}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            key={activeTab.id}
            ref={webViewRef}
            source={{ uri: activeTab.url }}
            style={styles.webView}
            containerStyle={styles.webViewContainer}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="never"
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            pullToRefreshEnabled={Platform.OS === 'android'}
            onLoadStart={() => { setLoading(true); setProgress(0.08); }}
            onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={onNavigationStateChange}
            onShouldStartLoadWithRequest={(request) => {
              if (request.url.startsWith('https://')) return true;
              if (request.url === 'about:blank') return true;
              if (request.url.startsWith('http://')) {
                setSecurityMessage('An insecure HTTP navigation was blocked. iBuddy does not downgrade HTTPS or bypass certificate errors.');
              } else {
                setSecurityMessage('A non-HTTPS navigation was blocked for your protection.');
              }
              return false;
            }}
            onError={({ nativeEvent }) => {
              setLoading(false);
              setErrorMessage(nativeEvent.description || 'The connection failed. Check your network or the website address.');
            }}
            onHttpError={({ nativeEvent }) => {
              if (nativeEvent.statusCode >= 400) {
                setErrorMessage(`The website returned HTTP ${nativeEvent.statusCode}.`);
              }
            }}
            onRenderProcessGone={() => {
              setErrorMessage('The webpage process stopped unexpectedly. Reload the page to continue.');
            }}
          />
        )}
        {loading && <View pointerEvents="none" style={styles.loadingOverlay}><ActivityIndicator color={palette.blue} /></View>}
      </View>

      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.toolButton} onPress={() => webViewRef.current?.goBack()}><Text style={styles.toolIcon}>‹</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Go forward" style={styles.toolButton} onPress={() => webViewRef.current?.goForward()}><Text style={styles.toolIcon}>›</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Reload page" style={styles.toolButton} onPress={() => { setErrorMessage(null); webViewRef.current?.reload(); }}><Text style={styles.toolLabel}>Reload</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Toggle bookmark" style={styles.toolButton} onPress={() => toggleBookmark({ url: activeTab.url, title: activeTab.title })}><Text style={[styles.toolIcon, isBookmarked && styles.activeIcon]}>{isBookmarked ? '★' : '☆'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="History" style={styles.toolButton} onPress={() => setListMode('history')}><Text style={styles.toolLabel}>History</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Bookmarks" style={styles.toolButton} onPress={() => setListMode('bookmarks')}><Text style={styles.toolLabel}>Saved</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Assessment Lock settings" style={styles.toolButton} onPress={showLockInfo}><Text style={[styles.toolLabel, locked && styles.activeIcon]}>Lock</Text></Pressable>
      </View>

      <View style={styles.tabStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.tabChip, tab.id === activeTab.id && styles.activeTabChip]}>
              <Text numberOfLines={1} style={[styles.tabText, tab.id === activeTab.id && styles.activeTabText]}>{tab.privateMode ? '◉ ' : ''}{tab.title || 'New tab'}</Text>
              <Pressable hitSlop={8} onPress={() => closeTab(tab.id)}><Text style={styles.closeTab}>×</Text></Pressable>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={styles.newTabButton} onPress={() => addTab(false)}><Text style={styles.newTabText}>＋</Text></Pressable>
        <Pressable style={styles.privateTabButton} onPress={() => addTab(true)}><Text style={styles.privateTabText}>Private</Text></Pressable>
      </View>

      <Modal visible={listMode !== null} transparent animationType="slide" onRequestClose={() => setListMode(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalTitle}>{listMode === 'history' ? 'Browsing history' : 'Bookmarks'}</Text>
              <Pressable onPress={() => setListMode(null)}><Text style={styles.modalClose}>Done</Text></Pressable>
            </View>
            <FlatList
              data={(listMode === 'history' ? history : bookmarks) as (HistoryEntry | Bookmark)[]}
              keyExtractor={(item) => item.id}
              renderItem={renderListItem}
              ListEmptyComponent={<Text style={styles.emptyText}>Nothing saved here yet.</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: palette.background },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  brandMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brandMarkText: { color: palette.white, fontSize: 23, fontWeight: '800' },
  brand: { color: palette.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  tagline: { color: palette.muted, fontSize: 8, letterSpacing: 1.5, marginTop: 1 },
  headerSpacer: { flex: 1 },
  headerButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: palette.surface },
  headerButtonText: { color: palette.text, fontWeight: '700' },
  addressRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 15, paddingLeft: 13, paddingRight: 5, height: 48 },
  addressInput: { flex: 1, color: palette.text, fontSize: 14, paddingVertical: 0 },
  goButton: { backgroundColor: palette.blue, borderRadius: 11, paddingHorizontal: 15, paddingVertical: 9 },
  goText: { color: palette.white, fontWeight: '700' },
  progressTrack: { height: 2, backgroundColor: palette.surface, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 2, backgroundColor: palette.blue },
  privateBanner: { backgroundColor: '#24204B', paddingVertical: 7, paddingHorizontal: 14 },
  privateText: { color: '#C9C0FF', fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.4 },
  lockBanner: { backgroundColor: '#392A20', paddingVertical: 8, paddingHorizontal: 14 },
  lockText: { color: '#FFD39B', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  warningBanner: { backgroundColor: '#392A20', padding: 10 },
  warningText: { color: '#FFD39B', fontSize: 11, lineHeight: 16 },
  webArea: { flex: 1, backgroundColor: palette.white },
  webView: { flex: 1, backgroundColor: palette.white },
  webViewContainer: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 10, right: 12 },
  errorView: { flex: 1, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  errorTitle: { color: palette.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  errorBody: { color: palette.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  primaryButton: { backgroundColor: palette.blue, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  primaryButtonText: { color: palette.white, fontWeight: '700' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.border, paddingVertical: 7 },
  toolButton: { minWidth: 34, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  toolIcon: { color: palette.text, fontSize: 25, fontWeight: '500' },
  toolLabel: { color: palette.textSecondary, fontSize: 10, fontWeight: '600' },
  activeIcon: { color: '#FFD166' },
  tabStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.border, paddingVertical: 7, paddingLeft: 8 },
  tabScroll: { alignItems: 'center', gap: 6 },
  tabChip: { maxWidth: 175, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: palette.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: palette.border },
  activeTabChip: { backgroundColor: '#1B3159', borderColor: palette.blue },
  tabText: { color: palette.textSecondary, fontSize: 11, maxWidth: 125 },
  activeTabText: { color: palette.text, fontWeight: '700' },
  closeTab: { color: palette.muted, fontSize: 17, lineHeight: 17 },
  newTabButton: { paddingHorizontal: 9, paddingVertical: 6 },
  newTabText: { color: palette.blue, fontSize: 23, fontWeight: '600' },
  privateTabButton: { backgroundColor: '#24204B', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, marginRight: 8 },
  privateTabText: { color: '#C9C0FF', fontSize: 10, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0009' },
  modalSheet: { maxHeight: '75%', minHeight: '40%', backgroundColor: palette.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 },
  modalHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: palette.border },
  modalTitle: { color: palette.text, fontSize: 18, fontWeight: '800' },
  modalClose: { color: palette.blue, fontWeight: '700', padding: 6 },
  listItem: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: palette.border },
  listTitle: { color: palette.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  listUrl: { color: palette.muted, fontSize: 11 },
  emptyText: { color: palette.muted, textAlign: 'center', paddingVertical: 28 },
});
