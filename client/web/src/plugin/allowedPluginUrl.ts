export function isAllowedPluginUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  if (url.startsWith('/plugins/')) {
    return true;
  }

  if (url.startsWith('{BACKEND}/plugins/')) {
    return true;
  }

  return false;
}

