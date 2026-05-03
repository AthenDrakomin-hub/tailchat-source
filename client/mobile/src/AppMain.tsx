import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from 'react-native';
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
type MobileTabKey = 'messages' | 'contacts' | 'discover' | 'me';

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
  const normalizedHost = useMemo(() => props.host.replace(/\/$/, ''), [props.host]);
  const tabConfig = useMemo(
    () => ({
      messages: { label: '消息', path: '/main/personal' },
      contacts: { label: '通讯录', path: '/main/personal/contacts' },
      discover: { label: '发现', path: '/main/feed' },
      me: { label: '我', path: null },
    }),
    []
  );
  const [currentTab, setCurrentTab] = useState<MobileTabKey>('messages');
  const [currentUrl, setCurrentUrl] = useState(`${normalizedHost}/main/personal`);

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

  useEffect(() => {
    setCurrentUrl(`${normalizedHost}/main/personal`);
    setCurrentTab('messages');
  }, [normalizedHost]);

  const switchTab = (tab: MobileTabKey) => {
    setCurrentTab(tab);

    const path = tabConfig[tab].path;
    if (path) {
      setErrorMessage(null);
      setLoading(true);
      setSlowNetworkHint(false);
      setRecoverSuccessVisible(false);
      setCurrentUrl(`${normalizedHost}${path}`);
    }
  };

  const recoverCurrentPage = (status: string) => {
    if (currentTab === 'me') {
      setStatusText('当前工作区连接稳定');
      return;
    }

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
        <View style={styles.topbarRow}>
          <View style={styles.topbarSide}>
            {currentTab !== 'me' ? (
              <TouchableOpacity
                style={[styles.topActionTextBtn, !canGoBack && styles.disabledTextBtn]}
                disabled={!canGoBack}
                onPress={() => {
                  webviewRef.current?.goBack();
                }}
              >
                <Text
                  style={[
                    styles.topActionText,
                    !canGoBack && styles.disabledBtnText,
                  ]}
                >
                  返回
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.topbarPlaceholder} />
            )}
          </View>
          <View style={styles.topbarCenter}>
            <Text style={styles.topbarTitle}>{tabConfig[currentTab].label}</Text>
          </View>
          <View style={[styles.topbarSide, styles.topbarSideRight]}>
            {currentTab !== 'me' && (
              <TouchableOpacity
                style={[styles.topActionTextBtn, loading && styles.disabledTextBtn]}
                disabled={loading}
                onPress={() => {
                  recoverCurrentPage('正在重新连接当前工作区…');
                }}
              >
                <Text style={styles.topActionText}>刷新</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.topActionTextBtn}
              onPress={() => {
                clearSelectedServer();
              }}
            >
              <Text style={styles.topActionText}>切换</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loading && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${Math.max(progress * 100, 8)}%` }]} />
          </View>
        )}
        {!loading && !errorMessage && currentTab !== 'me' && (
          <View
            style={[
              styles.topbarStatusWrap,
              statusText.includes('稳定') || statusText.includes('已连接')
                ? styles.topbarStatusWrapStable
                : styles.topbarStatusWrapActive,
            ]}
          >
            <Text
              style={[
                styles.topbarStatusText,
                statusText.includes('稳定') || statusText.includes('已连接')
                  ? styles.topbarStatusTextStable
                  : styles.topbarStatusTextActive,
              ]}
            >
              {statusText}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.webviewWrap}>
        {currentTab === 'me' ? (
          <ScrollView style={styles.meWrap} contentContainerStyle={styles.meContent}>
            <View style={styles.meProfileCard}>
              <View style={styles.meAvatar}>
                <Text style={styles.meAvatarText}>
                  {props.serverName.slice(0, 1) || '财'}
                </Text>
              </View>
              <View style={styles.meProfileMain}>
                <Text style={styles.meProfileName}>{props.serverName}</Text>
                <Text style={styles.meProfileDesc}>个人资料</Text>
                <Text style={styles.meProfileHost}>{props.host}</Text>
              </View>
              <Text style={styles.meProfileArrow}>›</Text>
            </View>
            <View style={styles.meMenuGroup}>
              <View style={styles.meMenuRow}>
                <Text style={styles.meMenuLabel}>服务状态</Text>
                <Text
                  style={[
                    styles.meMenuValue,
                    statusText.includes('稳定') || statusText.includes('已连接')
                      ? styles.meMenuValueStable
                      : styles.meMenuValueActive,
                  ]}
                >
                  {statusText}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => switchTab('messages')}
              >
                <Text style={styles.meMenuLabel}>消息</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => switchTab('contacts')}
              >
                <Text style={styles.meMenuLabel}>通讯录</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => switchTab('discover')}
              >
                <Text style={styles.meMenuLabel}>发现</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.meMenuGroup}>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => recoverCurrentPage('正在重新连接当前工作区…')}
              >
                <Text style={styles.meMenuLabel}>系统设置</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => recoverCurrentPage('正在重新连接当前工作区…')}
              >
                <Text style={styles.meMenuLabel}>刷新当前页面</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.meMenuGroup}>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('https://tailchat.msgbyte.com/entry/trust')}
              >
                <Text style={styles.meMenuLabel}>安全与合规</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('/entry/terms')}
              >
                <Text style={styles.meMenuLabel}>用户协议</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('/entry/privacy')}
              >
                <Text style={styles.meMenuLabel}>隐私政策</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('/entry/community')}
              >
                <Text style={styles.meMenuLabel}>社区公约</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('https://tailchat.msgbyte.com/downloads')}
              >
                <Text style={styles.meMenuLabel}>下载说明</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('https://tailchat.msgbyte.com/docs/intro')}
              >
                <Text style={styles.meMenuLabel}>使用文档</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.meMenuRow}
                onPress={() => Linking.openURL('/entry/about')}
              >
                <Text style={styles.meMenuLabel}>关于</Text>
                <Text style={styles.meMenuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <WebView
            ref={webviewRef}
            source={{ uri: currentUrl }}
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
            if (navState.url.startsWith(`${normalizedHost}/main/feed`)) {
              setCurrentTab('discover');
            } else if (
              navState.url.startsWith(`${normalizedHost}/main/personal/contacts`)
            ) {
              setCurrentTab('contacts');
            } else if (navState.url.startsWith(`${normalizedHost}/main/personal`)) {
              setCurrentTab('messages');
            }
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
        )}
        {loading && currentTab !== 'me' && (
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
        {recoverSuccessVisible && !errorMessage && currentTab !== 'me' && (
          <View style={styles.recoverSuccessOverlay}>
            <Text style={styles.recoverSuccessText}>已恢复当前工作区内容</Text>
          </View>
        )}
        {errorMessage && currentTab !== 'me' && (
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
      <View style={styles.bottomTabbar}>
        {(Object.keys(tabConfig) as MobileTabKey[]).map((tab) => {
          const active = currentTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={styles.bottomTabItem}
              onPress={() => switchTab(tab)}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  active ? styles.bottomTabTextActive : styles.bottomTabTextInactive,
                ]}
              >
                {tabConfig[tab].label}
              </Text>
              <View
                style={[
                  styles.bottomTabDot,
                  active ? styles.bottomTabDotActive : styles.bottomTabDotInactive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topbarRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topbarSide: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topbarSideRight: {
    justifyContent: 'flex-end',
  },
  topbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topbarPlaceholder: {
    width: 44,
    height: 28,
  },
  topbarTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
  },
  topActionTextBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  topActionText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledTextBtn: {
    opacity: 0.45,
  },
  disabledBtnText: {
    color: '#94a3b8',
  },
  progressWrap: {
    marginTop: 8,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  topbarStatusWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topbarStatusWrapActive: {
    backgroundColor: '#eef2ff',
  },
  topbarStatusWrapStable: {
    backgroundColor: '#ecfdf5',
  },
  topbarStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  topbarStatusTextActive: {
    color: '#0b4a8b',
  },
  topbarStatusTextStable: {
    color: '#047857',
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
  meWrap: {
    flex: 1,
  },
  meContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  meProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eef2f7',
  },
  meAvatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#07c160',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  meAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  meProfileMain: {
    flex: 1,
  },
  meProfileName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  meProfileDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  meProfileHost: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  meProfileArrow: {
    color: '#cbd5e1',
    fontSize: 24,
    lineHeight: 24,
  },
  meMenuGroup: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  meMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eef2f7',
  },
  meMenuLabel: {
    color: '#111827',
    fontSize: 15,
  },
  meMenuValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  meMenuValueActive: {
    color: '#0b4a8b',
  },
  meMenuValueStable: {
    color: '#07c160',
  },
  meMenuArrow: {
    color: '#94a3b8',
    fontSize: 22,
    lineHeight: 22,
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
  loadingOverlay: {
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
  bottomTabbar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    paddingBottom: 10,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomTabTextActive: {
    color: '#07c160',
  },
  bottomTabTextInactive: {
    color: '#64748b',
  },
  bottomTabDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 6,
  },
  bottomTabDotActive: {
    backgroundColor: '#07c160',
  },
  bottomTabDotInactive: {
    backgroundColor: 'transparent',
  },
});
