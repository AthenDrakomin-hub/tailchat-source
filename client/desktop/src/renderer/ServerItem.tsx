import React from 'react';
import './ServerItem.css';

export const ServerItem: React.FC<
  React.PropsWithChildren<{
    icon: string;
    version?: string;
    url?: string;
    badge?: string;
    subtitle?: string;
    onClick: () => void;
  }>
> = React.memo((props) => {
  return (
    <div className="server-item" onClick={props.onClick}>
      {props.badge && <div className="server-item__badge">{props.badge}</div>}
      <div>
        <img width="60px" height="60px" alt="icon" src={props.icon} />
      </div>
      <div className="server-item__name">{props.children}</div>
      {props.subtitle && <div className="server-item__subtitle">{props.subtitle}</div>}
      {props.url && <div className="server-item__url">{props.url}</div>}
      <div className="server-item__version">
        <small title={props.version}>{props.version}</small>
      </div>
    </div>
  );
});
ServerItem.displayName = 'ServerItem';
