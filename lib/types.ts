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

export type UiLanguage = "en" | "zhHant";

export type PrayerCategory = "foundational" | "marian" | "rosary" | "daily";

export type SacramentalActionType =
  | "confession"
  | "retreat"
  | "mass_prep"
  | "adoration";

export type PracticeStatus = "pending" | "completed" | "skipped";

export type PietyCadence = "daily" | "weekly" | "monthly" | "yearly" | "always";

export type PietyDifficulty = "beginner" | "intermediate" | "advanced";

export type PietyFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type PietyKind = "task" | "tip";

export type ActOfPiety = {
  id: string;
  sourceTitle: string;
  cadence: PietyCadence;
  kind: PietyKind;
  languages: Record<
    UiLanguage,
    {
      title: string;
      description: string;
      content: string;
    }
  >;
  category: ContentCategory;
  estimatedMinutes: number;
  difficulty: PietyDifficulty;
  tags: string[];
  prayerTimes: PreferredPrayerTime[];
  recommendedFor: Array<ExperienceLevel | "all">;
  sourceUrl?: string;
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
  uiLanguage: UiLanguage;
  prayerLanguage: PrayerLanguage;
  fontScale: number;
  confessionFrequencyDays: number;
};

export type DailyPlanItem = {
  id: string;
  practice: ActOfPiety;
  status: PracticeStatus;
  recommendedOrder: number;
};

export type PietyScheduleEntry = {
  id: string;
  pietyId: string;
  frequency: PietyFrequency;
  startDate: string;
  repeatDays?: number[];
  repeatTimes?: string[];
  enabled: boolean;
};

export type PietyCompletionEntry = {
  id: string;
  pietyId: string;
  date: string;
  completedAt: string;
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
  cards?: Record<
    PrayerLanguage,
    Array<{
      title: string;
      subtitle?: string;
      text: string;
    }>
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

export type SaintProfile = {
  id: string;
  imageSrc: string;
  feastDay: string;
  patronage: string[];
  tags: string[];
  relatedPrayerIds?: string[];
  relatedNovenaIds?: string[];
  languages: Record<
    UiLanguage,
    {
      name: string;
      title: string;
      introduction: string;
      patronage: string;
      reflection: string;
    }
  >;
};

export type ConfessionLogEntry = {
  id: string;
  date: string;
  note: string;
};

export type PrayerIntention = {
  id: string;
  title: string;
  note: string;
  createdAt: string;
  archived: boolean;
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
  saintId?: string;
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
