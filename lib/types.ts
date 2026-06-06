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

export type OnboardingAnswerKey =
  | "experienceLevel"
  | "dailyPrayerTimeMinutes"
  | "preferredDevotions"
  | "preferredPrayerTime"
  | "spiritualGoal";
