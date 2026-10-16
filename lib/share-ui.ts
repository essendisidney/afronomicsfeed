/**
 * The share text for calculator results in English and the Learn languages, and the language list itself. Split
 * from lib/learn-ui.ts so the share buttons (components/ui/ShareResult.tsx) and lib/share.ts ship only this, not
 * the whole Learn interface text, to every page that has a share button.
 */

export const learnLangs = ["fr", "pt", "ar", "sw"] as const;
export type LearnLang = (typeof learnLangs)[number];

export function isLearnLang(v: string): v is LearnLang {
  return (learnLangs as readonly string[]).includes(v);
}

/** Languages a share can be written in: English plus the Learn languages. */
export type ShareLang = "en" | LearnLang;

export function isShareLang(v: string): v is ShareLang {
  return v === "en" || isLearnLang(v);
}

/** The two result titles in each Learn language: the calculators' headings and the share messages' titles. */
export const resultTitles: Record<LearnLang, { savingsTitle: string; loanTitle: string }> = {
  fr: { savingsTitle: "Combien mon épargne va-t-elle grandir ?", loanTitle: "Combien ce prêt va-t-il me coûter ?" },
  pt: { savingsTitle: "Quanto vai crescer a minha poupança?", loanTitle: "Quanto me vai custar este empréstimo?" },
  ar: { savingsTitle: "كم ستنمو مدخراتي؟", loanTitle: "كم سيكلفني هذا القرض؟" },
  sw: { savingsTitle: "Akiba yangu itakua kiasi gani?", loanTitle: "Mkopo huu utanigharimu kiasi gani?" },
};

/**
 * Share buttons and the message that goes with a shared calculator result. Figures arrive already formatted.
 * `tryOwn` ends the message (before the link) and leads into the link on the share card; it carries its own colon.
 */
export type ShareUi = {
  heading: string;
  share: string;
  copy: string;
  copied: string;
  tryOwn: string;
  savingsTitle: string;
  loanTitle: string;
  savingsText: (monthly: string, years: string, rate: string, total: string) => string;
  loanText: (amount: string, rate: string, months: string, reducingInterest: string, flatInterest: string) => string;
  savingsCard: (monthly: string, years: string, rate: string) => string;
  loanCard: (amount: string, rate: string, months: string) => string;
};

export const shareUi: Record<ShareLang, ShareUi> = {
  en: {
    heading: "Share this result",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied",
    tryOwn: "Try your own numbers:",
    savingsTitle: "How much will my savings grow?",
    loanTitle: "What will this loan cost me?",
    savingsText: (m, y, r, t) => `Saving ${m} a month for ${y} years at ${r}% grows to about ${t}.`,
    loanText: (a, r, mo, ri, fi) => `Borrowing ${a} at ${r}% for ${mo} months costs about ${ri} in interest on a reducing balance, or ${fi} if the rate is flat.`,
    savingsCard: (m, y, r) => `Saving ${m} a month for ${y} years at ${r}%`,
    loanCard: (a, r, mo) => `Borrowing ${a} at ${r}% for ${mo} months`,
  },
  fr: {
    heading: "Partager ce résultat",
    share: "Partager",
    copy: "Copier le lien",
    copied: "Lien copié",
    tryOwn: "Faites votre propre calcul :",
    savingsTitle: resultTitles.fr.savingsTitle,
    loanTitle: resultTitles.fr.loanTitle,
    savingsText: (m, y, r, t) => `En épargnant ${m} par mois pendant ${y} ans à ${r} %, on arrive à environ ${t}.`,
    loanText: (a, r, mo, ri, fi) => `Emprunter ${a} à ${r} % sur ${mo} mois coûte environ ${ri} d’intérêts sur le capital restant dû, ou ${fi} à taux fixe.`,
    savingsCard: (m, y, r) => `Épargner ${m} par mois pendant ${y} ans à ${r} %`,
    loanCard: (a, r, mo) => `Emprunter ${a} à ${r} % sur ${mo} mois`,
  },
  pt: {
    heading: "Partilhar este resultado",
    share: "Partilhar",
    copy: "Copiar link",
    copied: "Link copiado",
    tryOwn: "Faça as suas contas:",
    savingsTitle: resultTitles.pt.savingsTitle,
    loanTitle: resultTitles.pt.loanTitle,
    savingsText: (m, y, r, t) => `Poupando ${m} por mês durante ${y} anos a ${r}%, chega a cerca de ${t}.`,
    loanText: (a, r, mo, ri, fi) => `Pedir ${a} emprestado a ${r}% por ${mo} meses custa cerca de ${ri} em juros sobre o saldo em dívida, ou ${fi} com taxa fixa.`,
    savingsCard: (m, y, r) => `Poupar ${m} por mês durante ${y} anos a ${r}%`,
    loanCard: (a, r, mo) => `Pedir ${a} emprestado a ${r}% por ${mo} meses`,
  },
  ar: {
    heading: "شارك هذه النتيجة",
    share: "مشاركة",
    copy: "نسخ الرابط",
    copied: "تم نسخ الرابط",
    tryOwn: "احسبها بأرقامك:",
    savingsTitle: resultTitles.ar.savingsTitle,
    loanTitle: resultTitles.ar.loanTitle,
    savingsText: (m, y, r, t) => `ادخار ${m} كل شهر لمدة ${y} سنوات بعائد ${r}% يصل إلى نحو ${t}.`,
    loanText: (a, r, mo, ri, fi) => `اقتراض ${a} بفائدة ${r}% لمدة ${mo} شهرًا يكلّف نحو ${ri} فوائد على الرصيد المتبقي، أو ${fi} إذا كانت الفائدة ثابتة.`,
    savingsCard: (m, y, r) => `ادخار ${m} كل شهر لمدة ${y} سنوات بعائد ${r}%`,
    loanCard: (a, r, mo) => `اقتراض ${a} بفائدة ${r}% لمدة ${mo} شهرًا`,
  },
  sw: {
    heading: "Shiriki matokeo haya",
    share: "Shiriki",
    copy: "Nakili kiungo",
    copied: "Kiungo kimenakiliwa",
    tryOwn: "Jaribu hesabu yako:",
    savingsTitle: resultTitles.sw.savingsTitle,
    loanTitle: resultTitles.sw.loanTitle,
    savingsText: (m, y, r, t) => `Ukiweka akiba ya ${m} kila mwezi kwa miaka ${y} kwa riba ya ${r}%, utakuwa na takriban ${t}.`,
    loanText: (a, r, mo, ri, fi) => `Kukopa ${a} kwa riba ya ${r}% kwa miezi ${mo} kunagharimu takriban ${ri} za riba kwa salio linalopungua, au ${fi} kwa riba bapa.`,
    savingsCard: (m, y, r) => `Akiba ya ${m} kila mwezi kwa miaka ${y} kwa riba ya ${r}%`,
    loanCard: (a, r, mo) => `Mkopo wa ${a} kwa riba ya ${r}% kwa miezi ${mo}`,
  },
};
