import React, { useMemo, useState } from 'react';
import {
  createPluginRequest,
  showToasts,
  uploadFile,
  useAsyncRequest,
} from '@capital/common';
import { Button, Input, ModalWrapper } from '@capital/component';

const request = createPluginRequest('com.msgbyte.pseudolive');

export const UploadAndStartModal: React.FC<{
  groupId: string;
  panelId: string;
  onSuccess?: () => void;
}> = React.memo((props) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [{ loading }, handleStart] = useAsyncRequest(async () => {
    if (!file) {
      throw new Error('请选择视频文件');
    }

    const { url } = await uploadFile(file, { usage: 'unknown' });
    await request.post('start', {
      groupId: props.groupId,
      panelId: props.panelId,
      title: title.trim(),
      fileUrl: url,
    });

    showToasts('已发起直播', 'success');
    props.onSuccess?.();
  }, [file, props.groupId, props.panelId, props.onSuccess, title]);

  const accept = useMemo(() => 'video/mp4', []);

  return (
    <ModalWrapper title="发起直播">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          placeholder="标题(可选)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <input
          type="file"
          accept={accept}
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFile(f ?? null);
          }}
        />

        <Button type="primary" loading={loading} onClick={handleStart}>
          开始
        </Button>
      </div>
    </ModalWrapper>
  );
});
UploadAndStartModal.displayName = 'UploadAndStartModal';

