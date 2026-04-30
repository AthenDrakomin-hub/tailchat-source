type VirtualIdSource = { _id: string | { toString(): string } };

export default function virtualId<T extends VirtualIdSource>(
  arr: T[]
): Array<T & { id: string }>;
export default function virtualId<T extends VirtualIdSource>(
  doc: T
): T & { id: string };

/** Virtual ID (_id to id) for react-admin */
export default function virtualId<T extends VirtualIdSource>(el: Array<T> | T) {
  if (Array.isArray(el)) {
    return el.map((e) => {
      return {
        id: e._id.toString(),
        ...e,
        _id: undefined,
      };
    });
  }

  return { id: el._id.toString(), ...el, _id: undefined };
}
