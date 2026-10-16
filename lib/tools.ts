/**
 * The calculators and checkers, in readers' words (the Tools row on Today, the /tools page and the Tools section of the
 * main menu). Each links to an existing page; `answers` is the one question it answers. `home` marks the tiles Today shows.
 */
export type Tool = { href: string; title: string; answers: string; group: ToolGroup; home?: boolean };
export type ToolGroup = "Everyday money" | "Saving and investing" | "Borrowing" | "Check before you sign";

export const toolGroups: ToolGroup[] = ["Everyday money", "Saving and investing", "Borrowing", "Check before you sign"];

export const tools: Tool[] = [
  { href: "/rates/kenya/mpesa-charges", title: "M-PESA & Fuliza", answers: "What sending, withdrawing and Fuliza cost you", group: "Everyday money", home: true },
  { href: "/rates/kenya/net-salary", title: "Net salary", answers: "Your take-home after PAYE, SHIF and the Housing Levy", group: "Everyday money", home: true },
  { href: "/rates/kenya/inflation", title: "Inflation calculator", answers: "What your shillings from any month are worth today", group: "Everyday money", home: true },
  { href: "/markets/kenya-tbills/calculator", title: "T-bill calculator", answers: "What a Treasury bill costs and pays after tax", group: "Saving and investing", home: true },
  { href: "/markets/kenya-tbills/auction", title: "Did my bid win?", answers: "The likely rates at this week's T-bill auction", group: "Saving and investing" },
  { href: "/markets/ipo-calculator", title: "IPO calculator", answers: "How many shares your money buys in an offer", group: "Saving and investing", home: true },
  { href: "/rates/kenya/savings-goal", title: "Savings goal planner", answers: "How much to save each month to reach a goal", group: "Saving and investing", home: true },
  { href: "/chama", title: "Chama planner", answers: "Where your chama's money earns most, after tax", group: "Saving and investing" },
  { href: "/rates/kenya/loan-cost", title: "Loan true cost", answers: "Any loan quote as its true yearly rate, with fees", group: "Borrowing", home: true },
  { href: "/rates/kenya/check", title: "Is my rate fair?", answers: "A Kenya savings or loan rate against the market", group: "Borrowing", home: true },
  { href: "/rates/nigeria/check", title: "Is my rate fair? Nigeria", answers: "A naira savings or loan rate against the market", group: "Borrowing" },
  { href: "/rates/ghana/check", title: "Is my rate fair? Ghana", answers: "A cedi savings or loan rate against the market", group: "Borrowing" },
  { href: "/rates/kenya/loan-apps", title: "Loan app checker", answers: "Is this loan app on the licensed list?", group: "Check before you sign" },
  { href: "/registry", title: "SACCO & bank registry", answers: "Is this SACCO or bank on the licensed list?", group: "Check before you sign" },
];

/** The paths the Tools section of the menu lights up on. */
export const toolPaths = tools.filter((t) => t.href !== "/registry").map((t) => t.href);
