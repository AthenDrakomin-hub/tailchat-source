import React from 'react';
import { Link } from 'react-router-dom';

const linkClassName =
  'transition-colors hover:text-tc-primary text-tc-text-tertiary no-underline';

export const TrustLinks: React.FC = React.memo(() => {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs leading-6">
      <Link className={linkClassName} to="/entry/about">
        关于我们
      </Link>
      <span className="text-tc-text-tertiary">|</span>
      <Link className={linkClassName} to="/entry/terms">
        用户协议
      </Link>
      <span className="text-tc-text-tertiary">|</span>
      <Link className={linkClassName} to="/entry/privacy">
        隐私政策
      </Link>
      <span className="text-tc-text-tertiary">|</span>
      <Link className={linkClassName} to="/entry/community">
        社区公约
      </Link>
      <span className="text-tc-text-tertiary">|</span>
      <Link className={linkClassName} to="/entry/trust">
        安全与合规
      </Link>
    </div>
  );
});
TrustLinks.displayName = 'TrustLinks';
