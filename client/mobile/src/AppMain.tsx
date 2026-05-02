import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            style={[styles.ghostBtn, !canGoBack && styles.disabledBtn]}
            disabled={!canGoBack}
            onPress={() => {
              webviewRef.current?.goBack();
            }}
          >
            <Text
              style={[styles.ghostBtnText, !canGoBack && styles.disabledBtnText]}
            >
              返回
            </Text>
          </TouchableOpacity>
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
              setErrorMessage(null);
              webviewRef.current?.reload();
            }}
          >
            <Text style={styles.primaryBtnText}>刷新</Text>
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${Math.max(progress * 100, 8)}%` }]} />
          </View>
        )}
      </View>
      <View style={styles.webviewWrap}>
        <WebView
          ref={webviewRef}
          source={{ uri: props.host }}
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScriptBeforeContentLoaded={generateInjectedScript()}
          onLoadStart={() => {
            setLoading(true);
            setErrorMessage(null);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onLoadProgress={(event) => {
            setProgress(event.nativeEvent.progress);
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onError={(event) => {
            setLoading(false);
            setErrorMessage(event.nativeEvent.description || '页面加载失败');
          }}
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
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#0b4a8b" />
            <Text style={styles.loadingText}>正在载入当前工作区内容…</Text>
          </View>
        )}
        {errorMessage && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>当前页面加载失败</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => {
                  clearSelectedServer();
                }}
              >
                <Text style={styles.ghostBtnText}>切换工作区</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  setErrorMessage(null);
                  setLoading(true);
                  webviewRef.current?.reload();
                }}
              >
                <Text style={styles.primaryBtnText}>重试</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
    flexWrap: 'wrap',
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
  disabledBtn: {
    backgroundColor: '#e2e8f0',
  },
  disabledBtnText: {
    color: '#94a3b8',
  },
  progressWrap: {
    marginTop: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0b4a8b',
  },
  webviewWrap: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#334155',
    fontSize: 12,
  },
  errorOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  errorTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
});
