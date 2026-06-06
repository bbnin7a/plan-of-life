"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CalendarCheck2,
  Check,
  ChevronRight,
  Church,
  Clock3,
  Compass,
  Flame,
  Heart,
  Home,
  Languages,
  Medal,
  Moon,
  RotateCcw,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  categoryCards,
  catholicPrayers,
  defaultProfile,
  dailyPlan,
  getRecommendedPlan,
  onboardingQuestions,
  weeklyProgress,
} from "@/lib/mock-data";
import type {
  CatholicPrayer,
  DailyPlanItem,
  OnboardingAnswerKey,
  PrayerCategory,
  PrayerLanguage,
  PracticeStatus,
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

export default function App() {
  const [stage, setStage] = useState<AppStage>("welcome");
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<OnboardingAnswerKey, string>>>({});
  const [profile, setProfile] = useState<UserSpiritualProfile>(defaultProfile);
  const [plan, setPlan] = useState<DailyPlanItem[]>(dailyPlan);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

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
        <AnimatePresence mode="wait">
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
            <ExploreScreen key="explore" />
          ) : activeTab === "prayers" ? (
            <PrayersScreen key="prayers" />
          ) : activeTab === "progress" ? (
            <ProgressScreen
              key="progress"
              completedCount={completedCount}
              progressValue={progressValue}
            />
          ) : (
            <ProfileScreen
              key="profile"
              profile={profile}
              progressValue={progressValue}
              onReset={resetOnboarding}
            />
          )}
        </AnimatePresence>
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
  const question = onboardingQuestions[questionIndex];
  const progress = ((questionIndex + 1) / onboardingQuestions.length) * 100;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 py-6">
      <div className="mb-7 flex items-center gap-3">
        <Progress value={progress} className="h-4 flex-1" />
        <span className="text-sm font-black text-primary-dark">
          {questionIndex + 1}/{onboardingQuestions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={question.id}
          initial={{ x: 56, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 190, damping: 22 }}
          className="flex flex-1 flex-col"
        >
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
        </motion.section>
      </AnimatePresence>
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

function ExploreScreen() {
  const icons = [CalendarCheck2, Heart, BookOpen, Church];

  return (
    <ScreenMotion className="space-y-5">
      <header>
        <p className="text-base font-black text-primary-dark">Explore</p>
        <h1 className="text-3xl font-black tracking-normal">Find your next step</h1>
      </header>

      <div className="grid gap-4">
        {categoryCards.map((category, index) => {
          const Icon = icons[index];
          return (
            <Card key={category.id} className={cn("border-4 p-5", category.border)}>
              <div className="flex items-center gap-4">
                <div className={cn("grid size-16 place-items-center rounded-3xl text-white", category.color)}>
                  <Icon className="size-8" strokeWidth={2.8} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{category.title}</h2>
                  <p className="text-base font-bold text-muted">{category.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </ScreenMotion>
  );
}

function PrayersScreen() {
  const [language, setLanguage] = useState<PrayerLanguage>("en");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const visiblePrayers = useMemo(() => {
    if (!normalizedQuery) return catholicPrayers;

    return catholicPrayers.filter((prayer) =>
      getPrayerSearchText(prayer).includes(normalizedQuery),
    );
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
                onClick={() => setLanguage(option.id)}
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
        {visiblePrayers.length > 0 ? (
          visiblePrayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} language={language} />
          ))
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
  progressValue,
}: {
  completedCount: number;
  progressValue: number;
}) {
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
    </ScreenMotion>
  );
}

function ProfileScreen({
  profile,
  progressValue,
  onReset,
}: {
  profile: UserSpiritualProfile;
  progressValue: number;
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

      <div className="space-y-3">
        <ProfileRow label="Experience" value={readableValue(profile.experienceLevel)} />
        <ProfileRow label="Prayer time" value={readableValue(profile.preferredPrayerTime)} />
        <ProfileRow label="Preferred devotion" value={profile.preferredDevotions.join(", ")} />
        <ProfileRow label="Daily goal" value={profile.spiritualGoal} />
      </div>

      <Button size="lg" variant="secondary" className="w-full" onClick={onReset}>
        <RotateCcw className="size-5" />
        Reset onboarding
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

function readableValue(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
