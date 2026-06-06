import type {
  ActOfPiety,
  AppPreferences,
  CatholicPrayer,
  ContentCategory,
  DailyPlanItem,
  Novena,
  OnboardingAnswerKey,
  PersonalProfile,
  SacramentalAction,
  UserSpiritualProfile,
} from "@/lib/types";

export const defaultProfile: UserSpiritualProfile = {
  experienceLevel: "beginner",
  dailyPrayerTimeMinutes: 10,
  preferredDevotions: ["I’m open to exploring"],
  preferredPrayerTime: "morning",
  spiritualGoal: "Building a daily prayer habit",
};

export const defaultPersonalProfile: PersonalProfile = {
  displayName: "",
  parish: "",
  patronSaint: "",
};

export const defaultPreferences: AppPreferences = {
  prayerLanguage: "en",
  confessionFrequencyDays: 30,
};

export const actsOfPiety: ActOfPiety[] = [
  {
    id: "morning-offering",
    title: "Morning Offering",
    description: "Begin the day by offering your work, joys, and challenges to God.",
    category: "daily_practices",
    estimatedMinutes: 2,
    difficulty: "beginner",
    tags: ["morning", "daily", "habit"],
    content:
      "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day.\n\nUnite them with the Holy Sacrifice of the Mass throughout the world. Help me live today with love, patience, and trust.",
  },
  {
    id: "scripture-reading",
    title: "Scripture Reading",
    description: "Read a short Gospel passage and notice one word that stays with you.",
    category: "formation",
    estimatedMinutes: 5,
    difficulty: "beginner",
    tags: ["scripture", "gospel", "formation"],
    content:
      "Read Luke 1:38 slowly: Behold, I am the handmaid of the Lord. May it be done to me according to your word.\n\nPause for one minute. Ask: Where is God inviting me to trust Him today?",
  },
  {
    id: "rosary-decade",
    title: "Rosary Decade",
    description: "Pray one decade of the Rosary with Mary and bring one intention.",
    category: "devotions",
    estimatedMinutes: 5,
    difficulty: "beginner",
    tags: ["rosary", "mary", "devotion"],
    content:
      "Choose one mystery of the Rosary. Pray one Our Father, ten Hail Marys, and one Glory Be.\n\nOffer the decade for someone who needs peace today.",
  },
  {
    id: "evening-examen",
    title: "Evening Examen",
    description: "Review the day with gratitude and ask for grace for tomorrow.",
    category: "daily_practices",
    estimatedMinutes: 6,
    difficulty: "intermediate",
    tags: ["evening", "reflection", "habit"],
    content:
      "Thank God for one gift from today. Notice one moment you could have loved better. Ask for forgiveness with confidence.\n\nClose with: Jesus, I trust in You.",
  },
  {
    id: "confession-prep",
    title: "Confession Prep",
    description: "Make a gentle examination of conscience before the sacrament.",
    category: "sacramental_life",
    estimatedMinutes: 10,
    difficulty: "intermediate",
    tags: ["confession", "sacrament", "mercy"],
    content:
      "Ask the Holy Spirit for light. Review love of God, love of neighbor, prayer, honesty, purity, patience, and charity.\n\nWrite down what you want to bring to confession.",
  },
];

export const onboardingQuestions: Array<{
  id: string;
  key: OnboardingAnswerKey;
  title: string;
  options: Array<{ label: string; value: string }>;
}> = [
  {
    id: "experience",
    key: "experienceLevel",
    title: "Which best describes you?",
    options: [
      { label: "I’m new to the Catholic faith", value: "beginner" },
      { label: "I’m learning and exploring", value: "exploring" },
      { label: "I practice my faith regularly", value: "regular" },
      { label: "I want to grow deeper", value: "growing_deeper" },
    ],
  },
  {
    id: "time",
    key: "dailyPrayerTimeMinutes",
    title: "How much time could you usually spend in prayer each day?",
    options: [
      { label: "2–5 minutes", value: "5" },
      { label: "5–10 minutes", value: "10" },
      { label: "10–20 minutes", value: "20" },
      { label: "20+ minutes", value: "30" },
    ],
  },
  {
    id: "devotion",
    key: "preferredDevotions",
    title: "Which forms of prayer do you feel most drawn to?",
    options: [
      { label: "Scripture reading", value: "Scripture reading" },
      { label: "Rosary or Marian prayers", value: "Rosary or Marian prayers" },
      { label: "Silent meditation", value: "Silent meditation" },
      { label: "Traditional prayers", value: "Traditional prayers" },
      { label: "I’m open to exploring", value: "I’m open to exploring" },
    ],
  },
  {
    id: "rhythm",
    key: "preferredPrayerTime",
    title: "When do you usually prefer to pray?",
    options: [
      { label: "Morning", value: "morning" },
      { label: "Midday", value: "midday" },
      { label: "Evening", value: "evening" },
      { label: "Before sleep", value: "before_sleep" },
      { label: "Flexible", value: "flexible" },
    ],
  },
  {
    id: "goal",
    key: "spiritualGoal",
    title: "What would you like help with most?",
    options: [
      { label: "Building a daily prayer habit", value: "Building a daily prayer habit" },
      { label: "Deepening my relationship with God", value: "Deepening my relationship with God" },
      { label: "Learning traditional Catholic devotions", value: "Learning traditional Catholic devotions" },
      { label: "Preparing better for confession", value: "Preparing better for confession" },
      { label: "Growing spiritually step by step", value: "Growing spiritually step by step" },
    ],
  },
];

