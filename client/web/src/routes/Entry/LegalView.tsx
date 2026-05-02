import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DocumentLayout } from './DocumentLayout';
import { legalContent } from './content/legal';

export const LegalView: React.FC = React.memo(() => {
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'community' }>();

  if (!type || !(type in legalContent)) {
    return <Navigate to="/entry/about" replace={true} />;
  }

  const content = legalContent[type];

  return (
    <DocumentLayout title={content.title} subtitle={content.description}>
      <div className="space-y-5">
        {content.sections.map((section) => (
          <section key={section.title}>
            <div className="text-base font-semibold text-white mb-2">
              {section.title}
            </div>
            <div className="space-y-2 text-sm leading-7 text-[rgba(255,255,255,0.82)]">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DocumentLayout>
  );
});
LegalView.displayName = 'LegalView';
