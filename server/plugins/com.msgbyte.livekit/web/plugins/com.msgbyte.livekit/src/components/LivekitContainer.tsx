import styled from 'styled-components';
import '@livekit/components-styles';

export const LivekitContainer = styled.div.attrs({
  'data-lk-theme': 'default',
})`
  height: 100%;
  background:
    radial-gradient(circle at top, rgba(34, 197, 94, 0.14), transparent 32%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);

  .lk-message-body {
    user-select: text;
  }
`;