export const dailyPlan: DailyPlanItem[] = [
  { id: "plan-1", practice: actsOfPiety[0], status: "pending", recommendedOrder: 1 },
  { id: "plan-2", practice: actsOfPiety[1], status: "pending", recommendedOrder: 2 },
  { id: "plan-3", practice: actsOfPiety[2], status: "pending", recommendedOrder: 3 },
];

export function getRecommendedPlan(profile: UserSpiritualProfile): DailyPlanItem[] {
  const preferred = profile.preferredDevotions[0] ?? "";
  const rhythm = profile.preferredPrayerTime;
  const goal = profile.spiritualGoal;

  const scored = actsOfPiety
    .map((practice) => {
      let score = 0;
      if (practice.estimatedMinutes <= profile.dailyPrayerTimeMinutes) score += 3;
      if (practice.difficulty === "beginner" && profile.experienceLevel !== "growing_deeper") score += 2;
      if (practice.tags.some((tag) => preferred.toLowerCase().includes(tag))) score += 4;
      if (practice.tags.includes(rhythm.replace("_", "-")) || practice.tags.includes(rhythm)) score += 2;
      if (goal.toLowerCase().includes("confession") && practice.category === "sacramental_life") score += 5;
      if (goal.toLowerCase().includes("devotions") && practice.category === "devotions") score += 4;
      return { practice, score };
    })
    .sort((a, b) => b.score - a.score || a.practice.estimatedMinutes - b.practice.estimatedMinutes)
    .slice(0, 3);

  return scored.map(({ practice }, index) => ({
    id: `plan-${practice.id}`,
    practice,
    status: "pending",
    recommendedOrder: index + 1,
  }));
}

export const categoryCards: Array<{
  id: ContentCategory;
  title: string;
  description: string;
  color: string;
  border: string;
}> = [
  {
    id: "daily_practices",
    title: "Daily Practices",
    description: "Simple habits for ordinary days.",
    color: "bg-primary",
    border: "border-primary-light",
  },
  {
    id: "devotions",
    title: "Devotions",
    description: "Rosary, Marian prayers, and beloved traditions.",
    color: "bg-blue",
    border: "border-blue",
  },
  {
    id: "formation",
    title: "Formation",
    description: "Scripture and Catholic teaching in small bites.",
    color: "bg-yellow",
    border: "border-yellow",
  },
  {
    id: "sacramental_life",
    title: "Sacramental Life",
    description: "Prepare for confession, Mass, and grace.",
    color: "bg-danger",
    border: "border-danger",
  },
];

export const sacramentalActions: SacramentalAction[] = [
  {
    id: "confession",
    type: "confession",
    title: "Confession",
    description: "Return to mercy with a steady rhythm of examination, contrition, and grace.",
    cadence: "Monthly rhythm",
    steps: [
      "Examine conscience",
      "Choose a confession time",
      "Make an act of contrition",
      "Complete the penance",
    ],
  },
  {
    id: "retreat",
    type: "retreat",
    title: "Retreat",
    description: "Set aside quiet time for prayer, spiritual reading, and renewed direction.",
    cadence: "Seasonal or annual rhythm",
    steps: [
      "Choose a retreat day",
      "Bring Scripture and journal",
      "Keep silence for one block",
      "Name one next step",
    ],
  },
  {
    id: "mass-prep",
    type: "mass_prep",
    title: "Mass Preparation",
    description: "Prepare for Sunday Mass by praying with the readings and arriving recollected.",
    cadence: "Weekly rhythm",
    steps: [
      "Read the Sunday Gospel",
      "Bring one intention",
      "Arrive early",
      "Give thanks after Communion",
    ],
  },
  {
    id: "adoration",
    type: "adoration",
    title: "Eucharistic Adoration",
    description: "Spend time before Christ in the Blessed Sacrament with attention and love.",
    cadence: "Weekly or monthly rhythm",
    steps: [
      "Schedule a chapel visit",
      "Begin with silence",
      "Pray slowly",
      "Close with thanksgiving",
    ],
  },
];

