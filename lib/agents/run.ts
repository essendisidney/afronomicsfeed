import { observationSlots } from "@/lib/demo/observations";
import { checkDoors, type DoorCheck } from "./doors";
import { storePrints, type StoreResult } from "./store";
import { latestPrints, loadCataloguePrints, loadPrints, type SourcedPrint } from "./worldbank";

export type AgentReport = {
  ranAt: string;
  prints: SourcedPrint[];
  store: StoreResult;
  doors: DoorCheck[] | null;
  desk: {
    emptySlots: string[];
    policyRate: string;
    printCount: number;
  };
};

export async function runAgents(options: { includeDoors?: boolean } = {}): Promise<AgentReport> {
  const [core, catalogue, doors] = await Promise.all([
    loadPrints(),
    loadCataloguePrints(),
    options.includeDoors ? checkDoors() : Promise.resolve(null),
  ]);
  const prints = latestPrints([...core, ...catalogue]);
  const store = await storePrints(prints);
  return {
    ranAt: new Date().toISOString(),
    prints,
    store,
    doors,
    desk: {
      emptySlots: observationSlots.map((slot) => slot.label),
      policyRate: "Policy rate stays empty until a central-bank notice is parsed. The catalogue reads only World Bank series that return a finite value.",
      printCount: prints.length,
    },
  };
}
