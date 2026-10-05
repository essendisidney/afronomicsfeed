/** Interface text for Learn in African languages; no server imports, so client components can use it. */

export const learnLangs = ["fr", "pt", "ar", "sw"] as const;
export type LearnLang = (typeof learnLangs)[number];

export function isLearnLang(v: string): v is LearnLang {
  return (learnLangs as readonly string[]).includes(v);
}

export const langMeta: Record<LearnLang, { name: string; native: string; dir: "ltr" | "rtl" }> = {
  fr: { name: "French", native: "Français", dir: "ltr" },
  pt: { name: "Portuguese", native: "Português", dir: "ltr" },
  ar: { name: "Arabic", native: "العربية", dir: "rtl" },
  sw: { name: "Kiswahili", native: "Kiswahili", dir: "ltr" },
};

export type Ui = {
  kicker: string;
  title: string;
  lede: string;
  lessons: string;
  tryIt: string;
  minutes: (n: number) => string;
  savingsTitle: string;
  savingsNote: string;
  loanTitle: string;
  loanNote: string;
  glossary: string;
  sources: string;
  asOf: string;
  notAdvice: string;
  english: string;
  otherLangs: string;
  back: string;
  calc: {
    saveMonthly: string;
    years: string;
    rate: string;
    youWillHave: string;
    youPutIn: string;
    interest: string;
    savingsFoot: string;
    amount: string;
    loanRate: string;
    months: string;
    ifCharged: (r: string) => string;
    monthly: string;
    totalInterest: string;
    totalRepaid: string;
    reducing: string;
    flat: string;
    equivalent: (flatRate: string, eq: string) => string;
    loanFoot: string;
  };
  terms: { term: string; means: string }[];
};