export const weeklyProgress = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: false },
  { day: "S", done: false },
  { day: "S", done: false },
];

export const catholicPrayers: CatholicPrayer[] = [
  {
    id: "sign-of-the-cross",
    category: "foundational",
    tags: ["cross", "trinity", "beginning", "聖號經", "十字聖號"],
    languages: {
      en: {
        title: "Sign of the Cross",
        subtitle: "A brief prayer to begin and end prayer.",
        text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      },
      zhHant: {
        title: "聖號經",
        subtitle: "開始和結束祈禱的短經。",
        text: "因父、及子、及聖神之名。阿們。",
      },
    },
  },
  {
    id: "our-father",
    category: "foundational",
    tags: ["lord's prayer", "our father", "天主經", "主禱文"],
    languages: {
      en: {
        title: "Our Father",
        subtitle: "The prayer Jesus taught his disciples.",
        text: "Our Father, who art in heaven,\nhallowed be thy name.\nThy kingdom come.\nThy will be done on earth, as it is in heaven.\nGive us this day our daily bread,\nand forgive us our trespasses,\nas we forgive those who trespass against us,\nand lead us not into temptation,\nbut deliver us from evil. Amen.",
      },
      zhHant: {
        title: "天主經",
        subtitle: "耶穌教導門徒的祈禱。",
        text: "我們的天父，\n願祢的名受顯揚；\n願祢的國來臨；\n願祢的旨意奉行在人間，\n如同在天上。\n求祢今天賞給我們日用的食糧；\n求祢寬恕我們的罪過，\n如同我們寬恕別人一樣；\n不要讓我們陷於誘惑；\n但救我們免於兇惡。阿們。",
      },
    },
  },
  {
    id: "hail-mary",
    category: "marian",
    tags: ["hail mary", "mary", "rosary", "聖母經", "瑪利亞", "玫瑰經"],
    languages: {
      en: {
        title: "Hail Mary",
        subtitle: "A Marian prayer used throughout the Rosary.",
        text: "Hail Mary, full of grace,\nthe Lord is with thee.\nBlessed art thou among women,\nand blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God,\npray for us sinners,\nnow and at the hour of our death. Amen.",
      },
      zhHant: {
        title: "聖母經",
        subtitle: "玫瑰經中常誦的聖母祈禱。",
        text: "萬福瑪利亞，妳充滿聖寵，\n主與妳同在，\n妳在婦女中受讚頌，\n妳的親子耶穌同受讚頌。\n天主聖母瑪利亞，\n求妳現在和我們臨終時，\n為我們罪人祈求天主。阿們。",
      },
    },
  },
  {
    id: "glory-be",
    category: "rosary",
    tags: ["glory be", "doxology", "trinity", "rosary", "聖三光榮頌", "聖三"],
    languages: {
      en: {
        title: "Glory Be",
        subtitle: "A short doxology of praise to the Trinity.",
        text: "Glory be to the Father,\nand to the Son,\nand to the Holy Spirit,\nas it was in the beginning,\nis now, and ever shall be,\nworld without end. Amen.",
      },
      zhHant: {
        title: "聖三光榮頌",
        subtitle: "讚美聖三的短頌。",
        text: "願光榮歸於父、及子、及聖神；\n起初如何，\n今日亦然，\n直到永遠。阿們。",
      },
    },
  },
  {
    id: "apostles-creed",
    category: "foundational",
    tags: ["apostles creed", "creed", "belief", "faith", "宗徒信經", "信經"],
    languages: {
      en: {
        title: "Apostles' Creed",
        subtitle: "A concise profession of Christian faith.",
        text: "I believe in God, the Father almighty,\nCreator of heaven and earth,\nand in Jesus Christ, his only Son, our Lord,\nwho was conceived by the Holy Spirit,\nborn of the Virgin Mary,\nsuffered under Pontius Pilate,\nwas crucified, died, and was buried;\nhe descended into hell;\non the third day he rose again from the dead;\nhe ascended into heaven,\nand is seated at the right hand of God the Father almighty;\nfrom there he will come to judge the living and the dead.\nI believe in the Holy Spirit,\nthe holy Catholic Church,\nthe communion of saints,\nthe forgiveness of sins,\nthe resurrection of the body,\nand life everlasting. Amen.",
      },
      zhHant: {
        title: "宗徒信經",
        subtitle: "基督信仰的簡要宣認。",
        text: "我信全能的天主父，天地萬物的創造者。\n我信父的唯一子，我們的主耶穌基督，祂因聖神降孕，由童貞瑪利亞誕生；祂在比拉多執政時蒙難，被釘在十字架上，死而安葬，祂下降陰府，第三日從死者中復活；祂升了天，坐在全能天主父的右邊，祂要從天降來，審判生者死者。\n我信聖神。我信聖而公教會，諸聖的相通。罪過的赦免。肉身的復活。永恆的生命。阿們。",
      },
    },
  },
  {
    id: "guardian-angel",
    category: "daily",
    tags: ["guardian angel", "angel", "protection", "daily", "護守天使", "天使"],
    languages: {
      en: {
        title: "Guardian Angel Prayer",
        subtitle: "A daily prayer for angelic care and guidance.",
        text: "Angel of God,\nmy guardian dear,\nto whom God's love commits me here,\never this day be at my side,\nto light and guard,\nto rule and guide. Amen.",
      },
      zhHant: {
        title: "求護守天使頌",
        subtitle: "求護守天使保護和引導的日用短經。",
        text: "我的護守天使，天主既使你照顧我，求你常保護我，指引我，管理我。阿們。",
      },
    },
  },
];

