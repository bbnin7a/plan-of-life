"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Church,
  CircleHelp,
  Clock3,
  ClipboardList,
  Compass,
  Flame,
  FolderOpen,
  Heart,
  Home,
  Languages,
  Medal,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ScrollText,
  Search,
  ShieldCheck,
  Smartphone,
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
import packageInfo from "@/package.json";
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
  saintProfiles,
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
  PrayerIntention,
  PrayerLanguage,
  SacramentalAction,
  SaintProfile,
  UiLanguage,
  UserSpiritualProfile,
} from "@/lib/types";

const CURRENT_APP_VERSION = packageInfo.version;

type AppStage = "welcome" | "onboarding" | "app";
type Tab = "today" | "explore" | "prayers" | "progress" | "profile";
type PrayerTab = "intentions" | "prayers" | "favorites";
type PrayerFilter = "all" | "novena" | PrayerCategory;
type ExploreLibraryCategory = "sacramental" | "piety" | "saints";
type SelectedDetail =
  | { type: "piety"; pietyId: string; date: string }
  | { type: "novena" }
  | { type: "calendar"; date: string };
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
type LifeRhythmStats = {
  activeDays: number;
  badgePoints: number;
  totalCompletions: number;
  weeklyConsistency: number;
};

const tabItems = [
  { id: "today", labelKey: "tabToday", icon: Home },
  { id: "explore", labelKey: "tabExplore", icon: Compass },
  { id: "prayers", labelKey: "tabPrayers", icon: ScrollText },
  { id: "progress", labelKey: "tabProgress", icon: Award },
  { id: "profile", labelKey: "tabProfile", icon: UserRound },
] as const;
const orientationSteps = [
  {
    tab: "today",
    icon: Home,
    titleKey: "orientationTodayTitle",
    detailKey: "orientationTodayDetail",
  },
  {
    tab: "explore",
    icon: Compass,
    titleKey: "orientationExploreTitle",
    detailKey: "orientationExploreDetail",
  },
  {
    tab: "prayers",
    icon: ScrollText,
    titleKey: "orientationPrayersTitle",
    detailKey: "orientationPrayersDetail",
  },
  {
    tab: "progress",
    icon: Award,
    titleKey: "orientationProgressTitle",
    detailKey: "orientationProgressDetail",
  },
  {
    tab: "profile",
    icon: UserRound,
    titleKey: "orientationProfileTitle",
    detailKey: "orientationProfileDetail",
  },
] as const satisfies Array<{
  tab: Tab;
  icon: typeof Home;
  titleKey: TranslationKey;
  detailKey: TranslationKey;
}>;

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
const frequencyOptions: PietyFrequency[] = ["daily", "weekly", "monthly", "yearly"];

