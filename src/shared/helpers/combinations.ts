import combinate from 'combinate';
export function makeCombinations(
  possibleValues: number[],
  numElems: number,
): number[][] {
  const opts = {};
  for (let i = 0; i < numElems; i += 1) {
    opts[i] = possibleValues;
  }

  const res = combinate(opts).map((resItem) => Object.values(resItem).sort());
  const deduped = Array.from(
    new Set(res.map((a) => JSON.stringify(a))),
    (json) => JSON.parse(json),
  );

  return deduped;
}
