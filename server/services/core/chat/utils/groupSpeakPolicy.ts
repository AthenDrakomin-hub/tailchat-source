import type {
  GroupPanelReadabilityRule,
  GroupPanelRoleStyle,
  GroupPanelSpeakRule,
} from '../../../../../packages/types/src/model/group';

export function getMostStrictSpeakRule(
  matchedRules: GroupPanelSpeakRule[],
  defaultRule?: GroupPanelSpeakRule
): GroupPanelSpeakRule {
  const rules = [...matchedRules];
  if (defaultRule) {
    rules.push(defaultRule);
  }

  if (rules.length === 0) {
    return {};
  }

  return rules.reduce<GroupPanelSpeakRule>(
    (acc, rule) => ({
      allowText: acc.allowText === false || rule.allowText === false ? false : true,
      allowRichContent:
        acc.allowRichContent === false || rule.allowRichContent === false
          ? false
          : true,
      rateLimitWindowSec: Math.max(
        acc.rateLimitWindowSec ?? 0,
        rule.rateLimitWindowSec ?? 0
      ),
      rateLimitCount:
        acc.rateLimitCount == null
          ? rule.rateLimitCount
          : rule.rateLimitCount == null
            ? acc.rateLimitCount
            : Math.min(acc.rateLimitCount, rule.rateLimitCount),
    }),
    { allowText: true, allowRichContent: true }
  );
}

export function isRichMessagePayload(content: string, meta?: Record<string, any>) {
  return Boolean(
    /\!\[.*\]\(.*\)/.test(content) ||
      (Array.isArray(meta?.decorators) && meta.decorators.length > 0) ||
      meta?.card ||
      meta?.file
  );
}

export function assertSpeakRuleAllowed(
  rule: GroupPanelSpeakRule | undefined,
  content: string,
  meta: Record<string, any> | undefined,
  messages: {
    noText: string;
    noRich: string;
  }
) {
  if (!rule) {
    return;
  }

  const isRich = isRichMessagePayload(content, meta);
  const hasText = content.trim().length > 0;
  if (rule.allowText === false && hasText && !isRich) {
    throw new Error(messages.noText);
  }

  if (rule.allowRichContent === false && isRich) {
    throw new Error(messages.noRich);
  }
}

export function getRoleStyleForRoleIds(
  roleIds: string[],
  readability: GroupPanelReadabilityRule | undefined
): GroupPanelRoleStyle | undefined {
  if (!readability?.roleStyleMap) {
    return undefined;
  }

  for (const roleId of roleIds) {
    const style = readability.roleStyleMap[roleId];
    if (style) {
      return style;
    }
  }

  return undefined;
}
