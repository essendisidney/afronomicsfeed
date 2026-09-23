export function observationKey(input: {
  indicatorId: string;
  geography: string;
  observationDate: string;
  sourceId: string;
}) {
  return `${input.indicatorId}:${input.geography}:${input.observationDate}:${input.sourceId}`;
}
