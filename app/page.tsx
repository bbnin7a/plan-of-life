"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  Church,
  Clock3,
  ClipboardList,
  Compass,
  Flame,
  Heart,
  Home,
  Languages,
  Medal,
  Moon,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  actsOfPiety,
  catholicPrayers,
  defaultPersonalProfile,
  defaultPreferences,
  defaultProfile,
  dailyPlan,
  getRecommendedPlan,
  getRecommendedSchedule,
  getScoredPietyRecommendations,
  novenas,
  onboardingQuestions,
  sacramentalActions,
} from "@/lib/mock-data";
import type {
  ActOfPiety,
  AppPreferences,
  CatholicPrayer,
  ConfessionLogEntry,
  DailyPlanItem,
  Novena,
  NovenaProgress,
  OnboardingAnswerKey,
  PersonalProfile,
  PietyCompletionEntry,
  PietyFrequency,
  PietyScheduleEntry,
  PrayerCategory,
  PrayerLanguage,
  SacramentalAction,
  UiLanguage,
  UserSpiritualProfile,
} from "@/lib/types";

type AppStage = "welcome" | "onboarding" | "app";
type Tab = "today" | "explore" | "prayers" | "progress" | "profile";
type SelectedDetail =
  | { type: "piety"; pietyId: string; date: string }
  | { type: "novena" };
type PietyAgendaItem = {
  type: "piety";
  id: string;
  piety: ActOfPiety;
  schedule: PietyScheduleEntry;
  date: string;
  completed: boolean;
};
type NovenaAgendaItem = {
  type: "novena";
  id: string;
  novena: Novena;
  progress: NovenaProgress;
  day: number;
  date: string;
  completed: boolean;
};
type AgendaItem = PietyAgendaItem | NovenaAgendaItem;
type CategoryMeta = {
  icon: typeof Sun;
  bgClass: string;
  borderClass: string;
  textClass: string;
  softClass: string;
  labelKey: TranslationKey;
};

const tabItems = [
  { id: "today", labelKey: "tabToday", icon: Home },
  { id: "explore", labelKey: "tabExplore", icon: Compass },
  { id: "prayers", labelKey: "tabPrayers", icon: ScrollText },
  { id: "progress", labelKey: "tabProgress", icon: Award },
  { id: "profile", labelKey: "tabProfile", icon: UserRound },
] as const;

const categoryMeta = {
  daily_practices: {
    icon: Sun,
    bgClass: "bg-primary",
    borderClass: "border-primary-light",
    textClass: "text-primary-dark",
    softClass: "bg-primary-light",
    labelKey: "categoryDailyPractices",
  },
  devotions: {
    icon: Heart,
    bgClass: "bg-blue",
    borderClass: "border-blue",
    textClass: "text-blue",
    softClass: "bg-blue/10",
    labelKey: "categoryDevotions",
  },
  formation: {
    icon: BookOpen,
    bgClass: "bg-yellow",
    borderClass: "border-yellow",
    textClass: "text-yellow",
    softClass: "bg-yellow/20",
    labelKey: "categoryFormation",
  },
  sacramental_life: {
    icon: Church,
    bgClass: "bg-danger",
    borderClass: "border-danger",
    textClass: "text-danger",
    softClass: "bg-danger/10",
    labelKey: "categorySacramentalLife",
  },
} satisfies Record<ActOfPiety["category"], CategoryMeta>;
const prayerLanguageOptions: Array<{ id: PrayerLanguage; label: string; shortLabel: string }> = [
  { id: "en", label: "English", shortLabel: "EN" },
  { id: "zhHant", label: "Traditional Chinese", shortLabel: "繁中" },
];
const uiLanguageOptions: Array<{ id: UiLanguage; label: string; shortLabel: string }> = [
  { id: "zhHant", label: "Traditional Chinese", shortLabel: "繁中" },
  { id: "en", label: "English", shortLabel: "EN" },
];
const fontScaleOptions = [
  { value: 90, labelKey: "fontSmall" },
  { value: 100, labelKey: "fontNormal" },
  { value: 110, labelKey: "fontLarge" },
  { value: 120, labelKey: "fontExtraLarge" },
] as const;
const confessionFrequencyOptions = [
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months" },
] as const;

const uiText = {
  en: {
    appTitle: "Acts of Piety",
    welcomeTitle: "Grow your prayer life step by step",
    welcomeSubtitle: "Build simple Catholic habits with daily acts of piety.",
    getStarted: "Get Started",
    peace: "Peace be with you",
    today: "Today",
    streak: "7 day streak",
    streakValue: "{days} day streak",
    dailyProgress: "Daily progress",
    completeCount: "{completed} of {total} complete",
    noTasksToday: "No acts scheduled for today.",
    nextDaysPreview: "Next days",
    schedule: "Schedule",
    addToSchedule: "Add to schedule",
    scheduled: "Scheduled",
    suggested: "Suggested",
    scheduledFor: "Scheduled for {date}",
    currentNovena: "Current novena",
    prayerDate: "Prayer date",
    cadence: "Rhythm",
    frequencyDaily: "Daily",
    frequencyWeekly: "Weekly",
    frequencyMonthly: "Monthly",
    frequencyYearly: "Yearly",
    dueToday: "Due today",
    previewEmpty: "No upcoming acts in the next few days.",
    minuteGoal: "Your {minutes}-minute goal is ready in small steps.",
    todayPlan: "Today's Spiritual Plan",
    open: "Open",
    done: "Done",
    complete: "Complete",
    back: "Back",
    prayer: "Prayer",
    completed: "Completed",
    markCompleted: "Mark as Completed",
    sacramentalLife: "Sacramental life",
    confessionRhythm: "Confession rhythm",
    date: "Date",
    note: "Note",
    confessionNotePlaceholder: "Grace, counsel, next step",
    addConfession: "Add Confession",
    confessionLog: "Confession log",
    deleteConfession: "Delete confession log from {date}",
    noConfession: "No confession logged yet.",
    prayers: "Prayers",
    commonPrayers: "Common Catholic prayers",
    viewPrayer: "View prayer",
    close: "Close",
    prayerLanguage: "Prayer language",
    searchPrayers: "Search prayers",
    noPrayersFound: "No prayers found",
    noPrayersHint: "Try another title, devotion, or keyword.",
    novena: "Novena",
    dayOf: "Day {day} of {total}",
    intention: "Intention",
    action: "Action",
    novenaComplete: "Novena complete",
    novenaCompleteDetail: "You completed all nine days.",
    continueTomorrow: "Continue Tomorrow",
    completeDay: "Complete Day",
    quit: "Quit",
    novenaActive: "Novena Active",
    startNovena: "Start Novena",
    progress: "Progress",
    progressTitle: "Small steps add up",
    prayerStreak: "day prayer streak",
    streakMetric: "Current streak",
    thisWeek: "This week",
    completedCount: "{count} completed",
    gracePoints: "Grace Points",
    categoryDistribution: "Today's categories",
    badgeHint: "Keep showing up. Your next badge is close.",
    savedTracks: "Saved tracks",
    confessionsLogged: "Confessions logged",
    novenaProgress: "Novena progress",
    noActiveNovena: "No active novena",
    profile: "Profile",
    prayerPath: "Your prayer path",
    growing: "Growing step by step",
    planComplete: "{progress}% of today's plan complete",
    personalProfile: "Personal profile",
    name: "Name",
    namePlaceholder: "Your name",
    parish: "Parish",
    parishPlaceholder: "Parish name",
    patronSaint: "Patron saint",
    patronSaintPlaceholder: "St. Joseph",
    preferences: "Preferences",
    uiLanguage: "UI language",
    defaultPrayerLanguage: "Default prayer language",
    fontSize: "Font size",
    fontSmall: "Small",
    fontNormal: "Normal",
    fontLarge: "Large",
    fontExtraLarge: "XL",
    experience: "Experience",
    prayerTime: "Prayer time",
    preferredDevotion: "Preferred devotion",
    dailyGoal: "Daily goal",
    appUpdate: "App update",
    updateReady: "Ready",
    updateInstall: "Available after install",
    updating: "Updating...",
    updatedRestarting: "Updated. Restarting...",
    updateFailed: "Update failed",
    updateApp: "Update App",
    resetOnboarding: "Reset onboarding",
    clearStorage: "Clear Storage",
    clearStorageConfirm: "Clear all saved Plan of Life data from this device?",
    tabToday: "Today",
    tabExplore: "Explore",
    tabPrayers: "Prayers",
    tabProgress: "Progress",
    tabProfile: "Profile",
    readyForConfession: "Ready for Confession",
    readyForConfessionDetail: "Set a rhythm and record the next confession.",
    confessionDueNow: "Confession due now",
    confessionDueToday: "Confession due today",
    nextConfession: "Next confession in {days} {unit}",
    targetLast: "Target: {target}. Last: {last}.",
    targetWasLast: "Target was {target}. Last: {last}.",
    lastConfession: "Last confession: {last}.",
    daySingular: "day",
    dayPlural: "days",
    categoryDailyPractices: "Daily Practices",
    categoryDevotions: "Devotions",
    categoryFormation: "Formation",
    categorySacramentalLife: "Sacramental Life",
    categoryFoundational: "Foundational",
    categoryMarian: "Marian",
    categoryRosary: "Rosary",
    categoryDaily: "Daily",
    practiceCompleteToast: "{title} complete. +10 Grace Points",
    genericPractice: "Practice",
    novenaStartedToast: "Novena started. Day 1 is ready.",
    novenaCompleteToast: "Novena complete.",
    novenaDayCompleteToast: "Novena day {day} complete.",
    statusActive: "active",
    statusCompleted: "completed",
  },
  zhHant: {
    appTitle: "敬禮生活",
    welcomeTitle: "一步一步培養祈禱生活",
    welcomeSubtitle: "以簡單的天主教敬禮建立每日習慣。",
    getStarted: "開始",
    peace: "願平安與你同在",
    today: "今天",
    streak: "連續 7 天",
    streakValue: "連續 {days} 天",
    dailyProgress: "今日進度",
    completeCount: "已完成 {completed} / {total}",
    noTasksToday: "今天沒有排定敬禮。",
    nextDaysPreview: "接下來幾天",
    schedule: "排程",
    addToSchedule: "加入排程",
    scheduled: "已排程",
    suggested: "建議",
    scheduledFor: "排定日期：{date}",
    currentNovena: "目前九日敬禮",
    prayerDate: "祈禱日期",
    cadence: "節奏",
    frequencyDaily: "每日",
    frequencyWeekly: "每週",
    frequencyMonthly: "每月",
    frequencyYearly: "每年",
    dueToday: "今天",
    previewEmpty: "未來幾天沒有排定敬禮。",
    minuteGoal: "你的 {minutes} 分鐘目標已拆成小步驟。",
    todayPlan: "今日靈修計劃",
    open: "開啟",
    done: "完成",
    complete: "完成",
    back: "返回",
    prayer: "祈禱",
    completed: "已完成",
    markCompleted: "標記為完成",
    sacramentalLife: "聖事生活",
    confessionRhythm: "告解節奏",
    date: "日期",
    note: "備註",
    confessionNotePlaceholder: "恩寵、指導、下一步",
    addConfession: "新增告解",
    confessionLog: "告解紀錄",
    deleteConfession: "刪除 {date} 的告解紀錄",
    noConfession: "尚未紀錄告解。",
    prayers: "經文",
    commonPrayers: "常用天主教經文",
    viewPrayer: "查看經文",
    close: "關閉",
    prayerLanguage: "經文語言",
    searchPrayers: "搜尋經文",
    noPrayersFound: "找不到經文",
    noPrayersHint: "請嘗試其他標題、敬禮或關鍵字。",
    novena: "九日敬禮",
    dayOf: "第 {day} 天 / 共 {total} 天",
    intention: "意向",
    action: "行動",
    novenaComplete: "九日敬禮完成",
    novenaCompleteDetail: "你已完成全部九天。",
    continueTomorrow: "明天繼續",
    completeDay: "完成今天",
    quit: "退出",
    novenaActive: "已有九日敬禮",
    startNovena: "開始九日敬禮",
    progress: "進度",
    progressTitle: "小步驟會累積",
    prayerStreak: "天祈禱連續紀錄",
    streakMetric: "目前連續紀錄",
    thisWeek: "本週",
    completedCount: "已完成 {count}",
    gracePoints: "恩寵點數",
    categoryDistribution: "今日類別分佈",
    badgeHint: "持續前進。下一個徽章已經接近。",
    savedTracks: "已儲存追蹤",
    confessionsLogged: "告解紀錄",
    novenaProgress: "九日敬禮進度",
    noActiveNovena: "沒有進行中的九日敬禮",
    profile: "個人",
    prayerPath: "你的祈禱道路",
    growing: "一步一步成長",
    planComplete: "今日計劃完成 {progress}%",
    personalProfile: "個人資料",
    name: "姓名",
    namePlaceholder: "你的名字",
    parish: "堂區",
    parishPlaceholder: "堂區名稱",
    patronSaint: "主保聖人",
    patronSaintPlaceholder: "聖若瑟",
    preferences: "偏好設定",
    uiLanguage: "介面語言",
    defaultPrayerLanguage: "預設經文語言",
    fontSize: "字體大小",
    fontSmall: "小",
    fontNormal: "正常",
    fontLarge: "大",
    fontExtraLarge: "特大",
    experience: "經驗",
    prayerTime: "祈禱時間",
    preferredDevotion: "偏好敬禮",
    dailyGoal: "每日目標",
    appUpdate: "應用程式更新",
    updateReady: "準備就緒",
    updateInstall: "安裝後可使用",
    updating: "更新中...",
    updatedRestarting: "已更新，正在重新啟動...",
    updateFailed: "更新失敗",
    updateApp: "更新應用程式",
    resetOnboarding: "重設引導",
    clearStorage: "清除儲存資料",
    clearStorageConfirm: "要清除本裝置所有 Plan of Life 儲存資料嗎？",
    tabToday: "今天",
    tabExplore: "探索",
    tabPrayers: "經文",
    tabProgress: "進度",
    tabProfile: "個人",
    readyForConfession: "可以準備告解",
    readyForConfessionDetail: "設定節奏並紀錄下一次告解。",
    confessionDueNow: "告解已到期",
    confessionDueToday: "今天是告解日",
    nextConfession: "距離下次告解還有 {days} {unit}",
    targetLast: "目標：{target}。上次：{last}。",
    targetWasLast: "原目標：{target}。上次：{last}。",
    lastConfession: "上次告解：{last}。",
    daySingular: "天",
    dayPlural: "天",
    categoryDailyPractices: "每日實踐",
    categoryDevotions: "敬禮",
    categoryFormation: "培育",
    categorySacramentalLife: "聖事生活",
    categoryFoundational: "基礎",
    categoryMarian: "聖母",
    categoryRosary: "玫瑰經",
    categoryDaily: "每日",
    practiceCompleteToast: "{title} 已完成。+10 恩寵點數",
    genericPractice: "敬禮",
    novenaStartedToast: "九日敬禮已開始。第 1 天已準備好。",
    novenaCompleteToast: "九日敬禮完成。",
    novenaDayCompleteToast: "九日敬禮第 {day} 天完成。",
    statusActive: "進行中",
    statusCompleted: "已完成",
  },
} as const;

