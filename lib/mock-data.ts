import type {
  ActOfPiety,
  AppPreferences,
  CatholicPrayer,
  ContentCategory,
  DailyPlanItem,
  ExperienceLevel,
  Novena,
  OnboardingAnswerKey,
  PersonalProfile,
  PietyScheduleEntry,
  PreferredPrayerTime,
  SacramentalAction,
  SaintProfile,
  UiLanguage,
  UserSpiritualProfile,
} from "@/lib/types";

const planOfLifeSourceUrl = "https://stjosemaria.org/plan-of-life/";

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
  uiLanguage: "zhHant",
  prayerLanguage: "zhHant",
  fontScale: 100,
  confessionFrequencyDays: 30,
};

export const actsOfPiety: ActOfPiety[] = [
  {
    id: "fixed-rising",
    sourceTitle: "Fixed rising time",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Fixed Rising Time",
        description: "Begin the day with order, enough rest, and a concrete first act of discipline.",
        content:
          "Choose a realistic time to get up and keep it with peace. Start the day without drifting, and offer the first minutes to God.",
      },
      zhHant: {
        title: "固定起床時間",
        description: "以規律、足夠休息和第一個具體克己開始一天。",
        content:
          "選擇一個實際可行的起床時間，並以平安持守。不要讓一天在拖延中開始，把最初的幾分鐘奉獻給天主。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 1,
    difficulty: "beginner",
    tags: ["morning", "daily", "order", "habit"],
    prayerTimes: ["morning"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "morning-offering",
    sourceTitle: "Offer your day",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Morning Offering",
        description: "Offer your work, joys, and difficulties to God through Our Lady.",
        content:
          "Make a short offering before the day fills up. Name your work, your family, and one intention, then entrust them to God through Mary.",
      },
      zhHant: {
        title: "晨禱奉獻",
        description: "藉聖母把工作、喜樂與困難奉獻給天主。",
        content:
          "在一天忙起來以前作一個簡短奉獻。說出今天的工作、家庭和一個意向，並藉聖母把它們託付給天主。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 2,
    difficulty: "beginner",
    tags: ["morning", "daily", "offering", "mary", "habit"],
    prayerTimes: ["morning"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "ordered-work",
    sourceTitle: "Ordered work",
    cadence: "daily",
    kind: "tip",
    languages: {
      en: {
        title: "Ordered Work",
        description: "Work with priorities, intensity, and a spirit of service.",
        content:
          "Write the next few tasks, choose what matters first, and work well. Let ordinary work become a place to serve God and others.",
      },
      zhHant: {
        title: "有秩序地工作",
        description: "以優先次序、專注和服務精神工作。",
        content:
          "寫下接下來幾件具體任務，先做最重要的事，並把事情做好。讓平凡工作成為事奉天主和他人的地方。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 3,
    difficulty: "intermediate",
    tags: ["work", "daily", "order", "service", "schedule"],
    prayerTimes: ["morning", "midday", "flexible"],
    recommendedFor: ["regular", "growing_deeper", "all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "daily-mass",
    sourceTitle: "Mass and Communion",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Mass and Communion",
        description: "Attend Mass and receive Communion as often as your state in life allows.",
        content:
          "If you can attend Mass today, prepare with a few minutes of prayer. If not, make a spiritual communion and unite your work to the sacrifice of the Mass.",
      },
      zhHant: {
        title: "彌撒與領聖體",
        description: "按生活情況，盡可能參與彌撒並領聖體。",
        content:
          "若今天能參與彌撒，先用幾分鐘收斂祈禱。若不能，作神領聖體，並把工作與彌撒聖祭結合。",
      },
    },
    category: "sacramental_life",
    estimatedMinutes: 30,
    difficulty: "advanced",
    tags: ["mass", "communion", "eucharist", "daily"],
    prayerTimes: ["morning", "midday", "evening", "flexible"],
    recommendedFor: ["regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "mental-prayer",
    sourceTitle: "Mental prayer",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Mental Prayer",
        description: "Spend quiet time speaking heart to heart with God.",
        content:
          "Set aside silent time, ideally before the Blessed Sacrament. Read a short line of Scripture, speak honestly to God, and listen.",
      },
      zhHant: {
        title: "默禱",
        description: "安靜地與天主作心對心的交談。",
        content:
          "預留安靜時間，若可能在聖體前。讀一句聖經，真誠地向天主說話，也給自己時間聆聽。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 15,
    difficulty: "intermediate",
    tags: ["silent meditation", "mental prayer", "adoration", "daily"],
    prayerTimes: ["morning", "midday", "evening", "flexible"],
    recommendedFor: ["exploring", "regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "angelus",
    sourceTitle: "Angelus",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Angelus",
        description: "Pause during the day to remember the Incarnation.",
        content:
          "At a natural pause, pray the Angelus or Regina Caeli in Easter time. Let the interruption renew your awareness of God’s presence.",
      },
      zhHant: {
        title: "三鐘經",
        description: "在一天中停下來紀念降生奧蹟。",
        content:
          "在一天的自然停頓中誦念三鐘經，復活期可誦念天上母后經。讓這個中斷更新你對天主臨在的意識。",
      },
    },
    category: "devotions",
    estimatedMinutes: 2,
    difficulty: "beginner",
    tags: ["angelus", "traditional prayers", "mary", "daily", "midday"],
    prayerTimes: ["midday", "morning", "evening"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "rosary",
    sourceTitle: "Rosary",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Rosary",
        description: "Pray the Rosary with Mary, bringing concrete intentions.",
        content:
          "Pray a decade or the full Rosary according to your time. Offer each mystery for a person, need, or responsibility.",
      },
      zhHant: {
        title: "玫瑰經",
        description: "偕同聖母誦念玫瑰經，帶著具體意向祈禱。",
        content:
          "按你的時間誦念一端或整串玫瑰經。把每一端為一個人、一項需要或一份責任奉獻。",
      },
    },
    category: "devotions",
    estimatedMinutes: 15,
    difficulty: "beginner",
    tags: ["rosary", "mary", "marian", "daily", "family"],
    prayerTimes: ["evening", "before_sleep", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "spiritual-reading",
    sourceTitle: "Spiritual reading",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Spiritual Reading",
        description: "Read Scripture or a trusted spiritual book in small, steady portions.",
        content:
          "Read slowly for a short time. Choose one sentence to carry into the day and let it shape a concrete decision.",
      },
      zhHant: {
        title: "靈修閱讀",
        description: "以短而穩定的方式閱讀聖經或可靠的靈修書。",
        content:
          "慢慢讀一小段。選一句帶進今天，並讓它影響一個具體決定。",
      },
    },
    category: "formation",
    estimatedMinutes: 10,
    difficulty: "beginner",
    tags: ["scripture", "gospel", "spiritual reading", "formation", "daily"],
    prayerTimes: ["morning", "evening", "before_sleep", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "evening-examen",
    sourceTitle: "Examination of conscience",
    cadence: "daily",
    kind: "task",
    languages: {
      en: {
        title: "Evening Examen",
        description: "Review the day with humility, gratitude, repentance, and hope.",
        content:
          "Place yourself before God. Thank him for one grace, notice one weakness, ask forgiveness, and choose one improvement for tomorrow.",
      },
      zhHant: {
        title: "晚間省察",
        description: "以謙遜、感恩、悔改和希望回顧一天。",
        content:
          "把自己置於天主前。感謝一項恩寵，留意一個軟弱，求寬恕，並為明天選一個可改進的地方。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 3,
    difficulty: "intermediate",
    tags: ["evening", "examen", "confession", "reflection", "daily"],
    prayerTimes: ["before_sleep", "evening"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "sunday-mass",
    sourceTitle: "Sunday Mass",
    cadence: "weekly",
    kind: "task",
    languages: {
      en: {
        title: "Sunday Mass",
        description: "Let Sunday Mass anchor worship, rest, family, and spiritual growth.",
        content:
          "Prepare for Sunday by reading the Mass readings, arriving recollected, and protecting the day as the Lord’s Day.",
      },
      zhHant: {
        title: "主日彌撒",
        description: "讓主日彌撒成為敬禮、休息、家庭和靈性成長的中心。",
        content:
          "以閱讀彌撒讀經、提早收斂到達，並保護主日作為主的日子來準備主日。",
      },
    },
    category: "sacramental_life",
    estimatedMinutes: 30,
    difficulty: "beginner",
    tags: ["mass", "sunday", "eucharist", "family", "weekly"],
    prayerTimes: ["morning", "midday", "evening", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "sunday-communion",
    sourceTitle: "Sunday Communion",
    cadence: "weekly",
    kind: "task",
    languages: {
      en: {
        title: "Sunday Communion",
        description: "Receive Holy Communion on Sundays and Holy Days when properly disposed.",
        content:
          "Prepare your heart before Mass and give thanks afterward. If you cannot receive, make a spiritual communion with faith.",
      },
      zhHant: {
        title: "主日領聖體",
        description: "在準備妥當時，於主日和當守瞻禮領受聖體。",
        content:
          "彌撒前準備心靈，彌撒後感謝。若不能領聖體，就以信德作神領聖體。",
      },
    },
    category: "sacramental_life",
    estimatedMinutes: 5,
    difficulty: "beginner",
    tags: ["communion", "mass", "eucharist", "weekly"],
    prayerTimes: ["morning", "midday", "evening", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "saturday-marian",
    sourceTitle: "Saturday Marian devotion",
    cadence: "weekly",
    kind: "task",
    languages: {
      en: {
        title: "Saturday Marian Devotion",
        description: "Honor Our Lady with a special prayer or Marian act on Saturday.",
        content:
          "Pray a Marian prayer, visit an image of Our Lady, or offer a small act of service in her honor.",
      },
      zhHant: {
        title: "星期六敬禮聖母",
        description: "在星期六以特別祈禱或敬禮行動尊敬聖母。",
        content:
          "誦念一篇聖母經文，探訪聖母像前祈禱，或為敬禮聖母奉獻一件小服務。",
      },
    },
    category: "devotions",
    estimatedMinutes: 5,
    difficulty: "beginner",
    tags: ["mary", "marian", "hail holy queen", "weekly", "traditional prayers"],
    prayerTimes: ["morning", "evening", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "monthly-confession",
    sourceTitle: "Monthly Confession",
    cadence: "monthly",
    kind: "task",
    languages: {
      en: {
        title: "Monthly Confession",
        description: "Return regularly to the sacrament of mercy and joy.",
        content:
          "Choose a monthly confession rhythm. Prepare with an examination of conscience, sincere contrition, and a concrete intention to begin again.",
      },
      zhHant: {
        title: "每月告解",
        description: "定期回到慈悲與喜樂的聖事。",
        content:
          "為告解選定每月節奏。以省察、真誠痛悔和重新開始的具體意向作準備。",
      },
    },
    category: "sacramental_life",
    estimatedMinutes: 10,
    difficulty: "intermediate",
    tags: ["confession", "sacrament", "mercy", "monthly"],
    prayerTimes: ["evening", "before_sleep", "flexible"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "spiritual-direction",
    sourceTitle: "Spiritual guidance",
    cadence: "monthly",
    kind: "task",
    languages: {
      en: {
        title: "Spiritual Guidance",
        description: "Seek prudent guidance to keep your spiritual life honest and concrete.",
        content:
          "Prepare one question, one struggle, and one grace to discuss with a trusted priest or spiritual guide.",
      },
      zhHant: {
        title: "靈修指導",
        description: "尋求明智指導，使靈修生活保持真實而具體。",
        content:
          "準備一個問題、一個掙扎和一項恩寵，與可信賴的神父或靈修導師分享。",
      },
    },
    category: "formation",
    estimatedMinutes: 15,
    difficulty: "advanced",
    tags: ["spiritual direction", "guidance", "formation", "monthly"],
    prayerTimes: ["flexible", "evening"],
    recommendedFor: ["regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "monthly-recollection",
    sourceTitle: "Monthly recollection",
    cadence: "monthly",
    kind: "task",
    languages: {
      en: {
        title: "Monthly Recollection",
        description: "Set aside a longer quiet time to review your direction toward God.",
        content:
          "Choose a block of quiet time for prayer, reading, and examination. Ask what God is inviting you to correct, deepen, or continue.",
      },
      zhHant: {
        title: "每月避靜收斂",
        description: "預留較長安靜時間，檢視自己是否朝向天主前進。",
        content:
          "選一段安靜時間作祈禱、閱讀和省察。問自己天主邀請你修正、加深或繼續什麼。",
      },
    },
    category: "formation",
    estimatedMinutes: 30,
    difficulty: "advanced",
    tags: ["recollection", "retreat", "monthly", "formation", "adoration"],
    prayerTimes: ["flexible", "morning", "evening"],
    recommendedFor: ["regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "annual-retreat",
    sourceTitle: "Annual retreat",
    cadence: "yearly",
    kind: "task",
    languages: {
      en: {
        title: "Annual Retreat",
        description: "Spend dedicated silent time with God for conversion and renewal.",
        content:
          "Plan a yearly retreat or retreat day. Protect silence, pray with Scripture, and leave with one clear next step.",
      },
      zhHant: {
        title: "年度避靜",
        description: "以專注的靜默時間與天主同在，更新和皈依。",
        content:
          "安排年度避靜或一日避靜。保護靜默，用聖經祈禱，並帶著一個清楚的下一步離開。",
      },
    },
    category: "formation",
    estimatedMinutes: 30,
    difficulty: "advanced",
    tags: ["retreat", "yearly", "silence", "conversion"],
    prayerTimes: ["flexible"],
    recommendedFor: ["regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "presence-of-god",
    sourceTitle: "Presence of God",
    cadence: "always",
    kind: "tip",
    languages: {
      en: {
        title: "Presence of God",
        description: "Stay aware that God is near in ordinary moments.",
        content:
          "Use brief aspirations during transitions: before work, after a message, while walking, or before a difficult conversation.",
      },
      zhHant: {
        title: "天主臨在",
        description: "在平凡時刻意識到天主常在身旁。",
        content:
          "在轉換活動時作短誦：工作前、回覆訊息後、走路時，或困難談話前。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 1,
    difficulty: "beginner",
    tags: ["presence", "aspiration", "always", "habit"],
    prayerTimes: ["flexible", "morning", "midday", "evening", "before_sleep"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "gratitude",
    sourceTitle: "Thanksgiving",
    cadence: "always",
    kind: "tip",
    languages: {
      en: {
        title: "Gratitude",
        description: "Thank God for graces, large and small, throughout the day.",
        content:
          "Name one gift and say thank you. Gratitude trains the heart to notice grace instead of only pressure.",
      },
      zhHant: {
        title: "感恩",
        description: "為一天中大小恩寵感謝天主。",
        content:
          "說出一項恩賜並感謝天主。感恩訓練心靈注意恩寵，而不只注意壓力。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 1,
    difficulty: "beginner",
    tags: ["gratitude", "thanksgiving", "always", "habit"],
    prayerTimes: ["flexible", "evening", "before_sleep"],
    recommendedFor: ["all"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "purity-of-intention",
    sourceTitle: "Purity of intention",
    cadence: "always",
    kind: "tip",
    languages: {
      en: {
        title: "Purity of Intention",
        description: "Do things for love of God and renew your intention often.",
        content:
          "Before a task, quietly ask: for whom am I doing this? Offer the action again when vanity, irritation, or discouragement appears.",
      },
      zhHant: {
        title: "意向純正",
        description: "為愛天主而做事，並常更新自己的意向。",
        content:
          "在一件事開始前，安靜地問：我是為誰做這件事？當虛榮、煩躁或灰心出現時，再次奉獻這行動。",
      },
    },
    category: "daily_practices",
    estimatedMinutes: 1,
    difficulty: "intermediate",
    tags: ["intention", "contrition", "atonement", "always", "work"],
    prayerTimes: ["flexible", "morning", "midday"],
    recommendedFor: ["exploring", "regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
  },
  {
    id: "memento-mori",
    sourceTitle: "Live toward eternity",
    cadence: "always",
    kind: "tip",
    languages: {
      en: {
        title: "Live Toward Eternity",
        description: "Let the end of life clarify today’s choices.",
        content:
          "Ask whether today’s choices prepare you to meet God with peace. Choose one act of love that would still matter at the end.",
      },
      zhHant: {
        title: "面向永恆生活",
        description: "讓生命的終點幫助你看清今天的選擇。",
        content:
          "問問今天的選擇是否幫助你平安地迎見天主。選一件到生命終點仍有價值的愛德行動。",
      },
    },
    category: "formation",
    estimatedMinutes: 2,
    difficulty: "advanced",
    tags: ["eternity", "death", "reflection", "always", "conversion"],
    prayerTimes: ["evening", "before_sleep", "flexible"],
    recommendedFor: ["regular", "growing_deeper"],
    sourceUrl: planOfLifeSourceUrl,
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

export function getScoredPietyRecommendations(profile: UserSpiritualProfile) {
  const preferred = (profile.preferredDevotions[0] ?? "").toLowerCase();
  const rhythm = profile.preferredPrayerTime;
  const goal = profile.spiritualGoal.toLowerCase();
  const experienceRank: Record<ExperienceLevel, number> = {
    beginner: 0,
    exploring: 1,
    regular: 2,
    growing_deeper: 3,
  };
  const difficultyRank = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };

  return actsOfPiety
    .map((practice) => {
      let score = 0;
      const difficultyGap =
        difficultyRank[practice.difficulty] - experienceRank[profile.experienceLevel];

      if (practice.estimatedMinutes <= profile.dailyPrayerTimeMinutes) score += 4;
      if (practice.estimatedMinutes <= Math.max(5, profile.dailyPrayerTimeMinutes / 2)) score += 1;
      if (difficultyGap <= 0) score += 3;
      if (difficultyGap === 1) score += 1;
      if (difficultyGap > 1) score -= 4;
      if (practice.recommendedFor.includes("all") || practice.recommendedFor.includes(profile.experienceLevel)) {
        score += 2;
      }
      if (practice.tags.some((tag) => preferred.includes(tag))) score += 5;
      if (practice.prayerTimes.includes(rhythm) || practice.prayerTimes.includes("flexible")) score += 2;
      if (goal.toLowerCase().includes("confession") && practice.category === "sacramental_life") score += 5;
      if (goal.toLowerCase().includes("devotions") && practice.category === "devotions") score += 4;
      if (goal.includes("relationship") && practice.tags.some((tag) => ["mental prayer", "presence", "adoration"].includes(tag))) score += 4;
      if (goal.includes("daily") && practice.cadence === "daily") score += 3;
      if (goal.includes("step") && practice.estimatedMinutes <= 5) score += 2;
      if (profile.experienceLevel === "beginner" && practice.cadence === "always") score += 1;
      if (profile.experienceLevel === "growing_deeper" && ["monthly", "yearly"].includes(practice.cadence)) score += 2;
      return { practice, score };
    })
    .sort((a, b) => b.score - a.score || a.practice.estimatedMinutes - b.practice.estimatedMinutes);
}

export function getRecommendedPlan(profile: UserSpiritualProfile): DailyPlanItem[] {
  const scored = getScoredPietyRecommendations(profile).filter(
    ({ practice, score }) => score > 0 && practice.kind === "task",
  );

  return scored.map(({ practice }, index) => ({
    id: `plan-${practice.id}`,
    practice,
    status: "pending",
    recommendedOrder: index + 1,
  }));
}

export function getRecommendedSchedule(
  profile: UserSpiritualProfile,
  startDate: string,
): PietyScheduleEntry[] {
  return getRecommendedPlan(profile).map((item) => ({
    id: `schedule-${item.practice.id}`,
    pietyId: item.practice.id,
    frequency: item.practice.cadence === "always" ? "daily" : item.practice.cadence,
    startDate,
    repeatDays: item.practice.cadence === "daily" || item.practice.cadence === "always" ? [0, 1, 2, 3, 4, 5, 6] : [],
    repeatTimes: [],
    enabled: true,
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

export const saintProfiles: SaintProfile[] = [
  {
    id: "st-joseph",
    imageSrc: "/saints/st-joseph.png",
    feastDay: "March 19",
    patronage: ["families", "workers", "the universal church"],
    tags: ["humility", "work", "family", "silence"],
    relatedPrayerIds: ["guardian-angel"],
    languages: {
      en: {
        name: "St. Joseph",
        title: "Guardian of Jesus and spouse of Mary",
        introduction:
          "St. Joseph lived hidden fidelity through work, family care, silence, and trust. He protected Jesus and Mary with practical love.",
        patronage: "Families, workers, and the universal Church",
        reflection:
          "Ask St. Joseph to help you work faithfully, protect your family, and respond to God with quiet courage.",
      },
      zhHant: {
        name: "聖若瑟",
        title: "耶穌的監護者、聖母的淨配",
        introduction:
          "聖若瑟以工作、家庭照顧、沉默和信賴活出隱藏的忠信。他以實際的愛保護耶穌和聖母。",
        patronage: "家庭、工人與普世教會",
        reflection:
          "請聖若瑟幫助你忠信工作、守護家庭，並以安靜的勇氣回應天主。",
      },
    },
  },
  {
    id: "st-josemaria",
    imageSrc: "/saints/st-josemaria.png",
    feastDay: "June 26",
    patronage: ["ordinary work", "lay holiness", "daily life"],
    tags: ["work", "holiness", "ordinary life", "plan of life"],
    relatedPrayerIds: ["work-offering"],
    relatedNovenaIds: ["daily-work"],
    languages: {
      en: {
        name: "St. Josemaria Escriva",
        title: "Saint of ordinary life and work",
        introduction:
          "St. Josemaria taught that ordinary work, family life, study, friendship, and rest can become paths to holiness when offered to God.",
        patronage: "Ordinary work, lay holiness, and daily life",
        reflection:
          "Ask St. Josemaria to help you sanctify ordinary duties and turn your daily schedule into a meeting place with God.",
      },
      zhHant: {
        name: "聖施禮華",
        title: "平凡生活與工作的聖人",
        introduction:
          "聖施禮華教導我們：平凡工作、家庭生活、學習、友誼和休息，若奉獻給天主，都能成為成聖道路。",
        patronage: "平凡工作、平信徒成聖與日常生活",
        reflection:
          "請聖施禮華幫助你聖化日常責任，把每日安排變成與天主相遇的地方。",
      },
    },
  },
  {
    id: "st-therese",
    imageSrc: "/saints/st-therese.png",
    feastDay: "October 1",
    patronage: ["missions", "small sacrifices", "trust"],
    tags: ["little way", "trust", "love", "simplicity"],
    relatedPrayerIds: ["hail-mary"],
    languages: {
      en: {
        name: "St. Therese of Lisieux",
        title: "Teacher of the Little Way",
        introduction:
          "St. Therese followed Christ through small acts of love, trust, patience, and simplicity. Her Little Way makes holiness concrete.",
        patronage: "Missions, small sacrifices, and trust",
        reflection:
          "Ask St. Therese to help you offer small sacrifices with love and trust God in simple daily moments.",
      },
      zhHant: {
        name: "聖女小德蘭",
        title: "小路的導師",
        introduction:
          "聖女小德蘭以愛、信賴、忍耐和簡樸的小行動跟隨基督。她的小路使成聖變得具體。",
        patronage: "傳教、小犧牲與信賴",
        reflection:
          "請聖女小德蘭幫助你以愛奉獻小犧牲，並在簡單日常中信賴天主。",
      },
    },
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
  {
    id: "work-offering",
    category: "daily",
    tags: ["work", "offering", "st josemaria", "ordinary life", "工作", "奉獻", "聖施禮華"],
    languages: {
      en: {
        title: "Prayer to Offer Work",
        subtitle: "A short prayer to sanctify ordinary work.",
        text: "Lord Jesus, I offer you my work today. Help me begin with love, work with order, serve others generously, and finish with gratitude. Through the intercession of St. Josemaria, make my ordinary duties a place of meeting with you. Amen.",
      },
      zhHant: {
        title: "奉獻工作的祈禱",
        subtitle: "為聖化平凡工作而作的短禱。",
        text: "主耶穌，我把今天的工作奉獻給祢。求祢幫助我以愛開始，以秩序工作，慷慨服務他人，並以感恩完成。藉聖施禮華的轉禱，使我的平凡責任成為與祢相遇的地方。阿們。",
      },
    },
  },
];

export const novenas: Novena[] = [
  {
    id: "daily-work",
    saintId: "st-josemaria",
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