export const novenas: Novena[] = [
  {
    id: "daily-work",
    title: "Novena for Daily Work",
    description:
      "Nine days of prayer to offer ordinary work to God with faith, order, service, and love.",
    intentionPrompt: "What work, vocation, or responsibility are you entrusting to God?",
    days: [
      {
        day: 1,
        title: "Offer the Work",
        reflection:
          "Begin by placing your tasks before God. Ordinary duties can become prayer when they are offered with love.",
        prayer:
          "Lord Jesus, receive the work of my hands and mind today. Teach me to begin with humility, to work with patience, and to offer each task for your glory. Amen.",
        action: "Name one task today and offer it before you begin.",
      },
      {
        day: 2,
        title: "Serve Through Work",
        reflection:
          "Work is not only productivity. It is a concrete way to serve family, neighbors, colleagues, and the common good.",
        prayer:
          "Father, help me see the people served by my work. Free me from selfishness, and make my effort generous, honest, and attentive to others. Amen.",
        action: "Choose one person who benefits from your work and pray for them.",
      },
      {
        day: 3,
        title: "Work With Love",
        reflection:
          "Small tasks gain spiritual weight when they are done with love. Nothing offered to God is wasted.",
        prayer:
          "Holy Spirit, fill small duties with great love. When work feels hidden or repetitive, keep my heart awake to your presence. Amen.",
        action: "Do one ordinary task carefully without rushing.",
      },
      {
        day: 4,
        title: "Order and Constancy",
        reflection:
          "A stable rhythm protects prayer, family, rest, and responsibility. Order makes room for grace.",
        prayer:
          "Lord, give me the grace to use time well. Help me order my day with peace, keep my commitments, and return to you when I lose focus. Amen.",
        action: "Write the next three concrete tasks for today.",
      },
      {
        day: 5,
        title: "Work Well",
        reflection:
          "Careful work can be an act of reverence. God is honored by honest effort and attention to detail.",
        prayer:
          "Creator God, help me work with diligence and integrity. Let my effort be worthy of the gifts you have entrusted to me. Amen.",
        action: "Improve one detail in a task you might normally overlook.",
      },
      {
        day: 6,
        title: "Accept Limits",
        reflection:
          "Not every task goes as planned. Limits can become invitations to humility, perseverance, and trust.",
        prayer:
          "Jesus, when my work is difficult or incomplete, keep me from discouragement. Help me do what I can and entrust the rest to you. Amen.",
        action: "Pause for one minute before reacting to a frustration.",
      },
      {
        day: 7,
        title: "Witness With Joy",
        reflection:
          "A Christian spirit at work is often shown through patience, fairness, gratitude, and quiet joy.",
        prayer:
          "Lord, make my conduct a peaceful witness. Let my words, decisions, and attitude reflect the hope I have in you. Amen.",
        action: "Offer one encouraging word today.",
      },
      {
        day: 8,
        title: "Seek God in the Ordinary",
        reflection:
          "God meets us in ordinary places. Work, home, study, and service can all become places of encounter.",
        prayer:
          "Father, open my eyes to meet you in the ordinary. Help me find you in the people, duties, and interruptions of this day. Amen.",
        action: "Pray a short aspiration before changing tasks.",
      },
      {
        day: 9,
        title: "Give Thanks and Continue",
        reflection:
          "A novena ends by giving thanks and taking one next faithful step. Grace continues in daily life.",
        prayer:
          "Lord, thank you for walking with me through these nine days. Strengthen my vocation, bless my work, and help me continue with faith, hope, and love. Amen.",
        action: "Write one grace received and one habit to continue.",
      },
    ],
  },
];