type TranslationKey = keyof typeof uiText.en;
type Translator = (key: TranslationKey, values?: Record<string, string | number>) => string;

function makeTranslator(language: UiLanguage): Translator {
  return (key, values = {}) => {
    const template: string = uiText[language][key] ?? uiText.en[key];
    return Object.entries(values).reduce<string>(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      template,
    );
  };
}

export default function App() {
  const [stage, setStage] = useLocalStorageState<AppStage>(
    "plan-of-life:stage",
    "welcome",
  );
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<OnboardingAnswerKey, string>>>({});
  const [profile, setProfile] = useLocalStorageState<UserSpiritualProfile>(
    "plan-of-life:spiritual-profile",
    defaultProfile,
  );
  const [personalProfile, setPersonalProfile] = useLocalStorageState<PersonalProfile>(
    "plan-of-life:personal-profile",
    defaultPersonalProfile,
  );
  const [preferences, setPreferences] = useLocalStorageState<AppPreferences>(
    "plan-of-life:preferences",
    defaultPreferences,
  );
  const [plan, setPlan] = useLocalStorageState<DailyPlanItem[]>(
    "plan-of-life:daily-plan",
    dailyPlan,
  );
  const [scheduledPieties, setScheduledPieties] = useLocalStorageState<PietyScheduleEntry[]>(
    "plan-of-life:piety-schedule",
    [],
  );
  const [pietyCompletions, setPietyCompletions] = useLocalStorageState<PietyCompletionEntry[]>(
    "plan-of-life:piety-completions",
    [],
  );
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [confessionLogs, setConfessionLogs] = useLocalStorageState<ConfessionLogEntry[]>(
    "plan-of-life:confession-logs",
    [],
  );
  const [novenaProgress, setNovenaProgress] = useLocalStorageState<NovenaProgress | null>(
    "plan-of-life:novena-progress",
    null,
  );
  const uiLanguage = preferences.uiLanguage ?? "zhHant";
  const t = useMemo(() => makeTranslator(uiLanguage), [uiLanguage]);
  const today = getTodayInputDate();
  const currentNovenaItem = useMemo(
    () => getCurrentNovenaAgendaItem(novenaProgress, today),
    [novenaProgress, today],
  );
  const todayAgenda = useMemo(
    () => getAgendaForDate(scheduledPieties, pietyCompletions, today, currentNovenaItem),
    [scheduledPieties, pietyCompletions, today, currentNovenaItem],
  );
  const upcomingAgenda = useMemo(
    () => getUpcomingAgenda(scheduledPieties, pietyCompletions, today, novenaProgress),
    [scheduledPieties, pietyCompletions, today, novenaProgress],
  );
  const completedCount = todayAgenda.filter((item) => item.completed).length;
  const progressValue = todayAgenda.length > 0 ? Math.round((completedCount / todayAgenda.length) * 100) : 0;
  const streakDays = useMemo(
    () => getCompletionStreak(pietyCompletions, novenaProgress, today),
    [pietyCompletions, novenaProgress, today],
  );
  const weekProgress = useMemo(
    () => getWeekProgress(pietyCompletions, novenaProgress, today, uiLanguage),
    [pietyCompletions, novenaProgress, today, uiLanguage],
  );
  const scoredRecommendations = useMemo(
    () => getScoredPietyRecommendations(profile),
    [profile],
  );
  const categoryDistribution = useMemo(
    () => getCategoryDistribution(todayAgenda),
    [todayAgenda],
  );
  const selectedPietyDetail =
    selectedDetail?.type === "piety"
      ? getPietyDetailItem(selectedDetail, scheduledPieties, pietyCompletions)
      : null;
  const selectedNovenaDetail =
    selectedDetail?.type === "novena" ? getCurrentNovenaAgendaItem(novenaProgress, today) : null;
  const selectedPrayer = selectedPrayerId
    ? catholicPrayers.find((prayer) => prayer.id === selectedPrayerId) ?? null
    : null;

  useEffect(() => {
    const fontScale = preferences.fontScale ?? 100;
    document.documentElement.style.fontSize = `${fontScale}%`;
    document.documentElement.dataset.density =
      fontScale <= 90 ? "compact" : fontScale >= 120 ? "roomy" : "normal";
  }, [preferences.fontScale]);

  useEffect(() => {
    if (plan.some((item) => !item.practice.languages)) {
      setPlan(getRecommendedPlan(profile));
    }
  }, [plan, profile, setPlan]);

  useEffect(() => {
    if (stage === "app" && scheduledPieties.length === 0) {
      setScheduledPieties(getRecommendedSchedule(profile, today));
    }
  }, [profile, scheduledPieties.length, setScheduledPieties, stage, today]);

  function chooseAnswer(key: OnboardingAnswerKey, value: string) {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);

    if (questionIndex < onboardingQuestions.length - 1) {
      setTimeout(() => setQuestionIndex((current) => current + 1), 160);
      return;
    }

    const nextProfile = buildProfile(nextAnswers);
    setProfile(nextProfile);
    setPlan(getRecommendedPlan(nextProfile));
    setScheduledPieties(getRecommendedSchedule(nextProfile, getTodayInputDate()));
    setTimeout(() => setStage("app"), 220);
  }

  function completePiety(pietyId: string, date: string) {
    const piety = actsOfPiety.find((entry) => entry.id === pietyId);
    setPietyCompletions((entries) => {
      if (entries.some((entry) => entry.pietyId === pietyId && entry.date === date)) {
        return entries;
      }

      return [
        ...entries,
        {
          id: `piety-completion-${pietyId}-${date}`,
          pietyId,
          date,
          completedAt: new Date().toISOString(),
        },
      ];
    });
    setCompletionMessage(
      t("practiceCompleteToast", {
        title: piety ? getPracticeText(piety, uiLanguage).title : t("genericPractice"),
      }),
    );
    setTimeout(() => setCompletionMessage(null), 1800);
  }

  function togglePietySchedule(pietyId: string, frequency?: PietyFrequency) {
    setScheduledPieties((entries) => {
      const existing = entries.find((entry) => entry.pietyId === pietyId);

      if (existing) {
        return entries.map((entry) =>
          entry.pietyId === pietyId
            ? {
                ...entry,
                frequency: frequency ?? entry.frequency,
                enabled: !entry.enabled,
              }
            : entry,
        );
      }

      const piety = actsOfPiety.find((entry) => entry.id === pietyId);
      return [
        ...entries,
        {
          id: `schedule-${pietyId}`,
          pietyId,
          frequency: frequency ?? getDefaultFrequencyForPiety(piety),
          startDate: getTodayInputDate(),
          enabled: true,
        },
      ];
    });
  }

  function addConfessionLog(date: string, note: string) {
    const entry: ConfessionLogEntry = {
      id: `confession-${Date.now()}`,
      date,
      note: note.trim(),
    };

    setConfessionLogs((logs) =>
      [entry, ...logs].sort((a, b) => b.date.localeCompare(a.date)),
    );
  }

  function deleteConfessionLog(entryId: string) {
    setConfessionLogs((logs) => logs.filter((entry) => entry.id !== entryId));
  }

  function startNovena(novenaId: string, intention: string) {
    setNovenaProgress({
      novenaId,
      startedAt: getTodayInputDate(),
      completedDays: [],
      intention: intention.trim(),
      status: "active",
    });
    setCompletionMessage(t("novenaStartedToast"));
    setTimeout(() => setCompletionMessage(null), 1800);
  }

  function completeNovenaDay(day: number) {
    const today = getTodayInputDate();

    setNovenaProgress((currentProgress) => {
      if (!currentProgress || currentProgress.lastCompletedDate === today) {
        return currentProgress;
      }

      const completedDays = Array.from(new Set([...currentProgress.completedDays, day])).sort(
        (a, b) => a - b,
      );

      return {
        ...currentProgress,
        completedDays,
        lastCompletedDate: today,
        status: completedDays.length >= 9 ? "completed" : "active",
      };
    });

    setCompletionMessage(
      day >= 9 ? t("novenaCompleteToast") : t("novenaDayCompleteToast", { day }),
    );
    setTimeout(() => setCompletionMessage(null), 1800);
  }

  function quitNovena() {
    setNovenaProgress(null);
  }

  function clearStoredAppData() {
    if (!window.confirm(t("clearStorageConfirm"))) {
      return;
    }

    clearPlanOfLifeLocalStorage();
    window.location.reload();
  }

  function resetOnboarding() {
    setQuestionIndex(0);
    setAnswers({});
    setStage("onboarding");
    setActiveTab("today");
    setSelectedDetail(null);
  }

  if (stage === "welcome") {
    return <WelcomeScreen t={t} onStart={() => setStage("onboarding")} />;
  }

  if (stage === "onboarding") {
    return (
      <OnboardingScreen
        questionIndex={questionIndex}
        answers={answers}
        language={uiLanguage}
        onChoose={chooseAnswer}
      />
    );
  }

  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-md flex-col bg-background",
        selectedDetail ? "overflow-visible" : "overflow-hidden",
      )}
    >
      <div className="flex-1 px-4 pb-28 pt-5">
        {selectedPietyDetail ? (
          <PracticeDetail
            key={`${selectedPietyDetail.piety.id}-${selectedPietyDetail.date}`}
            item={selectedPietyDetail}
            language={uiLanguage}
            t={t}
            onBack={() => setSelectedDetail(null)}
            onComplete={() => completePiety(selectedPietyDetail.piety.id, selectedPietyDetail.date)}
          />
        ) : selectedNovenaDetail ? (
          <NovenaDetailScreen
            key={selectedNovenaDetail.id}
            item={selectedNovenaDetail}
            t={t}
            language={uiLanguage}
            onBack={() => setSelectedDetail(null)}
            onComplete={() => completeNovenaDay(selectedNovenaDetail.day)}
          />
        ) : activeTab === "today" ? (
          <TodayScreen
            key="today"
            profile={profile}
            todayAgenda={todayAgenda}
            upcomingAgenda={upcomingAgenda}
            streakDays={streakDays}
            completedCount={completedCount}
            language={uiLanguage}
            progressValue={progressValue}
            t={t}
            onOpenAgendaItem={(item) =>
              setSelectedDetail(
                item.type === "piety"
                  ? { type: "piety", pietyId: item.piety.id, date: item.date }
                  : { type: "novena" },
              )
            }
            onCompletePiety={completePiety}
            onCompleteNovenaDay={completeNovenaDay}
          />
        ) : activeTab === "explore" ? (
          <ExploreScreen
            key="explore"
            confessionFrequencyDays={preferences.confessionFrequencyDays}
            confessionLogs={confessionLogs}
            language={uiLanguage}
            recommendedPieties={scoredRecommendations}
            scheduledPieties={scheduledPieties}
            t={t}
            onAddConfessionLog={addConfessionLog}
            onConfessionFrequencyChange={(confessionFrequencyDays) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                confessionFrequencyDays,
              }))
            }
            onDeleteConfessionLog={deleteConfessionLog}
            onTogglePietySchedule={togglePietySchedule}
          />
        ) : activeTab === "prayers" ? (
          <PrayersScreen
            key="prayers"
            language={preferences.prayerLanguage}
            t={t}
            uiLanguage={uiLanguage}
            novenaProgress={novenaProgress}
            onCompleteNovenaDay={completeNovenaDay}
            onLanguageChange={(prayerLanguage) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                prayerLanguage,
              }))
            }
            onQuitNovena={quitNovena}
            onOpenPrayer={setSelectedPrayerId}
            onStartNovena={startNovena}
          />
        ) : activeTab === "progress" ? (
          <ProgressScreen
            key="progress"
            completedCount={completedCount}
            confessionLogs={confessionLogs}
            streakDays={streakDays}
            categoryDistribution={categoryDistribution}
            t={t}
            weekProgress={weekProgress}
            novenaProgress={novenaProgress}
            progressValue={progressValue}
          />
        ) : (
          <ProfileScreen
            key="profile"
            personalProfile={personalProfile}
            preferences={preferences}
            profile={profile}
            progressValue={progressValue}
            t={t}
            onClearStorage={clearStoredAppData}
            onFontScaleChange={(fontScale) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                fontScale,
              }))
            }
            onPersonalProfileChange={setPersonalProfile}
            onPrayerLanguageChange={(prayerLanguage) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                prayerLanguage,
              }))
            }
            onUiLanguageChange={(nextUiLanguage) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                uiLanguage: nextUiLanguage,
              }))
            }
            onReset={resetOnboarding}
          />
        )}
      </div>

      <AnimatePresence>
        {completionMessage ? <CompletionToast message={completionMessage} /> : null}
      </AnimatePresence>

      {selectedPrayer ? (
        <PrayerDetailDialog
          language={preferences.prayerLanguage}
          prayer={selectedPrayer}
          t={t}
          onClose={() => setSelectedPrayerId(null)}
        />
      ) : null}

      {!selectedDetail ? (
        <BottomNav activeTab={activeTab} t={t} onChange={setActiveTab} />
      ) : null}
    </main>
  );
}

