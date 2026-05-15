import React from 'react';
import { Link } from 'react-router-dom';

const linkClassName =
  'transition-colors hover:text-tc-primary text-tc-text-tertiary underline underline-offset-4';

export const TrustLinks: React.FC = React.memo(() => {
  return (
    <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-6">
      <Link className={linkClassName} to="/entry/about">
        關於我們
      </Link>
      <Link className={linkClassName} to="/entry/terms">
        用戶協議
      </Link>
      <Link className={linkClassName} to="/entry/privacy">
        隱私政策
      </Link>
      <Link className={linkClassName} to="/entry/community">
        社區公約
      </Link>
      <Link className={linkClassName} to="/entry/trust">
        安全與合規
      </Link>
    </div>
  );
});
TrustLinks.displayName = 'TrustLinks';
