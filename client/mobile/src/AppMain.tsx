import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateInjectedScript } from './lib/inject';
import { handleTailchatMessage } from './lib/inject/message-handler';
import { Text, TouchableOpacity } from 'react-native-ui-lib';
import { useServerStore } from './store/server';

/**
 * Tailchat的主要内容
 *
 * 由webview提供
 */

interface Props {
  host: string;
  serverName: string;
}
export const AppMain: React.FC<Props> = React.memo((props) => {
  const webviewRef = useRef<WebView>(null);
  const clearSelectedServer = useServerStore((state) => state.clearSelectedServer);

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <View style={styles.topbarMain}>
          <Text style={styles.topbarKicker}>当前工作区</Text>
          <Text style={styles.topbarTitle}>{props.serverName}</Text>
          <Text style={styles.topbarHost}>{props.host}</Text>
        </View>
        <View style={styles.topbarActions}>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => {
              clearSelectedServer();
            }}
          >
            <Text style={styles.ghostBtnText}>切换</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              webviewRef.current?.reload();
            }}
          >
            <Text style={styles.primaryBtnText}>刷新</Text>
          </TouchableOpacity>
        </View>
      </View>
      <WebView
        ref={webviewRef}
        source={{ uri: props.host }}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={generateInjectedScript()}
        onMessage={(e) => {
          if (!webviewRef.current) {
            return;
          }

          try {
            const raw = e.nativeEvent.data as string;
            const data = JSON.parse(raw);
            if (typeof data === 'object' && data._isTailchat === true) {
              handleTailchatMessage(
                data.type,
                data.payload,
                webviewRef.current
              );
            }
          } catch (err) {
            console.error('webview onmessage:', err);
          }
        }}
      />
    </View>
  );
});
AppMain.displayName = 'AppMain';

const styles = StyleSheet.create({
  root: {
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  topbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topbarMain: {
    marginBottom: 10,
  },
  topbarKicker: {
    color: '#64748b',
    fontSize: 11,
  },
  topbarTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  topbarHost: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  topbarActions: {
    flexDirection: 'row',
  },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    marginRight: 8,
  },
  ghostBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0b4a8b',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
