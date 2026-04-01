import { useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Trophy } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import LessonBlockRenderer from "@/components/learn-ai/lesson-block-renderer";
import Layout from "@/components/layout/Layout";
import PageBackLink from "@/components/ui/page-back-link";
import { useLearnAI } from "@/contexts/LearnAIContext";
import {
  getLearnAiCourseBySlug,
  getLearnAiLessonById,
  getLearnAiNextLesson,
  getLearnAiPreviousLesson,
} from "@/data/learn-ai-courses";

const headerBackClassName =
  "border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:text-rose-800";

const LearnAILesson = () => {
  const { slug, lessonId } = useParams();
  const course = slug ? getLearnAiCourseBySlug(slug) : null;
  const lesson = course && lessonId ? getLearnAiLessonById(course, lessonId) : null;
  const {
    getCourseState,
    markLessonComplete,
    markLessonIncomplete,
    setLastVisitedLesson,
  } = useLearnAI();

  useEffect(() => {
    if (course && lesson) {
      setLastVisitedLesson(course.slug, lesson.id);
    }
  }, [course?.slug, lesson?.id]);

  if (!course || !lesson) {
    return <Navigate to="/learn-ai" replace />;
  }

  const courseState = getCourseState(course.slug);
  const completedLessons = courseState.completedLessonIds.length;
  const progressValue = Math.round((completedLessons / course.lessons.length) * 100);
  const isCompleted = courseState.completedLessonIds.includes(lesson.id);
  const lessonIndex = course.lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = getLearnAiPreviousLesson(course, lesson.id);
  const nextLesson = getLearnAiNextLesson(course, lesson.id);
  const allLessonsComplete = completedLessons === course.lessons.length;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f4f5f7] text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PageBackLink className={headerBackClassName} />
              <Link
                to={`/learn-ai/${course.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to course
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[280px,1fr]">
              <aside className="border-b border-slate-200 bg-slate-50/80 p-5 lg:border-b-0 lg:border-r">
                <Link
                  to={`/learn-ai/${course.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {course.title}
                </Link>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${progressValue}%` }} />
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  {course.lessons.map((item, index) => {
                    const lessonDone = courseState.completedLessonIds.includes(item.id);
                    const lessonActive = item.id === lesson.id;

                    return (
                      <Link
                        key={item.id}
                        to={`/learn-ai/${course.slug}/lessons/${item.id}`}
                        className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors ${
                          lessonActive ? "bg-white shadow-sm" : "hover:bg-white/70"
                        }`}
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                          {lessonDone ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-rose-600" />
                          ) : (
                            <Circle className={`h-4.5 w-4.5 ${lessonActive ? "text-slate-900" : "text-slate-300"}`} />
                          )}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${lessonActive ? "text-slate-950" : "text-slate-600"}`}>
                            {index + 1}. {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{item.duration}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {allLessonsComplete ? (
                  <Link
                    to={`/learn-ai/${course.slug}/results`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
                  >
                    <Trophy className="h-4 w-4" />
                    Final assessment
                  </Link>
                ) : null}
              </aside>

              <main className="px-6 py-8 sm:px-10 sm:py-10">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Lesson {lessonIndex + 1} of {course.lessons.length}
                  </p>
                  <h1 className="mt-4 text-[2.75rem] font-semibold leading-none tracking-tight text-slate-950">
                    {lesson.title}
                  </h1>
                  <p className="mt-5 text-lg italic leading-8 text-slate-500">{lesson.objective}</p>

                  <div className="mt-10 space-y-7">
                    {lesson.blocks.map((block, index) => (
                      <LessonBlockRenderer key={`${lesson.id}-${index}`} block={block} />
                    ))}
                  </div>

                  <div className="mt-10 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {isCompleted ? "Lesson completed" : "Ready to lock this in?"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Mark the lesson as complete to save your progress. You can still come back and review it later.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            isCompleted
                              ? markLessonIncomplete(course.slug, lesson.id)
                              : markLessonComplete(course.slug, lesson.id)
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                            isCompleted
                              ? "border border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700"
                              : "bg-rose-600 text-white hover:bg-rose-500"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isCompleted ? "Mark incomplete" : "Mark complete"}
                        </button>

                        {nextLesson ? (
                          <Link
                            to={`/learn-ai/${course.slug}/lessons/${nextLesson.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
                          >
                            Next lesson
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link
                            to={`/learn-ai/${course.slug}/results`}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-400 hover:text-emerald-800"
                          >
                            Finish course
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Previous</p>
                        {previousLesson ? (
                          <Link to={`/learn-ai/${course.slug}/lessons/${previousLesson.id}`} className="mt-2 block font-semibold text-slate-900 hover:text-rose-700">
                            {previousLesson.title}
                          </Link>
                        ) : (
                          <p className="mt-2 font-semibold text-slate-400">This is the first lesson.</p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-white bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next</p>
                        {nextLesson ? (
                          <Link to={`/learn-ai/${course.slug}/lessons/${nextLesson.id}`} className="mt-2 block font-semibold text-slate-900 hover:text-rose-700">
                            {nextLesson.title}
                          </Link>
                        ) : (
                          <p className="mt-2 font-semibold text-slate-900">Final assessment and certificate</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LearnAILesson;
