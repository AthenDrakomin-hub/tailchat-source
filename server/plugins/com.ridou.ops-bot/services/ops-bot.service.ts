import { ServiceSchema } from 'moleculer';
import { TcService } from 'tailchat-server-sdk';

class OpsBotService extends TcService {
  private timer: NodeJS.Timeout | null = null;
  private msgIndex = 0;

  get serviceName(): string {
    return 'plugin:com.ridou.ops-bot';
  }

  onInit() {}

  async started(): Promise<void> {
    this.setupTimer();
  }

  async stopped(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private setupTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, 10_000);
  }

  private async tick() {
    const enabled = await this.broker.call('config.get', { key: 'ops.bot.enabled' });
    if (enabled !== true) return;

    const intervalSecRaw = await this.broker.call('config.get', {
      key: 'ops.bot.intervalSec',
    });
    const intervalSec =
      typeof intervalSecRaw === 'number' && intervalSecRaw >= 5 ? intervalSecRaw : 30;

    const lastAtRaw = await this.broker.call('config.get', { key: 'ops.bot.lastAt' });
    const lastAt = typeof lastAtRaw === 'number' ? lastAtRaw : 0;
    if (Date.now() - lastAt < intervalSec * 1000) return;

    const userId = await this.broker.call('config.get', { key: 'ops.bot.userId' });
    const groupId = await this.broker.call('config.get', { key: 'ops.bot.groupId' });
    const panelId = await this.broker.call('config.get', { key: 'ops.bot.panelId' });
    const messages = await this.broker.call('config.get', { key: 'ops.bot.messages' });

    if (typeof userId !== 'string' || !userId) return;
    if (typeof groupId !== 'string' || !groupId) return;
    if (typeof panelId !== 'string' || !panelId) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    const content = String(messages[this.msgIndex % messages.length] ?? '').trim();
    if (!content) return;

    const converseId = `${groupId}|${panelId}`;
    await this.broker.call(
      'chat.message.sendMessage',
      {
        converseId,
        groupId,
        content,
      },
      { meta: { userId } }
    );

    this.msgIndex = (this.msgIndex + 1) % messages.length;
    await this.broker.call('config.set', { key: 'ops.bot.lastAt', value: Date.now() });
  }
}

export default OpsBotService as unknown as ServiceSchema;
