import React from 'react';

interface LuxuryFinancePanelProps {
  children?: React.ReactNode;
}

/**
 * 奢华金融风格右侧面板组件
 */
export const LuxuryFinancePanel: React.FC<LuxuryFinancePanelProps> = React.memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* 深色渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#080b12]" />
      
      {/* 顶部金色光晕 */}
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[rgba(212,175,55,0.12)] via-[rgba(184,148,46,0.06)] to-transparent blur-[100px]" />
      
      {/* 底部深色光晕 */}
      <div className="absolute -bottom-[300px] -left-[200px] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[rgba(11,25,44,0.8)] via-[rgba(10,15,26,0.4)] to-transparent blur-[120px]" />
      
      {/* 中央微妙金色光点 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[rgba(212,175,55,0.03)] to-transparent blur-[80px]" />
      
      {/* 装饰性横线 */}
      <div className="absolute top-[15%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent" />
      <div className="absolute top-[85%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.1)] to-transparent" />
      
      {/* 左侧装饰竖线 */}
      <div className="absolute top-[20%] bottom-[20%] left-[8%] w-px bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.08)] to-transparent" />
      
      {/* 品牌标识区域 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        {/* 主标题 */}
        <div className="text-6xl font-bold tracking-[0.3em] mb-4" style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #f5e6a3 25%, #d4af37 50%, #b8942e 75%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 40px rgba(212,175,55,0.3)',
        }}>
          財訊
        </div>
        
        {/* 副标题 */}
        <div className="text-sm tracking-[0.5em] text-[rgba(212,175,55,0.6)] uppercase">
          Financial Intelligence
        </div>
        
        {/* 装饰线 */}
        <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.4)] to-transparent" />
        
        {/* 底部标语 */}
        <div className="mt-8 text-xs tracking-widest text-[rgba(255,255,255,0.25)]">
          即时沟通 · 价值投资 · 长期主义
        </div>
      </div>
      
      {/* 左下角装饰 */}
      <div className="absolute bottom-[10%] left-[10%]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-gradient-to-r from-[rgba(212,175,55,0.3)] to-transparent" />
          <span className="text-[10px] tracking-widest text-[rgba(212,175,55,0.4)]">EST. 2020</span>
        </div>
      </div>
      
      {/* 右下角装饰 */}
      <div className="absolute bottom-[10%] right-[10%]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-widest text-[rgba(212,175,55,0.4)]">TOKYO NODE</span>
          <div className="w-8 h-px bg-gradient-to-l from-[rgba(212,175,55,0.3)] to-transparent" />
        </div>
      </div>
      
      {/* 右上角装饰点 */}
      <div className="absolute top-[8%] right-[12%]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.5)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.3)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.15)]" />
        </div>
      </div>
      
      {/* 左上角装饰 */}
      <div className="absolute top-[8%] left-[12%]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20">
          <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" fill="rgba(212,175,55,0.6)" />
        </svg>
      </div>
      
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
});

LuxuryFinancePanel.displayName = 'LuxuryFinancePanel';