export const ui: Record<LearnLang, Ui> = {
  fr: {
    kicker: "Afronomics · Apprendre",
    title: "Comprendre l’argent, depuis les bases",
    lede: "De courtes leçons en mots simples sur l’épargne, le crédit et la façon dont l’économie touche votre porte-monnaie, partout en Afrique. Les exemples marchent dans n’importe quelle monnaie : franc CFA, naira, cedi, dirham ou shilling.",
    lessons: "Leçons",
    tryIt: "Essayez",
    minutes: (n) => `${n} min`,
    savingsTitle: "Combien mon épargne va-t-elle grandir ?",
    savingsNote: "Dans n’importe quelle monnaie. Saisissez le taux que vous obtenez, après impôt.",
    loanTitle: "Combien ce prêt va-t-il me coûter ?",
    loanNote: "Taux fixe sur le capital initial et taux sur le capital restant dû, côte à côte.",
    glossary: "Lexique",
    sources: "Sources",
    asOf: "Données au",
    notAdvice: "Information, et non un conseil.",
    english: "Read in English",
    otherLangs: "Autres langues",
    back: "Toutes les leçons",
    calc: {
      saveMonthly: "Épargne chaque mois",
      years: "Pendant combien d’années",
      rate: "Taux par an, après impôt (%)",
      youWillHave: "Vous aurez",
      youPutIn: "Vous avez versé",
      interest: "Intérêts gagnés",
      savingsFoot: "Un seul taux pour toute la durée, intérêts ajoutés chaque mois ; les vrais taux changent. Information, et non un conseil.",
      amount: "Montant emprunté",
      loanRate: "Taux par an (%)",
      months: "Mois pour rembourser",
      ifCharged: (r) => `Si les ${r} % sont calculés`,
      monthly: "Mensualité",
      totalInterest: "Intérêts totaux",
      totalRepaid: "Total remboursé",
      reducing: "Sur le capital restant dû",
      flat: "Taux fixe, sur tout le montant",
      equivalent: (f, e) => `Un taux fixe de ${f} % coûte autant qu’environ ${e} % sur le capital restant dû.`,
      loanFoot: "Frais, assurance et taxes en plus. Demandez au prêteur le total à rembourser. Information, et non un conseil.",
    },
    terms: [
      { term: "Intérêt", means: "Ce que paie un emprunteur, ou gagne un épargnant, pour l’usage de l’argent, en pourcentage par an." },
      { term: "Intérêts composés", means: "Gagner des intérêts sur les intérêts déjà gagnés." },
      { term: "Taux fixe (sur le capital initial)", means: "Intérêts calculés sur tout le montant emprunté, même pendant le remboursement." },
      { term: "Capital restant dû", means: "Ce qui reste à rembourser ; les intérêts calculés dessus diminuent avec le temps." },
      { term: "Bon du Trésor", means: "Un prêt à l’État pour quelques mois à un an, acheté sous sa valeur nominale." },
      { term: "Taux directeur", means: "Le taux fixé par la banque centrale ; les autres taux le suivent." },
      { term: "Inflation", means: "La vitesse à laquelle les prix montent, en général sur un an." },
      { term: "Rendement réel", means: "Ce que vous gagnez une fois l’inflation déduite." },
      { term: "Taux de change", means: "Le prix d’une monnaie dans une autre, par exemple francs CFA par dollar." },
      { term: "Frais", means: "Un coût en plus des intérêts, ou à leur place ; comptez-le dans le total." },
    ],
  },
  pt: {
    kicker: "Afronomics · Aprender",
    title: "Perceber o dinheiro, desde o início",
    lede: "Lições curtas, em palavras simples, sobre poupar, pedir emprestado e como a economia chega ao seu bolso, em toda a África. Os exemplos funcionam em qualquer moeda: metical, kwanza, escudo ou xelim.",
    lessons: "Lições",
    tryIt: "Experimente",
    minutes: (n) => `${n} min`,
    savingsTitle: "Quanto vai crescer a minha poupança?",
    savingsNote: "Em qualquer moeda. Escreva a taxa que recebe, depois de impostos.",
    loanTitle: "Quanto me vai custar este empréstimo?",
    loanNote: "Taxa fixa sobre o valor total e taxa sobre o saldo em dívida, lado a lado.",
    glossary: "Glossário",
    sources: "Fontes",
    asOf: "Dados de",
    notAdvice: "Informação, não aconselhamento.",
    english: "Read in English",
    otherLangs: "Outras línguas",
    back: "Todas as lições",
    calc: {
      saveMonthly: "Poupar por mês",
      years: "Durante quantos anos",
      rate: "Taxa por ano, depois de impostos (%)",
      youWillHave: "Vai ter",
      youPutIn: "Depositou",
      interest: "Juros ganhos",
      savingsFoot: "Uma só taxa para todo o período, juros somados todos os meses; as taxas reais mudam. Informação, não aconselhamento.",
      amount: "Valor emprestado",
      loanRate: "Taxa por ano (%)",
      months: "Meses para pagar",
      ifCharged: (r) => `Se os ${r}% forem cobrados`,
      monthly: "Prestação mensal",
      totalInterest: "Juros totais",
      totalRepaid: "Total pago",
      reducing: "Sobre o saldo em dívida",
      flat: "Taxa fixa, sobre o valor total",
      equivalent: (f, e) => `Uma taxa fixa de ${f}% custa o mesmo que cerca de ${e}% sobre o saldo em dívida.`,
      loanFoot: "Comissões, seguros e impostos são à parte. Peça ao credor o total a pagar. Informação, não aconselhamento.",
    },
    terms: [
      { term: "Juros", means: "O que um devedor paga, ou um aforrador ganha, pelo uso do dinheiro, em percentagem por ano." },
      { term: "Juros compostos", means: "Ganhar juros sobre os juros já ganhos." },
      { term: "Taxa fixa (sobre o valor total)", means: "Juros calculados sobre todo o valor emprestado, mesmo enquanto vai pagando." },
      { term: "Saldo em dívida", means: "O que ainda falta pagar; os juros sobre ele diminuem com o tempo." },
      { term: "Bilhete do Tesouro", means: "Um empréstimo ao Estado por alguns meses até um ano, comprado abaixo do valor nominal." },
      { term: "Taxa de política monetária", means: "A taxa fixada pelo banco central; as outras taxas seguem-na." },
      { term: "Inflação", means: "A rapidez com que os preços sobem, normalmente ao longo de um ano." },
      { term: "Rendimento real", means: "O que ganha depois de descontar a inflação." },
      { term: "Taxa de câmbio", means: "O preço de uma moeda noutra, por exemplo meticais por dólar." },
      { term: "Comissão", means: "Um custo além dos juros, ou em vez deles; conte-o no total." },
    ],
  },
  ar: {
    kicker: "أفرونوميكس · تعلّم",
    title: "افهم المال من الأساس",
    lede: "دروس قصيرة بكلمات بسيطة عن الادخار والاقتراض وكيف يصل الاقتصاد إلى جيبك، في كل أنحاء أفريقيا. الأمثلة تصلح لأي عملة: الجنيه أو الدرهم أو الدينار أو غيرها.",
    lessons: "الدروس",
    tryIt: "جرّب",
    minutes: (n) => `${n} دقائق`,
    savingsTitle: "كم ستنمو مدخراتي؟",
    savingsNote: "بأي عملة. اكتب العائد الذي تحصل عليه بعد الضريبة.",
    loanTitle: "كم سيكلفني هذا القرض؟",
    loanNote: "الفائدة الثابتة على كامل المبلغ والفائدة على الرصيد المتبقي، جنبًا إلى جنب.",
    glossary: "مسرد المصطلحات",
    sources: "المصادر",
    asOf: "البيانات حتى",
    notAdvice: "معلومات وليست نصيحة.",
    english: "Read in English",
    otherLangs: "لغات أخرى",
    back: "كل الدروس",
    calc: {
      saveMonthly: "الادخار كل شهر",
      years: "لعدد من السنوات",
      rate: "العائد السنوي بعد الضريبة (%)",
      youWillHave: "سيكون لديك",
      youPutIn: "ما دفعته",
      interest: "الفوائد المكتسبة",
      savingsFoot: "عائد واحد لكل المدة، وتُضاف الفائدة شهريًا؛ العوائد الحقيقية تتغير. معلومات وليست نصيحة.",
      amount: "مبلغ القرض",
      loanRate: "الفائدة السنوية (%)",
      months: "عدد أشهر السداد",
      ifCharged: (r) => `إذا حُسبت فائدة ${r}%`,
      monthly: "القسط الشهري",
      totalInterest: "مجموع الفوائد",
      totalRepaid: "المبلغ المسدد كاملًا",
      reducing: "على الرصيد المتبقي",
      flat: "ثابتة على كامل المبلغ",
      equivalent: (f, e) => `فائدة ثابتة بنسبة ${f}% تكلف ما يعادل نحو ${e}% على الرصيد المتبقي.`,
      loanFoot: "الرسوم والتأمين والضرائب إضافية. اطلب من المُقرض المبلغ الإجمالي الذي ستسدده. معلومات وليست نصيحة.",
    },
    terms: [
      { term: "الفائدة", means: "ما يدفعه المقترض أو يكسبه المدخر مقابل استخدام المال، كنسبة مئوية سنوية." },
      { term: "الفائدة المركبة", means: "أن تكسب فائدة على الفوائد التي كسبتها من قبل." },
      { term: "الفائدة الثابتة على كامل المبلغ", means: "فائدة تُحسب على المبلغ المقترض كله طوال المدة، حتى أثناء السداد." },
      { term: "الرصيد المتبقي", means: "ما بقي عليك سداده؛ والفائدة عليه تقل مع الوقت." },
      { term: "أذون الخزانة", means: "قرض للحكومة لأشهر حتى سنة، يُشترى بأقل من قيمته الاسمية." },
      { term: "سعر الفائدة الأساسي", means: "السعر الذي يحدده البنك المركزي، وتتبعه أسعار الفائدة الأخرى." },
      { term: "التضخم", means: "سرعة ارتفاع الأسعار، عادة خلال سنة." },
      { term: "العائد الحقيقي", means: "ما تكسبه بعد خصم التضخم." },
      { term: "سعر الصرف", means: "ثمن عملة بعملة أخرى، مثل عدد الجنيهات مقابل الدولار." },
      { term: "الرسوم", means: "تكلفة إضافية إلى جانب الفائدة أو بدلًا منها؛ احسبها ضمن المبلغ الإجمالي." },
    ],
  },
  sw: {
    kicker: "Afronomics · Jifunze",
    title: "Jifunze kuhusu pesa, kuanzia mwanzo",
    lede: "Masomo mafupi kwa maneno rahisi kuhusu kuweka akiba, kukopa na jinsi uchumi unavyofika mfukoni mwako, popote ulipo Afrika. Mifano inafaa sarafu yoyote: shilingi, faranga, naira au randi.",
    lessons: "Masomo",
    tryIt: "Jaribu",
    minutes: (n) => `dakika ${n}`,
    savingsTitle: "Akiba yangu itakua kiasi gani?",
    savingsNote: "Kwa sarafu yoyote. Andika riba unayopata, baada ya kodi.",
    loanTitle: "Mkopo huu utanigharimu kiasi gani?",
    loanNote: "Riba ya kiwango bapa na riba kwa salio linalopungua, kando kwa kando.",
    glossary: "Faharasa",
    sources: "Vyanzo",
    asOf: "Takwimu hadi",
    notAdvice: "Taarifa, si ushauri.",
    english: "Read in English",
    otherLangs: "Lugha nyingine",
    back: "Masomo yote",
    calc: {
      saveMonthly: "Weka akiba kila mwezi",
      years: "Kwa miaka mingapi",
      rate: "Riba kwa mwaka, baada ya kodi (%)",
      youWillHave: "Utakuwa na",
      youPutIn: "Uliweka",
      interest: "Riba uliyopata",
      savingsFoot: "Riba moja kwa muda wote, riba huongezwa kila mwezi; riba halisi hubadilika. Taarifa, si ushauri.",
      amount: "Kiasi ulichokopa",
      loanRate: "Riba kwa mwaka (%)",
      months: "Miezi ya kulipa",
      ifCharged: (r) => `Ikiwa riba ya ${r}% itatozwa`,
      monthly: "Malipo ya mwezi",
      totalInterest: "Jumla ya riba",
      totalRepaid: "Jumla utakayolipa",
      reducing: "Kwa salio linalopungua",
      flat: "Kiwango bapa, kwa kiasi chote",
      equivalent: (f, e) => `Riba bapa ya ${f}% inagharimu sawa na takriban ${e}% kwa salio linalopungua.`,
      loanFoot: "Ada, bima na ushuru ni ziada. Muulize mkopeshaji jumla utakayolipa. Taarifa, si ushauri.",
    },
    terms: [
      { term: "Riba", means: "Anachotozwa mkopaji, au anachopata mweka akiba, kwa kutumia pesa; kwa asilimia kwa mwaka." },
      { term: "Riba mchanganyiko", means: "Kupata riba juu ya riba uliyokwisha kupata." },
      { term: "Riba ya kiwango bapa", means: "Riba inayohesabiwa kwa kiasi chote ulichokopa, hata unapoendelea kulipa." },
      { term: "Salio linalopungua", means: "Kiasi kilichobaki kulipwa; riba juu yake hupungua kadri unavyolipa." },
      { term: "Hati ya hazina", means: "Mkopo kwa serikali kwa miezi michache hadi mwaka mmoja, unaonunuliwa chini ya thamani yake." },
      { term: "Riba ya benki kuu", means: "Riba inayowekwa na benki kuu; riba nyingine huifuata." },
      { term: "Mfumuko wa bei", means: "Kasi ya kupanda kwa bei, kwa kawaida kwa mwaka mmoja." },
      { term: "Faida halisi", means: "Unachopata baada ya kuondoa mfumuko wa bei." },
      { term: "Kiwango cha ubadilishaji fedha", means: "Bei ya sarafu moja kwa sarafu nyingine, kama shilingi kwa dola." },
      { term: "Ada", means: "Gharama juu ya riba au badala yake; ihesabu katika jumla." },
    ],
  },
};
