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
    <div className="w-full text-tc-text-primary">
      <div className="mb-6 flex justify-center overflow-hidden">
        <BrandLogo alt="財訊" className="w-32 max-w-full h-auto mobile:w-28" />
      </div>

      <div className="text-center mb-6">
        <div className="font-bold text-2xl tracking-tight text-tc-text-primary">
          {props.title}
        </div>
        {props.subtitle && (
          <div className="mt-2 text-sm text-tc-text-secondary">
            {props.subtitle}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        {props.children}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-tc-text-secondary">
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
