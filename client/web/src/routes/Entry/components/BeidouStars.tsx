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
        id: 'tian-shu',
        name: '天枢',
        title: '首席策略 · 宏观框架',
        bio: '以宏观周期为锚，建立“风险预算—仓位—回撤”三段式策略，把不确定性压进可控区间。',
        tags: ['宏观', '风控', '周期'],
        pos: { left: '62%', top: '22%' },
        twinkle: { duration: '3.8s', delay: '0.2s' },
      },
      {
        id: 'tian-xuan',
        name: '天璇',
        title: '价值研判 · 护城河',
        bio: '在商业模式与现金流之间找确定性，用“护城河强度×估值安全边际”筛掉噪声。',
        tags: ['价值', '现金流', '护城河'],
        pos: { left: '70%', top: '26%' },
        twinkle: { duration: '4.6s', delay: '1.1s' },
      },
      {
        id: 'tian-ji',
        name: '天玑',
        title: '资产配置 · 组合结构',
        bio: '把单点判断拆成组合结构：相关性、波动率与再平衡纪律，决定长期曲线的质感。',
        tags: ['配置', '相关性', '纪律'],
        pos: { left: '78%', top: '33%' },
        twinkle: { duration: '3.2s', delay: '0.7s' },
      },
      {
        id: 'tian-quan',
        name: '天权',
        title: '交易执行 · 体系化',
        bio: '交易不是预测，是执行。用标准化入场、止损、减仓节奏，把情绪从系统里剔除。',
        tags: ['执行', '止损', '节奏'],
        pos: { left: '82%', top: '44%' },
        twinkle: { duration: '4.1s', delay: '1.8s' },
      },
      {
        id: 'yu-heng',
        name: '玉衡',
        title: '研究深潜 · 公司画像',
        bio: '从财报到业务链路，构建可复用的公司画像模板，关注长期确定性而非短期叙事。',
        tags: ['基本面', '财报', '复用'],
        pos: { left: '76%', top: '56%' },
        twinkle: { duration: '3.6s', delay: '0.9s' },
      },
      {
        id: 'kai-yang',
        name: '开阳',
        title: '风险事件 · 哨兵',
        bio: '用可观测指标盯住风险事件：异常波动、流动性收紧、消息面冲击，先保命再求胜。',
        tags: ['风险事件', '流动性', '监控'],
        pos: { left: '68%', top: '64%' },
        twinkle: { duration: '4.9s', delay: '0.4s' },
      },
      {
        id: 'yao-guang',
        name: '摇光',
        title: '运营与合规 · 透明化',
        bio: '把规则写在显眼的地方：风险提示、权限隔离、审计记录，长期主义的底座是透明。',
        tags: ['合规', '审计', '权限'],
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