const uiText = {
  en: {
    appTitle: "生活計劃 Plan of Life",
    appSlogan: "Small faithful steps, every day with God.",
    mascotEncouragementTitle: "Keep walking",
    mascotEncouragementDetail: "Your rhythm is growing. One faithful step today still counts.",
    loading: "Loading...",
    preparingApp: "Preparing your plan",
    welcomeTitle: "Grow your prayer life step by step",
    welcomeSubtitle: "Build simple Catholic habits with daily acts of piety.",
    getStarted: "Get Started",
    peace: "Peace be with you",
    friendName: "friend",
    today: "Today",
    todayTips: "Today tips",
    todayNews: "This month",
    saintFeastsThisMonth: "Saint feast celebrations",
    noSaintFeastsThisMonth: "No saint feast samples for this month.",
    completedTasks: "Completed",
    tip: "Tip",
    streak: "7 day streak",
    streakValue: "{days} day streak",
    dailyProgress: "Daily progress",
    completeCount: "{completed} of {total} complete",
    noTasksToday: "No acts scheduled for today.",
    tasksForDate: "Tasks for {date}",
    calendar: "Calendar",
    monthlyCalendar: "Monthly calendar",
    openCalendar: "Open calendar",
    taskCount: "{count} tasks",
    noTasksForDate: "No tasks scheduled for this day.",
    nextDaysPreview: "Next days",
    schedule: "Schedule",
    addToSchedule: "Add to schedule",
    scheduled: "Scheduled",
    suggested: "Suggested",
    scheduledFor: "Scheduled for {date}",
    suggestedFrequency: "Suggested frequency",
    startDate: "Start date",
    repeatDays: "Repeat days",
    repeatTimes: "Repeat times",
    addTime: "Add time",
    noRepeatTimes: "No times selected",
    scheduleDetails: "Schedule details",
    scheduleWizard: "Schedule setup",
    scheduleStepReview: "Review",
    scheduleStepRepeat: "Repeat",
    scheduleStepTime: "Time",
    configureSchedule: "Configure schedule",
    next: "Next",
    previous: "Previous",
    saveSchedule: "Save schedule",
    practiceInfo: "Practice info",
    howToImprove: "How to do this better",
    howToImproveDetail: "Start small, keep the time realistic, and review the act after you complete it.",
    preferredTimes: "Suggested time",
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
    library: "Library",
    spiritualLibrary: "Spiritual library",
    librarySubtitle: "Browse sacramental life, acts of piety, and saints.",
    backToLibrary: "Back to library",
    folderSacramentalLife: "Sacramental Life",
    folderPiety: "Acts of Piety",
    folderSaints: "Saints",
    saints: "Saints",
    feastDay: "Feast day",
    patronage: "Patronage",
    relatedPrayers: "Related prayers",
    relatedNovenas: "Related novenas",
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
    prayerTabIntentions: "Prayer intention",
    prayerTabPrayers: "Prayers",
    prayerTabFavorites: "My prayers",
    myPrayers: "My prayers",
    favoritePrayer: "Favorite prayer",
    unfavoritePrayer: "Remove favorite",
    noFavoritePrayers: "No favorite prayers yet.",
    noFavoritePrayersHint: "Mark prayers with the heart button to save them here.",
    viewPrayer: "View prayer",
    openCards: "Open cards",
    flipCard: "Flip card",
    cardFront: "Card front",
    cardBack: "Prayer text",
    browseAllCards: "Browse all cards",
    currentCard: "Current card",
    typePrayers: "Prayers",
    typeNovena: "Novena",
    typeLitany: "Litany",
    typeRosary: "Rosary",
    previousCard: "Previous card",
    nextCard: "Next card",
    close: "Close",
    prayerLanguage: "Prayer language",
    searchPrayers: "Search prayers",
    filterAll: "All",
    filterNovena: "Novenas",
    noPrayersFound: "No prayers found",
    noPrayersHint: "Try another title, devotion, or keyword.",
    prayerIntentions: "Prayer intentions",
    intentionTitle: "Intention title",
    intentionTitlePlaceholder: "Who or what are you praying for?",
    intentionNotePlaceholder: "Optional details or next step",
    addIntention: "Add intention",
    archiveIntention: "Archive intention",
    noPrayerIntentions: "No prayer intentions saved yet.",
    novena: "Novena",
    dayOf: "Day {day} of {total}",
    intention: "Intention",
    action: "Action",
    novenaComplete: "Novena complete",
    novenaCompleteDetail: "You completed all nine days.",
    continueTomorrow: "Continue Tomorrow",
    completeDay: "Complete Day",
    quit: "Quit",
    quitNovenaConfirm: "Quit this novena? Your current novena progress will be removed.",
    novenaActive: "Novena Active",
    startNovena: "Start Novena",
    progress: "Progress",
    progressTitle: "Small steps add up",
    prayerStreak: "day prayer streak",
    streakMetric: "Current streak",
    thisWeek: "This week",
    completedCount: "{count} completed",
    gracePoints: "Grace Points",
    lifeRhythm: "Life rhythm",
    totalActsCompleted: "Total acts",
    activeDays: "Active days",
    weeklyConsistency: "Weekly consistency",
    badgePoints: "Badge points",
    nextMilestone: "Next milestone",
    categoryDistribution: "Today's categories",
    badgeHint: "Badges now reward consistent practice over time, not only today's checklist.",
    badges: "Badges",
    badgeUnlocked: "Unlocked",
    badgeLocked: "Locked",
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
    edit: "Edit",
    save: "Save",
    notSet: "Not set",
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
    appVersion: "App version",
    currentVersion: "Current version",
    installedVersion: "Installed version",
    helpAndSetup: "Help and setup",
    installApp: "Install app",
    installGuide: "Install guide",
    installGuideDetail: "Add this app to your phone home screen for offline-style access.",
    androidInstall: "Android",
    androidInstallStep1: "Open this app in Chrome.",
    androidInstallStep2: "Tap the three-dot menu.",
    androidInstallStep3: "Choose Add to Home screen or Install app.",
    androidInstallStep4: "Confirm Install.",
    iosInstall: "iPhone",
    iosInstallStep1: "Open this app in Safari.",
    iosInstallStep2: "Tap the Share button.",
    iosInstallStep3: "Choose Add to Home Screen.",
    iosInstallStep4: "Tap Add.",
    orientation: "Orientation",
    orientationButton: "Open orientation",
    orientationTitle: "Quick orientation",
    orientationSubtitle: "A short tour of the main screens.",
    orientationHighlight: "Highlighted",
    orientationTodayTitle: "Today",
    orientationTodayDetail: "See today's acts, current novena, tips, streak, and upcoming preview.",
    orientationExploreTitle: "Explore",
    orientationExploreDetail: "Browse sacramental life, acts of piety, saints, and schedule practices.",
    orientationPrayersTitle: "Prayers",
    orientationPrayersDetail: "Save intentions, browse prayers, favorite prayers, and join novenas.",
    orientationProgressTitle: "Progress",
    orientationProgressDetail: "Review streaks, badges, completion history, and category balance.",
    orientationProfileTitle: "Profile",
    orientationProfileDetail: "Edit your profile, preferences, version updates, install help, and storage tools.",
    finishOrientation: "Finish tour",
    skipOrientation: "Skip",
    newUpdateFound: "New update found",
    newUpdateDetail: "Version {version} is ready with new improvements.",
    alreadyLatest: "Already latest",
    alreadyLatestDetail: "You are using the latest version.",
    acknowledgeUpdate: "Got it",
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
    appTitle: "生活計劃 Plan of Life",
    appSlogan: "每日忠信小步，與主同行。",
    mascotEncouragementTitle: "繼續同行",
    mascotEncouragementDetail: "你的生活節奏正在成長。今天忠信的一小步也算數。",
    loading: "載入中...",
    preparingApp: "正在準備你的計劃",
    welcomeTitle: "一步一步培養祈禱生活",
    welcomeSubtitle: "以簡單的天主教敬禮建立每日習慣。",
    getStarted: "開始",
    peace: "願平安與你同在",
    friendName: "朋友",
    today: "今天",
    todayTips: "今日提示",
    todayNews: "本月消息",
    saintFeastsThisMonth: "聖人慶日",
    noSaintFeastsThisMonth: "本月沒有聖人慶日範例。",
    completedTasks: "已完成",
    tip: "提示",
    streak: "連續 7 天",
    streakValue: "連續 {days} 天",
    dailyProgress: "今日進度",
    completeCount: "已完成 {completed} / {total}",
    noTasksToday: "今天沒有排定敬禮。",
    tasksForDate: "{date} 的任務",
    calendar: "日曆",
    monthlyCalendar: "月曆",
    openCalendar: "開啟日曆",
    taskCount: "{count} 項任務",
    noTasksForDate: "這一天沒有排定敬禮。",
    nextDaysPreview: "接下來幾天",
    schedule: "排程",
    addToSchedule: "加入排程",
    scheduled: "已排程",
    suggested: "建議",
    scheduledFor: "排定日期：{date}",
    suggestedFrequency: "建議頻率",
    startDate: "開始日期",
    repeatDays: "重複日子",
    repeatTimes: "重複時間",
    addTime: "加入時間",
    noRepeatTimes: "尚未選擇時間",
    scheduleDetails: "排程細節",
    scheduleWizard: "設定排程",
    scheduleStepReview: "檢視",
    scheduleStepRepeat: "重複",
    scheduleStepTime: "時間",
    configureSchedule: "設定排程",
    next: "下一步",
    previous: "上一步",
    saveSchedule: "儲存排程",
    practiceInfo: "敬禮資訊",
    howToImprove: "如何做得更好",
    howToImproveDetail: "從小步驟開始，保持時間實際，完成後簡短回顧。",
    preferredTimes: "建議時間",
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
    library: "圖書館",
    spiritualLibrary: "靈修圖書館",
    librarySubtitle: "瀏覽聖事生活、敬禮行動與聖人。",
    backToLibrary: "返回圖書館",
    folderSacramentalLife: "聖事生活",
    folderPiety: "敬禮行動",
    folderSaints: "聖人",
    saints: "聖人",
    feastDay: "慶日",
    patronage: "主保",
    relatedPrayers: "相關經文",
    relatedNovenas: "相關九日敬禮",
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
    prayerTabIntentions: "祈禱意向",
    prayerTabPrayers: "經文",
    prayerTabFavorites: "我的經文",
    myPrayers: "我的經文",
    favoritePrayer: "加入最愛經文",
    unfavoritePrayer: "移除最愛",
    noFavoritePrayers: "尚未加入最愛經文。",
    noFavoritePrayersHint: "按下心形按鈕，就可把經文儲存在這裡。",
    viewPrayer: "查看經文",
    openCards: "打開卡牌",
    flipCard: "翻牌",
    cardFront: "卡牌正面",
    cardBack: "經文內容",
    browseAllCards: "瀏覽全部卡牌",
    currentCard: "目前卡牌",
    typePrayers: "經文",
    typeNovena: "九日敬禮",
    typeLitany: "連禱",
    typeRosary: "玫瑰經",
    previousCard: "上一張卡",
    nextCard: "下一張卡",
    close: "關閉",
    prayerLanguage: "經文語言",
    searchPrayers: "搜尋經文",
    filterAll: "全部",
    filterNovena: "九日敬禮",
    noPrayersFound: "找不到經文",
    noPrayersHint: "請嘗試其他標題、敬禮或關鍵字。",
    prayerIntentions: "祈禱意向",
    intentionTitle: "意向標題",
    intentionTitlePlaceholder: "你想為誰或什麼祈禱？",
    intentionNotePlaceholder: "可選：細節或下一步",
    addIntention: "新增意向",
    archiveIntention: "封存意向",
    noPrayerIntentions: "尚未儲存祈禱意向。",
    novena: "九日敬禮",
    dayOf: "第 {day} 天 / 共 {total} 天",
    intention: "意向",
    action: "行動",
    novenaComplete: "九日敬禮完成",
    novenaCompleteDetail: "你已完成全部九天。",
    continueTomorrow: "明天繼續",
    completeDay: "完成今天",
    quit: "退出",
    quitNovenaConfirm: "要退出這個九日敬禮嗎？目前進度將會移除。",
    novenaActive: "已有九日敬禮",
    startNovena: "開始九日敬禮",
    progress: "進度",
    progressTitle: "小步驟會累積",
    prayerStreak: "天祈禱連續紀錄",
    streakMetric: "目前連續紀錄",
    thisWeek: "本週",
    completedCount: "已完成 {count}",
    gracePoints: "恩寵點數",
    lifeRhythm: "生活節奏",
    totalActsCompleted: "累計完成",
    activeDays: "活躍日數",
    weeklyConsistency: "本週穩定度",
    badgePoints: "徽章點數",
    nextMilestone: "下一個里程碑",
    categoryDistribution: "今日類別分佈",
    badgeHint: "徽章現在更重視長期穩定實踐，而不只是今天完成幾項。",
    badges: "徽章",
    badgeUnlocked: "已取得",
    badgeLocked: "未取得",
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
    edit: "編輯",
    save: "儲存",
    notSet: "未設定",
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
    appVersion: "應用程式版本",
    currentVersion: "目前版本",
    installedVersion: "已記錄版本",
    helpAndSetup: "說明與設定",
    installApp: "安裝應用程式",
    installGuide: "安裝指南",
    installGuideDetail: "把此應用程式加到手機主畫面，方便像 App 一樣使用。",
    androidInstall: "Android",
    androidInstallStep1: "用 Chrome 開啟此應用程式。",
    androidInstallStep2: "點選右上角三點選單。",
    androidInstallStep3: "選擇「新增至主畫面」或「安裝應用程式」。",
    androidInstallStep4: "確認安裝。",
    iosInstall: "iPhone",
    iosInstallStep1: "用 Safari 開啟此應用程式。",
    iosInstallStep2: "點選分享按鈕。",
    iosInstallStep3: "選擇「加入主畫面」。",
    iosInstallStep4: "點選「新增」。",
    orientation: "導覽",
    orientationButton: "開啟導覽",
    orientationTitle: "快速導覽",
    orientationSubtitle: "簡短認識主要畫面。",
    orientationHighlight: "目前焦點",
    orientationTodayTitle: "今天",
    orientationTodayDetail: "查看今日敬禮、進行中的九日敬禮、提示、連續紀錄和接下來預覽。",
    orientationExploreTitle: "探索",
    orientationExploreDetail: "瀏覽聖事生活、敬禮、聖人，並安排靈修實踐。",
    orientationPrayersTitle: "經文",
    orientationPrayersDetail: "儲存祈禱意向、瀏覽經文、加入最愛，並參與九日敬禮。",
    orientationProgressTitle: "進度",
    orientationProgressDetail: "查看連續紀錄、徽章、完成紀錄和今日類別分佈。",
    orientationProfileTitle: "個人",
    orientationProfileDetail: "編輯個人資料、偏好設定、版本更新、安裝說明和儲存工具。",
    finishOrientation: "完成導覽",
    skipOrientation: "略過",
    newUpdateFound: "發現新更新",
    newUpdateDetail: "{version} 版本已準備好，包含新的改進。",
    alreadyLatest: "已是最新版本",
    alreadyLatestDetail: "你正在使用最新版本。",
    acknowledgeUpdate: "知道了",
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
  const [stage, setStage, stageHydrated] = useLocalStorageState<AppStage>(
    "plan-of-life:stage",
    "welcome",
  );
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<OnboardingAnswerKey, string>>>({});
  const [profile, setProfile, profileHydrated] = useLocalStorageState<UserSpiritualProfile>(
    "plan-of-life:spiritual-profile",
    defaultProfile,
  );
  const [personalProfile, setPersonalProfile, personalProfileHydrated] = useLocalStorageState<PersonalProfile>(
    "plan-of-life:personal-profile",
    defaultPersonalProfile,
  );
  const [preferences, setPreferences, preferencesHydrated] = useLocalStorageState<AppPreferences>(
    "plan-of-life:preferences",
    defaultPreferences,
  );
  const [plan, setPlan, planHydrated] = useLocalStorageState<DailyPlanItem[]>(
    "plan-of-life:daily-plan",
    dailyPlan,
  );
  const [scheduledPieties, setScheduledPieties, scheduledPietiesHydrated] = useLocalStorageState<PietyScheduleEntry[]>(
    "plan-of-life:piety-schedule",
    [],
  );
  const [pietyCompletions, setPietyCompletions, pietyCompletionsHydrated] = useLocalStorageState<PietyCompletionEntry[]>(
    "plan-of-life:piety-completions",
    [],
  );
  const [prayerIntentions, setPrayerIntentions, prayerIntentionsHydrated] = useLocalStorageState<PrayerIntention[]>(
    "plan-of-life:prayer-intentions",
    [],
  );
  const [favoritePrayerIds, setFavoritePrayerIds, favoritePrayerIdsHydrated] = useLocalStorageState<string[]>(
    "plan-of-life:favorite-prayers",
    [],
  );
  const [lastSeenAppVersion, setLastSeenAppVersion, lastSeenAppVersionHydrated] = useLocalStorageState<string>(
    "plan-of-life:app-version",
    CURRENT_APP_VERSION,
  );
  const [orientationSeen, setOrientationSeen, orientationSeenHydrated] = useLocalStorageState<boolean>(
    "plan-of-life:orientation-seen",
    false,
  );
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [selectedNovenaId, setSelectedNovenaId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [orientationStepIndex, setOrientationStepIndex] = useState(0);
  const [confessionLogs, setConfessionLogs, confessionLogsHydrated] = useLocalStorageState<ConfessionLogEntry[]>(
    "plan-of-life:confession-logs",
    [],
  );
  const [novenaProgress, setNovenaProgress, novenaProgressHydrated] = useLocalStorageState<NovenaProgress | null>(
    "plan-of-life:novena-progress",
    null,
  );
  const [showSplash, setShowSplash] = useState(true);
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
  const lifeStats = useMemo(
    () => getLifeRhythmStats(pietyCompletions, novenaProgress, today),
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
  const todayTips = useMemo(
    () =>
      scoredRecommendations
        .filter(({ practice, score }) => practice.kind === "tip" && score > 0)
        .map(({ practice }) => practice),
    [scoredRecommendations],
  );
  const currentMonthSaintFeasts = useMemo(
    () => getSaintFeastsForMonth(today),
    [today],
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
  const selectedCalendarDate = selectedDetail?.type === "calendar" ? selectedDetail.date : null;
  const selectedPrayer = selectedPrayerId
    ? catholicPrayers.find((prayer) => prayer.id === selectedPrayerId) ?? null
    : null;
  const selectedNovena = selectedNovenaId
    ? novenas.find((novena) => novena.id === selectedNovenaId) ?? null
    : null;
  const storageHydrated =
    stageHydrated &&
    profileHydrated &&
    personalProfileHydrated &&
    preferencesHydrated &&
    planHydrated &&
    scheduledPietiesHydrated &&
    pietyCompletionsHydrated &&
    prayerIntentionsHydrated &&
    favoritePrayerIdsHydrated &&
    lastSeenAppVersionHydrated &&
    orientationSeenHydrated &&
    confessionLogsHydrated &&
    novenaProgressHydrated;
  const hasNewAppVersion = compareVersionStrings(lastSeenAppVersion, CURRENT_APP_VERSION) < 0;
  const currentOrientationStep = orientationSteps[orientationStepIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (showSplash || !storageHydrated || stage !== "app" || orientationSeen || orientationOpen) {
      return;
    }

    setSelectedDetail(null);
    setOrientationStepIndex(0);
    setActiveTab(orientationSteps[0].tab);
    setOrientationOpen(true);
  }, [orientationOpen, orientationSeen, showSplash, stage, storageHydrated]);

  useEffect(() => {
    if (!selectedDetail) return;

    window.scrollTo({ top: 0, behavior: "auto" });
    document.querySelector(".app-content")?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedDetail]);

  useEffect(() => {
    if (selectedPrayerId && !selectedPrayer) {
      setSelectedPrayerId(null);
    }

    if (selectedNovenaId && !selectedNovena) {
      setSelectedNovenaId(null);
    }
  }, [selectedNovena, selectedNovenaId, selectedPrayer, selectedPrayerId]);

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

  function updatePietySchedule(
    pietyId: string,
    updates: Partial<Omit<PietyScheduleEntry, "id" | "pietyId">> = {},
    shouldToggle = false,
  ) {
    setScheduledPieties((entries) => {
      const existing = entries.find((entry) => entry.pietyId === pietyId);

      if (existing) {
        return entries.map((entry) =>
          entry.pietyId === pietyId
            ? {
                ...entry,
                ...updates,
                enabled: shouldToggle ? !entry.enabled : updates.enabled ?? entry.enabled,
              }
            : entry,
        );
      }

      const piety = actsOfPiety.find((entry) => entry.id === pietyId);
      const frequency = updates.frequency ?? getDefaultFrequencyForPiety(piety);
      return [
        ...entries,
        {
          id: `schedule-${pietyId}`,
          pietyId,
          frequency,
          startDate: updates.startDate ?? getTodayInputDate(),
          repeatDays: updates.repeatDays ?? getDefaultRepeatDays(frequency),
          repeatTimes: updates.repeatTimes ?? [],
          enabled: updates.enabled ?? true,
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

  function addPrayerIntention(title: string, note: string) {
    const trimmedTitle = title.trim();
    const trimmedNote = note.trim();

    if (!trimmedTitle && !trimmedNote) {
      return;
    }

    const entry: PrayerIntention = {
      id: `prayer-intention-${Date.now()}`,
      title: trimmedTitle || t("intention"),
      note: trimmedNote,
      createdAt: new Date().toISOString(),
      archived: false,
    };

    setPrayerIntentions((intentions) => [entry, ...intentions]);
  }

  function archivePrayerIntention(intentionId: string) {
    setPrayerIntentions((intentions) =>
      intentions.map((intention) =>
        intention.id === intentionId ? { ...intention, archived: true } : intention,
      ),
    );
  }

  function toggleFavoritePrayer(prayerId: string) {
    setFavoritePrayerIds((ids) =>
      ids.includes(prayerId) ? ids.filter((id) => id !== prayerId) : [prayerId, ...ids],
    );
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
    if (!window.confirm(t("quitNovenaConfirm"))) {
      return;
    }

    setNovenaProgress(null);
    setSelectedNovenaId(null);
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

  function acknowledgeCurrentAppVersion() {
    setLastSeenAppVersion(CURRENT_APP_VERSION);
  }

  function openOrientationTour() {
    setSelectedDetail(null);
    setOrientationStepIndex(0);
    setActiveTab(orientationSteps[0].tab);
    setOrientationOpen(true);
  }

  function moveOrientationStep(nextIndex: number) {
    const safeIndex = Math.min(Math.max(nextIndex, 0), orientationSteps.length - 1);
    setOrientationStepIndex(safeIndex);
    setActiveTab(orientationSteps[safeIndex].tab);
  }

  function closeOrientationTour() {
    setOrientationOpen(false);
    setOrientationSeen(true);
  }

  if (showSplash) {
    return <SplashScreen t={t} />;
  }

  if (!storageHydrated) {
    return <LoadingScreen t={t} />;
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
        "app-shell mx-auto flex w-full max-w-md flex-col bg-background",
        selectedDetail ? "overflow-visible" : "overflow-hidden",
      )}
    >
      <div className="app-content flex-1 px-4 pt-5">
        {selectedPietyDetail ? (
          <PracticeDetail
            key={`${selectedPietyDetail.piety.id}-${selectedPietyDetail.date}`}
            item={selectedPietyDetail}
            language={uiLanguage}
            t={t}
            onComplete={() => completePiety(selectedPietyDetail.piety.id, selectedPietyDetail.date)}
          />
        ) : selectedNovenaDetail ? (
          <NovenaDetailScreen
            key={selectedNovenaDetail.id}
            item={selectedNovenaDetail}
            t={t}
            language={uiLanguage}
            onComplete={() => completeNovenaDay(selectedNovenaDetail.day)}
          />
        ) : selectedCalendarDate ? (
          <CalendarDetailScreen
            key={`calendar-${selectedCalendarDate}`}
            initialDate={selectedCalendarDate}
            language={uiLanguage}
            pietyCompletions={pietyCompletions}
            scheduledPieties={scheduledPieties}
            novenaProgress={novenaProgress}
            t={t}
            onOpenAgendaItem={(item) =>
              setSelectedDetail(
                item.type === "piety"
                  ? { type: "piety", pietyId: item.piety.id, date: item.date }
                  : { type: "novena" },
              )
            }
          />
        ) : activeTab === "today" ? (
          <TodayScreen
            key="today"
            personalProfile={personalProfile}
            profile={profile}
            todayAgenda={todayAgenda}
            currentMonthSaintFeasts={currentMonthSaintFeasts}
            todayTips={todayTips}
            upcomingAgenda={upcomingAgenda}
            streakDays={streakDays}
            completedCount={completedCount}
            language={uiLanguage}
            progressValue={progressValue}
            t={t}
            versionUpdate={
              hasNewAppVersion
                ? {
                    currentVersion: CURRENT_APP_VERSION,
                    previousVersion: lastSeenAppVersion,
                  }
                : null
            }
            onOpenAgendaItem={(item) =>
              setSelectedDetail(
                item.type === "piety"
                  ? { type: "piety", pietyId: item.piety.id, date: item.date }
                  : { type: "novena" },
              )
            }
            onCompletePiety={completePiety}
            onCompleteNovenaDay={completeNovenaDay}
            onAcknowledgeVersionUpdate={acknowledgeCurrentAppVersion}
            onOpenCalendar={() => setSelectedDetail({ type: "calendar", date: today })}
            onOpenProgress={() => setActiveTab("progress")}
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
            onOpenNovena={setSelectedNovenaId}
            onOpenPrayer={setSelectedPrayerId}
            onAddConfessionLog={addConfessionLog}
            onConfessionFrequencyChange={(confessionFrequencyDays) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                confessionFrequencyDays,
              }))
            }
            onDeleteConfessionLog={deleteConfessionLog}
            onUpdatePietySchedule={updatePietySchedule}
          />
        ) : activeTab === "prayers" ? (
          <PrayersScreen
            key="prayers"
            language={preferences.prayerLanguage}
            favoritePrayerIds={favoritePrayerIds}
            prayerIntentions={prayerIntentions}
            t={t}
            uiLanguage={uiLanguage}
            novenaProgress={novenaProgress}
            onAddPrayerIntention={addPrayerIntention}
            onArchivePrayerIntention={archivePrayerIntention}
            onCompleteNovenaDay={completeNovenaDay}
            onQuitNovena={quitNovena}
            onOpenNovena={setSelectedNovenaId}
            onOpenPrayer={setSelectedPrayerId}
            onStartNovena={startNovena}
            onToggleFavoritePrayer={toggleFavoritePrayer}
          />
        ) : activeTab === "progress" ? (
          <ProgressScreen
            key="progress"
            completedCount={completedCount}
            confessionLogs={confessionLogs}
            lifeStats={lifeStats}
            streakDays={streakDays}
            categoryDistribution={categoryDistribution}
            t={t}
            weekProgress={weekProgress}
            novenaProgress={novenaProgress}
            progressValue={progressValue}
            onOpenCalendar={() => setSelectedDetail({ type: "calendar", date: today })}
          />
        ) : (
          <ProfileScreen
            key="profile"
            personalProfile={personalProfile}
            preferences={preferences}
            profile={profile}
            progressValue={progressValue}
            t={t}
            appVersion={CURRENT_APP_VERSION}
            lastSeenAppVersion={lastSeenAppVersion}
            onAcknowledgeVersionUpdate={acknowledgeCurrentAppVersion}
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
            onShowInstallGuide={() => setInstallGuideOpen(true)}
            onShowOrientation={openOrientationTour}
          />
        )}
      </div>

      {selectedDetail ? (
        <FloatingBackButton t={t} onBack={() => setSelectedDetail(null)} />
      ) : null}

      <AnimatePresence>
        {completionMessage ? <CompletionToast message={completionMessage} /> : null}
      </AnimatePresence>

      {selectedPrayer ? (
        <PrayerCardGameDialog
          key={selectedPrayer.id}
          language={preferences.prayerLanguage}
          prayer={selectedPrayer}
          t={t}
          onClose={() => setSelectedPrayerId(null)}
          onSelectPrayer={setSelectedPrayerId}
        />
      ) : null}

      {selectedNovena ? (
        <NovenaCardGameDialog
          key={selectedNovena.id}
          novena={selectedNovena}
          progress={novenaProgress?.novenaId === selectedNovena.id ? novenaProgress : null}
          t={t}
          onClose={() => setSelectedNovenaId(null)}
          onCompleteDay={completeNovenaDay}
        />
      ) : null}

      <AnimatePresence>
        {installGuideOpen ? (
          <InstallGuideDialog t={t} onClose={() => setInstallGuideOpen(false)} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {orientationOpen ? (
          <OrientationDialog
            currentStep={currentOrientationStep}
            stepIndex={orientationStepIndex}
            t={t}
            totalSteps={orientationSteps.length}
            onClose={closeOrientationTour}
            onNext={() => {
              if (orientationStepIndex >= orientationSteps.length - 1) {
                closeOrientationTour();
                return;
              }

              moveOrientationStep(orientationStepIndex + 1);
            }}
            onPrevious={() => moveOrientationStep(orientationStepIndex - 1)}
          />
        ) : null}
      </AnimatePresence>

      {!selectedDetail && !selectedPrayer && !selectedNovena && !installGuideOpen ? (
        <BottomNav
          activeTab={activeTab}
          highlightedTab={orientationOpen ? currentOrientationStep.tab : null}
          t={t}
          onChange={setActiveTab}
        />
      ) : null}
    </main>
  );
}

function SplashScreen({ t }: { t: Translator }) {
  return (
    <main className="mx-auto grid min-h-screen min-h-[100svh] w-full max-w-md place-items-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="text-center"
      >
        <div className="mascot-bob relative mx-auto mb-6 grid size-40 place-items-center rounded-[2rem] border-8 border-white bg-primary-light shadow-playful">
          <MascotAnimation title={t("appTitle")} className="size-36" />
          <span className="mascot-glow absolute inset-x-8 bottom-3 h-3 rounded-full bg-primary/20 blur-sm" />
        </div>
        <h1 className="text-4xl font-black tracking-normal">{t("appTitle")}</h1>
        <p className="mt-3 text-lg font-black leading-relaxed text-primary-dark">{t("appSlogan")}</p>
        <p className="mt-2 text-base font-bold text-muted">{t("preparingApp")}</p>
      </motion.div>
    </main>
  );
}

function MascotAnimation({ className, title }: { className?: string; title: string }) {
  return (
    <svg
      aria-label={title}
      className={cn("mascot-vector pointer-events-none relative z-10", className)}
      role="img"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <radialGradient id="mascotWoolGradient" cx="42%" cy="26%" r="76%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.62" stopColor="#FFF4D2" />
          <stop offset="1" stopColor="#F5D68F" />
        </radialGradient>
        <radialGradient id="mascotFleeceGradient" cx="38%" cy="24%" r="75%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#FFF6DA" />
          <stop offset="1" stopColor="#FFE3A3" />
        </radialGradient>
        <linearGradient id="mascotBookGradient" x1="70" x2="140" y1="105" y2="155">
          <stop stopColor="#243041" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>

      <ellipse className="mascot-vector-shadow" cx="91" cy="160" fill="#7A5A35" opacity="0.18" rx="48" ry="9" />

      <g className="mascot-vector-body">
        <g className="mascot-vector-halo">
          <ellipse cx="91" cy="20" fill="none" rx="34" ry="9" stroke="#FFC928" strokeLinecap="round" strokeWidth="6" />
          <ellipse cx="91" cy="20" fill="none" opacity="0.5" rx="25" ry="5" stroke="#FFF4A6" strokeWidth="2" />
        </g>

        <g className="mascot-vector-ear-left">
          <path d="M51 69c-14-24-36-31-48-20-12 11-6 35 13 47 16 10 34 5 47-10Z" fill="#FFE2B3" />
          <path d="M20 51c12-4 25 4 33 18-11 10-29 8-39-4 1-5 3-10 6-14Z" fill="#F3B08E" opacity="0.72" />
        </g>
        <g className="mascot-vector-ear-right">
          <path d="M129 69c14-24 36-31 48-20 12 11 6 35-13 47-16 10-34 5-47-10Z" fill="#FFE2B3" />
          <path d="M160 51c-12-4-25 4-33 18 11 10 29 8 39-4-1-5-3-10-6-14Z" fill="#F3B08E" opacity="0.72" />
        </g>

        <g className="mascot-vector-arm-left">
          <path d="M56 113c-17 3-27 15-25 27 1 8 10 12 18 6 7-6 12-16 21-27Z" fill="#FFF0C0" />
          <circle cx="39" cy="140" fill="#8A5B32" r="7" />
        </g>

        <g className="mascot-vector-face">
          <g className="mascot-vector-curls">
            <circle cx="54" cy="62" fill="url(#mascotFleeceGradient)" r="13" />
            <circle cx="66" cy="49" fill="url(#mascotFleeceGradient)" r="13" />
            <circle cx="79" cy="43" fill="url(#mascotFleeceGradient)" r="14" />
            <circle cx="94" cy="40" fill="url(#mascotFleeceGradient)" r="15" />
            <circle cx="109" cy="45" fill="url(#mascotFleeceGradient)" r="13" />
            <circle cx="122" cy="55" fill="url(#mascotFleeceGradient)" r="12" />
            <circle cx="132" cy="70" fill="url(#mascotFleeceGradient)" r="11" />
          </g>
          <path d="M45 88c0-27 20-48 47-48 28 0 49 21 49 48 0 30-22 54-50 54S45 118 45 88Z" fill="url(#mascotWoolGradient)" />
          <circle cx="55" cy="98" fill="url(#mascotFleeceGradient)" r="12" />
          <circle cx="128" cy="98" fill="url(#mascotFleeceGradient)" r="12" />
          <path d="M65 75c5-4 12-4 17 0" fill="none" stroke="#6B3B2D" strokeLinecap="round" strokeWidth="4" />
          <g className="mascot-vector-eyes">
            <ellipse cx="76" cy="88" fill="#171717" rx="5.5" ry="7" />
            <ellipse cx="114" cy="88" fill="#171717" rx="5.5" ry="7" />
            <circle cx="78" cy="85" fill="#FFFFFF" opacity="0.75" r="1.5" />
            <circle cx="116" cy="85" fill="#FFFFFF" opacity="0.75" r="1.5" />
          </g>
          <path d="M85 100c5-6 17-6 22 0-3 8-19 8-22 0Z" fill="#FFEFD0" />
          <path d="M89 99c3-4 10-4 13 0-2 5-11 5-13 0Z" fill="#F2A38B" />
          <path d="M86 111c6 5 17 5 23 0" fill="none" stroke="#6B3B2D" strokeLinecap="round" strokeWidth="4" />
          <circle cx="58" cy="105" fill="#F4A58A" opacity="0.38" r="7" />
          <circle cx="124" cy="105" fill="#F4A58A" opacity="0.38" r="7" />
        </g>

        <g className="mascot-vector-fleece">
          <circle cx="62" cy="126" fill="url(#mascotFleeceGradient)" r="14" />
          <circle cx="78" cy="136" fill="url(#mascotFleeceGradient)" r="16" />
          <circle cx="96" cy="139" fill="url(#mascotFleeceGradient)" r="18" />
          <circle cx="114" cy="135" fill="url(#mascotFleeceGradient)" r="16" />
          <circle cx="129" cy="123" fill="url(#mascotFleeceGradient)" r="13" />
        </g>

        <g className="mascot-vector-arm-right">
          <path d="M129 114c14 4 24 15 23 26-1 8-10 12-18 6-7-6-11-15-20-27Z" fill="#FFF0C0" />
          <circle cx="143" cy="140" fill="#8A5B32" r="7" />
        </g>

        <g className="mascot-vector-book">
          <path d="M68 115c13-8 28-7 40 2v39c-13-8-27-9-40-2Z" fill="url(#mascotBookGradient)" />
          <path d="M108 117c13-9 28-10 42-3v39c-14-7-28-5-42 3Z" fill="url(#mascotBookGradient)" />
          <path d="M108 117v39" stroke="#EBD8A4" strokeLinecap="round" strokeWidth="3" />
          <path d="M78 126h18M78 134h20M118 126h20M118 134h17" stroke="#EBD8A4" strokeLinecap="round" strokeWidth="2" />
          <path d="M68 115c13-8 28-7 40 2 13-9 28-10 42-3" fill="none" stroke="#F2C94C" strokeLinecap="round" strokeWidth="3" />
        </g>

        <path d="M65 158h16M112 158h16" stroke="#8A5B32" strokeLinecap="round" strokeWidth="9" />
      </g>
    </svg>
  );
}

function LoadingScreen({ t }: { t: Translator }) {
  return (
    <main className="mx-auto grid min-h-screen min-h-[100svh] w-full max-w-md place-items-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 grid size-20 animate-pulse place-items-center rounded-full bg-primary-light text-primary-dark">
          <RefreshCw className="size-10 animate-spin" strokeWidth={2.8} />
        </div>
        <p className="text-2xl font-black">{t("loading")}</p>
        <p className="mt-2 text-base font-bold text-muted">{t("preparingApp")}</p>
      </div>
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
  currentMonthSaintFeasts,
  personalProfile,
  profile,
  todayAgenda,
  todayTips,
  upcomingAgenda,
  streakDays,
  completedCount,
  language,
  progressValue,
  t,
  versionUpdate,
  onOpenAgendaItem,
  onCompletePiety,
  onCompleteNovenaDay,
  onAcknowledgeVersionUpdate,
  onOpenCalendar,
  onOpenProgress,
}: {
  currentMonthSaintFeasts: SaintProfile[];
  personalProfile: PersonalProfile;
  profile: UserSpiritualProfile;
  todayAgenda: AgendaItem[];
  todayTips: ActOfPiety[];
  upcomingAgenda: AgendaItem[];
  streakDays: number;
  completedCount: number;
  language: UiLanguage;
  progressValue: number;
  t: Translator;
  versionUpdate: { currentVersion: string; previousVersion: string } | null;
  onOpenAgendaItem: (item: AgendaItem) => void;
  onCompletePiety: (pietyId: string, date: string) => void;
  onCompleteNovenaDay: (day: number) => void;
  onAcknowledgeVersionUpdate: () => void;
  onOpenCalendar: () => void;
  onOpenProgress: () => void;
}) {
  const [greeting] = useState(() =>
    getTodayGreeting(personalProfile.displayName, language, t("friendName")),
  );
  const activeAgenda = todayAgenda.filter((item) => !item.completed);
  const completedAgenda = todayAgenda.filter((item) => item.completed);

  return (
    <ScreenMotion className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-black text-primary-dark">{greeting}</p>
          <h1 className="text-3xl font-black tracking-normal">{t("today")}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={t("openCalendar")}
            title={t("openCalendar")}
            onClick={onOpenCalendar}
            className="grid size-11 place-items-center rounded-2xl border-4 border-white bg-primary-light text-primary-dark shadow-playful transition active:translate-y-1 active:shadow-none"
          >
            <CalendarDays className="size-5" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={onOpenProgress}
            className="flex items-center gap-2 rounded-full border-4 border-white bg-yellow px-3 py-2 text-sm font-black shadow-playful active:translate-y-1 active:shadow-none"
          >
            <AnimatedFireIcon className="size-5" />
            {t("streakValue", { days: streakDays })}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {versionUpdate ? (
          <AppVersionNotice
            currentVersion={versionUpdate.currentVersion}
            previousVersion={versionUpdate.previousVersion}
            t={t}
            onAcknowledge={onAcknowledgeVersionUpdate}
          />
        ) : null}
      </AnimatePresence>

      <MetricCard
        label={t("dailyProgress")}
        value={t("completeCount", { completed: completedCount, total: todayAgenda.length })}
        badge={`${progressValue}%`}
      >
        <Progress value={progressValue} />
        <p className="mt-4 text-base font-bold text-muted">
          {t("minuteGoal", { minutes: profile.dailyPrayerTimeMinutes })}
        </p>
      </MetricCard>

      {todayTips.length > 0 ? (
        <section>
          <SectionHeader title={t("todayTips")} />
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {todayTips.map((tip) => (
              <TipCard key={tip.id} language={language} tip={tip} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader eyebrow={t("todayNews")} title={t("saintFeastsThisMonth")} />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {currentMonthSaintFeasts.length > 0 ? (
            currentMonthSaintFeasts.map((saint) => (
              <SaintFeastNewsCard key={saint.id} saint={saint} language={language} t={t} />
            ))
          ) : (
            <Card className="w-[82%] shrink-0 snap-start border-4 border-border p-4 text-base font-bold text-muted">
              {t("noSaintFeastsThisMonth")}
            </Card>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title={t("todayPlan")} />
        <div className="space-y-3">
          {activeAgenda.length > 0 ? (
            activeAgenda.map((item) => (
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
              {completedAgenda.length > 0 ? t("completed") : t("noTasksToday")}
            </Card>
          )}
        </div>
      </section>

      {completedAgenda.length > 0 ? (
        <section>
          <SectionHeader title={t("completedTasks")} />
          <div className="space-y-2">
            {completedAgenda.map((item) => (
              <AgendaCard
                key={`${item.id}-completed`}
                item={item}
                language={language}
                t={t}
                compact
                onOpen={() => onOpenAgendaItem(item)}
                onComplete={() => undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title={t("nextDaysPreview")} />
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
  compact = false,
  item,
  language,
  showCompleteAction = true,
  t,
  onOpen,
  onComplete,
}: {
  compact?: boolean;
  item: AgendaItem;
  language: UiLanguage;
  showCompleteAction?: boolean;
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
        "cursor-pointer border-4 transition active:translate-y-1 active:shadow-none",
        compact ? "p-3" : "p-3.5",
        completed ? `${meta.borderClass} ${meta.softClass}` : "border-border",
      )}
    >
      <div className={cn("flex", compact ? "gap-3" : "gap-3.5")}>
        <div className={cn("grid shrink-0 place-items-center text-white", compact ? "size-12 rounded-2xl" : "size-14 rounded-2xl", meta.bgClass)}>
          <Icon className={cn(compact ? "size-6" : "size-7")} strokeWidth={2.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className={cn("font-black leading-tight", compact ? "text-lg" : "text-xl")}>{title}</h3>
            <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-sm font-black text-muted">
              {minutes} min
            </span>
          </div>
          {!compact ? (
            <p className="mb-2 text-base font-bold leading-snug text-muted">
              {description}
            </p>
          ) : null}
          <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-black", meta.softClass, meta.textClass)}>
            {item.type === "piety" ? t(meta.labelKey) : t("novena")}
          </span>
          {!compact && showCompleteAction ? (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant={completed ? "secondary" : "default"}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!completed) onComplete();
                }}
                className="min-w-32"
              >
                {completed ? t("done") : t("complete")}
                <Check className="size-5" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-3">
      {eyebrow ? <p className="text-base font-black text-primary-dark">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black tracking-normal">{title}</h2>
    </div>
  );
}

function MetricCard({
  badge,
  children,
  label,
  value,
}: {
  badge?: string;
  children?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-4 border-primary-light p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-muted">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
        {badge ? (
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-light text-xl font-black text-primary-dark">
            {badge}
          </div>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

function AppVersionNotice({
  currentVersion,
  previousVersion,
  t,
  onAcknowledge,
}: {
  currentVersion: string;
  previousVersion: string;
  t: Translator;
  onAcknowledge: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <Card className="border-4 border-blue bg-blue/10 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue text-white">
            <RefreshCw className="size-6" strokeWidth={2.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase text-blue">{t("appVersion")}</p>
            <h2 className="text-2xl font-black tracking-normal">{t("newUpdateFound")}</h2>
            <p className="mt-1 text-base font-bold leading-relaxed text-muted">
              {t("newUpdateDetail", { version: currentVersion })}
            </p>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <ScheduleInfoPill label={t("installedVersion")} value={previousVersion} />
          <ScheduleInfoPill label={t("currentVersion")} value={currentVersion} />
        </div>
        <Button type="button" size="lg" className="w-full" onClick={onAcknowledge}>
          {t("acknowledgeUpdate")}
          <Check className="size-5" />
        </Button>
      </Card>
    </motion.div>
  );
}

function AnimatedFireIcon({ className }: { className?: string }) {
  return (
    <span className={cn("animated-fire relative inline-grid place-items-center", className)}>
      <Flame className="size-full fill-white text-white" strokeWidth={2.8} />
      <span className="animated-fire-spark absolute size-1.5 rounded-full bg-white/90" />
    </span>
  );
}

function TipCard({
  language,
  tip,
  t,
}: {
  language: UiLanguage;
  tip: ActOfPiety;
  t: Translator;
}) {
  const text = getPracticeText(tip, language);
  const meta = getCategoryMeta(tip.category);
  const Icon = meta.icon;

  return (
    <Card className={cn("w-[82%] shrink-0 snap-start border-4 p-4", meta.borderClass)}>
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl text-white", meta.bgClass)}>
          <Icon className="size-5" strokeWidth={2.8} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-xs font-black uppercase", meta.textClass)}>{t("tip")}</p>
          <h3 className="truncate text-xl font-black tracking-normal">{text.title}</h3>
        </div>
      </div>
      <p className="text-base font-bold leading-relaxed text-muted">{text.content}</p>
    </Card>
  );
}

function SaintFeastNewsCard({
  language,
  saint,
  t,
}: {
  language: UiLanguage;
  saint: SaintProfile;
  t: Translator;
}) {
  const text = saint.languages[language];

  return (
    <Card className="w-[82%] shrink-0 snap-start border-4 border-blue p-4">
      <div className="mb-3 flex items-center gap-3">
        <Image
          src={saint.imageSrc}
          alt={text.name}
          width={64}
          height={64}
          className="size-12 shrink-0 rounded-2xl border-4 border-white bg-blue/10 object-cover shadow-soft [image-rendering:pixelated]"
        />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-blue">{t("feastDay")}</p>
          <h3 className="truncate text-xl font-black tracking-normal">{text.name}</h3>
        </div>
      </div>
      <p className="text-sm font-black text-muted">{saint.feastDay}</p>
      <p className="mt-2 text-base font-bold leading-relaxed text-foreground">
        {text.reflection}
      </p>
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
  onComplete,
}: {
  item: PietyAgendaItem;
  language: UiLanguage;
  t: Translator;
  onComplete: () => void;
}) {
  const completed = item.completed;
  const practiceText = getPracticeText(item.piety, language);
  const meta = getCategoryMeta(item.piety.category);
  const Icon = meta.icon;

  return (
    <ScreenMotion className="flex min-h-[calc(100vh-2.5rem)] flex-col space-y-5">
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
  onComplete,
}: {
  item: NovenaAgendaItem;
  language: UiLanguage;
  t: Translator;
  onComplete: () => void;
}) {
  const currentDay = item.novena.days[item.day - 1];

  return (
    <ScreenMotion className="flex min-h-[calc(100vh-2.5rem)] flex-col space-y-5">
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

function CalendarDetailScreen({
  initialDate,
  language,
  novenaProgress,
  pietyCompletions,
  scheduledPieties,
  t,
  onOpenAgendaItem,
}: {
  initialDate: string;
  language: UiLanguage;
  novenaProgress: NovenaProgress | null;
  pietyCompletions: PietyCompletionEntry[];
  scheduledPieties: PietyScheduleEntry[];
  t: Translator;
  onOpenAgendaItem: (item: AgendaItem) => void;
}) {
  const today = getTodayInputDate();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = parseInputDate(initialDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const calendarDays = useMemo(
    () => getMonthCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const selectedAgenda = useMemo(() => {
    const novenaItem = getCurrentNovenaAgendaItem(novenaProgress, selectedDate);
    return getAgendaForDate(scheduledPieties, pietyCompletions, selectedDate, novenaItem);
  }, [novenaProgress, pietyCompletions, scheduledPieties, selectedDate]);
  const monthLabel = new Intl.DateTimeFormat(language === "zhHant" ? "zh-Hant" : "en", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const weekdayLabels = getWeekdayOptions(language).map((day) => day.label);

  function moveMonth(monthOffset: number) {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + monthOffset);
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    });
  }

  return (
    <ScreenMotion className="space-y-5">
      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-primary-dark">{t("calendar")}</p>
            <h1 className="text-3xl font-black tracking-normal">{monthLabel}</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("previous")}
              onClick={() => moveMonth(-1)}
              className="grid size-11 place-items-center rounded-2xl border-4 border-border bg-white text-muted shadow-soft transition active:translate-y-1 active:shadow-none"
            >
              <ChevronLeft className="size-5" strokeWidth={3} />
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => moveMonth(1)}
              className="grid size-11 place-items-center rounded-2xl border-4 border-border bg-white text-muted shadow-soft transition active:translate-y-1 active:shadow-none"
            >
              <ChevronRight className="size-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-black text-muted">
          {weekdayLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((date) => {
            const inputDate = toInputDate(date);
            const inMonth = date.getMonth() === visibleMonth.getMonth();
            const isToday = inputDate === today;
            const selected = inputDate === selectedDate;
            const past = inputDate < today;
            const novenaItem = getCurrentNovenaAgendaItem(novenaProgress, inputDate);
            const agenda = getAgendaForDate(scheduledPieties, pietyCompletions, inputDate, novenaItem);
            const completed = agenda.filter((item) => item.completed).length;

            return (
              <button
                key={inputDate}
                type="button"
                onClick={() => setSelectedDate(inputDate)}
                className={cn(
                  "min-h-16 rounded-2xl border-2 px-1 py-2 text-left transition active:translate-y-1",
                  selected
                    ? "border-primary bg-primary text-white shadow-soft"
                    : isToday
                      ? "border-yellow bg-yellow/20 text-foreground"
                      : past
                        ? "border-border bg-white/55 text-muted"
                        : "border-border bg-white text-foreground",
                  !inMonth && "opacity-40",
                )}
              >
                <span className="block text-sm font-black">{date.getDate()}</span>
                {agenda.length > 0 ? (
                  <span className={cn("mt-1 block text-[0.65rem] font-black leading-tight", selected ? "text-white" : "text-muted")}>
                    {completed}/{agenda.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      <section>
        <SectionHeader title={t("tasksForDate", { date: formatDisplayDate(selectedDate, language) })} />
        <div className="space-y-3">
          {selectedAgenda.length > 0 ? (
            selectedAgenda.map((item) => (
              <AgendaCard
                key={`${item.id}-calendar`}
                item={item}
                language={language}
                t={t}
                compact={item.completed}
                showCompleteAction={false}
                onOpen={() => onOpenAgendaItem(item)}
                onComplete={() => undefined}
              />
            ))
          ) : (
            <Card className="border-4 border-border p-5 text-base font-bold text-muted">
              {t("noTasksForDate")}
            </Card>
          )}
        </div>
      </section>
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
  onUpdatePietySchedule,
  onOpenNovena,
  onOpenPrayer,
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
  onUpdatePietySchedule: (
    pietyId: string,
    updates?: Partial<Omit<PietyScheduleEntry, "id" | "pietyId">>,
    shouldToggle?: boolean,
  ) => void;
  onOpenNovena: (novenaId: string) => void;
  onOpenPrayer: (prayerId: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<ExploreLibraryCategory | null>(null);
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
      <header className="space-y-2">
        <p className="text-base font-black text-primary-dark">{t("tabExplore")}</p>
        <h1 className="text-3xl font-black tracking-normal">{t("spiritualLibrary")}</h1>
        <p className="text-base font-bold leading-relaxed text-muted">{t("librarySubtitle")}</p>
      </header>

      {!selectedCategory ? (
        <div className="grid gap-4">
          <LibraryCategoryCard
            count={sacramentalActions.length + 1}
            description={t("readyForConfessionDetail")}
            icon={Church}
            title={t("folderSacramentalLife")}
            tone="danger"
            onOpen={() => setSelectedCategory("sacramental")}
          />
          <LibraryCategoryCard
            count={recommendedPieties.filter(({ practice }) => practice.kind === "task").length}
            description={t("todayPlan")}
            icon={FolderOpen}
            title={t("folderPiety")}
            tone="primary"
            onOpen={() => setSelectedCategory("piety")}
          />
          <LibraryCategoryCard
            count={saintProfiles.length}
            description={t("saints")}
            icon={UserRound}
            title={t("folderSaints")}
            tone="blue"
            onOpen={() => setSelectedCategory("saints")}
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="flex w-fit items-center gap-2 rounded-full border-4 border-border bg-white px-4 py-2 text-base font-black shadow-playful active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft className="size-5" strokeWidth={3} />
            {t("backToLibrary")}
          </button>

      {selectedCategory === "sacramental" ? (
        <CategoryDetailSection
          count={sacramentalActions.length + 1}
          description={t("readyForConfessionDetail")}
          icon={Church}
          title={t("folderSacramentalLife")}
          tone="danger"
        >
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
        </CategoryDetailSection>
      ) : null}

      {selectedCategory === "piety" ? (
        <CategoryDetailSection
          count={recommendedPieties.length}
          description={t("todayPlan")}
          icon={FolderOpen}
          title={t("folderPiety")}
          tone="primary"
        >
        <div className="grid gap-4">
          {recommendedPieties
            .filter(({ practice }) => practice.kind === "task")
            .map(({ practice: piety, score }) => {
            const schedule = scheduledPieties.find((entry) => entry.pietyId === piety.id);

            return (
              <PietyScheduleCard
                key={piety.id}
                language={language}
                piety={piety}
                score={score}
                schedule={schedule}
                t={t}
                onUpdate={(updates, shouldToggle) =>
                  onUpdatePietySchedule(piety.id, updates, shouldToggle)
                }
              />
            );
          })}
        </div>
        </CategoryDetailSection>
      ) : null}

      {selectedCategory === "saints" ? (
        <CategoryDetailSection
          count={saintProfiles.length}
          description={t("saints")}
          icon={UserRound}
          title={t("folderSaints")}
          tone="blue"
        >
        <div className="grid gap-4">
          {saintProfiles.map((saint) => (
            <SaintCard
              key={saint.id}
              language={language}
              saint={saint}
              t={t}
              onOpenNovena={onOpenNovena}
              onOpenPrayer={onOpenPrayer}
            />
          ))}
        </div>
        </CategoryDetailSection>
      ) : null}
        </>
      )}
    </ScreenMotion>
  );
}

function LibraryFolder({
  children,
  count,
  description,
  icon: Icon,
  title,
  tone,
}: {
  children: React.ReactNode;
  count: number;
  description: string;
  icon: typeof Sun;
  title: string;
  tone: "primary" | "danger" | "blue";
}) {
  const toneClasses = {
    primary: {
      border: "border-primary-light",
      bg: "bg-primary-light",
      iconBg: "bg-primary",
      text: "text-primary-dark",
    },
    danger: {
      border: "border-danger",
      bg: "bg-danger/10",
      iconBg: "bg-danger",
      text: "text-danger",
    },
    blue: {
      border: "border-blue",
      bg: "bg-blue/10",
      iconBg: "bg-blue",
      text: "text-blue",
    },
  }[tone];

  return (
    <section className={cn("rounded-[2rem] border-4 bg-white p-4 shadow-soft", toneClasses.border)}>
      <div className={cn("mb-4 rounded-[1.5rem] px-4 py-3", toneClasses.bg)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-white", toneClasses.iconBg)}>
              <Icon className="size-6" strokeWidth={2.8} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-sm font-black uppercase", toneClasses.text)}>{title}</p>
              <p className="truncate text-base font-bold text-muted">{description}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-muted">
            {count}
          </span>
        </div>
      </div>

      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function CategoryDetailSection({
  children,
  count,
  description,
  icon: Icon,
  title,
  tone,
}: {
  children: React.ReactNode;
  count: number;
  description: string;
  icon: typeof Sun;
  title: string;
  tone: "primary" | "danger" | "blue";
}) {
  const toneClasses = {
    primary: {
      iconBg: "bg-primary",
      text: "text-primary-dark",
    },
    danger: {
      iconBg: "bg-danger",
      text: "text-danger",
    },
    blue: {
      iconBg: "bg-blue",
      text: "text-blue",
    },
  }[tone];

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-4">
        <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-white", toneClasses.iconBg)}>
          <Icon className="size-7" strokeWidth={2.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn("text-sm font-black uppercase", toneClasses.text)}>{title}</p>
              <h2 className="text-3xl font-black tracking-normal">{title}</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-muted shadow-soft">
              {count}
            </span>
          </div>
          <p className="mt-2 text-base font-bold leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function LibraryCategoryCard({
  count,
  description,
  icon: Icon,
  onOpen,
  title,
  tone,
}: {
  count: number;
  description: string;
  icon: typeof Sun;
  onOpen: () => void;
  title: string;
  tone: "primary" | "danger" | "blue";
}) {
  const toneClasses = {
    primary: {
      border: "border-primary-light",
      bg: "bg-primary-light",
      iconBg: "bg-primary",
      text: "text-primary-dark",
    },
    danger: {
      border: "border-danger",
      bg: "bg-danger/10",
      iconBg: "bg-danger",
      text: "text-danger",
    },
    blue: {
      border: "border-blue",
      bg: "bg-blue/10",
      iconBg: "bg-blue",
      text: "text-blue",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-[2rem] border-4 bg-white p-4 text-left shadow-soft transition active:translate-y-1 active:shadow-none",
        toneClasses.border,
      )}
    >
      <div className={cn("rounded-[1.5rem] px-4 py-4", toneClasses.bg)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-white", toneClasses.iconBg)}>
              <Icon className="size-7" strokeWidth={2.8} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-sm font-black uppercase", toneClasses.text)}>{title}</p>
              <p className="mt-1 text-base font-bold leading-relaxed text-muted">{description}</p>
            </div>
          </div>
          <div className="grid shrink-0 gap-2 text-center">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-muted">
              {count}
            </span>
            <ChevronRight className={cn("mx-auto size-6", toneClasses.text)} strokeWidth={3} />
          </div>
        </div>
      </div>
    </button>
  );
}

function SaintCard({
  language,
  onOpenNovena,
  onOpenPrayer,
  saint,
  t,
}: {
  language: UiLanguage;
  onOpenNovena: (novenaId: string) => void;
  onOpenPrayer: (prayerId: string) => void;
  saint: SaintProfile;
  t: Translator;
}) {
  const text = saint.languages[language];
  const relatedPrayers = (saint.relatedPrayerIds ?? [])
    .map((prayerId) => catholicPrayers.find((prayer) => prayer.id === prayerId))
    .filter((prayer): prayer is CatholicPrayer => Boolean(prayer));
  const relatedNovenas = (saint.relatedNovenaIds ?? [])
    .map((novenaId) => novenas.find((novena) => novena.id === novenaId))
    .filter((novena): novena is Novena => Boolean(novena));

  return (
    <Card className="border-4 border-blue p-5">
      <div className="mb-4 flex items-start gap-4">
        <Image
          src={saint.imageSrc}
          alt={text.name}
          width={96}
          height={96}
          className="size-20 shrink-0 rounded-2xl border-4 border-white bg-blue/10 object-cover shadow-soft [image-rendering:pixelated]"
          priority={false}
        />
        <div className="min-w-0">
          <p className="text-sm font-black uppercase text-blue">{t("saints")}</p>
          <h3 className="text-2xl font-black tracking-normal">{text.name}</h3>
          <p className="mt-1 text-base font-bold leading-relaxed text-muted">{text.title}</p>
        </div>
      </div>

      <p className="text-base font-bold leading-relaxed text-foreground">
        {text.introduction}
      </p>

      <div className="mt-4 grid gap-3 rounded-2xl bg-background px-4 py-3">
        <div>
          <p className="text-sm font-black uppercase text-muted">{t("feastDay")}</p>
          <p className="text-base font-black text-foreground">{saint.feastDay}</p>
        </div>
        <div>
          <p className="text-sm font-black uppercase text-muted">{t("patronage")}</p>
          <p className="text-base font-black text-foreground">{text.patronage}</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-blue/10 px-4 py-3 text-base font-black leading-relaxed text-foreground">
        {text.reflection}
      </p>

      {relatedPrayers.length > 0 || relatedNovenas.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {relatedPrayers.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-black uppercase text-muted">{t("relatedPrayers")}</p>
              <div className="grid gap-2">
                {relatedPrayers.map((prayer) => {
                  const prayerText = prayer.languages[language === "zhHant" ? "zhHant" : "en"];

                  return (
                    <button
                      key={prayer.id}
                      type="button"
                      onClick={() => onOpenPrayer(prayer.id)}
                      className="flex items-center justify-between gap-3 rounded-2xl border-4 border-primary-light bg-white px-3 py-2 text-left shadow-soft transition active:translate-y-1 active:shadow-none"
                    >
                      <span className="text-base font-black text-foreground">{prayerText.title}</span>
                      <Sparkles className="size-5 shrink-0 text-primary-dark" strokeWidth={2.8} />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {relatedNovenas.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-black uppercase text-muted">{t("relatedNovenas")}</p>
              <div className="grid gap-2">
                {relatedNovenas.map((novena) => (
                  <button
                    key={novena.id}
                    type="button"
                    onClick={() => onOpenNovena(novena.id)}
                    className="flex items-center justify-between gap-3 rounded-2xl border-4 border-yellow bg-white px-3 py-2 text-left shadow-soft transition active:translate-y-1 active:shadow-none"
                  >
                    <span className="text-base font-black text-foreground">{novena.title}</span>
                    <CalendarDays className="size-5 shrink-0 text-yellow" strokeWidth={2.8} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function PietyScheduleCard({
  language,
  piety,
  score,
  schedule,
  t,
  onUpdate,
}: {
  language: UiLanguage;
  piety: ActOfPiety;
  score: number;
  schedule?: PietyScheduleEntry;
  t: Translator;
  onUpdate: (
    updates?: Partial<Omit<PietyScheduleEntry, "id" | "pietyId">>,
    shouldToggle?: boolean,
  ) => void;
}) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const text = getPracticeText(piety, language);
  const frequency = schedule?.frequency ?? getDefaultFrequencyForPiety(piety);
  const startDate = schedule?.startDate ?? getTodayInputDate();
  const repeatDays = schedule?.repeatDays ?? getDefaultRepeatDays(frequency);
  const repeatTimes = schedule?.repeatTimes ?? [];
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

      <div className="mb-4 grid gap-3 rounded-2xl bg-background px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <ScheduleInfoPill label={t("suggestedFrequency")} value={getFrequencyLabel(getDefaultFrequencyForPiety(piety), t)} />
          <ScheduleInfoPill
            label={t("preferredTimes")}
            value={piety.prayerTimes.map((time) => readableProfileValue(time, language)).join(", ")}
          />
        </div>
        <div>
          <p className="text-sm font-black uppercase text-muted">{t("scheduleDetails")}</p>
          <p className="mt-1 text-base font-bold leading-relaxed text-foreground">
            {formatScheduleSummary(startDate, frequency, repeatDays, repeatTimes, language, t)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button type="button" size="lg" className="w-full" onClick={() => setWizardOpen(true)}>
          {t("configureSchedule")}
          <CalendarPlus className="size-5" />
        </Button>
        <Button
          type="button"
          size="lg"
          variant={schedule?.enabled ? "secondary" : "default"}
          onClick={() => onUpdate(undefined, true)}
        >
          {schedule?.enabled ? t("scheduled") : t("addToSchedule")}
        </Button>
      </div>

      <AnimatePresence>
        {wizardOpen ? (
          <ScheduleWizardSheet
            frequency={frequency}
            language={language}
            piety={piety}
            repeatDays={repeatDays}
            repeatTimes={repeatTimes}
            startDate={startDate}
            t={t}
            onClose={() => setWizardOpen(false)}
            onSave={(updates) => {
              onUpdate(updates);
              setWizardOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

function ScheduleInfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2">
      <p className="text-xs font-black uppercase text-muted">{label}</p>
      <p className="text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function ScheduleWizardSheet({
  frequency,
  language,
  piety,
  repeatDays,
  repeatTimes,
  startDate,
  t,
  onClose,
  onSave,
}: {
  frequency: PietyFrequency;
  language: UiLanguage;
  piety: ActOfPiety;
  repeatDays: number[];
  repeatTimes: string[];
  startDate: string;
  t: Translator;
  onClose: () => void;
  onSave: (updates: Partial<Omit<PietyScheduleEntry, "id" | "pietyId">>) => void;
}) {
  const [step, setStep] = useState(0);
  const [draftFrequency, setDraftFrequency] = useState<PietyFrequency>(frequency);
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftRepeatDays, setDraftRepeatDays] = useState(repeatDays);
  const [draftRepeatTimes, setDraftRepeatTimes] = useState(repeatTimes);
  const text = getPracticeText(piety, language);
  const meta = getCategoryMeta(piety.category);
  const weekdayOptions = getWeekdayOptions(language);
  const stepLabels = [t("scheduleStepReview"), t("scheduleStepRepeat"), t("scheduleStepTime")];

  function toggleDraftDay(day: number) {
    setDraftRepeatDays((days) =>
      days.includes(day)
        ? days.filter((entry) => entry !== day)
        : [...days, day].sort((a, b) => a - b),
    );
  }

  function save() {
    onSave({
      frequency: draftFrequency,
      startDate: draftStartDate,
      repeatDays: draftRepeatDays,
      repeatTimes: draftRepeatTimes,
      enabled: true,
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end bg-foreground/40 px-3 pb-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-auto w-full max-w-md"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 230, damping: 24 }}
      >
        <Card className="max-h-[86vh] overflow-y-auto border-4 border-primary-light p-5 shadow-soft">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-primary-dark">{t("scheduleWizard")}</p>
              <h2 className="text-2xl font-black tracking-normal">{text.title}</h2>
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

          <div className="mb-5 grid grid-cols-3 gap-2">
            {stepLabels.map((label, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-2xl px-3 py-2 text-center text-xs font-black",
                  step === index ? "bg-primary text-white" : "bg-background text-muted",
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div className="grid gap-4">
              <div className="rounded-2xl bg-background px-4 py-3">
                <p className="text-sm font-black uppercase text-muted">{t("practiceInfo")}</p>
                <p className="mt-1 text-base font-bold leading-relaxed text-foreground">{text.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ScheduleInfoPill
                  label={t("suggestedFrequency")}
                  value={getFrequencyLabel(getDefaultFrequencyForPiety(piety), t)}
                />
                <ScheduleInfoPill
                  label={t("preferredTimes")}
                  value={piety.prayerTimes.map((time) => readableProfileValue(time, language)).join(", ")}
                />
              </div>
              <div className="rounded-2xl bg-background px-4 py-3">
                <p className="text-sm font-black uppercase text-muted">{t("howToImprove")}</p>
                <p className="mt-1 text-base font-bold leading-relaxed text-foreground">
                  {t("howToImproveDetail")}
                </p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase text-muted">{t("startDate")}</span>
                <input
                  type="date"
                  value={draftStartDate}
                  onChange={(event) => setDraftStartDate(event.target.value)}
                  className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-black text-foreground outline-none focus:border-primary"
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-black uppercase text-muted">{t("suggestedFrequency")}</p>
                <div className="grid grid-cols-4 gap-1 rounded-[1.5rem] border-4 border-white bg-white p-1 shadow-soft">
                  {frequencyOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={draftFrequency === option}
                      onClick={() => {
                        setDraftFrequency(option);
                        if (draftRepeatDays.length === 0) setDraftRepeatDays(getDefaultRepeatDays(option));
                      }}
                      className={cn(
                        "min-h-11 rounded-2xl px-2 text-xs font-black leading-tight transition",
                        draftFrequency === option ? cn(meta.bgClass, "text-white") : "text-muted",
                      )}
                    >
                      {getFrequencyLabel(option, t)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-black uppercase text-muted">{t("repeatDays")}</p>
                <div className="grid grid-cols-7 gap-1">
                  {weekdayOptions.map((option) => {
                    const active = draftRepeatDays.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleDraftDay(option.value)}
                        className={cn(
                          "grid aspect-square place-items-center rounded-full border-4 text-xs font-black transition",
                          active
                            ? cn(meta.borderClass, meta.bgClass, "text-white")
                            : "border-border bg-white text-muted",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <RepeatTimesEditor
              repeatTimes={draftRepeatTimes}
              t={t}
              onAdd={(time) =>
                setDraftRepeatTimes((times) =>
                  time && !times.includes(time) ? [...times, time].sort() : times,
                )
              }
              onRemove={(time) =>
                setDraftRepeatTimes((times) => times.filter((entry) => entry !== time))
              }
            />
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              {t("previous")}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => (step === 2 ? save() : setStep((current) => current + 1))}
            >
              {step === 2 ? t("saveSchedule") : t("next")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function RepeatTimesEditor({
  repeatTimes,
  t,
  onAdd,
  onRemove,
}: {
  repeatTimes: string[];
  t: Translator;
  onAdd: (time: string) => void;
  onRemove: (time: string) => void;
}) {
  const [time, setTime] = useState("");

  return (
    <div>
      <p className="mb-2 text-sm font-black uppercase text-muted">{t("repeatTimes")}</p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-black text-foreground outline-none focus:border-primary"
        />
        <Button
          type="button"
          size="sm"
          className="size-12 min-h-12 px-0 py-0"
          aria-label={t("addTime")}
          title={t("addTime")}
          disabled={!time}
          onClick={() => {
            onAdd(time);
            setTime("");
          }}
        >
          <Plus className="size-5" strokeWidth={3} />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {repeatTimes.length > 0 ? (
          repeatTimes.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => onRemove(entry)}
              className="rounded-full bg-primary-light px-3 py-1 text-sm font-black text-primary-dark"
            >
              {entry} ×
            </button>
          ))
        ) : (
          <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
            {t("noRepeatTimes")}
          </span>
        )}
      </div>
    </div>
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
  favoritePrayerIds,
  language,
  prayerIntentions,
  t,
  uiLanguage,
  novenaProgress,
  onAddPrayerIntention,
  onArchivePrayerIntention,
  onCompleteNovenaDay,
  onQuitNovena,
  onOpenNovena,
  onOpenPrayer,
  onStartNovena,
  onToggleFavoritePrayer,
}: {
  favoritePrayerIds: string[];
  language: PrayerLanguage;
  prayerIntentions: PrayerIntention[];
  t: Translator;
  uiLanguage: UiLanguage;
  novenaProgress: NovenaProgress | null;
  onAddPrayerIntention: (title: string, note: string) => void;
  onArchivePrayerIntention: (intentionId: string) => void;
  onCompleteNovenaDay: (day: number) => void;
  onQuitNovena: () => void;
  onOpenNovena: (novenaId: string) => void;
  onOpenPrayer: (prayerId: string) => void;
  onStartNovena: (novenaId: string, intention: string) => void;
  onToggleFavoritePrayer: (prayerId: string) => void;
}) {
  const [activePrayerTab, setActivePrayerTab] = useState<PrayerTab>("intentions");
  const [activeFilter, setActiveFilter] = useState<PrayerFilter>("all");
  const [query, setQuery] = useState("");
  const [intentionTitle, setIntentionTitle] = useState("");
  const [intentionNote, setIntentionNote] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const activeIntentions = prayerIntentions.filter((intention) => !intention.archived);
  const favoritePrayers = useMemo(
    () =>
      favoritePrayerIds
        .map((id) => catholicPrayers.find((prayer) => prayer.id === id))
        .filter((prayer): prayer is CatholicPrayer => Boolean(prayer)),
    [favoritePrayerIds],
  );
  const prayerTabs: Array<{ id: PrayerTab; label: string; icon: typeof Heart }> = [
    { id: "intentions", label: t("prayerTabIntentions"), icon: Heart },
    { id: "prayers", label: t("prayerTabPrayers"), icon: ScrollText },
    { id: "favorites", label: t("prayerTabFavorites"), icon: Heart },
  ];
  const prayerFilters: Array<{ id: PrayerFilter; label: string }> = [
    { id: "all", label: t("filterAll") },
    { id: "novena", label: t("filterNovena") },
    { id: "foundational", label: t("categoryFoundational") },
    { id: "marian", label: t("categoryMarian") },
    { id: "rosary", label: t("categoryRosary") },
    { id: "daily", label: t("categoryDaily") },
  ];
  const activeNovena = novenaProgress
    ? novenas.find((novena) => novena.id === novenaProgress.novenaId) ?? null
    : null;

  const visiblePrayers = useMemo(() => {
    const source = activePrayerTab === "favorites" ? favoritePrayers : catholicPrayers;
    const filteredSource =
      activeFilter === "all" || activeFilter === "novena"
        ? source
        : source.filter((prayer) => prayer.category === activeFilter);
    if (activeFilter === "novena") return [];
    if (!normalizedQuery) return filteredSource;

    return filteredSource.filter((prayer) =>
      getPrayerSearchText(prayer).includes(normalizedQuery),
    );
  }, [activeFilter, activePrayerTab, favoritePrayers, normalizedQuery]);
  const visibleNovenas = useMemo(() => {
    if (activePrayerTab !== "prayers") return [];
    if (activeFilter !== "all" && activeFilter !== "novena") return [];
    const source = activeNovena
      ? novenas.filter((novena) => novena.id !== activeNovena.id)
      : novenas;
    if (!normalizedQuery) return source;

    return source.filter((novena) => getNovenaSearchText(novena).includes(normalizedQuery));
  }, [activeFilter, activeNovena, activePrayerTab, normalizedQuery]);

  function submitPrayerIntention(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddPrayerIntention(intentionTitle, intentionNote);
    setIntentionTitle("");
    setIntentionNote("");
  }

  return (
    <ScreenMotion className="space-y-5">
      <header className="space-y-4">
        <div>
          <p className="text-base font-black text-primary-dark">{t("prayers")}</p>
          <h1 className="text-3xl font-black tracking-normal">{t("commonPrayers")}</h1>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-[1.75rem] border-4 border-white bg-white p-1 shadow-soft">
          {prayerTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activePrayerTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActivePrayerTab(tab.id)}
                className={cn(
                  "grid min-h-16 place-items-center rounded-3xl px-2 py-2 text-center text-xs font-black leading-tight transition",
                  active ? "bg-primary text-white shadow-soft" : "text-muted",
                )}
              >
                <Icon className="mb-1 size-5" strokeWidth={2.8} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activePrayerTab !== "intentions" ? (
          <div className="space-y-3">
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
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {prayerFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "shrink-0 rounded-full border-4 px-4 py-2 text-sm font-black shadow-soft transition active:translate-y-1 active:shadow-none",
                    activeFilter === filter.id
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-muted",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      {activeNovena ? (
        <NovenaCard
          novena={activeNovena}
          progress={novenaProgress}
          hasOtherActiveNovena={false}
          t={t}
          uiLanguage={uiLanguage}
          onCompleteDay={onCompleteNovenaDay}
          onQuit={onQuitNovena}
          onOpenCards={() => onOpenNovena(activeNovena.id)}
          onStart={onStartNovena}
        />
      ) : null}

      {activePrayerTab === "intentions" ? (
        <Card className="border-4 border-primary-light p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary-light text-primary-dark">
              <Heart className="size-6" strokeWidth={2.8} />
            </div>
            <h2 className="text-2xl font-black">{t("prayerIntentions")}</h2>
          </div>

          <form onSubmit={submitPrayerIntention} className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase text-muted">{t("intentionTitle")}</span>
              <input
                type="text"
                value={intentionTitle}
                onChange={(event) => setIntentionTitle(event.target.value)}
                placeholder={t("intentionTitlePlaceholder")}
                className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
              />
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="text"
                value={intentionNote}
                onChange={(event) => setIntentionNote(event.target.value)}
                placeholder={t("intentionNotePlaceholder")}
                className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
              />
              <Button
                type="submit"
                size="sm"
                aria-label={t("addIntention")}
                title={t("addIntention")}
                disabled={!intentionTitle.trim() && !intentionNote.trim()}
                className="size-12 min-h-12 px-0 py-0"
              >
                <Plus className="size-5" strokeWidth={3} />
              </Button>
            </div>
          </form>

          <div className="mt-4 grid gap-2">
            {activeIntentions.length > 0 ? (
              activeIntentions.map((intention) => (
                <div
                  key={intention.id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-background px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-base font-black text-foreground">
                      {intention.title}
                    </p>
                    {intention.note ? (
                      <p className="mt-1 break-words text-sm font-bold leading-relaxed text-muted">
                        {intention.note}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={t("archiveIntention")}
                    title={t("archiveIntention")}
                    onClick={() => onArchivePrayerIntention(intention.id)}
                    className="grid size-10 shrink-0 place-items-center rounded-full border-4 border-border bg-white text-danger shadow-soft transition active:translate-y-1 active:shadow-none"
                  >
                    <Trash2 className="size-5" strokeWidth={2.8} />
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-background px-4 py-3 text-base font-bold text-muted">
                {t("noPrayerIntentions")}
              </p>
            )}
          </div>
        </Card>
      ) : null}

      {activePrayerTab !== "intentions" ? (
        <div className="grid gap-4">
          {activePrayerTab === "favorites" && favoritePrayers.length === 0 ? (
            <Card className="border-4 border-yellow p-5 text-center">
              <Heart className="mx-auto mb-3 size-10 text-yellow" />
              <h2 className="text-2xl font-black">{t("noFavoritePrayers")}</h2>
              <p className="mt-2 text-base font-bold text-muted">
                {t("noFavoritePrayersHint")}
              </p>
            </Card>
          ) : visiblePrayers.length > 0 || visibleNovenas.length > 0 ? (
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
                onOpenCards={() => onOpenNovena(novena.id)}
                onStart={onStartNovena}
              />
            ))}

            {visiblePrayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                language={language}
                isFavorite={favoritePrayerIds.includes(prayer.id)}
                t={t}
                onOpen={() => onOpenPrayer(prayer.id)}
                onToggleFavorite={() => onToggleFavoritePrayer(prayer.id)}
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
      ) : null}
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
  onOpenCards,
  onStart,
}: {
  novena: Novena;
  progress: NovenaProgress | null;
  hasOtherActiveNovena: boolean;
  t: Translator;
  uiLanguage: UiLanguage;
  onCompleteDay: (day: number) => void;
  onQuit: () => void;
  onOpenCards: () => void;
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
          <Button type="button" size="lg" variant="secondary" className="w-full" onClick={onOpenCards}>
            {t("currentCard")}
            <Sparkles className="size-5" />
          </Button>
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
          <Button type="button" size="lg" variant="secondary" className="w-full" onClick={onOpenCards}>
            {t("browseAllCards")}
            <Sparkles className="size-5" />
          </Button>
        </form>
      )}
    </Card>
  );
}

function PrayerCard({
  isFavorite,
  prayer,
  language,
  t,
  onOpen,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  prayer: CatholicPrayer;
  language: PrayerLanguage;
  t: Translator;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  const translation = prayer.languages[language];

  return (
    <Card
      onClick={onOpen}
      className="cursor-pointer border-4 border-border p-5 transition active:translate-y-1 active:shadow-none"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-black uppercase text-primary-dark">
            {readablePrayerCategory(prayer.category, t)}
          </p>
          <h2 className="text-2xl font-black tracking-normal">{translation.title}</h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? t("unfavoritePrayer") : t("favoritePrayer")}
            title={isFavorite ? t("unfavoritePrayer") : t("favoritePrayer")}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "grid size-11 place-items-center rounded-2xl border-4 shadow-soft transition active:translate-y-1 active:shadow-none",
              isFavorite
                ? "border-yellow bg-yellow text-white"
                : "border-border bg-white text-muted",
            )}
          >
            <Heart className={cn("size-5", isFavorite ? "fill-current" : "")} strokeWidth={2.8} />
          </button>
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
      </div>
    </Card>
  );
}

function PrayerCardGameDialog({
  language,
  prayer,
  t,
  onClose,
  onSelectPrayer,
}: {
  language: PrayerLanguage;
  prayer: CatholicPrayer;
  t: Translator;
  onClose: () => void;
  onSelectPrayer: (prayerId: string) => void;
}) {
  const translation = prayer.languages[language];
  const selectedIndex = catholicPrayers.findIndex((candidate) => candidate.id === prayer.id);
  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex >= 0 && selectedIndex < catholicPrayers.length - 1;

  function goToPrayer(index: number) {
    const nextPrayer = catholicPrayers[index];
    if (nextPrayer) onSelectPrayer(nextPrayer.id);
  }

  return (
    <FlipCardDialogShell t={t} onClose={onClose}>
      <PrayerFlipCard
        backLabel={t("cardBack")}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        frontLabel={t("cardFront")}
        key={prayer.id}
        metadata={translation.subtitle ?? readablePrayerCategory(prayer.category, t)}
        navigationStyle="plain"
        onNext={() => goToPrayer(selectedIndex + 1)}
        onPrevious={() => goToPrayer(selectedIndex - 1)}
        prayerText={translation.text}
        textLanguage={language}
        title={translation.title}
        typeLabel={getPrayerCardTypeLabel(prayer, t)}
        t={t}
      />
    </FlipCardDialogShell>
  );
}

function NovenaCardGameDialog({
  novena,
  progress,
  t,
  onClose,
  onCompleteDay,
}: {
  novena: Novena;
  progress: NovenaProgress | null;
  t: Translator;
  onClose: () => void;
  onCompleteDay: (day: number) => void;
}) {
  const completedCount = progress?.completedDays.length ?? 0;
  const currentDayNumber = Math.min(completedCount + 1, novena.days.length);
  const initialIndex = progress?.status === "active" ? currentDayNumber - 1 : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedDay = novena.days[selectedIndex];
  const cardTextLanguage = containsHanCharacters(`${selectedDay.title} ${selectedDay.prayer}`)
    ? "zhHant"
    : "en";
  const isActiveDay = progress?.status === "active" && selectedDay.day === currentDayNumber;
  const completedToday = progress?.lastCompletedDate === getTodayInputDate();
  const canComplete = Boolean(progress) && isActiveDay && !completedToday;

  return (
    <FlipCardDialogShell t={t} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border-4 border-white bg-white px-4 py-3 shadow-soft">
          <p className="text-sm font-black uppercase text-yellow">
            {t("dayOf", { day: selectedDay.day, total: novena.days.length })}
          </p>
          <h2 className="text-2xl font-black leading-tight tracking-normal">{selectedDay.title}</h2>
          <p className="mt-1 text-base font-bold leading-snug text-muted">{novena.title}</p>
        </div>

        <PrayerFlipCard
          backLabel={t("cardBack")}
          canGoNext={selectedIndex < novena.days.length - 1}
          canGoPrevious={selectedIndex > 0}
          frontLabel={t("cardFront")}
          key={selectedDay.day}
          metadata={`${t("dayOf", { day: selectedDay.day, total: novena.days.length })} · ${selectedDay.reflection}`}
          navigationStyle="stacked"
          autoFlip={false}
          defaultFlipped={false}
          onNext={() => setSelectedIndex((index) => Math.min(novena.days.length - 1, index + 1))}
          onPrevious={() => setSelectedIndex((index) => Math.max(0, index - 1))}
          prayerText={`${selectedDay.reflection}\n\n${selectedDay.prayer}\n\n${t("action")}: ${selectedDay.action}`}
          remainingCards={novena.days.length - selectedIndex - 1}
          textLanguage={cardTextLanguage}
          title={selectedDay.title}
          typeLabel={t("typeNovena")}
          t={t}
        />

        {progress ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!canComplete}
            onClick={() => onCompleteDay(selectedDay.day)}
          >
            {completedToday ? t("continueTomorrow") : t("completeDay")}
            <Check className="size-5" />
          </Button>
        ) : null}
      </div>
    </FlipCardDialogShell>
  );
}

function FlipCardDialogShell({
  children,
  t,
  onClose,
}: {
  children: React.ReactNode;
  t: Translator;
  onClose: () => void;
}) {
  function closeDialog() {
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-foreground/50 px-2 py-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 230, damping: 20 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-3 right-2 z-30 flex justify-end">
          <button
            type="button"
            aria-label={t("close")}
            onClick={closeDialog}
            className="pointer-events-auto grid size-11 place-items-center rounded-full border-2 border-white bg-white text-xl font-black text-muted shadow-soft"
          >
            ×
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function PrayerFlipCard({
  autoFlip = false,
  backLabel,
  canGoNext = false,
  canGoPrevious = false,
  defaultFlipped = false,
  frontLabel,
  metadata,
  navigationStyle = "plain",
  onNext,
  onPrevious,
  prayerText,
  remainingCards = 0,
  textLanguage,
  title,
  typeLabel,
  t,
}: {
  autoFlip?: boolean;
  backLabel: string;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  defaultFlipped?: boolean;
  frontLabel: string;
  metadata: string;
  navigationStyle?: "plain" | "stacked";
  onNext?: () => void;
  onPrevious?: () => void;
  prayerText: string;
  remainingCards?: number;
  textLanguage: PrayerLanguage;
  title: string;
  typeLabel: string;
  t: Translator;
}) {
  const canNavigate = canGoPrevious || canGoNext;
  const [flipped, setFlipped] = useState(defaultFlipped);

  useEffect(() => {
    setFlipped(defaultFlipped);
    if (!autoFlip) return;

    const timer = window.setTimeout(() => setFlipped(true), 520);
    return () => window.clearTimeout(timer);
  }, [autoFlip, defaultFlipped, title]);

  function handleSwipe(offsetX: number) {
    if (offsetX < -64 && canGoNext) {
      onNext?.();
      return;
    }

    if (offsetX > 64 && canGoPrevious) {
      onPrevious?.();
    }
  }

  return (
    <div className="relative mx-auto w-[min(92vw,25rem)] [perspective:1400px]">
      <div className="relative h-[72svh] min-h-[31rem] max-h-[47rem]">
        {navigationStyle === "stacked" ? (
          <NovenaDeckBackStack remainingCards={remainingCards} />
        ) : null}
        <motion.div
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0, x: 0, rotateZ: 0 }}
          drag={canNavigate ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.24}
          whileDrag={{ rotateZ: canGoNext ? -3 : canGoPrevious ? 3 : 0 }}
          onDragEnd={(_, info) => handleSwipe(info.offset.x)}
          transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.9 }}
        >
        <Card className="absolute inset-0 overflow-hidden border-2 border-yellow bg-yellow p-2 shadow-playful [backface-visibility:hidden]">
          <div className="flex h-full flex-col rounded-[1.1rem] border-2 border-white bg-white p-4">
            <div className="rounded-2xl bg-primary-light px-4 py-2 text-center">
              <p className="text-sm font-black uppercase text-primary-dark">{frontLabel}</p>
            </div>
            <div className="my-4 grid flex-1 place-items-center rounded-[1.35rem] border-2 border-yellow bg-background px-4 py-8 text-center">
              <div className="mb-4 grid size-24 place-items-center rounded-full border-2 border-white bg-yellow text-white shadow-soft">
                <Sparkles className="size-12" strokeWidth={2.8} />
              </div>
              <p className="text-base font-black uppercase text-yellow">{typeLabel}</p>
              <h2 className="mt-2 text-4xl font-black tracking-normal text-foreground">{title}</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-muted">{metadata}</p>
            </div>
            <Button type="button" size="lg" className="mt-auto w-full" onClick={() => setFlipped(true)}>
              {t("flipCard")}
              <RefreshCw className="size-5" />
            </Button>
          </div>
        </Card>

        <Card className="absolute inset-0 overflow-hidden border-2 border-primary bg-primary p-2 shadow-playful [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex h-full flex-col rounded-[1.1rem] border-2 border-white bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-primary-dark">{backLabel}</p>
                <h2 className="text-2xl font-black tracking-normal">{title}</h2>
              </div>
              <button
                type="button"
                aria-label={t("flipCard")}
                title={t("flipCard")}
                onClick={() => setFlipped(false)}
                className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-primary-light bg-primary-light text-primary-dark shadow-soft"
              >
                <RefreshCw className="size-5" strokeWidth={2.8} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-background px-4 py-3">
              <p
                className={cn(
                  "whitespace-pre-line font-bold leading-relaxed text-foreground",
                  textLanguage === "zhHant" ? "text-xl" : "text-lg",
                )}
              >
                {prayerText}
              </p>
            </div>
          </div>
        </Card>
        </motion.div>
      </div>
      {canNavigate ? (
      <div className={cn("mt-4 grid gap-3", canGoPrevious && canGoNext ? "grid-cols-2" : "grid-cols-1")}>
        {canGoPrevious ? (
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={onPrevious}
          >
            <ArrowLeft className="size-5" />
            {t("previous")}
          </Button>
        ) : null}
        {canGoNext ? (
          <Button
            type="button"
            size="lg"
            onClick={onNext}
          >
            {t("next")}
            <ChevronRight className="size-5" />
          </Button>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}

function NovenaDeckBackStack({ remainingCards }: { remainingCards: number }) {
  const visibleCards = Math.min(remainingCards, 2);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {Array.from({ length: visibleCards }).map((_, index) => {
        const layer = visibleCards - index;
        const distance = layer * 0.55;
        const scale = 1 - layer * 0.035;

        return (
          <div
            key={layer}
            className="absolute inset-0 rounded-[1.25rem] border-2 border-white bg-white shadow-soft"
            style={{
              opacity: 0.9 - layer * 0.08,
              transform: `translate(${distance}rem, ${distance * 0.28}rem) scale(${scale})`,
              transformOrigin: "50% 92%",
            }}
          >
            <div className="h-full rounded-[1.1rem] border-2 border-yellow bg-background" />
          </div>
        );
      })}
    </div>
  );
}

function ProgressScreen({
  categoryDistribution,
  completedCount,
  confessionLogs,
  lifeStats,
  streakDays,
  t,
  weekProgress,
  novenaProgress,
  onOpenCalendar,
  progressValue,
}: {
  categoryDistribution: Array<{ category: ActOfPiety["category"]; total: number; completed: number }>;
  completedCount: number;
  confessionLogs: ConfessionLogEntry[];
  lifeStats: LifeRhythmStats;
  streakDays: number;
  t: Translator;
  weekProgress: Array<{ day: string; done: boolean }>;
  novenaProgress: NovenaProgress | null;
  onOpenCalendar: () => void;
  progressValue: number;
}) {
  const novenaCompletedCount = novenaProgress?.completedDays.length ?? 0;
  const badges = getBadgeLevels(lifeStats.badgePoints, t);

  return (
    <ScreenMotion className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-black text-primary-dark">{t("progress")}</p>
          <h1 className="text-3xl font-black tracking-normal">{t("progressTitle")}</h1>
        </div>
        <button
          type="button"
          aria-label={t("openCalendar")}
          title={t("openCalendar")}
          onClick={onOpenCalendar}
          className="grid size-12 shrink-0 place-items-center rounded-2xl border-4 border-white bg-primary-light text-primary-dark shadow-playful transition active:translate-y-1 active:shadow-none"
        >
          <CalendarDays className="size-6" strokeWidth={2.8} />
        </button>
      </header>

      <Card className="border-4 border-yellow p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-full bg-yellow text-white">
            <AnimatedFireIcon className="size-10" />
          </div>
          <div>
            <p className="text-4xl font-black">{streakDays}</p>
            <p className="text-lg font-black text-muted">{t("streakMetric")}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-4 border-primary-light p-4">
        <div className="flex items-center gap-4">
          <div className="relative grid size-24 shrink-0 place-items-center rounded-[1.5rem] bg-primary-light">
            <MascotAnimation title={t("appTitle")} className="size-24" />
            <span className="mascot-glow absolute inset-x-5 bottom-3 h-2 rounded-full bg-primary/20 blur-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black leading-tight">{t("mascotEncouragementTitle")}</p>
            <p className="mt-2 text-base font-bold leading-relaxed text-muted">{t("mascotEncouragementDetail")}</p>
            <span className="mt-3 inline-flex rounded-full bg-primary-light px-3 py-1 text-sm font-black text-primary-dark">
              {t("badgePoints")}: {lifeStats.badgePoints}
            </span>
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
          <h2 className="text-2xl font-black">{t("lifeRhythm")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatPill label={t("totalActsCompleted")} value={`${lifeStats.totalCompletions}`} />
          <StatPill label={t("activeDays")} value={`${lifeStats.activeDays}`} />
          <StatPill label={t("weeklyConsistency")} value={`${lifeStats.weeklyConsistency}%`} />
          <StatPill label={t("badgePoints")} value={`${lifeStats.badgePoints}`} />
        </div>
        <Progress value={lifeStats.weeklyConsistency} className="mt-4" />
        <p className="mt-4 text-lg font-black text-muted">
          {t("badgeHint")}
        </p>
      </Card>

      <Card className="border-4 border-yellow p-5">
        <div className="mb-4 flex items-center gap-3">
          <Award className="size-9 text-yellow" />
          <h2 className="text-2xl font-black">{t("badges")}</h2>
        </div>
        <div className="grid gap-3">
          {badges.map((badge) => (
            <BadgeLevelRow key={badge.id} badge={badge} t={t} />
          ))}
        </div>
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background px-3 py-3">
      <p className="text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

function BadgeLevelRow({
  badge,
  t,
}: {
  badge: ReturnType<typeof getBadgeLevels>[number];
  t: Translator;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-4 p-3",
        badge.unlocked ? "border-yellow bg-yellow/20" : "border-border bg-background",
      )}
    >
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl text-white",
          badge.unlocked ? "bg-yellow" : "bg-muted",
        )}
      >
        <Medal className="size-6" strokeWidth={2.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-black">{badge.title}</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-muted">
            {badge.unlocked ? t("badgeUnlocked") : t("badgeLocked")}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-muted">{badge.detail}</p>
        <Progress value={badge.progress} className="mt-2 h-4" />
      </div>
    </div>
  );
}

function ProfileScreen({
  appVersion,
  lastSeenAppVersion,
  personalProfile,
  preferences,
  profile,
  progressValue,
  t,
  onClearStorage,
  onAcknowledgeVersionUpdate,
  onFontScaleChange,
  onPersonalProfileChange,
  onPrayerLanguageChange,
  onUiLanguageChange,
  onReset,
  onShowInstallGuide,
  onShowOrientation,
}: {
  appVersion: string;
  lastSeenAppVersion: string;
  personalProfile: PersonalProfile;
  preferences: AppPreferences;
  profile: UserSpiritualProfile;
  progressValue: number;
  t: Translator;
  onAcknowledgeVersionUpdate: () => void;
  onClearStorage: () => void;
  onFontScaleChange: (fontScale: number) => void;
  onPersonalProfileChange: (profile: PersonalProfile) => void;
  onPrayerLanguageChange: (language: PrayerLanguage) => void;
  onUiLanguageChange: (language: UiLanguage) => void;
  onReset: () => void;
  onShowInstallGuide: () => void;
  onShowOrientation: () => void;
}) {
  const [editingPersonalProfile, setEditingPersonalProfile] = useState(false);

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserRound className="size-9 shrink-0 text-primary-dark" />
            <h2 className="text-2xl font-black">{t("personalProfile")}</h2>
          </div>
          <button
            type="button"
            aria-label={editingPersonalProfile ? t("save") : t("edit")}
            title={editingPersonalProfile ? t("save") : t("edit")}
            onClick={() => setEditingPersonalProfile((editing) => !editing)}
            className="grid size-10 shrink-0 place-items-center rounded-full border-4 border-primary-light bg-white text-primary-dark shadow-soft transition active:translate-y-1 active:shadow-none"
          >
            {editingPersonalProfile ? (
              <Save className="size-5" strokeWidth={2.8} />
            ) : (
              <Pencil className="size-5" strokeWidth={2.8} />
            )}
          </button>
        </div>

        {editingPersonalProfile ? (
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
        ) : (
          <div className="grid gap-3">
            <ProfileField label={t("name")} value={personalProfile.displayName || t("notSet")} />
            <ProfileField label={t("parish")} value={personalProfile.parish || t("notSet")} />
            <ProfileField
              label={t("patronSaint")}
              value={personalProfile.patronSaint || t("notSet")}
            />
          </div>
        )}
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

      <AppUpdateCard
        appVersion={appVersion}
        lastSeenAppVersion={lastSeenAppVersion}
        t={t}
        onAcknowledgeVersionUpdate={onAcknowledgeVersionUpdate}
      />

      <Card className="border-4 border-yellow p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-yellow text-white">
            <CircleHelp className="size-6" strokeWidth={2.8} />
          </div>
          <div>
            <h2 className="text-2xl font-black">{t("helpAndSetup")}</h2>
            <p className="text-base font-bold text-muted">{t("orientationSubtitle")}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Button type="button" size="lg" className="w-full" onClick={onShowInstallGuide}>
            <Smartphone className="size-5" />
            {t("installApp")}
          </Button>
          <Button type="button" size="lg" variant="secondary" className="w-full" onClick={onShowOrientation}>
            <Compass className="size-5" />
            {t("orientationButton")}
          </Button>
        </div>
      </Card>

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

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background px-4 py-3">
      <p className="text-sm font-black uppercase text-muted">{label}</p>
      <p className="break-words text-lg font-black text-foreground">{value}</p>
    </div>
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

function AppUpdateCard({
  appVersion,
  lastSeenAppVersion,
  t,
  onAcknowledgeVersionUpdate,
}: {
  appVersion: string;
  lastSeenAppVersion: string;
  t: Translator;
  onAcknowledgeVersionUpdate: () => void;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<TranslationKey>("updateReady");
  const hasNewVersion = compareVersionStrings(lastSeenAppVersion, appVersion) < 0;

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && process.env.NODE_ENV === "production");
  }, []);

  async function updateApp() {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      setStatus("alreadyLatest");
      if (hasNewVersion) {
        onAcknowledgeVersionUpdate();
      }
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
        onAcknowledgeVersionUpdate();
        window.setTimeout(reloadApp, 1200);
        return;
      }

      if (registration.active) {
        await requestAppShellRefresh(registration.active);
        onAcknowledgeVersionUpdate();
        reloadApp();
        return;
      }

      await clearAppCaches();
      onAcknowledgeVersionUpdate();
      reloadApp();
    } catch {
      setStatus("updateFailed");
      setIsUpdating(false);
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
            {hasNewVersion
              ? t("newUpdateDetail", { version: appVersion })
              : status === "alreadyLatest"
                ? t("alreadyLatestDetail")
                : isSupported
                  ? t(status)
                  : t("alreadyLatestDetail")}
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <ScheduleInfoPill label={t("installedVersion")} value={lastSeenAppVersion} />
        <ScheduleInfoPill label={t("currentVersion")} value={appVersion} />
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={updateApp}
        disabled={isUpdating}
      >
        {isUpdating ? t("updating") : t("updateApp")}
        <RefreshCw className={cn("size-5", isUpdating ? "animate-spin" : "")} />
      </Button>
    </Card>
  );
}

function InstallGuideDialog({ t, onClose }: { t: Translator; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 grid place-items-center bg-foreground/50 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 230, damping: 20 }}
      >
        <Card className="max-h-[86svh] overflow-y-auto border-4 border-yellow p-5 shadow-soft">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow text-white">
                <Smartphone className="size-6" strokeWidth={2.8} />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-yellow">{t("installApp")}</p>
                <h2 className="text-3xl font-black tracking-normal">{t("installGuide")}</h2>
                <p className="mt-1 text-base font-bold leading-relaxed text-muted">
                  {t("installGuideDetail")}
                </p>
              </div>
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

          <div className="grid gap-4">
            <InstallGuideSteps
              title={t("androidInstall")}
              steps={[
                t("androidInstallStep1"),
                t("androidInstallStep2"),
                t("androidInstallStep3"),
                t("androidInstallStep4"),
              ]}
            />
            <InstallGuideSteps
              title={t("iosInstall")}
              steps={[
                t("iosInstallStep1"),
                t("iosInstallStep2"),
                t("iosInstallStep3"),
                t("iosInstallStep4"),
              ]}
            />
          </div>

          <Button type="button" size="lg" className="mt-5 w-full" onClick={onClose}>
            {t("close")}
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function InstallGuideSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-3xl border-4 border-border bg-background p-4">
      <h3 className="mb-3 text-xl font-black tracking-normal">{title}</h3>
      <div className="grid gap-2">
        {steps.map((step, index) => (
          <div key={step} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl bg-white px-3 py-2">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-black text-white">
              {index + 1}
            </span>
            <p className="text-base font-bold leading-relaxed text-foreground">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrientationDialog({
  currentStep,
  stepIndex,
  totalSteps,
  t,
  onClose,
  onNext,
  onPrevious,
}: {
  currentStep: (typeof orientationSteps)[number];
  stepIndex: number;
  totalSteps: number;
  t: Translator;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const Icon = currentStep.icon;
  const isLastStep = stepIndex >= totalSteps - 1;

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end bg-foreground/35 px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-auto w-full max-w-md"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 230, damping: 22 }}
      >
        <Card className="border-4 border-primary-light p-5 shadow-soft">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white">
                <Icon className="size-6" strokeWidth={2.8} />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-primary-dark">{t("orientation")}</p>
                <h2 className="text-2xl font-black tracking-normal">
                  {t(currentStep.titleKey)}
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label={t("skipOrientation")}
              onClick={onClose}
              className="rounded-full bg-background px-3 py-2 text-sm font-black text-muted"
            >
              {t("skipOrientation")}
            </button>
          </div>

          <p className="text-base font-bold leading-relaxed text-muted">
            {t(currentStep.detailKey)}
          </p>

          <div className="my-4 grid grid-cols-5 gap-2">
            {orientationSteps.map((step, index) => {
              const StepIcon = step.icon;
              const active = index === stepIndex;

              return (
                <div
                  key={step.tab}
                  className={cn(
                    "grid aspect-square place-items-center rounded-2xl border-4",
                    active
                      ? "border-primary bg-primary text-white shadow-playful"
                      : "border-border bg-background text-muted",
                  )}
                >
                  <StepIcon className="size-5" strokeWidth={active ? 3 : 2.4} />
                </div>
              );
            })}
          </div>

          <p className="mb-4 rounded-2xl bg-primary-light px-4 py-3 text-sm font-black text-primary-dark">
            {t("orientationHighlight")}: {t(currentStep.titleKey)} · {stepIndex + 1}/{totalSteps}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              disabled={stepIndex === 0}
              onClick={onPrevious}
            >
              {t("previous")}
            </Button>
            <Button type="button" size="lg" onClick={onNext}>
              {isLastStep ? t("finishOrientation") : t("next")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function FloatingBackButton({ t, onBack }: { t: Translator; onBack: () => void }) {
  return (
    <button
      type="button"
      aria-label={t("back")}
      onClick={onBack}
      className="floating-back z-30 grid size-12 place-items-center rounded-full border-4 border-border bg-white text-foreground shadow-playful active:translate-y-1 active:shadow-none"
    >
      <ArrowLeft className="size-6" strokeWidth={3} />
    </button>
  );
}

function BottomNav({
  activeTab,
  highlightedTab,
  t,
  onChange,
}: {
  activeTab: Tab;
  highlightedTab: Tab | null;
  t: Translator;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="bottom-dock z-20 px-4">
      <div className="grid grid-cols-5 gap-1 rounded-[2rem] border-4 border-white bg-white p-2 shadow-soft">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const highlighted = highlightedTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-3xl text-[0.68rem] font-black leading-tight transition",
                active ? "bg-primary-light text-primary-dark" : "text-muted",
                highlighted && "animate-pulse ring-4 ring-yellow ring-offset-2 ring-offset-white",
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

  return [value, setValue, hydrated] as const;
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
      if (!piety || piety.kind === "tip") return null;

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
  const repeatDays = entry.repeatDays;

  if (repeatDays) {
    if (repeatDays.length === 0) return false;
    if (!repeatDays.includes(targetDate.getDay())) return false;
  }

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

function getDefaultRepeatDays(frequency: PietyFrequency) {
  return frequency === "daily" ? [0, 1, 2, 3, 4, 5, 6] : [];
}

function getWeekdayOptions(language: UiLanguage) {
  const labels =
    language === "zhHant"
      ? ["日", "一", "二", "三", "四", "五", "六"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return labels.map((label, value) => ({ label, value }));
}

function getSaintFeastsForMonth(date: string) {
  const month = parseInputDate(date).getMonth();

  return saintProfiles.filter((saint) => getFeastMonthIndex(saint.feastDay) === month);
}

function getFeastMonthIndex(feastDay: string) {
  const monthName = feastDay.split(" ")[0]?.toLocaleLowerCase();
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  return monthNames.indexOf(monthName);
}

function getBadgeLevels(totalPoints: number, t: Translator) {
  const levels = [
    { id: "spark", threshold: 80, title: "Spark" },
    { id: "steady", threshold: 220, title: "Steady Flame" },
    { id: "pilgrim", threshold: 520, title: "Pilgrim" },
    { id: "faithful", threshold: 1100, title: "Faithful Builder" },
    { id: "rule", threshold: 2200, title: "Rule of Life" },
  ];

  return levels.map((level) => ({
    ...level,
    detail:
      t("badges") === "徽章"
        ? `需要 ${level.threshold} 點；目前 ${totalPoints} 點`
        : `${level.threshold} points needed; ${totalPoints} now`,
    progress: Math.min(100, Math.round((totalPoints / level.threshold) * 100)),
    unlocked: totalPoints >= level.threshold,
  }));
}

function getLifeRhythmStats(
  completions: PietyCompletionEntry[],
  novenaProgress: NovenaProgress | null,
  today: string,
): LifeRhythmStats {
  const completionDates = new Set(completions.map((entry) => entry.date));
  if (novenaProgress?.lastCompletedDate) {
    completionDates.add(novenaProgress.lastCompletedDate);
  }

  const recentActiveDays = Array.from({ length: 7 }, (_, index) => {
    const date = toInputDate(addDays(parseInputDate(today), -index));
    return completionDates.has(date);
  }).filter(Boolean).length;
  const weeklyConsistency = Math.round((recentActiveDays / 7) * 100);
  const activeDays = completionDates.size;
  const totalCompletions = completions.length + (novenaProgress?.completedDays.length ?? 0);
  const streakDays = getCompletionStreak(completions, novenaProgress, today);
  const badgePoints = totalCompletions * 8 + activeDays * 18 + streakDays * 25 + weeklyConsistency;

  return {
    activeDays,
    badgePoints,
    totalCompletions,
    weeklyConsistency,
  };
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

function formatScheduleSummary(
  startDate: string,
  frequency: PietyFrequency,
  repeatDays: number[],
  repeatTimes: string[],
  language: UiLanguage,
  t: Translator,
) {
  const weekdays = getWeekdayOptions(language)
    .filter((day) => repeatDays.includes(day.value))
    .map((day) => day.label)
    .join(", ");
  const times = repeatTimes.length > 0 ? repeatTimes.join(", ") : t("noRepeatTimes");

  return `${formatDisplayDate(startDate, language)} · ${getFrequencyLabel(frequency, t)} · ${weekdays || t("repeatDays")} · ${times}`;
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

function getMonthCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => addDays(startDate, index));
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

function getPrayerCardTypeLabel(prayer: CatholicPrayer, t: Translator) {
  if (prayer.category === "rosary") return t("typeRosary");
  return t("typePrayers");
}

function compareVersionStrings(left: string, right: string) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
  }

  return 0;
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

function containsHanCharacters(value: string) {
  return /[\u3400-\u9fff]/.test(value);
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

function getTodayGreeting(displayName: string, language: UiLanguage, fallbackName: string) {
  const name = displayName.trim() || fallbackName;
  const greetings =
    language === "zhHant"
      ? [
          `今天平安，${name}`,
          `${name}，願今天充滿恩寵`,
          `${name}，一起走今天的小步驟`,
          `歡迎回來，${name}`,
          `${name}，今天也與主同行`,
        ]
      : [
          `Peace today, ${name}`,
          `${name}, grace for today`,
          `Welcome back, ${name}`,
          `${name}, one faithful step today`,
          `Good to see you, ${name}`,
        ];

  return greetings[Math.floor(Math.random() * greetings.length)];
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