function WelcomeScreen({ t, onStart }: { t: Translator; onStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6 py-8">
      <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <motion.div
          initial={{ scale: 0.88, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="relative grid size-40 place-items-center rounded-full border-8 border-white bg-primary-light shadow-playful"
        >
          <div className="absolute -right-2 top-6 grid size-12 place-items-center rounded-full border-4 border-white bg-yellow">
            <Star className="size-6 fill-white text-white" />
          </div>
          <Church className="size-20 text-primary-dark" strokeWidth={2.8} />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black leading-tight tracking-normal text-foreground">
            {t("welcomeTitle")}
          </h1>
          <p className="text-lg font-bold leading-relaxed text-muted">
            {t("welcomeSubtitle")}
          </p>
        </div>
      </section>

      <Button size="xl" className="w-full" onClick={onStart}>
        {t("getStarted")}
        <ChevronRight className="size-6" />
      </Button>
    </main>
  );
}

function OnboardingScreen({
  questionIndex,
  answers,
  language,
  onChoose,
}: {
  questionIndex: number;
  answers: Partial<Record<OnboardingAnswerKey, string>>;
  language: UiLanguage;
  onChoose: (key: OnboardingAnswerKey, value: string) => void;
}) {
  const safeQuestionIndex = Math.min(questionIndex, onboardingQuestions.length - 1);
  const question = onboardingQuestions[safeQuestionIndex];
  const localizedQuestion = getOnboardingQuestionText(question.id, language);
  const progress = ((safeQuestionIndex + 1) / onboardingQuestions.length) * 100;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 py-6">
      <div className="mb-7 flex items-center gap-3">
        <Progress value={progress} className="h-4 flex-1" />
        <span className="text-sm font-black text-primary-dark">
          {safeQuestionIndex + 1}/{onboardingQuestions.length}
        </span>
      </div>

      <section key={question.id} className="flex flex-1 flex-col">
        <div className="mb-7">
          <div className="mb-4 grid size-16 place-items-center rounded-3xl border-4 border-white bg-blue text-white shadow-playful">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-normal">
            {localizedQuestion.title}
          </h1>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const selected = answers[question.key] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChoose(question.key, option.value)}
                className={cn(
                  "flex min-h-20 w-full items-center justify-between gap-4 rounded-3xl border-4 bg-card px-5 py-4 text-left text-lg font-extrabold shadow-playful transition",
                  selected
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-border text-foreground active:translate-y-1 active:shadow-none",
                )}
              >
                <span>{localizedQuestion.options[index] ?? option.label}</span>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-4",
                    selected ? "border-primary bg-primary text-white" : "border-border",
                  )}
                >
                  {selected ? <Check className="size-5" strokeWidth={4} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function TodayScreen({
  profile,
  todayAgenda,
  upcomingAgenda,
  streakDays,
  completedCount,
  language,
  progressValue,
  t,
  onOpenAgendaItem,
  onCompletePiety,
  onCompleteNovenaDay,
}: {
  profile: UserSpiritualProfile;
  todayAgenda: AgendaItem[];
  upcomingAgenda: AgendaItem[];
  streakDays: number;
  completedCount: number;
  language: UiLanguage;
  progressValue: number;
  t: Translator;
  onOpenAgendaItem: (item: AgendaItem) => void;
  onCompletePiety: (pietyId: string, date: string) => void;
  onCompleteNovenaDay: (day: number) => void;
}) {
  return (
    <ScreenMotion className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-black text-primary-dark">{t("peace")}</p>
          <h1 className="text-3xl font-black tracking-normal">{t("today")}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border-4 border-white bg-yellow px-3 py-2 text-sm font-black shadow-playful">
          <Flame className="size-5 fill-white text-white" />
          {t("streakValue", { days: streakDays })}
        </div>
      </header>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-muted">{t("dailyProgress")}</p>
            <p className="text-2xl font-black">
              {t("completeCount", { completed: completedCount, total: todayAgenda.length })}
            </p>
          </div>
          <div className="grid size-16 place-items-center rounded-full bg-primary-light text-xl font-black text-primary-dark">
            {progressValue}%
          </div>
        </div>
        <Progress value={progressValue} />
        <p className="mt-4 text-base font-bold text-muted">
          {t("minuteGoal", { minutes: profile.dailyPrayerTimeMinutes })}
        </p>
      </Card>

      <section>
        <h2 className="mb-3 text-2xl font-black">{t("todayPlan")}</h2>
        <div className="space-y-4">
          {todayAgenda.length > 0 ? (
            todayAgenda.map((item, index) => (
              <AgendaCard
                key={item.id}
                item={item}
                language={language}
                t={t}
                onOpen={() => onOpenAgendaItem(item)}
                onComplete={() => {
                  if (item.completed) return;
                  if (item.type === "piety") {
                    onCompletePiety(item.piety.id, item.date);
                    return;
                  }

                  onCompleteNovenaDay(item.day);
                }}
            />
            ))
          ) : (
            <Card className="border-4 border-border p-5 text-base font-bold text-muted">
              {t("noTasksToday")}
            </Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-black">{t("nextDaysPreview")}</h2>
        <div className="space-y-3">
          {upcomingAgenda.length > 0 ? (
            upcomingAgenda.map((item) => (
              <AgendaPreviewRow
                key={`${item.id}-preview`}
                item={item}
                language={language}
                t={t}
              />
            ))
          ) : (
            <Card className="border-4 border-border p-4 text-base font-bold text-muted">
              {t("previewEmpty")}
            </Card>
          )}
        </div>
      </section>
    </ScreenMotion>
  );
}

function AgendaCard({
  item,
  language,
  t,
  onOpen,
  onComplete,
}: {
  item: AgendaItem;
  language: UiLanguage;
  t: Translator;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const completed = item.completed;
  const title = getAgendaTitle(item, language);
  const description = getAgendaDescription(item, language, t);
  const minutes = item.type === "piety" ? item.piety.estimatedMinutes : 9;
  const meta = getAgendaCategoryMeta(item);
  const Icon = meta.icon;

  return (
    <Card
      onClick={onOpen}
      className={cn(
        "cursor-pointer border-4 p-4 transition active:translate-y-1 active:shadow-none",
        completed ? `${meta.borderClass} ${meta.softClass}` : "border-border",
      )}
    >
      <div className="flex gap-4">
        <div className={cn("grid size-16 shrink-0 place-items-center rounded-3xl text-white", meta.bgClass)}>
          <Icon className="size-8" strokeWidth={2.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="text-xl font-black leading-tight">{title}</h3>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
              {minutes} min
            </span>
          </div>
          <p className="mb-4 text-base font-bold leading-snug text-muted">
            {description}
          </p>
          <span className={cn("mb-3 inline-flex rounded-full px-3 py-1 text-xs font-black", meta.softClass, meta.textClass)}>
            {item.type === "piety" ? t(meta.labelKey) : t("novena")}
          </span>
          <div className="grid grid-cols-[0.85fr_1.15fr] gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              className="w-full"
            >
              {t("open")}
            </Button>
            <Button
              size="sm"
              variant={completed ? "secondary" : "default"}
              onClick={(event) => {
                event.stopPropagation();
                if (!completed) onComplete();
              }}
              className="w-full"
            >
              {completed ? t("done") : t("complete")}
              <Check className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AgendaPreviewRow({
  item,
  language,
  t,
}: {
  item: AgendaItem;
  language: UiLanguage;
  t: Translator;
}) {
  const meta = getAgendaCategoryMeta(item);
  const Icon = meta.icon;

  return (
    <Card className={cn("border-4 p-4", meta.borderClass)}>
      <div className="flex items-center gap-3">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-white", meta.bgClass)}>
          <Icon className="size-6" strokeWidth={2.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black">{getAgendaTitle(item, language)}</p>
          <p className="text-sm font-bold text-muted">
            {formatDisplayDate(item.date, language)}
            {" · "}
            {item.type === "piety" ? getFrequencyLabel(item.schedule.frequency, t) : t("currentNovena")}
          </p>
        </div>
      </div>
    </Card>
  );
}

function PracticeDetail({
  item,
  language,
  t,
  onBack,
  onComplete,
}: {
  item: PietyAgendaItem;
  language: UiLanguage;
  t: Translator;
  onBack: () => void;
  onComplete: () => void;
}) {
  const completed = item.completed;
  const practiceText = getPracticeText(item.piety, language);
  const meta = getCategoryMeta(item.piety.category);
  const Icon = meta.icon;

  return (
    <ScreenMotion className="flex min-h-[calc(100vh-2.5rem)] flex-col space-y-5">
      <button
        onClick={onBack}
        className="sticky top-3 z-30 w-fit rounded-full border-4 border-border bg-white px-4 py-2 text-base font-black shadow-playful active:translate-y-1 active:shadow-none"
      >
        {t("back")}
      </button>

      <Card className={cn("border-4 p-5", meta.borderClass)}>
        <div className={cn("mb-5 grid size-20 place-items-center rounded-3xl text-white", meta.bgClass)}>
          <Icon className="size-10" strokeWidth={2.8} />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full px-3 py-1 text-sm font-black", meta.softClass, meta.textClass)}>
            {readableCategory(item.piety.category, t)}
          </span>
          <span className="rounded-full bg-yellow px-3 py-1 text-sm font-black text-foreground">
            {item.piety.estimatedMinutes} min
          </span>
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-black text-primary-dark">
            {getFrequencyLabel(item.schedule.frequency, t)}
          </span>
        </div>
        <h1 className="mb-3 text-4xl font-black leading-tight tracking-normal">
          {practiceText.title}
        </h1>
        <p className="text-lg font-bold leading-relaxed text-muted">
          {practiceText.description}
        </p>
      </Card>

      <Card className="border-4 border-yellow p-5">
        <p className="text-sm font-black uppercase text-muted">{t("scheduledFor")}</p>
        <p className="text-2xl font-black">{formatDisplayDate(item.date, language)}</p>
      </Card>

      <Card className="flex-1 border-4 border-border p-5">
        <h2 className="mb-3 text-2xl font-black">{t("prayer")}</h2>
        <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-foreground">
          {practiceText.content}
        </p>
      </Card>

      <Button
        size="xl"
        className="w-full"
        variant={completed ? "secondary" : "default"}
        onClick={onComplete}
      >
        {completed ? t("completed") : t("markCompleted")}
        <Check className="size-6" />
      </Button>
    </ScreenMotion>
  );
}

function NovenaDetailScreen({
  item,
  language,
  t,
  onBack,
  onComplete,
}: {
  item: NovenaAgendaItem;
  language: UiLanguage;
  t: Translator;
  onBack: () => void;
  onComplete: () => void;
}) {
  const currentDay = item.novena.days[item.day - 1];

  return (
    <ScreenMotion className="flex min-h-[calc(100vh-2.5rem)] flex-col space-y-5">
      <button
        onClick={onBack}
        className="sticky top-3 z-30 w-fit rounded-full border-4 border-border bg-white px-4 py-2 text-base font-black shadow-playful active:translate-y-1 active:shadow-none"
      >
        {t("back")}
      </button>

      <Card className="border-4 border-yellow p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-yellow">{t("currentNovena")}</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">
              {item.novena.title}
            </h1>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-yellow text-white">
            <CalendarDays className="size-7" strokeWidth={2.8} />
          </div>
        </div>
        <div className="grid gap-3 rounded-2xl bg-background px-4 py-3">
          <div>
            <p className="text-sm font-black uppercase text-muted">{t("prayerDate")}</p>
            <p className="text-xl font-black">{formatDisplayDate(item.date, language)}</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase text-muted">
              {t("dayOf", { day: item.day, total: item.novena.days.length })}
            </p>
            <p className="text-xl font-black">{currentDay.title}</p>
          </div>
        </div>
      </Card>

      <Card className="flex-1 border-4 border-border p-5">
        <p className="mb-4 text-base font-bold leading-relaxed text-muted">
          {currentDay.reflection}
        </p>
        <h2 className="mb-3 text-2xl font-black">{t("prayer")}</h2>
        <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-foreground">
          {currentDay.prayer}
        </p>
        <div className="mt-5 rounded-2xl bg-background px-4 py-3">
          <p className="text-sm font-black uppercase text-muted">{t("action")}</p>
          <p className="text-base font-black text-foreground">{currentDay.action}</p>
        </div>
      </Card>

      <Button
        size="xl"
        className="w-full"
        variant={item.completed ? "secondary" : "default"}
        disabled={item.completed}
        onClick={onComplete}
      >
        {item.completed ? t("completed") : t("completeDay")}
        <Check className="size-6" />
      </Button>
    </ScreenMotion>
  );
}

function ExploreScreen({
  confessionFrequencyDays,
  confessionLogs,
  language,
  recommendedPieties,
  scheduledPieties,
  t,
  onAddConfessionLog,
  onConfessionFrequencyChange,
  onDeleteConfessionLog,
  onTogglePietySchedule,
}: {
  confessionFrequencyDays: number;
  confessionLogs: ConfessionLogEntry[];
  language: UiLanguage;
  recommendedPieties: Array<{ practice: ActOfPiety; score: number }>;
  scheduledPieties: PietyScheduleEntry[];
  t: Translator;
  onAddConfessionLog: (date: string, note: string) => void;
  onConfessionFrequencyChange: (days: number) => void;
  onDeleteConfessionLog: (entryId: string) => void;
  onTogglePietySchedule: (pietyId: string, frequency?: PietyFrequency) => void;
}) {
  const [confessionDate, setConfessionDate] = useState(getTodayInputDate());
  const [confessionNote, setConfessionNote] = useState("");
  const confessionStatus = getConfessionStatus(confessionLogs, confessionFrequencyDays, t, language);

  function submitConfessionLog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confessionDate) return;

    onAddConfessionLog(confessionDate, confessionNote);
    setConfessionDate(getTodayInputDate());
    setConfessionNote("");
  }

  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">{t("tabExplore")}</p>
        <h1 className="text-3xl font-black tracking-normal">{t("sacramentalLife")}</h1>
      </header>

      <Card className="border-4 border-danger p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-danger">{t("confessionRhythm")}</p>
            <h2 className="text-2xl font-black tracking-normal">{confessionStatus.title}</h2>
            <p className="mt-1 text-base font-bold text-muted">{confessionStatus.detail}</p>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-danger text-white">
            <ClipboardList className="size-7" strokeWidth={2.8} />
          </div>
        </div>

        <Progress value={confessionStatus.progressValue} />

        <div className="mt-5 grid grid-cols-4 gap-1 rounded-[1.5rem] border-4 border-white bg-white p-1 shadow-soft">
          {confessionFrequencyOptions.map((option) => {
            const active = confessionFrequencyDays === option.days;

            return (
              <button
                key={option.days}
                type="button"
                aria-pressed={active}
                onClick={() => onConfessionFrequencyChange(option.days)}
                className={cn(
                  "min-h-11 rounded-2xl px-2 text-xs font-black leading-tight transition",
                  active ? "bg-danger text-white" : "text-muted",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={submitConfessionLog} className="mt-5 grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("date")}</span>
            <input
              type="date"
              value={confessionDate}
              onChange={(event) => setConfessionDate(event.target.value)}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-black text-foreground outline-none focus:border-danger"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("note")}</span>
            <input
              type="text"
              value={confessionNote}
              onChange={(event) => setConfessionNote(event.target.value)}
              placeholder={t("confessionNotePlaceholder")}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-danger"
            />
          </label>

          <Button type="submit" size="lg" className="w-full">
            {t("addConfession")}
            <CalendarPlus className="size-5" />
          </Button>
        </form>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">{t("confessionLog")}</h3>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
              {confessionLogs.length}
            </span>
          </div>

          {confessionLogs.length > 0 ? (
            <div className="divide-y-4 divide-border overflow-hidden rounded-2xl border-4 border-border bg-white">
              {confessionLogs.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
                    <CalendarDays className="size-5" strokeWidth={2.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black">{formatDisplayDate(entry.date, language)}</p>
                    {entry.note ? (
                      <p className="break-words text-sm font-bold text-muted">{entry.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={t("deleteConfession", { date: formatDisplayDate(entry.date, language) })}
                    onClick={() => onDeleteConfessionLog(entry.id)}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-background hover:text-danger"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-4 border-border bg-white p-4 text-base font-bold text-muted">
              {t("noConfession")}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4">
        {sacramentalActions.map((action) => (
          <SacramentalActionCard key={action.id} action={action} language={language} />
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <p className="text-base font-black text-primary-dark">{t("schedule")}</p>
          <h2 className="text-3xl font-black tracking-normal">{t("todayPlan")}</h2>
        </div>
        <div className="grid gap-4">
          {recommendedPieties.map(({ practice: piety, score }) => {
            const schedule = scheduledPieties.find((entry) => entry.pietyId === piety.id);

            return (
              <PietyScheduleCard
                key={piety.id}
                language={language}
                piety={piety}
                score={score}
                schedule={schedule}
                t={t}
                onToggle={() => onTogglePietySchedule(piety.id)}
              />
            );
          })}
        </div>
      </section>
    </ScreenMotion>
  );
}

function PietyScheduleCard({
  language,
  piety,
  score,
  schedule,
  t,
  onToggle,
}: {
  language: UiLanguage;
  piety: ActOfPiety;
  score: number;
  schedule?: PietyScheduleEntry;
  t: Translator;
  onToggle: () => void;
}) {
  const text = getPracticeText(piety, language);
  const frequency = schedule?.frequency ?? getDefaultFrequencyForPiety(piety);
  const meta = getCategoryMeta(piety.category);
  const Icon = meta.icon;

  return (
    <Card className={cn("border-4 p-5", schedule?.enabled ? meta.borderClass : "border-border")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-white", meta.bgClass)}>
          <Icon className="size-6" strokeWidth={2.8} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-black uppercase", meta.textClass)}>
            {getFrequencyLabel(frequency, t)}
          </p>
          <h3 className="text-2xl font-black tracking-normal">{text.title}</h3>
          <p className="mt-1 text-base font-bold leading-relaxed text-muted">
            {text.description}
          </p>
          <p className="mt-2 text-sm font-black text-muted">
            {t(meta.labelKey)}
            {score > 0 ? ` · ${t("suggested")}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-black",
            schedule?.enabled ? "bg-primary-light text-primary-dark" : "bg-background text-muted",
          )}
        >
          {schedule?.enabled ? t("scheduled") : t("cadence")}
        </span>
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        variant={schedule?.enabled ? "secondary" : "default"}
        onClick={onToggle}
      >
        {schedule?.enabled ? t("scheduled") : t("addToSchedule")}
        <CalendarPlus className="size-5" />
      </Button>
    </Card>
  );
}

function SacramentalActionCard({
  action,
  language,
}: {
  action: SacramentalAction;
  language: UiLanguage;
}) {
  const Icon = getSacramentalActionIcon(action.type);
  const actionText = getSacramentalActionText(action, language);

  return (
    <Card className="border-4 border-primary-light p-5">
      <div className="mb-4 flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
          <Icon className="size-7" strokeWidth={2.8} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase text-muted">{actionText.cadence}</p>
          <h2 className="text-2xl font-black tracking-normal">{actionText.title}</h2>
          <p className="mt-1 text-base font-bold leading-relaxed text-muted">
            {actionText.description}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {actionText.steps.map((step) => (
          <div key={step} className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2">
            <Check className="size-5 shrink-0 text-primary-dark" strokeWidth={3.2} />
            <span className="text-base font-black text-foreground">{step}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PrayersScreen({
  language,
  t,
  uiLanguage,
  novenaProgress,
  onCompleteNovenaDay,
  onLanguageChange,
  onQuitNovena,
  onOpenPrayer,
  onStartNovena,
}: {
  language: PrayerLanguage;
  t: Translator;
  uiLanguage: UiLanguage;
  novenaProgress: NovenaProgress | null;
  onCompleteNovenaDay: (day: number) => void;
  onLanguageChange: (language: PrayerLanguage) => void;
  onQuitNovena: () => void;
  onOpenPrayer: (prayerId: string) => void;
  onStartNovena: (novenaId: string, intention: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const visiblePrayers = useMemo(() => {
    if (!normalizedQuery) return catholicPrayers;

    return catholicPrayers.filter((prayer) =>
      getPrayerSearchText(prayer).includes(normalizedQuery),
    );
  }, [normalizedQuery]);
  const visibleNovenas = useMemo(() => {
    if (!normalizedQuery) return novenas;

    return novenas.filter((novena) => getNovenaSearchText(novena).includes(normalizedQuery));
  }, [normalizedQuery]);

  return (
    <ScreenMotion className="space-y-5">
      <header className="space-y-4">
        <div>
          <p className="text-base font-black text-primary-dark">{t("prayers")}</p>
          <h1 className="text-3xl font-black tracking-normal">{t("commonPrayers")}</h1>
        </div>

        <div
          role="group"
          aria-label={t("prayerLanguage")}
          className="grid grid-cols-2 gap-1 rounded-full border-4 border-white bg-white p-1 shadow-soft"
        >
          {prayerLanguageOptions.map((option) => {
            const active = language === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => onLanguageChange(option.id)}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-black leading-tight transition",
                  active ? "bg-primary text-white" : "bg-transparent text-muted",
                )}
              >
                <Languages className="size-4" strokeWidth={3} />
                <span>{option.id === "zhHant" ? option.shortLabel : option.label}</span>
              </button>
            );
          })}
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("searchPrayers")}
            placeholder={t("searchPrayers")}
            className="min-h-14 w-full rounded-full border-4 border-border bg-white py-3 pl-12 pr-4 text-base font-black text-foreground shadow-playful outline-none placeholder:text-muted focus:border-primary"
          />
        </label>
      </header>

      <div className="grid gap-4">
        {visiblePrayers.length > 0 || visibleNovenas.length > 0 ? (
          <>
            {visibleNovenas.map((novena) => (
              <NovenaCard
                key={novena.id}
                novena={novena}
                progress={novenaProgress?.novenaId === novena.id ? novenaProgress : null}
                hasOtherActiveNovena={
                  Boolean(novenaProgress) && novenaProgress?.novenaId !== novena.id
                }
                t={t}
                uiLanguage={uiLanguage}
                onCompleteDay={onCompleteNovenaDay}
                onQuit={onQuitNovena}
                onStart={onStartNovena}
              />
            ))}

            {visiblePrayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                language={language}
                t={t}
                onOpen={() => onOpenPrayer(prayer.id)}
              />
            ))}
          </>
        ) : (
          <Card className="border-4 border-border p-5 text-center">
            <ScrollText className="mx-auto mb-3 size-10 text-primary-dark" />
            <h2 className="text-2xl font-black">{t("noPrayersFound")}</h2>
            <p className="mt-2 text-base font-bold text-muted">
              {t("noPrayersHint")}
            </p>
          </Card>
        )}
      </div>
    </ScreenMotion>
  );
}

function NovenaCard({
  novena,
  progress,
  hasOtherActiveNovena,
  t,
  uiLanguage,
  onCompleteDay,
  onQuit,
  onStart,
}: {
  novena: Novena;
  progress: NovenaProgress | null;
  hasOtherActiveNovena: boolean;
  t: Translator;
  uiLanguage: UiLanguage;
  onCompleteDay: (day: number) => void;
  onQuit: () => void;
  onStart: (novenaId: string, intention: string) => void;
}) {
  const [intention, setIntention] = useState("");
  const completedCount = progress?.completedDays.length ?? 0;
  const currentDayNumber = Math.min(completedCount + 1, novena.days.length);
  const currentDay = novena.days[currentDayNumber - 1];
  const completedToday = progress?.lastCompletedDate === getTodayInputDate();
  const isCompleted = progress?.status === "completed";
  const progressValue = Math.round((completedCount / novena.days.length) * 100);

  function submitNovenaStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart(novena.id, intention);
    setIntention("");
  }

  return (
    <Card className="border-4 border-yellow p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-yellow">{t("novena")}</p>
          <h2 className="text-2xl font-black tracking-normal">{novena.title}</h2>
          <p className="mt-1 text-base font-bold leading-relaxed text-muted">
            {novena.description}
          </p>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow text-white">
          <CalendarDays className="size-6" strokeWidth={2.8} />
        </div>
      </div>

      {progress ? (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase text-muted">
                {isCompleted
                  ? t("complete")
                  : t("dayOf", { day: currentDayNumber, total: novena.days.length })}
              </p>
              <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
                {completedCount}/{novena.days.length}
              </span>
            </div>
            <Progress value={progressValue} />
          </div>

          {progress.intention ? (
            <div className="rounded-2xl bg-background px-4 py-3">
              <p className="text-sm font-black uppercase text-muted">{t("intention")}</p>
              <p className="break-words text-base font-bold text-foreground">
                {progress.intention}
              </p>
            </div>
          ) : null}

          {isCompleted ? (
            <div className="rounded-2xl bg-primary-light px-4 py-3">
              <p className="text-xl font-black text-primary-dark">{t("novenaComplete")}</p>
              <p className="mt-1 text-base font-bold text-muted">
                {t("novenaCompleteDetail")}
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border-4 border-border bg-white p-4">
              <div>
                <p className="text-sm font-black uppercase text-muted">
                  {t("dayOf", { day: currentDay.day, total: novena.days.length })}
                </p>
                <h3 className="text-2xl font-black tracking-normal">{currentDay.title}</h3>
              </div>
              <p className="text-base font-bold leading-relaxed text-muted">
                {currentDay.reflection}
              </p>
            </div>
          )}

          <div className="grid grid-cols-9 gap-1">
            {novena.days.map((day) => {
              const done = progress.completedDays.includes(day.day);

              return (
                <div
                  key={day.day}
                  className={cn(
                    "grid aspect-square place-items-center rounded-full border-4 text-xs font-black",
                    done
                      ? "border-primary bg-primary text-white"
                      : day.day === currentDayNumber && !isCompleted
                        ? "border-yellow bg-yellow text-white"
                        : "border-border bg-white text-muted",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={4} /> : day.day}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={isCompleted || completedToday}
              onClick={() => onCompleteDay(currentDayNumber)}
            >
              {completedToday ? t("continueTomorrow") : t("completeDay")}
              <Check className="size-5" />
            </Button>
            <Button type="button" size="lg" variant="danger" onClick={onQuit}>
              {t("quit")}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitNovenaStart} className="space-y-3">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("intention")}</span>
            <input
              type="text"
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              placeholder={uiLanguage === "zhHant" ? "你想為哪件工作、召叫或責任祈禱？" : novena.intentionPrompt}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-yellow"
            />
          </label>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={hasOtherActiveNovena}
          >
            {hasOtherActiveNovena ? t("novenaActive") : t("startNovena")}
            <CalendarPlus className="size-5" />
          </Button>
        </form>
      )}
    </Card>
  );
}

function PrayerCard({
  prayer,
  language,
  t,
  onOpen,
}: {
  prayer: CatholicPrayer;
  language: PrayerLanguage;
  t: Translator;
  onOpen: () => void;
}) {
  const translation = prayer.languages[language];

  return (
    <Card className="border-4 border-border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-black uppercase text-primary-dark">
            {readablePrayerCategory(prayer.category, t)}
          </p>
          <h2 className="text-2xl font-black tracking-normal">{translation.title}</h2>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
          <ScrollText className="size-6" strokeWidth={2.8} />
        </div>
      </div>

      <p className="text-base font-bold leading-relaxed text-muted">
        {translation.subtitle ?? readablePrayerCategory(prayer.category, t)}
      </p>

      <div className="mt-4 grid gap-3">
        <div className="flex flex-wrap gap-2">
          {prayer.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-light px-3 py-1 text-xs font-black text-primary-dark"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button type="button" size="lg" className="w-full" onClick={onOpen}>
          {t("viewPrayer")}
          <ScrollText className="size-5" />
        </Button>
      </div>
    </Card>
  );
}

function PrayerDetailDialog({
  language,
  prayer,
  t,
  onClose,
}: {
  language: PrayerLanguage;
  prayer: CatholicPrayer;
  t: Translator;
  onClose: () => void;
}) {
  const translation = prayer.languages[language];

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-foreground/40 px-4 pb-4 pt-16">
      <Card className="mx-auto max-h-[82vh] w-full max-w-md overflow-y-auto border-4 border-primary-light p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-primary-dark">
              {readablePrayerCategory(prayer.category, t)}
            </p>
            <h2 className="text-3xl font-black tracking-normal">{translation.title}</h2>
          </div>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-xl font-black text-muted"
          >
            ×
          </button>
        </div>
        <p
          className={cn(
            "whitespace-pre-line font-bold leading-relaxed text-foreground",
            language === "zhHant" ? "text-xl" : "text-lg",
          )}
        >
          {translation.text}
        </p>
        <Button type="button" size="lg" className="mt-5 w-full" onClick={onClose}>
          {t("close")}
        </Button>
      </Card>
    </div>
  );
}

function ProgressScreen({
  categoryDistribution,
  completedCount,
  confessionLogs,
  streakDays,
  t,
  weekProgress,
  novenaProgress,
  progressValue,
}: {
  categoryDistribution: Array<{ category: ActOfPiety["category"]; total: number; completed: number }>;
  completedCount: number;
  confessionLogs: ConfessionLogEntry[];
  streakDays: number;
  t: Translator;
  weekProgress: Array<{ day: string; done: boolean }>;
  novenaProgress: NovenaProgress | null;
  progressValue: number;
}) {
  const novenaCompletedCount = novenaProgress?.completedDays.length ?? 0;

  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">{t("progress")}</p>
        <h1 className="text-3xl font-black tracking-normal">{t("progressTitle")}</h1>
      </header>

      <Card className="border-4 border-yellow p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-full bg-yellow text-white">
            <Flame className="size-10 fill-white" />
          </div>
          <div>
            <p className="text-4xl font-black">{streakDays}</p>
            <p className="text-lg font-black text-muted">{t("streakMetric")}</p>
          </div>
        </div>
      </Card>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">{t("thisWeek")}</h2>
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-black text-primary-dark">
            {t("completedCount", { count: completedCount })}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekProgress.map((day, index) => (
            <div key={`${day.day}-${index}`} className="text-center">
              <div
                className={cn(
                  "mx-auto mb-2 grid size-10 place-items-center rounded-full border-4 text-sm font-black",
                  day.done
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-muted",
                )}
              >
                {day.done ? <Check className="size-5" strokeWidth={4} /> : ""}
              </div>
              <span className="text-xs font-black text-muted">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-4 border-blue p-5">
        <div className="mb-4 flex items-center gap-3">
          <Medal className="size-9 text-blue" />
          <h2 className="text-2xl font-black">{t("gracePoints")}</h2>
        </div>
        <Progress value={progressValue} />
        <p className="mt-4 text-lg font-black text-muted">
          {t("badgeHint")}
        </p>
      </Card>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center gap-3">
          <Award className="size-9 text-primary-dark" />
          <h2 className="text-2xl font-black">{t("categoryDistribution")}</h2>
        </div>
        <div className="grid gap-3">
          {categoryDistribution.length > 0 ? (
            categoryDistribution.map((entry) => (
              <CategoryDistributionRow
                key={entry.category}
                completed={entry.completed}
                category={entry.category}
                t={t}
                total={entry.total}
              />
            ))
          ) : (
            <p className="text-base font-bold text-muted">{t("noTasksToday")}</p>
          )}
        </div>
      </Card>

      <Card className="border-4 border-border p-5">
        <div className="mb-4 flex items-center gap-3">
          <ClipboardList className="size-9 text-primary-dark" />
          <h2 className="text-2xl font-black">{t("savedTracks")}</h2>
        </div>
        <div className="grid gap-3">
          <TrackSummaryRow label={t("confessionsLogged")} value={`${confessionLogs.length}`} />
          <TrackSummaryRow
            label={t("novenaProgress")}
            value={
              novenaProgress
                ? `${novenaCompletedCount}/9 ${getNovenaStatusLabel(novenaProgress.status, t)}`
                : t("noActiveNovena")
            }
          />
        </div>
      </Card>
    </ScreenMotion>
  );
}

function ProfileScreen({
  personalProfile,
  preferences,
  profile,
  progressValue,
  t,
  onClearStorage,
  onFontScaleChange,
  onPersonalProfileChange,
  onPrayerLanguageChange,
  onUiLanguageChange,
  onReset,
}: {
  personalProfile: PersonalProfile;
  preferences: AppPreferences;
  profile: UserSpiritualProfile;
  progressValue: number;
  t: Translator;
  onClearStorage: () => void;
  onFontScaleChange: (fontScale: number) => void;
  onPersonalProfileChange: (profile: PersonalProfile) => void;
  onPrayerLanguageChange: (language: PrayerLanguage) => void;
  onUiLanguageChange: (language: UiLanguage) => void;
  onReset: () => void;
}) {
  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">{t("profile")}</p>
        <h1 className="text-3xl font-black tracking-normal">{t("prayerPath")}</h1>
      </header>

      <Card className="border-4 border-primary-light p-5 text-center">
        <div className="mx-auto mb-4 grid size-24 place-items-center rounded-full bg-primary-light text-primary-dark">
          <ShieldCheck className="size-12" strokeWidth={2.8} />
        </div>
        <h2 className="text-2xl font-black">{t("growing")}</h2>
        <p className="text-base font-bold text-muted">{t("planComplete", { progress: progressValue })}</p>
      </Card>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center gap-3">
          <UserRound className="size-9 text-primary-dark" />
          <h2 className="text-2xl font-black">{t("personalProfile")}</h2>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("name")}</span>
            <input
              type="text"
              value={personalProfile.displayName}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  displayName: event.target.value,
                })
              }
              placeholder={t("namePlaceholder")}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("parish")}</span>
            <input
              type="text"
              value={personalProfile.parish}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  parish: event.target.value,
                })
              }
              placeholder={t("parishPlaceholder")}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">{t("patronSaint")}</span>
            <input
              type="text"
              value={personalProfile.patronSaint}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  patronSaint: event.target.value,
                })
              }
              placeholder={t("patronSaintPlaceholder")}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>
        </div>
      </Card>

      <Card className="border-4 border-blue p-5">
        <div className="mb-4 flex items-center gap-3">
          <Languages className="size-9 text-blue" />
          <h2 className="text-2xl font-black">{t("preferences")}</h2>
        </div>

        <p className="mb-2 text-sm font-black uppercase text-muted">{t("uiLanguage")}</p>
        <div
          role="group"
          aria-label={t("uiLanguage")}
          className="mb-4 grid grid-cols-2 gap-1 rounded-full border-4 border-white bg-white p-1 shadow-soft"
        >
          {uiLanguageOptions.map((option) => {
            const active = (preferences.uiLanguage ?? "zhHant") === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => onUiLanguageChange(option.id)}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-black leading-tight transition",
                  active ? "bg-blue text-white" : "bg-transparent text-muted",
                )}
              >
                <Languages className="size-4" strokeWidth={3} />
                <span>{option.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-sm font-black uppercase text-muted">{t("fontSize")}</p>
        <div
          role="group"
          aria-label={t("fontSize")}
          className="mb-4 grid grid-cols-4 gap-1 rounded-[1.5rem] border-4 border-white bg-white p-1 shadow-soft"
        >
          {fontScaleOptions.map((option) => {
            const active = (preferences.fontScale ?? 100) === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFontScaleChange(option.value)}
                className={cn(
                  "min-h-11 rounded-2xl px-2 text-xs font-black leading-tight transition",
                  active ? "bg-blue text-white" : "text-muted",
                )}
              >
                {t(option.labelKey)}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-sm font-black uppercase text-muted">{t("defaultPrayerLanguage")}</p>
        <div
          role="group"
          aria-label={t("defaultPrayerLanguage")}
          className="grid grid-cols-2 gap-1 rounded-full border-4 border-white bg-white p-1 shadow-soft"
        >
          {prayerLanguageOptions.map((option) => {
            const active = preferences.prayerLanguage === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => onPrayerLanguageChange(option.id)}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-black leading-tight transition",
                  active ? "bg-blue text-white" : "bg-transparent text-muted",
                )}
              >
                <Languages className="size-4" strokeWidth={3} />
                <span>{option.id === "zhHant" ? option.shortLabel : option.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-3">
        <ProfileRow label={t("experience")} value={readableProfileValue(profile.experienceLevel, preferences.uiLanguage ?? "zhHant")} />
        <ProfileRow label={t("prayerTime")} value={readableProfileValue(profile.preferredPrayerTime, preferences.uiLanguage ?? "zhHant")} />
        <ProfileRow
          label={t("preferredDevotion")}
          value={profile.preferredDevotions
            .map((devotion) => readableProfileValue(devotion, preferences.uiLanguage ?? "zhHant"))
            .join(", ")}
        />
        <ProfileRow
          label={t("dailyGoal")}
          value={readableProfileValue(profile.spiritualGoal, preferences.uiLanguage ?? "zhHant")}
        />
      </div>

      <AppUpdateCard t={t} />

      <Button size="lg" variant="secondary" className="w-full" onClick={onReset}>
        <RotateCcw className="size-5" />
        {t("resetOnboarding")}
      </Button>

      <Button size="lg" variant="danger" className="w-full" onClick={onClearStorage}>
        <Trash2 className="size-5" />
        {t("clearStorage")}
      </Button>
    </ScreenMotion>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-4 border-border p-4">
      <p className="text-sm font-black uppercase text-muted">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </Card>
  );
}

function TrackSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background px-4 py-3">
      <p className="text-sm font-black uppercase text-muted">{label}</p>
      <p className="text-xl font-black text-foreground">{value}</p>
    </div>
  );
}

function CategoryDistributionRow({
  category,
  completed,
  total,
  t,
}: {
  category: ActOfPiety["category"];
  completed: number;
  total: number;
  t: Translator;
}) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const progressValue = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("rounded-2xl border-4 p-3", meta.borderClass, meta.softClass)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl text-white", meta.bgClass)}>
            <Icon className="size-5" strokeWidth={2.8} />
          </div>
          <p className="truncate text-base font-black">{t(meta.labelKey)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-muted">
          {completed}/{total}
        </span>
      </div>
      <Progress value={progressValue} />
    </div>
  );
}

function AppUpdateCard({ t }: { t: Translator }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<TranslationKey>("updateReady");

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && process.env.NODE_ENV === "production");
  }, []);

  async function updateApp() {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      setStatus("updateInstall");
      return;
    }

    setIsUpdating(true);
    setStatus("updating");

    try {
      let didReload = false;
      const reloadApp = () => {
        if (didReload) return;
        didReload = true;
        setStatus("updatedRestarting");
        window.setTimeout(() => window.location.reload(), 300);
      };

      const registration =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }));

      await registration.update();

      if (registration.waiting) {
        navigator.serviceWorker.addEventListener("controllerchange", reloadApp, { once: true });
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.setTimeout(reloadApp, 1200);
        return;
      }

      const readyRegistration = await navigator.serviceWorker.ready;
      const worker = readyRegistration.active ?? navigator.serviceWorker.controller;

      if (worker) {
        await requestAppShellRefresh(worker);
      } else {
        await clearAppCaches();
      }

      reloadApp();
    } catch {
      try {
        await clearAppCaches();
        setStatus("updatedRestarting");
        window.setTimeout(() => window.location.reload(), 300);
      } catch {
        setStatus("updateFailed");
        setIsUpdating(false);
      }
    }
  }

  return (
    <Card className="border-4 border-blue p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-blue text-white">
          <RefreshCw className={cn("size-6", isUpdating ? "animate-spin" : "")} strokeWidth={2.8} />
        </div>
        <div>
          <h2 className="text-2xl font-black">{t("appUpdate")}</h2>
          <p className="text-base font-bold text-muted">
            {isSupported ? t(status) : t("updateInstall")}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={updateApp}
        disabled={!isSupported || isUpdating}
      >
        {isUpdating ? t("updating") : t("updateApp")}
        <RefreshCw className={cn("size-5", isUpdating ? "animate-spin" : "")} />
      </Button>
    </Card>
  );
}

function BottomNav({
  activeTab,
  t,
  onChange,
}: {
  activeTab: Tab;
  t: Translator;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-3">
      <div className="grid grid-cols-5 gap-1 rounded-[2rem] border-4 border-white bg-white p-2 shadow-soft">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-3xl text-[0.68rem] font-black leading-tight transition",
                active ? "bg-primary-light text-primary-dark" : "text-muted",
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 3 : 2.4} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function CompletionToast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      className="fixed inset-x-4 bottom-28 z-30 mx-auto max-w-sm rounded-3xl border-4 border-primary bg-white p-4 text-center text-lg font-black shadow-soft"
    >
      <Sparkles className="mx-auto mb-2 size-8 text-yellow" />
      {message}
    </motion.div>
  );
}

function ScreenMotion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ type: "spring", stiffness: 190, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch {
      // Keep the in-memory initial value if stored data cannot be parsed.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Browsers can block storage; keep the current session usable.
    }
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}

function requestAppShellRefresh(worker: ServiceWorker) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while refreshing the app shell."));
    }, 7000);

    function cleanup() {
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    }

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "APP_REFRESHED") {
        cleanup();
        resolve();
      }

      if (event.data?.type === "APP_REFRESH_FAILED") {
        cleanup();
        reject(new Error("The app shell could not be refreshed."));
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    worker.postMessage({ type: "REFRESH_APP" });
  });
}

async function clearAppCaches() {
  if (!("caches" in window)) return;

  const cacheKeys = await window.caches.keys();
  await Promise.all(
    cacheKeys
      .filter((key) => key.startsWith("acts-of-piety"))
      .map((key) => window.caches.delete(key)),
  );
}

function clearPlanOfLifeLocalStorage() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("plan-of-life:"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Leave the app running if storage is unavailable in the current browser.
  }
}

function getSacramentalActionIcon(type: SacramentalAction["type"]) {
  switch (type) {
    case "confession":
      return ClipboardList;
    case "retreat":
      return Clock3;
    case "mass_prep":
      return CalendarCheck2;
    case "adoration":
      return Heart;
  }
}

function getAgendaForDate(
  schedule: PietyScheduleEntry[],
  completions: PietyCompletionEntry[],
  date: string,
  novenaItem: NovenaAgendaItem | null,
) {
  const pietyItems = schedule
    .filter((entry) => isScheduleDueOnDate(entry, date))
    .map((entry) => {
      const piety = actsOfPiety.find((candidate) => candidate.id === entry.pietyId);
      if (!piety) return null;

      return {
        type: "piety" as const,
        id: `agenda-${entry.pietyId}-${date}`,
        piety,
        schedule: entry,
        date,
        completed: hasPietyCompletion(completions, entry.pietyId, date),
      };
    })
    .filter((item): item is PietyAgendaItem => item !== null);

  return novenaItem ? [novenaItem, ...pietyItems] : pietyItems;
}

function getCategoryMeta(category: ActOfPiety["category"]) {
  return categoryMeta[category];
}

function getAgendaCategoryMeta(item: AgendaItem) {
  if (item.type === "novena") {
    return {
      icon: CalendarDays,
      bgClass: "bg-yellow",
      borderClass: "border-yellow",
      textClass: "text-yellow",
      softClass: "bg-yellow/20",
      labelKey: "novena",
    } satisfies CategoryMeta;
  }

  return getCategoryMeta(item.piety.category);
}

function getCategoryDistribution(agenda: AgendaItem[]) {
  const distribution = new Map<
    ActOfPiety["category"],
    { category: ActOfPiety["category"]; total: number; completed: number }
  >();

  agenda.forEach((item) => {
    if (item.type !== "piety") return;

    const current = distribution.get(item.piety.category) ?? {
      category: item.piety.category,
      total: 0,
      completed: 0,
    };

    current.total += 1;
    if (item.completed) current.completed += 1;
    distribution.set(item.piety.category, current);
  });

  return Array.from(distribution.values()).sort((a, b) => b.total - a.total);
}

function getUpcomingAgenda(
  schedule: PietyScheduleEntry[],
  completions: PietyCompletionEntry[],
  today: string,
  novenaProgress: NovenaProgress | null,
) {
  const items: AgendaItem[] = [];

  for (let offset = 1; offset <= 5; offset += 1) {
    const date = toInputDate(addDays(parseInputDate(today), offset));
    const novenaItem = getCurrentNovenaAgendaItem(novenaProgress, date);
    items.push(...getAgendaForDate(schedule, completions, date, novenaItem));
    if (items.length >= 4) break;
  }

  return items.slice(0, 4);
}

function getPietyDetailItem(
  detail: Extract<SelectedDetail, { type: "piety" }>,
  schedule: PietyScheduleEntry[],
  completions: PietyCompletionEntry[],
) {
  const entry = schedule.find((candidate) => candidate.pietyId === detail.pietyId);
  const piety = actsOfPiety.find((candidate) => candidate.id === detail.pietyId);

  if (!entry || !piety) return null;

  return {
    type: "piety" as const,
    id: `agenda-${entry.pietyId}-${detail.date}`,
    piety,
    schedule: entry,
    date: detail.date,
    completed: hasPietyCompletion(completions, entry.pietyId, detail.date),
  };
}

function getCurrentNovenaAgendaItem(
  progress: NovenaProgress | null,
  date: string,
): NovenaAgendaItem | null {
  if (!progress || progress.status === "completed") return null;

  const novena = novenas.find((candidate) => candidate.id === progress.novenaId);
  if (!novena) return null;

  const completedCount = progress.completedDays.length;
  const currentDay = Math.min(completedCount + 1, novena.days.length);
  const completed = progress.lastCompletedDate === date;

  return {
    type: "novena",
    id: `novena-${progress.novenaId}-${date}`,
    novena,
    progress,
    day: currentDay,
    date,
    completed,
  };
}

function isScheduleDueOnDate(entry: PietyScheduleEntry, date: string) {
  if (!entry.enabled || date < entry.startDate) return false;

  const startDate = parseInputDate(entry.startDate);
  const targetDate = parseInputDate(date);
  const dayDifference = getDayDifference(startDate, targetDate);

  switch (entry.frequency) {
    case "daily":
      return true;
    case "weekly":
      return dayDifference % 7 === 0;
    case "monthly":
      return targetDate.getDate() === startDate.getDate();
    case "yearly":
      return targetDate.getMonth() === startDate.getMonth() && targetDate.getDate() === startDate.getDate();
  }
}

function hasPietyCompletion(completions: PietyCompletionEntry[], pietyId: string, date: string) {
  return completions.some((entry) => entry.pietyId === pietyId && entry.date === date);
}

function getCompletionStreak(
  completions: PietyCompletionEntry[],
  novenaProgress: NovenaProgress | null,
  today: string,
) {
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const date = toInputDate(addDays(parseInputDate(today), -offset));
    if (!hasAnyCompletionOnDate(completions, novenaProgress, date)) break;
    streak += 1;
  }

  return streak;
}

function getWeekProgress(
  completions: PietyCompletionEntry[],
  novenaProgress: NovenaProgress | null,
  today: string,
  language: UiLanguage,
) {
  const todayDate = parseInputDate(today);
  const start = addDays(todayDate, -todayDate.getDay());
  const formatter = new Intl.DateTimeFormat(language === "zhHant" ? "zh-Hant" : "en", {
    weekday: "narrow",
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = toInputDate(addDays(start, index));
    return {
      day: formatter.format(parseInputDate(date)),
      done: hasAnyCompletionOnDate(completions, novenaProgress, date),
    };
  });
}

function hasAnyCompletionOnDate(
  completions: PietyCompletionEntry[],
  novenaProgress: NovenaProgress | null,
  date: string,
) {
  return completions.some((entry) => entry.date === date) || novenaProgress?.lastCompletedDate === date;
}

function getDefaultFrequencyForPiety(piety?: ActOfPiety): PietyFrequency {
  if (!piety || piety.cadence === "always") return "daily";
  return piety.cadence;
}

function getFrequencyLabel(frequency: PietyFrequency, t: Translator) {
  const frequencyMap: Record<PietyFrequency, TranslationKey> = {
    daily: "frequencyDaily",
    weekly: "frequencyWeekly",
    monthly: "frequencyMonthly",
    yearly: "frequencyYearly",
  };

  return t(frequencyMap[frequency]);
}

function getAgendaTitle(item: AgendaItem, language: UiLanguage) {
  if (item.type === "novena") return item.novena.title;
  return getPracticeText(item.piety, language).title;
}

function getAgendaDescription(item: AgendaItem, language: UiLanguage, t: Translator) {
  if (item.type === "novena") {
    const currentDay = item.novena.days[item.day - 1];
    return `${t("dayOf", { day: item.day, total: item.novena.days.length })}: ${currentDay.title}`;
  }

  return getPracticeText(item.piety, language).description;
}

function getNovenaStatusLabel(status: NovenaProgress["status"], t: Translator) {
  return status === "completed" ? t("statusCompleted") : t("statusActive");
}

function getConfessionStatus(
  logs: ConfessionLogEntry[],
  frequencyDays: number,
  t: Translator,
  language: UiLanguage,
) {
  const latestLog = logs[0];

  if (!latestLog) {
    return {
      title: t("readyForConfession"),
      detail: t("readyForConfessionDetail"),
      progressValue: 0,
    };
  }

  const today = startOfLocalDay(new Date());
  const lastDate = parseInputDate(latestLog.date);
  const nextDate = addDays(lastDate, frequencyDays);
  const elapsedDays = Math.max(0, getDayDifference(lastDate, today));
  const daysUntilNext = getDayDifference(today, nextDate);
  const progressValue = Math.min(100, Math.round((elapsedDays / frequencyDays) * 100));

  if (daysUntilNext < 0) {
    return {
      title: t("confessionDueNow"),
      detail: t("targetWasLast", {
        target: formatDisplayDate(toInputDate(nextDate), language),
        last: formatDisplayDate(latestLog.date, language),
      }),
      progressValue: 100,
    };
  }

  if (daysUntilNext === 0) {
    return {
      title: t("confessionDueToday"),
      detail: t("lastConfession", { last: formatDisplayDate(latestLog.date, language) }),
      progressValue: 100,
    };
  }

  return {
    title: t("nextConfession", {
      days: daysUntilNext,
      unit: daysUntilNext === 1 ? t("daySingular") : t("dayPlural"),
    }),
    detail: t("targetLast", {
      target: formatDisplayDate(toInputDate(nextDate), language),
      last: formatDisplayDate(latestLog.date, language),
    }),
    progressValue,
  };
}

function getTodayInputDate() {
  return toInputDate(new Date());
}

function parseInputDate(value: string) {
  return startOfLocalDay(new Date(`${value}T00:00:00`));
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDayDifference(startDate: Date, endDate: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string, language: UiLanguage = "en") {
  return new Intl.DateTimeFormat(language === "zhHant" ? "zh-Hant" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseInputDate(value));
}

function buildProfile(
  answers: Partial<Record<OnboardingAnswerKey, string>>,
): UserSpiritualProfile {
  return {
    experienceLevel: (answers.experienceLevel as UserSpiritualProfile["experienceLevel"]) ?? "beginner",
    dailyPrayerTimeMinutes: Number(answers.dailyPrayerTimeMinutes ?? 10),
    preferredDevotions: [answers.preferredDevotions ?? "I’m open to exploring"],
    preferredPrayerTime: (answers.preferredPrayerTime as UserSpiritualProfile["preferredPrayerTime"]) ?? "morning",
    spiritualGoal: answers.spiritualGoal ?? "Growing spiritually step by step",
  };
}

function readableCategory(category: string, t: Translator) {
  const categoryMap: Record<string, TranslationKey> = {
    daily_practices: "categoryDailyPractices",
    devotions: "categoryDevotions",
    formation: "categoryFormation",
    sacramental_life: "categorySacramentalLife",
  };

  const key = categoryMap[category];
  if (key) return t(key);

  return readableValue(category);
}

function readablePrayerCategory(category: PrayerCategory, t: Translator) {
  const categoryMap: Record<PrayerCategory, TranslationKey> = {
    foundational: "categoryFoundational",
    marian: "categoryMarian",
    rosary: "categoryRosary",
    daily: "categoryDaily",
  };

  return t(categoryMap[category]);
}

function getPrayerSearchText(prayer: CatholicPrayer) {
  return [
    prayer.category,
    ...prayer.tags,
    ...Object.values(prayer.languages).flatMap((translation) => [
      translation.title,
      translation.subtitle ?? "",
      translation.text,
    ]),
  ]
    .join(" ")
    .toLocaleLowerCase();
}

function getNovenaSearchText(novena: Novena) {
  return [
    novena.title,
    novena.description,
    novena.intentionPrompt,
    ...novena.days.flatMap((day) => [day.title, day.reflection, day.prayer, day.action]),
  ]
    .join(" ")
    .toLocaleLowerCase();
}

function getPracticeText(practice: DailyPlanItem["practice"], language: UiLanguage) {
  if (!practice.languages) {
    const legacyPractice = practice as DailyPlanItem["practice"] & {
      title?: string;
      description?: string;
      content?: string;
    };

    return {
      title: legacyPractice.title ?? legacyPractice.sourceTitle ?? "",
      description: legacyPractice.description ?? "",
      content: legacyPractice.content ?? "",
    };
  }

  return practice.languages[language] ?? practice.languages.en;
}

function getOnboardingQuestionText(questionId: string, language: UiLanguage) {
  const localizedQuestions: Record<
    string,
    Record<UiLanguage, { title: string; options: string[] }>
  > = {
    experience: {
      en: {
        title: "Which best describes you?",
        options: [
          "I’m new to the Catholic faith",
          "I’m learning and exploring",
          "I practice my faith regularly",
          "I want to grow deeper",
        ],
      },
      zhHant: {
        title: "哪一項最符合你？",
        options: [
          "我是天主教信仰的新朋友",
          "我正在學習和探索",
          "我有穩定實踐信仰",
          "我想更深入成長",
        ],
      },
    },
    time: {
      en: {
        title: "How much time could you usually spend in prayer each day?",
        options: ["2–5 minutes", "5–10 minutes", "10–20 minutes", "20+ minutes"],
      },
      zhHant: {
        title: "你通常每天可以用多少時間祈禱？",
        options: ["2–5 分鐘", "5–10 分鐘", "10–20 分鐘", "20 分鐘以上"],
      },
    },
    devotion: {
      en: {
        title: "Which forms of prayer do you feel most drawn to?",
        options: [
          "Scripture reading",
          "Rosary or Marian prayers",
          "Silent meditation",
          "Traditional prayers",
          "I’m open to exploring",
        ],
      },
      zhHant: {
        title: "你較被哪種祈禱方式吸引？",
        options: ["聖經閱讀", "玫瑰經或聖母經文", "靜默默禱", "傳統經文", "我願意探索"],
      },
    },
    rhythm: {
      en: {
        title: "When do you usually prefer to pray?",
        options: ["Morning", "Midday", "Evening", "Before sleep", "Flexible"],
      },
      zhHant: {
        title: "你通常喜歡在什麼時候祈禱？",
        options: ["早上", "中午", "晚上", "睡前", "彈性"],
      },
    },
    goal: {
      en: {
        title: "What would you like help with most?",
        options: [
          "Building a daily prayer habit",
          "Deepening my relationship with God",
          "Learning traditional Catholic devotions",
          "Preparing better for confession",
          "Growing spiritually step by step",
        ],
      },
      zhHant: {
        title: "你最希望在哪方面得到幫助？",
        options: [
          "建立每日祈禱習慣",
          "加深我與天主的關係",
          "學習傳統天主教敬禮",
          "更好地準備告解",
          "一步一步靈性成長",
        ],
      },
    },
  };

  return localizedQuestions[questionId]?.[language] ?? localizedQuestions[questionId]?.en ?? {
    title: "",
    options: [],
  };
}

function getSacramentalActionText(action: SacramentalAction, language: UiLanguage) {
  const zhHantText: Record<
    SacramentalAction["id"],
    { title: string; description: string; cadence: string; steps: string[] }
  > = {
    confession: {
      title: "告解",
      description: "以穩定的省察、痛悔與恩寵節奏回到慈悲中。",
      cadence: "每月節奏",
      steps: ["省察良心", "選擇告解時間", "作痛悔經", "完成補贖"],
    },
    retreat: {
      title: "避靜",
      description: "預留安靜時間作祈禱、靈修閱讀和重新定向。",
      cadence: "季節性或年度節奏",
      steps: ["選擇避靜日", "帶聖經和筆記", "保留一段靜默", "定下一個下一步"],
    },
    "mass-prep": {
      title: "彌撒準備",
      description: "以讀經祈禱並收斂到達來準備主日彌撒。",
      cadence: "每週節奏",
      steps: ["閱讀主日讀經", "提前到達", "獻上一個意向", "彌撒後感謝"],
    },
    adoration: {
      title: "朝拜聖體",
      description: "花時間在聖體前安靜陪伴主。",
      cadence: "每週或每月節奏",
      steps: ["選定朝拜時間", "保持靜默", "向耶穌說話", "聆聽並記下一個感動"],
    },
  };

  if (language === "zhHant") return zhHantText[action.id];
  return {
    title: action.title,
    description: action.description,
    cadence: action.cadence,
    steps: action.steps,
  };
}

function readableValue(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function readableProfileValue(value: string, language: UiLanguage) {
  if (language === "en") return readableValue(value);

  const zhHantValues: Record<string, string> = {
    beginner: "初學者",
    exploring: "探索中",
    regular: "穩定實踐",
    growing_deeper: "希望更深入",
    morning: "早上",
    midday: "中午",
    evening: "晚上",
    before_sleep: "睡前",
    flexible: "彈性",
    "Scripture reading": "聖經閱讀",
    "Rosary or Marian prayers": "玫瑰經或聖母經文",
    "Silent meditation": "靜默默禱",
    "Traditional prayers": "傳統經文",
    "I’m open to exploring": "我願意探索",
    "Building a daily prayer habit": "建立每日祈禱習慣",
    "Deepening my relationship with God": "加深我與天主的關係",
    "Learning traditional Catholic devotions": "學習傳統天主教敬禮",
    "Preparing better for confession": "更好地準備告解",
    "Growing spiritually step by step": "一步一步靈性成長",
  };

  return zhHantValues[value] ?? readableValue(value);
}
