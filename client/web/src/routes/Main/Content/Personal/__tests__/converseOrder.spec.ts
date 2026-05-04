import { sortPersonalSidebarConverses } from '../converseOrder';

describe('sortPersonalSidebarConverses', () => {
  test('keeps conversation with newer local message on top when remote order is stale', () => {
    const list = sortPersonalSidebarConverses([
      {
        _id: 'a',
        messages: [{ _id: '003' }],
      },
      {
        _id: 'b',
        messages: [{ _id: '002' }],
      },
    ] as any);

    expect(list.map((item: any) => item._id)).toEqual(['a', 'b']);
  });

  test('keeps empty conversation at bottom', () => {
    const list = sortPersonalSidebarConverses([
      {
        _id: 'a',
        messages: [],
      },
      {
        _id: 'b',
        messages: [{ _id: '001' }],
      },
    ] as any);

    expect(list.map((item: any) => item._id)).toEqual(['b', 'a']);
  });
});
