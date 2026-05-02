import React, { useEffect, useRef, useState } from 'react';
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
  const nextLoadStatusTextRef = useRef<string | null>(null);
  const recoverSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const showRecoverSuccessRef = useRef(false);
  const clearSelectedServer = useServerStore((state) => state.clearSelectedServer);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slowNetworkHint, setSlowNetworkHint] = useState(false);
  const [statusText, setStatusText] = useState('正在连接当前工作区…');
  const [recoverSuccessVisible, setRecoverSuccessVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlowNetworkHint(false);
      return;
    }

    const timer = setTimeout(() => {
      setSlowNetworkHint(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    return () => {
      if (recoverSuccessTimerRef.current) {
        clearTimeout(recoverSuccessTimerRef.current);
      }
    };
  }, []);

  const recoverCurrentPage = (status: string) => {
    showRecoverSuccessRef.current = true;
    nextLoadStatusTextRef.current = status;
    setErrorMessage(null);
    setLoading(true);
    setProgress(0.08);
    setSlowNetworkHint(false);
    setRecoverSuccessVisible(false);
    setStatusText(status);
    webviewRef.current?.reload();
  };

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
            style={[styles.primaryBtn, loading && styles.disabledPrimaryBtn]}
            disabled={loading}
            onPress={() => {
              recoverCurrentPage('正在重新连接当前工作区…');
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
        {!loading && !errorMessage && (
          <View style={styles.topbarStatusWrap}>
            <Text style={styles.topbarStatusText}>{statusText}</Text>
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
            setSlowNetworkHint(false);
            setStatusText(
              nextLoadStatusTextRef.current ?? '正在连接当前工作区…'
            );
            nextLoadStatusTextRef.current = null;
          }}
          onLoadEnd={() => {
            setLoading(false);
            if (showRecoverSuccessRef.current) {
              setStatusText('当前工作区内容已恢复');
              setRecoverSuccessVisible(true);
              if (recoverSuccessTimerRef.current) {
                clearTimeout(recoverSuccessTimerRef.current);
              }
              recoverSuccessTimerRef.current = setTimeout(() => {
                setRecoverSuccessVisible(false);
                setStatusText('当前工作区连接稳定');
              }, 1800);
              showRecoverSuccessRef.current = false;
            } else {
              setStatusText('当前工作区已连接');
            }
          }}
          onLoadProgress={(event) => {
            setProgress(event.nativeEvent.progress);
            if (event.nativeEvent.progress > 0.6) {
              setStatusText('正在同步页面内容…');
            }
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onError={(event) => {
            setLoading(false);
            setErrorMessage(event.nativeEvent.description || '页面加载失败');
            setStatusText('当前工作区暂时无法访问');
          }}
          onHttpError={(event) => {
            setLoading(false);
            setErrorMessage(
              `服务返回异常状态 (${event.nativeEvent.statusCode})，请稍后重试或切换工作区。`
            );
            setStatusText('服务响应异常');
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
            <View>
              <Text style={styles.loadingText}>正在载入当前工作区内容…</Text>
              <Text style={styles.statusText}>{statusText}</Text>
              {slowNetworkHint && (
                <Text style={styles.slowNetworkText}>
                  当前网络较慢，若长时间无响应可尝试刷新或切换工作区。
                </Text>
              )}
            </View>
          </View>
        )}
        {recoverSuccessVisible && !errorMessage && (
          <View style={styles.recoverSuccessOverlay}>
            <Text style={styles.recoverSuccessText}>已恢复当前工作区内容</Text>
          </View>
        )}
        {errorMessage && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>当前页面加载失败</Text>
            <Text style={styles.statusBadge}>{statusText}</Text>
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
                  recoverCurrentPage('正在恢复当前工作区…');
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
  disabledPrimaryBtn: {
    opacity: 0.65,
  },
  progressWrap: {
    marginTop: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  topbarStatusWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topbarStatusText: {
    color: '#0b4a8b',
    fontSize: 11,
    fontWeight: '600',
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
  slowNetworkText: {
    marginLeft: 8,
    marginTop: 4,
    color: '#64748b',
    fontSize: 11,
    lineHeight: 18,
    maxWidth: 220,
  },
  statusText: {
    marginLeft: 8,
    marginTop: 4,
    color: '#0b4a8b',
    fontSize: 11,
    lineHeight: 18,
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
  recoverSuccessOverlay: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(11,74,139,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recoverSuccessText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    color: '#0b4a8b',
    fontSize: 11,
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
