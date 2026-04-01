import { ArrowRight, BookOpen, BookMarked, CheckCircle2, Clock3, GraduationCap, RotateCcw, Trophy } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { useLearnAI } from "@/contexts/LearnAIContext";
import {
  getLearnAiCourseBySlug,
  getLearnAiFirstIncompleteLessonId,
} from "@/data/learn-ai-courses";

const headerBackClassName =
  "border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:text-rose-800";

const LearnAIDetail = () => {
  const { slug } = useParams();
  const course = slug ? getLearnAiCourseBySlug(slug) : null;
  const { getCourseState, isFavorite, toggleFavorite, resetCourse } = useLearnAI();

  if (!course) {
    return <Navigate to="/learn-ai" replace />;
  }

  const courseState = getCourseState(course.slug);
  const completedLessons = courseState.completedLessonIds.length;
  const progressValue = Math.round((completedLessons / course.lessons.length) * 100);
  const nextLessonId =
    courseState.lastVisitedLessonId ||
    getLearnAiFirstIncompleteLessonId(course, courseState.completedLessonIds);
  const allLessonsComplete = completedLessons === course.lessons.length;

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title={course.title}
          subtitle={course.cardLabel}
          topLabel="Course overview"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-rose-700/75"
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700">
                {course.access} course
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                {course.level}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                {course.category}
              </span>
            </div>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{course.subtitle}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-rose-500" />
                {course.lessons.length} lessons
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-rose-500" />
                Self paced
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-rose-500" />
                Results + certificate
              </span>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to={nextLessonId ? `/learn-ai/${course.slug}/lessons/${nextLessonId}` : `/learn-ai/${course.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
              >
                {completedLessons > 0 ? "Continue learning" : "Start learning"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => toggleFavorite(course.slug)}
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
                  isFavorite(course.slug)
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700"
                }`}
              >
                <BookMarked className="h-4 w-4" />
                {isFavorite(course.slug) ? "Saved" : "Save course"}
              </button>
              {allLessonsComplete ? (
                <Link
                  to={`/learn-ai/${course.slug}/results`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-400 hover:text-emerald-800"
                >
                  <Trophy className="h-4 w-4" />
                  View results
                </Link>
              ) : null}
            </div>
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.12fr,0.88fr]">
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold text-foreground">About this course</h2>
                <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground">
                  <p>{course.description}</p>
                  <p>{course.summary}</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">What you&apos;ll walk away with</h2>
                <div className="mt-5 space-y-4">
                  {course.outcomes.map((outcome) => (
                    <div key={outcome} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                      <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm leading-7 text-muted-foreground">{outcome}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Who this is for</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">{course.audience}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">What makes this different</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">{course.differentiator}</p>
              </section>

              <section id="curriculum">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Course curriculum</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Progress is saved locally on this device until the backend learning layer is connected.
                    </p>
                  </div>
                  <button
                    onClick={() => resetCourse(course.slug)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset progress
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-border bg-card">
                  {course.lessons.map((lesson, index) => {
                    const isCompleted = courseState.completedLessonIds.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className="grid gap-4 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[auto,1fr,auto]"
                      >
                        <div className="flex items-center">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{lesson.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{lesson.summary}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {lesson.duration}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Link
                            to={`/learn-ai/${course.slug}/lessons/${lesson.id}`}
                            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
                          >
                            {isCompleted ? "Review" : "Open"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <div className="h-64 overflow-hidden bg-[#131313]">
                  <img src={course.image} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Course progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${progressValue}%` }} />
                  </div>

                  <div className="mt-6 rounded-[1.4rem] border border-border bg-secondary/60 p-5">
                    <h3 className="text-lg font-semibold text-foreground">What happens at the end</h3>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                      <p>1. Finish all lessons.</p>
                      <p>2. Complete the {course.assessmentLabel.toLowerCase()}.</p>
                      <p>3. Save your result and unlock a completion certificate.</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-border bg-background p-5">
                    <h3 className="text-lg font-semibold text-foreground">Details</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Lessons</span>
                        <span className="font-semibold text-foreground">{course.lessons.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Level</span>
                        <span className="font-semibold text-foreground">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Access</span>
                        <span className="font-semibold text-foreground">{course.access}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Assessment</span>
                        <span className="font-semibold text-foreground">{course.assessment.length} questions</span>
                      </div>
                    </div>
                  </div>

                  {courseState.certificateIssuedAt ? (
                    <div className="mt-5 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 p-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        <Trophy className="h-3.5 w-3.5" />
                        Certificate earned
                      </div>
                      <p className="mt-3 text-sm leading-6 text-emerald-800">
                        You completed this course and passed the final assessment. Your certificate is ready.
                      </p>
                      <Link
                        to={`/learn-ai/${course.slug}/results`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                      >
                        View certificate
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LearnAIDetail;
