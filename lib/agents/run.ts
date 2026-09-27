import { observationSlots } from "@/lib/demo/observations";
import { checkDoors, type DoorCheck } from "./doors";
import { storePrints, type StoreResult } from "./store";
import { loadPrints, type SourcedPrint } from "./worldbank";

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
  const [prints, doors] = await Promise.all([
    loadPrints(),
    options.includeDoors ? checkDoors() : Promise.resolve(null),
  ]);
  const store = await storePrints(prints);
  return {
    ranAt: new Date().toISOString(),
    prints,
    store,
    doors,
    desk: {
      emptySlots: observationSlots.map((slot) => slot.label),
      policyRate: "Policy rate is not read from World Bank. That cell stays empty until a central-bank notice is parsed.",
      printCount: prints.length,
    },
  };
}
