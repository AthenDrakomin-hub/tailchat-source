export function buildConversePreview(input: {
  hasMessage?: boolean;
  content?: string;
  hasRecall?: boolean;
  roleLabel?: string | null;
  senderName?: string;
  isMultiMember?: boolean;
}) {
  if (input.hasMessage === false) {
    return input.roleLabel ? `[${input.roleLabel}]` : '暂无消息';
  }

  const text =
    (typeof input.content === 'string' ? input.content.trim() : '') ||
    (input.hasRecall ? '撤回了一条消息' : '') ||
    '新消息';

  const compactText = text.replace(/\s+/g, ' ').slice(0, 30);
  const withRoleLabel = input.roleLabel
    ? `[${input.roleLabel}] ${compactText}`
    : compactText;

  if (input.isMultiMember && input.senderName) {
    return `${input.senderName}：${withRoleLabel}`;
  }

  return withRoleLabel;
}
