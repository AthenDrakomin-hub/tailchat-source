import React, { useEffect, useMemo, useState } from 'react';
import { request } from '../../request';
import {
  useAsyncRequest,
  useEditValue,
  Button,
  Input,
  Spin,
  Message,
  Form,
  Upload,
  useTranslation,
  Card,
  Tabs,
  Switch,
  Divider,
  Typography,
} from 'tushan';
import _get from 'lodash/get';
import { IconCheck, IconClose, IconDelete } from 'tushan/icon';
import { TailchatImage } from '../../components/TailchatImage';

type BeidouStarCardConfig = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  avatar?: string;
  verifiedText?: string;
  verifiedIcon?: string;
  footerLeftText?: string;
};

const DEFAULT_BEIDOU_STARS_CARDS: BeidouStarCardConfig[] = [
  {
    id: 'wang-wen',
    name: '王文',
    title: '创始人 · 董事长',
    bio: '从国家部委到百亿私募掌门人，知名财经大V“股道热肠也”，被投资者誉为“万倍叔”。坚信“便宜是硬道理，成长是真功夫”。',
    tags: ['深度价值', '万倍叔', '创始人'],
  },
  {
    id: 'zou-wen',
    name: '邹文',
    title: '投资总监',
    bio: '日斗投资核心基金经理，秉承“稳健进取，价值取胜”理念，深研高现金流与高分红标的，为组合构建坚实的安全边际。',
    tags: ['稳健进取', '高分红', '投资总监'],
  },
  {
    id: 'zhang-wenyong',
    name: '张文勇',
    title: '基金经理',
    bio: '日斗投资核心基金经理，共同践行“低估值、高现金流、高分红、业务长期可持续、有梦想”的五大选股标准。',
    tags: ['低估值', '五大标准', '基金经理'],
  },
  {
    id: 'class-9',
    name: '李班长',
    title: '第九届财富交流学习班长',
    bio: '带领第九届学员深入探讨逆向投资策略，组织实地调研，用脚底板丈量企业护城河。',
    tags: ['第九届', '实地调研', '学习标兵'],
  },
  {
    id: 'class-8',
    name: '赵班长',
    title: '第八届财富交流学习班长',
    bio: '第八届学习会核心组织者，专注“高分红与现金流”课题，协助成员建立稳健的组合结构。',
    tags: ['第八届', '课题研讨', '现金流'],
  },
  {
    id: 'class-5',
    name: '陈班长',
    title: '第五届财富交流学习班长',
    bio: '第五届老学员领袖，常年组织内部读书会，深谙“去人少的地方”这一核心投资哲学。',
    tags: ['第五届', '读书会', '逆向思维'],
  },
  {
    id: 'class-3',
    name: '林班长',
    title: '第三届财富交流学习班长',
    bio: '日斗投资早期追随者与第三届班长，见证了长期主义的力量，擅长分享周期穿越经验。',
    tags: ['第三届', '早期成员', '穿越周期'],
  },
];

function normalizeBeidouStarsCards(
  cards: unknown
): BeidouStarCardConfig[] {
  const list: any[] = Array.isArray(cards) ? cards : [];
  return DEFAULT_BEIDOU_STARS_CARDS.map((fallback, i) => {
    const item = list[i] ?? {};
    const tags = Array.isArray(item.tags)
      ? item.tags.filter((t: any) => typeof t === 'string' && t.trim().length > 0)
      : fallback.tags;

    return {
      ...fallback,
      ...item,
      id: typeof item.id === 'string' && item.id ? item.id : fallback.id,
      tags,
    };
  }).slice(0, 7);
}

/**
 * Tailchat 系统设置
 */
