import React, { useMemo } from 'react';
import { Icon } from 'tailchat-design';
import { openModal } from '@/components/Modal';
import { useGlobalConfigStore } from 'tailchat-shared';

type StarProfile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  pos: { left: string; top: string };
  twinkle: { duration: string; delay: string };
  avatar?: string;
  verifiedText?: string;
  footerLeftText?: string;
};

type BeidouStarCardConfig = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  avatar?: string;
  verifiedText?: string;
  footerLeftText?: string;
};

const DEFAULT_LAYOUT: Array<Pick<StarProfile, 'pos' | 'twinkle'>> = [
  { pos: { left: '55%', top: '25%' }, twinkle: { duration: '2.5s', delay: '0.1s' } },
  { pos: { left: '68%', top: '30%' }, twinkle: { duration: '3.0s', delay: '0.8s' } },
  { pos: { left: '78%', top: '42%' }, twinkle: { duration: '2.8s', delay: '0.4s' } },
  { pos: { left: '85%', top: '55%' }, twinkle: { duration: '3.2s', delay: '1.2s' } },
  { pos: { left: '75%', top: '68%' }, twinkle: { duration: '2.7s', delay: '0.6s' } },
  { pos: { left: '62%', top: '75%' }, twinkle: { duration: '3.5s', delay: '0.3s' } },
  { pos: { left: '48%', top: '80%' }, twinkle: { duration: '2.9s', delay: '1.5s' } },
];

