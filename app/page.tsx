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
  catholicPrayers,
  defaultPersonalProfile,
  defaultPreferences,
  defaultProfile,
  dailyPlan,
  getRecommendedPlan,
  novenas,
  onboardingQuestions,
  sacramentalActions,
  weeklyProgress,
} from "@/lib/mock-data";
import type {
  AppPreferences,
  CatholicPrayer,
  ConfessionLogEntry,
  DailyPlanItem,
  Novena,
  NovenaProgress,
  OnboardingAnswerKey,
  PersonalProfile,
  PrayerCategory,
  PrayerLanguage,
  PracticeStatus,
  SacramentalAction,
  UserSpiritualProfile,
} from "@/lib/types";

type AppStage = "welcome" | "onboarding" | "app";
type Tab = "today" | "explore" | "prayers" | "progress" | "profile";

const tabItems = [
  { id: "today", label: "Today", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "prayers", label: "Prayers", icon: ScrollText },
  { id: "progress", label: "Progress", icon: Award },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

const practiceIcons = [Sun, BookOpen, Heart, Church, Moon];
const prayerLanguageOptions: Array<{ id: PrayerLanguage; label: string; shortLabel: string }> = [
  { id: "en", label: "English", shortLabel: "EN" },
  { id: "zhHant", label: "Traditional Chinese", shortLabel: "繁中" },
];
const confessionFrequencyOptions = [
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months" },
] as const;

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
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [confessionLogs, setConfessionLogs] = useLocalStorageState<ConfessionLogEntry[]>(
    "plan-of-life:confession-logs",
    [],
  );
  const [novenaProgress, setNovenaProgress] = useLocalStorageState<NovenaProgress | null>(
    "plan-of-life:novena-progress",
    null,
  );

  const completedCount = plan.filter((item) => item.status === "completed").length;
  const progressValue = Math.round((completedCount / plan.length) * 100);
  const selectedPractice = plan.find((item) => item.id === selectedPracticeId);

  const visiblePlan = useMemo(() => {
    return [...plan].sort((a, b) => a.recommendedOrder - b.recommendedOrder);
  }, [plan]);

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
    setTimeout(() => setStage("app"), 220);
  }

  function completePractice(itemId: string) {
    const item = plan.find((entry) => entry.id === itemId);
    setPlan((items) =>
      items.map((entry) =>
        entry.id === itemId ? { ...entry, status: "completed" as PracticeStatus } : entry,
      ),
    );
    setCompletionMessage(`${item?.practice.title ?? "Practice"} complete. +10 Grace Points`);
    setTimeout(() => setCompletionMessage(null), 1800);
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
    setCompletionMessage("Novena started. Day 1 is ready.");
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

    setCompletionMessage(day >= 9 ? "Novena complete." : `Novena day ${day} complete.`);
    setTimeout(() => setCompletionMessage(null), 1800);
  }

  function quitNovena() {
    setNovenaProgress(null);
  }

  function clearStoredAppData() {
    if (!window.confirm("Clear all saved Plan of Life data from this device?")) {
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
    setSelectedPracticeId(null);
  }

  if (stage === "welcome") {
    return <WelcomeScreen onStart={() => setStage("onboarding")} />;
  }

  if (stage === "onboarding") {
    return (
      <OnboardingScreen
        questionIndex={questionIndex}
        answers={answers}
        onChoose={chooseAnswer}
      />
    );
  }

  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-md flex-col bg-background",
        selectedPractice ? "overflow-visible" : "overflow-hidden",
      )}
    >
      <div className="flex-1 px-4 pb-28 pt-5">
        {selectedPractice ? (
          <PracticeDetail
            key={selectedPractice.id}
            item={selectedPractice}
            onBack={() => setSelectedPracticeId(null)}
            onComplete={() => completePractice(selectedPractice.id)}
          />
        ) : activeTab === "today" ? (
          <TodayScreen
            key="today"
            profile={profile}
            plan={visiblePlan}
            completedCount={completedCount}
            progressValue={progressValue}
            onOpenPractice={setSelectedPracticeId}
            onComplete={completePractice}
          />
        ) : activeTab === "explore" ? (
          <ExploreScreen
            key="explore"
            confessionFrequencyDays={preferences.confessionFrequencyDays}
            confessionLogs={confessionLogs}
            onAddConfessionLog={addConfessionLog}
            onConfessionFrequencyChange={(confessionFrequencyDays) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                confessionFrequencyDays,
              }))
            }
            onDeleteConfessionLog={deleteConfessionLog}
          />
        ) : activeTab === "prayers" ? (
          <PrayersScreen
            key="prayers"
            language={preferences.prayerLanguage}
            novenaProgress={novenaProgress}
            onCompleteNovenaDay={completeNovenaDay}
            onLanguageChange={(prayerLanguage) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                prayerLanguage,
              }))
            }
            onQuitNovena={quitNovena}
            onStartNovena={startNovena}
          />
        ) : activeTab === "progress" ? (
          <ProgressScreen
            key="progress"
            completedCount={completedCount}
            confessionLogs={confessionLogs}
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
            onClearStorage={clearStoredAppData}
            onPersonalProfileChange={setPersonalProfile}
            onPrayerLanguageChange={(prayerLanguage) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                prayerLanguage,
              }))
            }
            onReset={resetOnboarding}
          />
        )}
      </div>

      <AnimatePresence>
        {completionMessage ? <CompletionToast message={completionMessage} /> : null}
      </AnimatePresence>

      {!selectedPractice ? (
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      ) : null}
    </main>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
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
            Grow your prayer life step by step
          </h1>
          <p className="text-lg font-bold leading-relaxed text-muted">
            Build simple Catholic habits with daily acts of piety.
          </p>
        </div>
      </section>

      <Button size="xl" className="w-full" onClick={onStart}>
        Get Started
        <ChevronRight className="size-6" />
      </Button>
    </main>
  );
}

