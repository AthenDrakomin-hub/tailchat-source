import React from 'react';
import {
  DefaultFullModalInputEditorRender,
  FullModalField,
  Select,
  Switch,
} from '@capital/component';
import { useOpenAppInfo } from '../context';
import { Translate } from '../../translate';
import { useOpenAppAction } from './useOpenAppAction';

const Bot: React.FC = React.memo(() => {
  const { capability, bot } = useOpenAppInfo();
  const { loading, handleChangeAppCapability, handleUpdateBotInfo } =
    useOpenAppAction();

  return (
    <div className="plugin-openapi-app-info_bot">
      <FullModalField
        title={Translate.enableBotCapability}
        content={
          <Switch
            disabled={loading}
            checked={capability.includes('bot')}
            onChange={(checked) => handleChangeAppCapability('bot', checked)}
          />
        }
      />

      {capability.includes('bot') && (
        <>
          <FullModalField
            title={Translate.bot.runtimeMode}
            tip={Translate.bot.runtimeModeTip}
            content={
              <Select
                style={{ minWidth: 220 }}
                value={bot?.runtimeMode ?? 'openapi-http'}
                options={[
                  { label: 'OpenAPI HTTP', value: 'openapi-http' },
                  { label: 'OpenAPI WS', value: 'openapi-ws' },
                  { label: 'OpenClaw Bridge', value: 'openclaw-bridge' },
                ]}
                onChange={(val) => handleUpdateBotInfo('runtimeMode', val)}
              />
            }
          />

          <FullModalField
            title={Translate.bot.callback}
            tip={Translate.bot.callbackTip}
            value={bot?.callbackUrl}
            editable={true}
            renderEditor={DefaultFullModalInputEditorRender}
            onSave={(str: string) =>
              handleUpdateBotInfo('callbackUrl', String(str))
            }
          />

          {(bot?.runtimeMode ?? 'openapi-http') === 'openclaw-bridge' && (
            <>
              <FullModalField
                title={Translate.bot.bridgeEndpoint}
                value={bot?.bridgeEndpoint}
                editable={true}
                renderEditor={DefaultFullModalInputEditorRender}
                onSave={(str: string) =>
                  handleUpdateBotInfo('bridgeEndpoint', String(str))
                }
              />

              <FullModalField
                title={Translate.bot.bridgeToken}
                value={bot?.bridgeToken}
                editable={true}
                renderEditor={DefaultFullModalInputEditorRender}
                onSave={(str: string) =>
                  handleUpdateBotInfo('bridgeToken', String(str))
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
});
Bot.displayName = 'Bot';

export default Bot;
