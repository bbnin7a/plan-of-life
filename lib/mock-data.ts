import type {
  ActOfPiety,
  ContentCategory,
  DailyPlanItem,
  OnboardingAnswerKey,
  UserSpiritualProfile,
} from "@/lib/types";

export const defaultProfile: UserSpiritualProfile = {
  experienceLevel: "beginner",
  dailyPrayerTimeMinutes: 10,
  preferredDevotions: ["I’m open to exploring"],
  preferredPrayerTime: "morning",
  spiritualGoal: "Building a daily prayer habit",
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

export const weeklyProgress = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: false },
  { day: "S", done: false },
  { day: "S", done: false },
];
