import arrayMove from 'array-move';
import { useMemo } from 'react';
import { useAppSelector, useEvent, useSingleUserSetting } from 'tailchat-shared';

export function useGroupList() {
  const groups = useAppSelector((state) => state.group.groups);
  const { value: groupOrderList = [], setValue: setGroupOrderList } =
    useSingleUserSetting('groupOrderList', []);

  const groupList = useMemo(
    () =>
      Object.values(groups).sort((a, b) => {
        const aIndex = groupOrderList.findIndex((item) => item === a._id);
        const bIndex = groupOrderList.findIndex((item) => item === b._id);

        return aIndex - bIndex;
      }),
    [groups, groupOrderList]
  );

  const handleSortEnd = useEvent((oldIndex: number, newIndex: number) => {
    setGroupOrderList(
      arrayMove(
        groupList.map((item) => item._id),
        oldIndex,
        newIndex
      )
    );
  });

  return {
    groupList,
    handleSortEnd,
  };
}
