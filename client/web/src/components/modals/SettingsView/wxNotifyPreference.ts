export interface WxNotifyPreference {
  mention: boolean;
  directMessage: boolean;
}

export function normalizeWxNotifyPreference(
  preference?: Partial<WxNotifyPreference>
): WxNotifyPreference {
  return {
    mention: preference?.mention !== false,
    directMessage: preference?.directMessage === true,
  };
}
