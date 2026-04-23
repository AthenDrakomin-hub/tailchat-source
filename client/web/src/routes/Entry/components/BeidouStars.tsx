import React, { useMemo } from 'react';
import { Icon } from 'tailchat-design';
import { closeModal, ModalWrapper, openModal } from '@/components/Modal';

type StarProfile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  pos: { left: string; top: string };
  twinkle: { duration: string; delay: string };
};

const ProfileCard: React.FC<{ profile: StarProfile; modalKey: number }> =
  React.memo(({ profile, modalKey }) => {
    const initials = profile.name
      .split('')
      .filter((s) => s.trim().length > 0)
      .slice(0, 2)
      .join('');

    return (
      <ModalWrapper
        className="p-0 overflow-hidden"
        style={{ minWidth: 360, maxWidth: 460 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b192c] via-[#0a1020] to-[#06080f]" />
          <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-[rgba(212,175,55,0.18)] blur-3xl" />
          <div className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-[rgba(255,255,255,0.10)] blur-3xl" />

          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.16)] flex items-center justify-center text-white font-semibold tracking-wide">
                  {initials}
                </div>
                <div>
                  <div className="text-white text-lg font-semibold leading-tight">
                    {profile.name}
                  </div>
                  <div className="text-[rgba(255,255,255,0.72)] text-sm mt-0.5">
                    {profile.title}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
                onClick={() => closeModal(modalKey)}
                aria-label="Close"
              >
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>

            <div className="mt-4 text-[rgba(255,255,255,0.82)] text-sm leading-relaxed">
              {profile.bio}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-[rgba(212,175,55,0.14)] border border-[rgba(212,175,55,0.20)] text-[#f3e5ab]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-[rgba(255,255,255,0.55)]">
                日斗投资 · 北斗七星档案
              </div>
              <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.70)]">
                <Icon icon="mdi:shield-lock-outline" />
                <span>私密资料卡</span>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  });
ProfileCard.displayName = 'ProfileCard';

export const BeidouStars: React.FC = React.memo(() => {
  const profiles = useMemo<StarProfile[]>(
    () => [
      {
        id: 'wang-wen',
        name: '王文',
        title: '创始人 · 董事长',
        bio: '从国家部委到百亿私募掌门人，知名财经大V“股道热肠也”，被投资者誉为“万倍叔”。坚信“便宜是硬道理，成长是真功夫”。',
        tags: ['深度价值', '万倍叔', '创始人'],
        pos: { left: '62%', top: '22%' },
        twinkle: { duration: '3.8s', delay: '0.2s' },
      },
      {
        id: 'zou-wen',
        name: '邹文',
        title: '投资总监',
        bio: '日斗投资核心基金经理，秉承“稳健进取，价值取胜”理念，深研高现金流与高分红标的，为组合构建坚实的安全边际。',
        tags: ['稳健进取', '高分红', '投资总监'],
        pos: { left: '70%', top: '26%' },
        twinkle: { duration: '4.6s', delay: '1.1s' },
      },
      {
        id: 'zhang-wenyong',
        name: '张文勇',
        title: '基金经理',
        bio: '日斗投资核心基金经理，共同践行“低估值、高现金流、高分红、业务长期可持续、有梦想”的五大选股标准。',
        tags: ['低估值', '五大标准', '基金经理'],
        pos: { left: '78%', top: '33%' },
        twinkle: { duration: '3.2s', delay: '0.7s' },
      },
      {
        id: 'rule-xuangu',
        name: '选股法则',
        title: '去人少的地方',
        bio: '强调“非经调研不买入”，不买长期繁荣的行业和公司。只有实地调研眼见为实，才能避开估值泡沫。',
        tags: ['逆向投资', '实地调研', '避开泡沫'],
        pos: { left: '82%', top: '44%' },
        twinkle: { duration: '4.1s', delay: '1.8s' },
      },
      {
        id: 'rule-cangwei',
        name: '仓位法则',
        title: '集中持股',
        bio: '赚大钱要靠一只股票赚很多倍，而不是频繁操作多个股票。“看见了，才能重仓”，拒绝平庸的投资机会。',
        tags: ['集中持股', '重仓出击', '拒绝平庸'],
        pos: { left: '76%', top: '56%' },
        twinkle: { duration: '3.6s', delay: '0.9s' },
      },
      {
        id: 'rule-zuhe',
        name: '组合法则',
        title: '行业配置',
        bio: '为了应对市场的波动，做组合投资，配置几个行业。用多行业的配置来平滑单一行业的巨大波动，实现均衡增长。',
        tags: ['组合投资', '平滑波动', '均衡增长'],
        pos: { left: '68%', top: '64%' },
        twinkle: { duration: '4.9s', delay: '0.4s' },
      },
      {
        id: 'rule-shiji',
        name: '时机法则',
        title: '逃顶如风',
        bio: '在全盛时果断退出。分清风险和波动，避免过度借贷和炒作。投资就像修行，要有耐心等待价值的实现。',
        tags: ['逃顶', '风险控制', '长期主义'],
        pos: { left: '60%', top: '70%' },
        twinkle: { duration: '3.4s', delay: '1.4s' },
      },
    ],
    []
  );

  const openProfile = (profile: StarProfile) => {
    let key = -1;
    key = openModal(<ProfileCard profile={profile} modalKey={key} />, {
      closable: false,
      maskClosable: true,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,11,20,0.15)] via-transparent to-[rgba(7,11,20,0.55)]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: 0.35 }}
      >
        <polyline
          points="62,22 70,26 78,33 82,44 76,56 68,64 60,70"
          fill="none"
          stroke="rgba(212,175,55,0.28)"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1.5 2.5"
        />
      </svg>

      {profiles.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={`Open profile ${p.name}`}
          className="absolute pointer-events-auto"
          style={{ left: p.pos.left, top: p.pos.top, transform: 'translate(-50%, -50%)' }}
          onClick={() => openProfile(p)}
        >
          <span
            className="block"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(212,175,55,0.95) 38%, rgba(212,175,55,0.20) 70%, rgba(212,175,55,0) 78%)',
              boxShadow:
                '0 0 14px rgba(212,175,55,0.40), 0 0 40px rgba(212,175,55,0.18)',
              animationName: 'ridouTwinkle',
              animationDuration: p.twinkle.duration,
              animationDelay: p.twinkle.delay,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />
        </button>
      ))}

      <style>
        {`
          @keyframes ridouTwinkle {
            0% { opacity: 0.55; transform: scale(0.90); filter: blur(0px); }
            45% { opacity: 1; transform: scale(1.25); filter: blur(0.15px); }
            100% { opacity: 0.55; transform: scale(0.90); filter: blur(0px); }
          }
        `}
      </style>
    </div>
  );
});
BeidouStars.displayName = 'BeidouStars';