const DEFAULT_CARDS: BeidouStarCardConfig[] = [
  {
    id: 'wang-wen',
    name: '王文',
    title: '创始人 · 董事长',
    bio: '从国家部委到百亿私募掌门人，知名财经大V“股道热肠也”，被投资者誉为“万倍叔”。坚信“便宜是硬道理，成长是真功夫”。',
    tags: ['深度价值', '万倍叔', '创始人'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'zou-wen',
    name: '邹文',
    title: '投资总监',
    bio: '日斗投资核心基金经理，秉承“稳健进取，价值取胜”理念，深研高现金流与高分红标的，为组合构建坚实的安全边际。',
    tags: ['稳健进取', '高分红', '投资总监'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'zhang-wenyong',
    name: '张文勇',
    title: '基金经理',
    bio: '日斗投资核心基金经理，共同践行“低估值、高现金流、高分红、业务长期可持续、有梦想”的五大选股标准。',
    tags: ['低估值', '五大标准', '基金经理'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'class-9',
    name: '李班长',
    title: '第九届财富交流学习班长',
    bio: '带领第九届学员深入探讨逆向投资策略，组织实地调研，用脚底板丈量企业护城河。',
    tags: ['第九届', '实地调研', '学习标兵'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'class-8',
    name: '赵班长',
    title: '第八届财富交流学习班长',
    bio: '第八届学习会核心组织者，专注“高分红与现金流”课题，协助成员建立稳健的组合结构。',
    tags: ['第八届', '课题研讨', '现金流'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'class-5',
    name: '陈班长',
    title: '第五届财富交流学习班长',
    bio: '第五届老学员领袖，常年组织内部读书会，深谙“去人少的地方”这一核心投资哲学。',
    tags: ['第五届', '读书会', '逆向思维'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
  {
    id: 'class-3',
    name: '林班长',
    title: '第三届财富交流学习班长',
    bio: '日斗投资早期追随者与第三届班长，见证了长期主义的力量，擅长分享周期穿越经验。',
    tags: ['第三届', '早期成员', '穿越周期'],
    verifiedText: '认证档案',
    footerLeftText: 'RIDOU INVESTMENT',
  },
];

function normalizeBeidouStarsCards(cards: unknown): BeidouStarCardConfig[] {
  const list: any[] = Array.isArray(cards) ? cards : [];
  return DEFAULT_CARDS.map((fallback, i) => {
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

const ProfileCard: React.FC<{ profile: StarProfile }> = React.memo(
  ({ profile }) => {
    const initials = profile.name
      .split('')
      .filter((s) => s.trim().length > 0)
      .slice(0, 2)
      .join('');

    return (
      <div
        className="p-0 overflow-hidden rounded-xl"
        style={{ minWidth: 360, maxWidth: 460 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b192c] via-[#0a1020] to-[#06080f]" />
          <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-[rgba(212,175,55,0.18)] blur-3xl" />
          <div className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-[rgba(255,255,255,0.10)] blur-3xl" />

          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-14 h-14 rounded-full object-cover shadow-[0_0_15px_rgba(212,175,55,0.25)] border border-[rgba(212,175,55,0.35)]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a7220] flex items-center justify-center text-white font-bold tracking-wide text-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="text-white text-lg font-bold leading-tight tracking-wide">
                    {profile.name}
                  </div>
                  <div className="text-[rgba(212,175,55,0.9)] text-sm mt-0.5 font-medium">
                    {profile.title}
                  </div>
                </div>
              </div>
              <div />
            </div>

            <div className="mt-5 text-[rgba(255,255,255,0.85)] text-sm leading-relaxed tracking-wide">
              {profile.bio}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] text-[#f3e5ab] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.1)]">
              <div className="text-xs text-[rgba(255,255,255,0.5)] tracking-wider">
                {profile.footerLeftText || 'RIDOU INVESTMENT'}
              </div>
              {profile.verifiedText ? (
                <div className="flex items-center gap-2 text-xs text-[rgba(212,175,55,0.8)] font-medium">
                  <Icon icon="mdi:shield-check" className="text-sm" />
                  <span>{profile.verifiedText}</span>
                </div>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ProfileCard.displayName = 'ProfileCard';

export const BeidouStars: React.FC = React.memo(() => {
  const configuredCards = useGlobalConfigStore((state) => state.beidouStarsCards);
  const profiles = useMemo<StarProfile[]>(() => {
    const cards = normalizeBeidouStarsCards(configuredCards);
    return cards.map((card, i) => ({
      ...card,
      ...DEFAULT_LAYOUT[i],
    }));
  }, [configuredCards]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      {/* 极光背景装饰 */}
      <div className="absolute top-[20%] left-[40%] w-[800px] h-[800px] bg-[rgba(212,175,55,0.03)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-[rgba(11,25,44,0.5)] rounded-full blur-[100px] pointer-events-none" />

      <style>{`
        @keyframes starPulse {
          0% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 5px rgba(212,175,55,0.4); }
          50% { transform: scale(1.8); opacity: 1; box-shadow: 0 0 20px rgba(212,175,55,0.9), 0 0 40px rgba(212,175,55,0.4); }
          100% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 5px rgba(212,175,55,0.4); }
        }
        .star-node {
          animation: starPulse var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }
      `}</style>

      {/* 星星节点 */}
      {profiles.map((profile, i) => (
        <div
          key={profile.id}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: profile.pos.left, top: profile.pos.top }}
          onClick={() => {
            openModal(<ProfileCard profile={profile} />, {
              closable: true,
              maskClosable: true,
            });
          }}
        >
          {/* 发光核心 */}
          <div
            className="star-node w-3 h-3 bg-[#f3e5ab] rounded-full relative"
            style={
              {
                '--duration': profile.twinkle.duration,
                '--delay': profile.twinkle.delay,
              } as React.CSSProperties
            }
          >
            {/* 扩大点击热区 */}
            <div className="absolute inset-[-20px] rounded-full" />
          </div>

          {/* 悬浮时显示的名字标签 */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[rgba(11,25,44,0.85)] border border-[rgba(212,175,55,0.3)] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap backdrop-blur-sm">
            <div className="text-[#f3e5ab] font-bold text-sm tracking-widest">{profile.name}</div>
            <div className="text-[rgba(255,255,255,0.6)] text-[10px] mt-0.5">{profile.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
});
BeidouStars.displayName = 'BeidouStars';
