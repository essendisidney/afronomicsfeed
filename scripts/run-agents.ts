import { runAgents } from "../lib/agents/run";

async function main() {
  const report = await runAgents({ includeDoors: false });
  const kenya = report.prints.filter((print) => print.iso === "KE");
  console.log(JSON.stringify({
    ranAt: report.ranAt,
    prints: report.prints.length,
    byIndicator: {
      inflation: report.prints.filter((print) => print.indicatorSlug === "inflation").length,
      gdp: report.prints.filter((print) => print.indicatorSlug === "gdp").length,
      fdi: report.prints.filter((print) => print.indicatorSlug === "fdi").length,
      publicDebt: report.prints.filter((print) => print.indicatorSlug === "public-debt").length,
    },
    store: report.store,
    kenya,
  }, null, 2));
}

main();
