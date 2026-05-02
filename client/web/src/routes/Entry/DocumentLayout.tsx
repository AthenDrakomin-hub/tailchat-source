import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const DocumentLayout: React.FC<Props> = React.memo((props) => {
  useEffect(() => {
    document.title = `${props.title} - 財訊`;
  }, [props.title]);

  return (
    <div className="w-full text-white">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="財訊" className="max-h-20 max-w-[80%]" />
      </div>

      <div className="text-center mb-6">
        <div className="font-extrabold text-2xl tracking-wide text-white">
          {props.title}
        </div>
        {props.subtitle && (
          <div className="mt-2 text-sm text-[rgba(255,255,255,0.78)]">
            {props.subtitle}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-5 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.24)]">
        {props.children}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-[rgba(255,255,255,0.72)]">
        <Link to="/entry/login" className="underline underline-offset-4">
          返回登錄
        </Link>
        <Link to="/entry/about" className="underline underline-offset-4">
          關於我們
        </Link>
        <Link to="/entry/trust" className="underline underline-offset-4">
          安全與合規
        </Link>
      </div>
    </div>
  );
});
DocumentLayout.displayName = 'DocumentLayout';