function OnboardingScreen({
  questionIndex,
  answers,
  onChoose,
}: {
  questionIndex: number;
  answers: Partial<Record<OnboardingAnswerKey, string>>;
  onChoose: (key: OnboardingAnswerKey, value: string) => void;
}) {
  const safeQuestionIndex = Math.min(questionIndex, onboardingQuestions.length - 1);
  const question = onboardingQuestions[safeQuestionIndex];
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
            {question.title}
          </h1>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => {
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
                <span>{option.label}</span>
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
  plan,
  completedCount,
  progressValue,
  onOpenPractice,
  onComplete,
}: {
  profile: UserSpiritualProfile;
  plan: DailyPlanItem[];
  completedCount: number;
  progressValue: number;
  onOpenPractice: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  return (
    <ScreenMotion className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-black text-primary-dark">Peace be with you</p>
          <h1 className="text-3xl font-black tracking-normal">Today</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border-4 border-white bg-yellow px-3 py-2 text-sm font-black shadow-playful">
          <Flame className="size-5 fill-white text-white" />
          7 day streak
        </div>
      </header>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-muted">Daily progress</p>
            <p className="text-2xl font-black">{completedCount} of {plan.length} complete</p>
          </div>
          <div className="grid size-16 place-items-center rounded-full bg-primary-light text-xl font-black text-primary-dark">
            {progressValue}%
          </div>
        </div>
        <Progress value={progressValue} />
        <p className="mt-4 text-base font-bold text-muted">
          Your {profile.dailyPrayerTimeMinutes}-minute goal is ready in small steps.
        </p>
      </Card>

      <section>
        <h2 className="mb-3 text-2xl font-black">Today&apos;s Spiritual Plan</h2>
        <div className="space-y-4">
          {plan.map((item, index) => (
            <PracticeCard
              key={item.id}
              item={item}
              iconIndex={index}
              onOpen={() => onOpenPractice(item.id)}
              onComplete={() => onComplete(item.id)}
            />
          ))}
        </div>
      </section>
    </ScreenMotion>
  );
}

function PracticeCard({
  item,
  iconIndex,
  onOpen,
  onComplete,
}: {
  item: DailyPlanItem;
  iconIndex: number;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const Icon = practiceIcons[iconIndex % practiceIcons.length];
  const completed = item.status === "completed";

  return (
    <Card
      onClick={onOpen}
      className={cn(
        "cursor-pointer border-4 p-4 transition active:translate-y-1 active:shadow-none",
        completed ? "border-primary bg-primary-light" : "border-border",
      )}
    >
      <div className="flex gap-4">
        <div className={cn("grid size-16 shrink-0 place-items-center rounded-3xl", completed ? "bg-primary text-white" : "bg-blue text-white")}>
          <Icon className="size-8" strokeWidth={2.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="text-xl font-black leading-tight">{item.practice.title}</h3>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
              {item.practice.estimatedMinutes} min
            </span>
          </div>
          <p className="mb-4 text-base font-bold leading-snug text-muted">
            {item.practice.description}
          </p>
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
              Open
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
              {completed ? "Done" : "Complete"}
              <Check className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PracticeDetail({
  item,
  onBack,
  onComplete,
}: {
  item: DailyPlanItem;
  onBack: () => void;
  onComplete: () => void;
}) {
  const completed = item.status === "completed";

  return (
    <ScreenMotion className="flex min-h-[calc(100vh-2.5rem)] flex-col space-y-5">
      <button
        onClick={onBack}
        className="sticky top-3 z-30 w-fit rounded-full border-4 border-border bg-white px-4 py-2 text-base font-black shadow-playful active:translate-y-1 active:shadow-none"
      >
        Back
      </button>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-primary-light text-primary-dark">
          <BookOpen className="size-10" strokeWidth={2.8} />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue px-3 py-1 text-sm font-black text-white">
            {readableCategory(item.practice.category)}
          </span>
          <span className="rounded-full bg-yellow px-3 py-1 text-sm font-black text-foreground">
            {item.practice.estimatedMinutes} min
          </span>
        </div>
        <h1 className="mb-3 text-4xl font-black leading-tight tracking-normal">
          {item.practice.title}
        </h1>
        <p className="text-lg font-bold leading-relaxed text-muted">
          {item.practice.description}
        </p>
      </Card>

      <Card className="flex-1 border-4 border-border p-5">
        <h2 className="mb-3 text-2xl font-black">Prayer</h2>
        <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-foreground">
          {item.practice.content}
        </p>
      </Card>

      <Button
        size="xl"
        className="w-full"
        variant={completed ? "secondary" : "default"}
        onClick={onComplete}
      >
        {completed ? "Completed" : "Mark as Completed"}
        <Check className="size-6" />
      </Button>
    </ScreenMotion>
  );
}

function ExploreScreen({
  confessionFrequencyDays,
  confessionLogs,
  onAddConfessionLog,
  onConfessionFrequencyChange,
  onDeleteConfessionLog,
}: {
  confessionFrequencyDays: number;
  confessionLogs: ConfessionLogEntry[];
  onAddConfessionLog: (date: string, note: string) => void;
  onConfessionFrequencyChange: (days: number) => void;
  onDeleteConfessionLog: (entryId: string) => void;
}) {
  const [confessionDate, setConfessionDate] = useState(getTodayInputDate());
  const [confessionNote, setConfessionNote] = useState("");
  const confessionStatus = getConfessionStatus(confessionLogs, confessionFrequencyDays);

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
        <p className="text-base font-black text-primary-dark">Explore</p>
        <h1 className="text-3xl font-black tracking-normal">Sacramental life</h1>
      </header>

      <Card className="border-4 border-danger p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-danger">Confession rhythm</p>
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
            <span className="text-sm font-black uppercase text-muted">Date</span>
            <input
              type="date"
              value={confessionDate}
              onChange={(event) => setConfessionDate(event.target.value)}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-black text-foreground outline-none focus:border-danger"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">Note</span>
            <input
              type="text"
              value={confessionNote}
              onChange={(event) => setConfessionNote(event.target.value)}
              placeholder="Grace, counsel, next step"
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-danger"
            />
          </label>

          <Button type="submit" size="lg" className="w-full">
            Add Confession
            <CalendarPlus className="size-5" />
          </Button>
        </form>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">Confession log</h3>
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
                    <p className="text-base font-black">{formatDisplayDate(entry.date)}</p>
                    {entry.note ? (
                      <p className="break-words text-sm font-bold text-muted">{entry.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete confession log from ${formatDisplayDate(entry.date)}`}
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
              No confession logged yet.
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4">
        {sacramentalActions.map((action) => (
          <SacramentalActionCard key={action.id} action={action} />
        ))}
      </div>
    </ScreenMotion>
  );
}

function SacramentalActionCard({ action }: { action: SacramentalAction }) {
  const Icon = getSacramentalActionIcon(action.type);

  return (
    <Card className="border-4 border-primary-light p-5">
      <div className="mb-4 flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
          <Icon className="size-7" strokeWidth={2.8} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase text-muted">{action.cadence}</p>
          <h2 className="text-2xl font-black tracking-normal">{action.title}</h2>
          <p className="mt-1 text-base font-bold leading-relaxed text-muted">
            {action.description}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {action.steps.map((step) => (
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
  novenaProgress,
  onCompleteNovenaDay,
  onLanguageChange,
  onQuitNovena,
  onStartNovena,
}: {
  language: PrayerLanguage;
  novenaProgress: NovenaProgress | null;
  onCompleteNovenaDay: (day: number) => void;
  onLanguageChange: (language: PrayerLanguage) => void;
  onQuitNovena: () => void;
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
          <p className="text-base font-black text-primary-dark">Prayers</p>
          <h1 className="text-3xl font-black tracking-normal">Common Catholic prayers</h1>
        </div>

        <div
          role="group"
          aria-label="Prayer language"
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
            aria-label="Search prayers"
            placeholder={language === "en" ? "Search prayers" : "搜尋經文"}
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
                onCompleteDay={onCompleteNovenaDay}
                onQuit={onQuitNovena}
                onStart={onStartNovena}
              />
            ))}

            {visiblePrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} language={language} />
            ))}
          </>
        ) : (
          <Card className="border-4 border-border p-5 text-center">
            <ScrollText className="mx-auto mb-3 size-10 text-primary-dark" />
            <h2 className="text-2xl font-black">No prayers found</h2>
            <p className="mt-2 text-base font-bold text-muted">
              Try another title, devotion, or keyword.
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
  onCompleteDay,
  onQuit,
  onStart,
}: {
  novena: Novena;
  progress: NovenaProgress | null;
  hasOtherActiveNovena: boolean;
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
          <p className="text-sm font-black uppercase text-yellow">Novena</p>
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
                {isCompleted ? "Complete" : `Day ${currentDayNumber} of ${novena.days.length}`}
              </p>
              <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted">
                {completedCount}/{novena.days.length}
              </span>
            </div>
            <Progress value={progressValue} />
          </div>

          {progress.intention ? (
            <div className="rounded-2xl bg-background px-4 py-3">
              <p className="text-sm font-black uppercase text-muted">Intention</p>
              <p className="break-words text-base font-bold text-foreground">
                {progress.intention}
              </p>
            </div>
          ) : null}

          {isCompleted ? (
            <div className="rounded-2xl bg-primary-light px-4 py-3">
              <p className="text-xl font-black text-primary-dark">Novena complete</p>
              <p className="mt-1 text-base font-bold text-muted">
                You completed all nine days.
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border-4 border-border bg-white p-4">
              <div>
                <p className="text-sm font-black uppercase text-muted">
                  Day {currentDay.day}
                </p>
                <h3 className="text-2xl font-black tracking-normal">{currentDay.title}</h3>
              </div>
              <p className="text-base font-bold leading-relaxed text-muted">
                {currentDay.reflection}
              </p>
              <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-foreground">
                {currentDay.prayer}
              </p>
              <div className="rounded-2xl bg-background px-4 py-3">
                <p className="text-sm font-black uppercase text-muted">Action</p>
                <p className="text-base font-black text-foreground">{currentDay.action}</p>
              </div>
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
              {completedToday ? "Continue Tomorrow" : "Complete Day"}
              <Check className="size-5" />
            </Button>
            <Button type="button" size="lg" variant="danger" onClick={onQuit}>
              Quit
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitNovenaStart} className="space-y-3">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">Intention</span>
            <input
              type="text"
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              placeholder={novena.intentionPrompt}
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-yellow"
            />
          </label>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={hasOtherActiveNovena}
          >
            {hasOtherActiveNovena ? "Novena Active" : "Start Novena"}
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
}: {
  prayer: CatholicPrayer;
  language: PrayerLanguage;
}) {
  const translation = prayer.languages[language];

  return (
    <Card className="border-4 border-border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-black uppercase text-primary-dark">
            {readablePrayerCategory(prayer.category)}
          </p>
          <h2 className="text-2xl font-black tracking-normal">{translation.title}</h2>
          {translation.subtitle ? (
            <p className="mt-1 text-base font-bold text-muted">{translation.subtitle}</p>
          ) : null}
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
          <ScrollText className="size-6" strokeWidth={2.8} />
        </div>
      </div>

      <p
        className={cn(
          "whitespace-pre-line font-bold leading-relaxed text-foreground",
          language === "zhHant" ? "text-xl" : "text-lg",
        )}
      >
        {translation.text}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {prayer.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary-light px-3 py-1 text-xs font-black text-primary-dark"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

function ProgressScreen({
  completedCount,
  confessionLogs,
  novenaProgress,
  progressValue,
}: {
  completedCount: number;
  confessionLogs: ConfessionLogEntry[];
  novenaProgress: NovenaProgress | null;
  progressValue: number;
}) {
  const novenaCompletedCount = novenaProgress?.completedDays.length ?? 0;

  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">Progress</p>
        <h1 className="text-3xl font-black tracking-normal">Small steps add up</h1>
      </header>

      <Card className="border-4 border-yellow p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-full bg-yellow text-white">
            <Flame className="size-10 fill-white" />
          </div>
          <div>
            <p className="text-4xl font-black">7</p>
            <p className="text-lg font-black text-muted">day prayer streak</p>
          </div>
        </div>
      </Card>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">This week</h2>
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-black text-primary-dark">
            {completedCount} completed
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyProgress.map((day, index) => (
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
          <h2 className="text-2xl font-black">Grace Points</h2>
        </div>
        <Progress value={Math.max(progressValue, 35)} />
        <p className="mt-4 text-lg font-black text-muted">
          Keep showing up. Your next badge is close.
        </p>
      </Card>

      <Card className="border-4 border-border p-5">
        <div className="mb-4 flex items-center gap-3">
          <ClipboardList className="size-9 text-primary-dark" />
          <h2 className="text-2xl font-black">Saved tracks</h2>
        </div>
        <div className="grid gap-3">
          <TrackSummaryRow label="Confessions logged" value={`${confessionLogs.length}`} />
          <TrackSummaryRow
            label="Novena progress"
            value={
              novenaProgress
                ? `${novenaCompletedCount}/9 ${novenaProgress.status}`
                : "No active novena"
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
  onClearStorage,
  onPersonalProfileChange,
  onPrayerLanguageChange,
  onReset,
}: {
  personalProfile: PersonalProfile;
  preferences: AppPreferences;
  profile: UserSpiritualProfile;
  progressValue: number;
  onClearStorage: () => void;
  onPersonalProfileChange: (profile: PersonalProfile) => void;
  onPrayerLanguageChange: (language: PrayerLanguage) => void;
  onReset: () => void;
}) {
  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">Profile</p>
        <h1 className="text-3xl font-black tracking-normal">Your prayer path</h1>
      </header>

      <Card className="border-4 border-primary-light p-5 text-center">
        <div className="mx-auto mb-4 grid size-24 place-items-center rounded-full bg-primary-light text-primary-dark">
          <ShieldCheck className="size-12" strokeWidth={2.8} />
        </div>
        <h2 className="text-2xl font-black">Growing step by step</h2>
        <p className="text-base font-bold text-muted">{progressValue}% of today&apos;s plan complete</p>
      </Card>

      <Card className="border-4 border-primary-light p-5">
        <div className="mb-4 flex items-center gap-3">
          <UserRound className="size-9 text-primary-dark" />
          <h2 className="text-2xl font-black">Personal profile</h2>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">Name</span>
            <input
              type="text"
              value={personalProfile.displayName}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  displayName: event.target.value,
                })
              }
              placeholder="Your name"
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">Parish</span>
            <input
              type="text"
              value={personalProfile.parish}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  parish: event.target.value,
                })
              }
              placeholder="Parish name"
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase text-muted">Patron saint</span>
            <input
              type="text"
              value={personalProfile.patronSaint}
              onChange={(event) =>
                onPersonalProfileChange({
                  ...personalProfile,
                  patronSaint: event.target.value,
                })
              }
              placeholder="St. Joseph"
              className="min-h-12 rounded-2xl border-4 border-border bg-white px-4 py-2 text-base font-bold text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </label>
        </div>
      </Card>

      <Card className="border-4 border-blue p-5">
        <div className="mb-4 flex items-center gap-3">
          <Languages className="size-9 text-blue" />
          <h2 className="text-2xl font-black">Preferences</h2>
        </div>

        <div
          role="group"
          aria-label="Default prayer language"
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
        <ProfileRow label="Experience" value={readableValue(profile.experienceLevel)} />
        <ProfileRow label="Prayer time" value={readableValue(profile.preferredPrayerTime)} />
        <ProfileRow label="Preferred devotion" value={profile.preferredDevotions.join(", ")} />
        <ProfileRow label="Daily goal" value={profile.spiritualGoal} />
      </div>

      <AppUpdateCard />

      <Button size="lg" variant="secondary" className="w-full" onClick={onReset}>
        <RotateCcw className="size-5" />
        Reset onboarding
      </Button>

      <Button size="lg" variant="danger" className="w-full" onClick={onClearStorage}>
        <Trash2 className="size-5" />
        Clear Storage
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

function AppUpdateCard() {
  const [isSupported, setIsSupported] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && process.env.NODE_ENV === "production");
  }, []);

  async function updateApp() {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      setStatus("Available after install");
      return;
    }

    setIsUpdating(true);
    setStatus("Updating...");

    try {
      let didReload = false;
      const reloadApp = () => {
        if (didReload) return;
        didReload = true;
        setStatus("Updated. Restarting...");
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
        setStatus("Updated. Restarting...");
        window.setTimeout(() => window.location.reload(), 300);
      } catch {
        setStatus("Update failed");
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
          <h2 className="text-2xl font-black">App update</h2>
          <p className="text-base font-bold text-muted">
            {isSupported ? status : "Available after install"}
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
        {isUpdating ? "Updating..." : "Update App"}
        <RefreshCw className={cn("size-5", isUpdating ? "animate-spin" : "")} />
      </Button>
    </Card>
  );
}

function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
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
              {item.label}
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

function getConfessionStatus(logs: ConfessionLogEntry[], frequencyDays: number) {
  const latestLog = logs[0];

  if (!latestLog) {
    return {
      title: "Ready for Confession",
      detail: "Set a rhythm and record the next confession.",
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
      title: "Confession due now",
      detail: `Target was ${formatDisplayDate(toInputDate(nextDate))}. Last: ${formatDisplayDate(latestLog.date)}.`,
      progressValue: 100,
    };
  }

  if (daysUntilNext === 0) {
    return {
      title: "Confession due today",
      detail: `Last confession: ${formatDisplayDate(latestLog.date)}.`,
      progressValue: 100,
    };
  }

  return {
    title: `Next confession in ${daysUntilNext} ${daysUntilNext === 1 ? "day" : "days"}`,
    detail: `Target: ${formatDisplayDate(toInputDate(nextDate))}. Last: ${formatDisplayDate(latestLog.date)}.`,
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

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
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

function readableCategory(category: string) {
  return category
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function readablePrayerCategory(category: PrayerCategory) {
  return category
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
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

function readableValue(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
