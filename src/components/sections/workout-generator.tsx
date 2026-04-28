import { useState } from "react"
import { MagneticButton } from "@/components/magnetic-button"
import { useReveal } from "@/hooks/use-reveal"
import Icon from "@/components/ui/icon"
import func2url from "../../backend/func2url.json"

interface WorkoutExercise {
  name: string
  duration?: string
  sets?: string
  reps?: string
  description: string
}

interface WorkoutPlan {
  title: string
  duration: string
  level: string
  warmup: WorkoutExercise[]
  main: WorkoutExercise[]
  cooldown: WorkoutExercise[]
  tips: string[]
}

export function WorkoutGenerator() {
  const { ref, isVisible } = useReveal(0.2)
  const [form, setForm] = useState({ profile: "спортсмен", age: "", level: "", goal: "" })
  const [loading, setLoading] = useState(false)
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!form.age || !form.level || !form.goal) {
      setError("Заполните все поля")
      return
    }
    setError("")
    setLoading(true)
    setWorkout(null)

    try {
      const res = await fetch(func2url["generate-workout"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.workout) {
        setWorkout(data.workout)
      } else {
        setError("Не удалось сгенерировать тренировку. Попробуйте ещё раз.")
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16 overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-7xl py-8">
        <div
          className={`mb-8 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Генератор
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ AI составит тренировку за секунды</p>
        </div>

        {!workout ? (
          <div
            className={`grid gap-6 md:grid-cols-2 md:gap-12 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Form */}
            <div className="space-y-6">
              {/* Profile toggle */}
              <div>
                <label className="mb-3 block font-mono text-xs text-foreground/60">Профиль</label>
                <div className="flex gap-2">
                  {["спортсмен", "школьник"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, profile: p })}
                      className={`flex-1 rounded-lg border py-2.5 font-sans text-sm transition-all duration-200 ${
                        form.profile === p
                          ? "border-foreground/60 bg-foreground/15 text-foreground"
                          : "border-foreground/20 bg-transparent text-foreground/60 hover:border-foreground/40"
                      }`}
                    >
                      {p === "спортсмен" ? "⚔ Спортсмен" : "🎓 Школьник"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="mb-2 block font-mono text-xs text-foreground/60">Возраст</label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Например: 18"
                  className="w-full border-b border-foreground/30 bg-transparent py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/60 focus:outline-none md:text-base"
                />
              </div>

              {/* Level */}
              <div>
                <label className="mb-3 block font-mono text-xs text-foreground/60">Уровень подготовки</label>
                <div className="flex gap-2">
                  {["Начинающий", "Средний", "Продвинутый"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm({ ...form, level: l })}
                      className={`flex-1 rounded-lg border py-2 font-sans text-xs transition-all duration-200 md:text-sm ${
                        form.level === l
                          ? "border-foreground/60 bg-foreground/15 text-foreground"
                          : "border-foreground/20 bg-transparent text-foreground/60 hover:border-foreground/40"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="mb-3 block font-mono text-xs text-foreground/60">Цель тренировки</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Выносливость", "Сила", "Скорость", "Боевая готовность"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, goal: g })}
                      className={`rounded-lg border py-2.5 font-sans text-xs transition-all duration-200 md:text-sm ${
                        form.goal === g
                          ? "border-foreground/60 bg-foreground/15 text-foreground"
                          : "border-foreground/20 bg-transparent text-foreground/60 hover:border-foreground/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="font-mono text-xs text-red-400">{error}</p>}

              <MagneticButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    AI генерирует план...
                  </span>
                ) : (
                  "Сгенерировать тренировку"
                )}
              </MagneticButton>
            </div>

            {/* Placeholder right side */}
            <div className="hidden md:flex flex-col justify-center">
              <div className="space-y-4 border-l border-foreground/20 pl-8">
                {["Укажи профиль и возраст", "Выбери уровень подготовки", "Поставь цель", "Получи персональный план"].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="font-mono text-xs text-foreground/30 mt-0.5">0{i + 1}</span>
                    <p className="font-sans text-base text-foreground/70">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <WorkoutResult workout={workout} onReset={() => setWorkout(null)} />
        )}
      </div>
    </section>
  )
}

function WorkoutResult({ workout, onReset }: { workout: WorkoutPlan; onReset: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-2xl font-light text-foreground md:text-3xl">{workout.title}</h3>
          <div className="mt-1 flex gap-4 font-mono text-xs text-foreground/50">
            <span>⏱ {workout.duration}</span>
            <span>📊 {workout.level}</span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 font-mono text-xs text-foreground/50 hover:text-foreground transition-colors"
        >
          <Icon name="RotateCcw" size={12} />
          Новая тренировка
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Разминка */}
        <WorkoutBlock title="Разминка" icon="Zap" items={workout.warmup} type="time" />
        {/* Основная часть */}
        <WorkoutBlock title="Основная часть" icon="Sword" items={workout.main} type="sets" />
        {/* Заминка */}
        <WorkoutBlock title="Заминка" icon="Wind" items={workout.cooldown} type="time" />
      </div>

      {/* Tips */}
      {workout.tips && workout.tips.length > 0 && (
        <div className="mt-6 rounded-lg border border-foreground/20 bg-foreground/5 p-4 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50">/ Советы тренера</p>
          <ul className="space-y-1.5">
            {workout.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-0.5 text-foreground/30">—</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function WorkoutBlock({
  title,
  icon,
  items,
  type,
}: {
  title: string
  icon: string
  items: WorkoutExercise[]
  type: "time" | "sets"
}) {
  return (
    <div className="rounded-lg border border-foreground/20 bg-foreground/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon name={icon as "Zap"} size={14} className="text-foreground/60" fallback="Circle" />
        <p className="font-mono text-xs text-foreground/60">{title}</p>
      </div>
      <div className="space-y-3">
        {items.map((ex, i) => (
          <div key={i} className="border-b border-foreground/10 pb-3 last:border-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-sans text-sm font-light text-foreground">{ex.name}</p>
              <span className="shrink-0 font-mono text-xs text-foreground/40">
                {type === "time" ? ex.duration : `${ex.sets} × ${ex.reps}`}
              </span>
            </div>
            {ex.description && (
              <p className="mt-0.5 text-xs text-foreground/50 leading-relaxed">{ex.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
