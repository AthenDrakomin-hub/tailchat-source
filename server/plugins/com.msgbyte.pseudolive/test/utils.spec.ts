import { parseObjectNameFromFileUrl } from '../utils/parseObjectNameFromFileUrl';

describe('parseObjectNameFromFileUrl', () => {
  test('parses object name from /static url', () => {
    expect(
      parseObjectNameFromFileUrl('http://localhost:11000/static/a/b/c.mp4')
    ).toBe('a/b/c.mp4');
  });

  test('returns null for non-static url', () => {
    expect(parseObjectNameFromFileUrl('http://localhost:11000/xxx.mp4')).toBe(
      null
    );
  });
});

