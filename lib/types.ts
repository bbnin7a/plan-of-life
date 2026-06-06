export type ExperienceLevel = "beginner" | "exploring" | "regular" | "growing_deeper";

export type PreferredPrayerTime =
  | "morning"
  | "midday"
  | "evening"
  | "before_sleep"
  | "flexible";

export type ContentCategory =
  | "daily_practices"
  | "devotions"
  | "formation"
  | "sacramental_life";

export type PrayerLanguage = "en" | "zhHant";

export type PrayerCategory = "foundational" | "marian" | "rosary" | "daily";

export type SacramentalActionType =
  | "confession"
  | "retreat"
  | "mass_prep"
  | "adoration";

export type PracticeStatus = "pending" | "completed" | "skipped";

export type ActOfPiety = {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  content: string;
};

export type UserSpiritualProfile = {
  experienceLevel: ExperienceLevel;
  dailyPrayerTimeMinutes: number;
  preferredDevotions: string[];
  preferredPrayerTime: PreferredPrayerTime;
  spiritualGoal: string;
};

export type PersonalProfile = {
  displayName: string;
  parish: string;
  patronSaint: string;
};

export type AppPreferences = {
  prayerLanguage: PrayerLanguage;
  confessionFrequencyDays: number;
};

export type DailyPlanItem = {
  id: string;
  practice: ActOfPiety;
  status: PracticeStatus;
  recommendedOrder: number;
};

export type CatholicPrayer = {
  id: string;
  category: PrayerCategory;
  tags: string[];
  languages: Record<
    PrayerLanguage,
    {
      title: string;
      subtitle?: string;
      text: string;
    }
  >;
};

export type SacramentalAction = {
  id: string;
  type: SacramentalActionType;
  title: string;
  description: string;
  cadence: string;
  steps: string[];
};

export type ConfessionLogEntry = {
  id: string;
  date: string;
  note: string;
};

export type NovenaDay = {
  day: number;
  title: string;
  reflection: string;
  prayer: string;
  action: string;
};

export type Novena = {
  id: string;
  title: string;
  description: string;
  intentionPrompt: string;
  days: NovenaDay[];
};

export type NovenaProgress = {
  novenaId: string;
  startedAt: string;
  completedDays: number[];
  lastCompletedDate?: string;
  intention: string;
  status: "active" | "completed";
};

export type OnboardingAnswerKey =
  | "experienceLevel"
  | "dailyPrayerTimeMinutes"
  | "preferredDevotions"
  | "preferredPrayerTime"
  | "spiritualGoal";
