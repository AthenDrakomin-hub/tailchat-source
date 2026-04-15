export function parseObjectNameFromFileUrl(fileUrl: string): string | null {
  if (typeof fileUrl !== 'string' || fileUrl.trim() === '') {
    return null;
  }

  const marker = '/static/';
  const idx = fileUrl.indexOf(marker);
  if (idx < 0) {
    return null;
  }

  const objectName = fileUrl.slice(idx + marker.length);
  if (objectName === '') {
    return null;
  }

  return objectName;
}