export const SystemConfig: React.FC = React.memo(() => {
  const [{ value: config = {}, loading, error }, fetchConfig] = useAsyncRequest(
    async () => {
      const { data } = await request.get('/config/client');

      return data.config ?? {};
    }
  );
  const { t } = useTranslation();

  useEffect(() => {
    fetchConfig();
  }, []);

  const [serverName, setServerName, saveServerName] = useEditValue(
    config?.serverName,
    async (val) => {
      if (val === config?.serverName) {
        return;
      }

      try {
        await request.patch('/config/client', {
          key: 'serverName',
          value: val,
        });
        fetchConfig();
        Message.success(t('tushan.common.success'));
      } catch (err) {
        console.log(err);
        Message.error(String(err));
      }
    }
  );

  const [registerOrgCode, setRegisterOrgCode, saveRegisterOrgCode] = useEditValue(
    config?.registerOrgCode || '0501',
    async (val) => {
      if (val === config?.registerOrgCode) {
        return;
      }

      try {
        await request.patch('/config/client', {
          key: 'registerOrgCode',
          value: val,
        });
        fetchConfig();
        Message.success(t('tushan.common.success'));
      } catch (err) {
        console.log(err);
        Message.error(String(err));
      }
    }
  );

  const [{}, handleChangeServerEntryImage] = useAsyncRequest(
    async (file: File | null) => {
      if (file) {
        const formdata = new FormData();
        formdata.append('file', file);
        formdata.append('usage', 'server');

        const { data } = await request.put('/file/upload', formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const fileInfo = data.files[0];

        if (!fileInfo) {
          throw new Error('not get file');
        }

        const url = fileInfo.url;
        await request.patch('/config/client', {
          key: 'serverEntryImage',
          value: url,
        });
        fetchConfig();
      } else {
        // delete
        await request.patch('/config/client', {
          key: 'serverEntryImage',
          value: '',
        });
        fetchConfig();
      }
    }
  );

  const [{}, handleChangeAnnouncement] = useAsyncRequest(
    async (values: { enable: boolean; link: string; text: string }) => {
      console.log(values);
      const { enable = false, link = '', text = '' } = values;

      if (enable) {
        await request.patch('/config/client', {
          key: 'announcement',
          value: {
            id: Date.now(),
            text,
            link,
          },
        });
      } else {
        await request.patch('/config/client', {
          key: 'announcement',
          value: false,
        });
      }

      Message.success(t('tushan.common.success'));
    }
  );

  const [beidouStarsCards, setBeidouStarsCards] = useState<
    BeidouStarCardConfig[]
  >(() => normalizeBeidouStarsCards(config?.beidouStarsCards));

  useEffect(() => {
    setBeidouStarsCards(normalizeBeidouStarsCards(config?.beidouStarsCards));
  }, [config]);

  const [{ loading: savingBeidouStars }, saveBeidouStarsCards] = useAsyncRequest(
    async () => {
      await request.patch('/config/client', {
        key: 'beidouStarsCards',
        value: beidouStarsCards.map((c) => ({
          id: c.id,
          name: String(c.name ?? '').trim(),
          title: String(c.title ?? '').trim(),
          bio: String(c.bio ?? '').trim(),
          tags: Array.isArray(c.tags)
            ? c.tags
                .map((t) => String(t ?? '').trim())
                .filter((t) => t.length > 0)
            : [],
          avatar: c.avatar ? String(c.avatar) : '',
          verifiedText: c.verifiedText ? String(c.verifiedText) : '',
          verifiedIcon: c.verifiedIcon ? String(c.verifiedIcon) : '',
          footerLeftText: c.footerLeftText ? String(c.footerLeftText) : '',
        })),
      });
      fetchConfig();
      Message.success(t('tushan.common.success'));
    }
  );

  const [{ loading: uploadingBeidouAvatar }, uploadBeidouAvatar] =
    useAsyncRequest(
      async (params: { index: number; file: File | null }) => {
        const { index, file } = params;
        if (file) {
          const formdata = new FormData();
          formdata.append('file', file);
          formdata.append('usage', 'server');

          const { data } = await request.put('/file/upload', formdata, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const fileInfo = data.files[0];
          if (!fileInfo) {
            throw new Error('not get file');
          }

          const url = fileInfo.url;
          setBeidouStarsCards((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], avatar: url };
            return next;
          });
        } else {
          setBeidouStarsCards((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], avatar: '' };
            return next;
          });
        }
      }
    );

  const beidouSavingOrUploading = useMemo(
    () => savingBeidouStars || uploadingBeidouAvatar,
    [savingBeidouStars, uploadingBeidouAvatar]
  );

  if (loading) {
    return <Spin />;
  }

  if (error) {
    console.log('error', error);
    return <div>{String(error)}</div>;
  }

  return (
    <Card>
      <Tabs>
        <Tabs.TabPane key={0} title={t('custom.config.configPanel')}>
          <Form>
            <Form.Item label={t('custom.config.uploadFileLimit')}>
              {config.uploadFileLimit}
            </Form.Item>

            <Form.Item label={t('custom.config.emailVerification')}>
              {config.emailVerification ? <IconCheck /> : <IconClose />}
            </Form.Item>

            <Form.Item label={t('custom.config.allowGuestLogin')}>
              {!config.disableGuestLogin ? <IconCheck /> : <IconClose />}
            </Form.Item>

            <Form.Item label={t('custom.config.allowUserRegister')}>
              {!config.disableUserRegister ? <IconCheck /> : <IconClose />}
            </Form.Item>

            <Form.Item label={t('custom.config.allowCreateGroup')}>
              {!config.disableCreateGroup ? <IconCheck /> : <IconClose />}
            </Form.Item>

            <Form.Item label={t('custom.config.registerOrgCode')}>
              <Input
                value={registerOrgCode}
                onChange={(val) => setRegisterOrgCode(val)}
                onBlur={() => saveRegisterOrgCode()}
                placeholder="0501"
              />
            </Form.Item>

            <Form.Item label={t('custom.config.serverName')}>
              <Input
                value={serverName}
                onChange={(val) => setServerName(val)}
                onBlur={() => saveServerName()}
                placeholder="Tailchat"
              />
            </Form.Item>

            <Form.Item label={t('custom.config.serverEntryImage')}>
              <div>
                {config?.serverEntryImage ? (
                  <div style={{ marginTop: 10 }}>
                    <div>
                      <TailchatImage
                        style={{
                          maxWidth: '100%',
                          maxHeight: 360,
                          overflow: 'hidden',
                          marginBottom: 4,
                        }}
                        src={config?.serverEntryImage}
                      />
                    </div>

                    <Button
                      type="primary"
                      icon={<IconDelete />}
                      onClick={() => handleChangeServerEntryImage(null)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Upload
                    onChange={(_, file) => {
                      handleChangeServerEntryImage(file.originFile);
                    }}
                  />
                )}
              </div>
            </Form.Item>

            <Divider />
            <Typography.Title heading={6}>
              {t('custom.config.beidouStarsTitle')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('custom.config.beidouStarsTip')}
            </Typography.Text>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {beidouStarsCards.map((cardItem, index) => (
                <Card
                  key={cardItem.id || String(index)}
                  title={`${index + 1}. ${cardItem.name || '-'}`}
                >
                  <Form.Item label={t('custom.config.beidouCardAvatar')}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      {cardItem.avatar ? (
                        <>
                          <TailchatImage
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: 999,
                              overflow: 'hidden',
                            }}
                            src={cardItem.avatar}
                          />
                          <Button
                            type="primary"
                            icon={<IconDelete />}
                            disabled={beidouSavingOrUploading}
                            onClick={() => uploadBeidouAvatar({ index, file: null })}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Upload
                          disabled={beidouSavingOrUploading}
                          onChange={(_, file) => {
                            uploadBeidouAvatar({ index, file: file.originFile });
                          }}
                        />
                      )}
                    </div>
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardName')}>
                    <Input
                      value={cardItem.name}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], name: val };
                          return next;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardTitle')}>
                    <Input
                      value={cardItem.title}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], title: val };
                          return next;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardBio')}>
                    <Input.TextArea
                      rows={4}
                      value={cardItem.bio}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], bio: val };
                          return next;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardTags')}>
                    <Input
                      value={(cardItem.tags ?? []).join(',')}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = {
                            ...next[index],
                            tags: String(val)
                              .split(',')
                              .map((t) => t.trim())
                              .filter((t) => t.length > 0),
                          };
                          return next;
                        })
                      }
                      placeholder="tag1,tag2"
                    />
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardVerifiedText')}>
                    <Input
                      value={cardItem.verifiedText || ''}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], verifiedText: val };
                          return next;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item label={t('custom.config.beidouCardFooterLeftText')}>
                    <Input
                      value={cardItem.footerLeftText || ''}
                      onChange={(val) =>
                        setBeidouStarsCards((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], footerLeftText: val };
                          return next;
                        })
                      }
                    />
                  </Form.Item>
                </Card>
              ))}
            </div>

            <Form.Item label={' '}>
              <Button
                type="primary"
                loading={beidouSavingOrUploading}
                onClick={() => saveBeidouStarsCards()}
              >
                {t('custom.config.saveAll')}
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane key={1} title={t('custom.config.announcementPanel')}>
          <Form
            initialValues={
              config['announcement']
                ? {
                    enable: true,
                    text: _get(config, ['announcement', 'text'], ''),
                    link: _get(config, ['announcement', 'link'], ''),
                  }
                : { enable: false, text: '', link: '' }
            }
            onSubmit={handleChangeAnnouncement}
          >
            <Form.Item
              label={t('custom.config.announcementEnable')}
              field="enable"
            >
              <SwitchFormInput />
            </Form.Item>
            <Form.Item label={t('custom.config.announcementText')} field="text">
              <Input maxLength={240} />
            </Form.Item>
            <Form.Item
              label={t('custom.config.announcementLink')}
              field="link"
              tooltip={t('custom.config.announcementLinkTip')}
            >
              <Input placeholder="https://tailchat.msgbyte.com/" />
            </Form.Item>
            <Form.Item label={' '}>
              <Button htmlType="submit">{t('tushan.common.submit')}</Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
});
SystemConfig.displayName = 'SystemConfig';

export const SwitchFormInput: React.FC<{
  value?: boolean;
  onChange?: (val: boolean) => void;
}> = React.memo((props) => {
  return <Switch checked={props.value} onChange={props.onChange} />;
});
SwitchFormInput.displayName = 'SwitchFormInput';
