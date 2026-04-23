import { db } from 'tailchat-server-sdk';
const { getModelForClass, prop, modelOptions, TimeStamps } = db;

export class CloudflareConfig {
  @prop()
  apiKey?: string;

  @prop()
  email?: string;

  @prop()
  zoneId?: string;
}

export class RateLimitConfig {
  @prop({ default: false })
  enable: boolean;

  @prop({ default: 100 })
  requestsPerMinute: number;
}

export class SelfEdgeConfig {
  @prop()
  ip: string;

  @prop()
  name?: string;

  @prop()
  mtlsCert?: string;

  @prop()
  mtlsKey?: string;
}

@modelOptions({
  options: {
    customName: 'p_defense_config',
  },
})
export class DefenseConfig extends TimeStamps implements db.Base {
  _id: db.Types.ObjectId;
  id: string;

  @prop({ default: 'L0' })
  mode: string;

  @prop({ type: () => CloudflareConfig, default: {} })
  cloudflare?: CloudflareConfig;

  @prop({ type: () => RateLimitConfig, default: {} })
  rateLimit?: RateLimitConfig;

  @prop({ type: () => [SelfEdgeConfig], default: [] })
  selfEdges?: SelfEdgeConfig[];

  @prop({ default: false })
  disableRegister: boolean;

  @prop({ default: false })
  disableUpload: boolean;
}

export type DefenseConfigDocument = db.DocumentType<DefenseConfig>;

const model = getModelForClass(DefenseConfig);

export type DefenseConfigModel = typeof model;

@modelOptions({
  options: {
    customName: 'p_defense_audit_log',
  },
})
export class DefenseAuditLog extends TimeStamps implements db.Base {
  _id: db.Types.ObjectId;
  id: string;

  @prop({ required: true })
  action: string; // e.g. 'PRECHECK', 'DRYRUN', 'COMMIT', 'ROLLBACK'

  @prop({ required: true })
  status: string; // e.g. 'SUCCESS', 'FAILED'

  @prop()
  message?: string;

  @prop()
  mode?: string;
}

export type DefenseAuditLogDocument = db.DocumentType<DefenseAuditLog>;
export const DefenseAuditLogModel = getModelForClass(DefenseAuditLog);

export default model;
