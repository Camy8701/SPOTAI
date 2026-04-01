import { useMemo, useState } from "react";
import { ArrowRight, BookMarked, CheckCircle2, GraduationCap, Search, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { useLearnAI } from "@/contexts/LearnAIContext";
import {
  getLearnAiFirstIncompleteLessonId,
  learnAiCategories,
  learnAiCourses,
} from "@/data/learn-ai-courses";

const headerBackClassName =
  "border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:text-rose-800";

const LearnAI = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { getCourseState, isFavorite, toggleFavorite, state } = useLearnAI();

  const filteredCourses = useMemo(() => {
    return learnAiCourses.filter((course) => {
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === "Favorites" && isFavorite(course.slug)) ||
        course.category === activeCategory;
      const keyword = `${course.title} ${course.subtitle} ${course.description} ${course.category} ${course.level} ${course.access}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, isFavorite, search]);

  const featuredCourse =
    filteredCourses.find((course) => course.featured) ||
    filteredCourses[0] ||
    learnAiCourses.find((course) => course.featured) ||
    learnAiCourses[0];

  const remainingCourses = filteredCourses.filter((course) => course.slug !== featuredCourse?.slug);
  const certificatesEarned = Object.values(state.courses).filter((course) => course.certificateIssuedAt).length;

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Learn AI"
          subtitle="Structured courses, saved progress, and guided execution for builders"
          topLabel="Explore all courses"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-rose-700/75"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search courses"
                  className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-rose-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {["All", "Favorites", ...learnAiCategories.filter((category) => category !== "All")].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      activeCategory === category
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-input text-muted-foreground hover:border-rose-400 hover:text-rose-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Course library</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{learnAiCourses.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Guided courses with saved progress and final course results.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <BookMarked className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Saved courses</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{state.favorites.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Keep a shortlist of the tracks you want to return to later.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Trophy className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Certificates earned</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{certificatesEarned}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Completion records stay saved locally until the backend learning layer is live.</p>
            </div>
          </div>

          {featuredCourse ? (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#2b1618] bg-[#121212] text-white shadow-[0_26px_80px_rgba(15,23,42,0.16)]">
              <div className="grid lg:grid-cols-[1.08fr,0.92fr]">
                <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-300">
                      {featuredCourse.heroLabel}
                    </span>
                    <button
                      onClick={() => toggleFavorite(featuredCourse.slug)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                        isFavorite(featuredCourse.slug)
                          ? "border-amber-300 bg-amber-300/15 text-amber-100"
                          : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {isFavorite(featuredCourse.slug) ? "Saved" : "Save course"}
                    </button>
                  </div>

                  <h2
                    className="mt-5 text-4xl leading-tight tracking-tight sm:text-5xl"
                    style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                  >
                    {featuredCourse.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/72">{featuredCourse.subtitle}</p>

                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{featuredCourse.access}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{featuredCourse.level}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {featuredCourse.lessons.length} lessons
                    </span>
                  </div>

                  <div className="mt-8 w-full max-w-xl">
                    {(() => {
                      const progress = getCourseState(featuredCourse.slug);
                      const progressValue = Math.round((progress.completedLessonIds.length / featuredCourse.lessons.length) * 100);
                      const nextLessonId =
                        progress.lastVisitedLessonId ||
                        getLearnAiFirstIncompleteLessonId(featuredCourse, progress.completedLessonIds);

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                            <span>Your progress</span>
                            <span>{progressValue}%</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-300" style={{ width: `${progressValue}%` }} />
                          </div>
                          <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                              to={nextLessonId ? `/learn-ai/${featuredCourse.slug}/lessons/${nextLessonId}` : `/learn-ai/${featuredCourse.slug}`}
                              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                            >
                              {progress.completedLessonIds.length > 0 ? "Continue learning" : "Start learning"}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/learn-ai/${featuredCourse.slug}`}
                              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/82 transition-colors hover:border-white/25 hover:bg-white/8"
                            >
                              View course
                            </Link>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="relative min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.26),transparent_36%),radial-gradient(circle_at_80%_30%,rgba(251,146,60,0.18),transparent_32%),#121212]">
                  <img
                    src={featuredCourse.image}
                    alt={featuredCourse.title}
                    className="h-full w-full object-cover opacity-80 mix-blend-screen"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {filteredCourses.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No courses matched your search.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or switch filters.</p>
            </div>
          ) : null}

          {remainingCourses.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {remainingCourses.map((course) => {
                const courseState = getCourseState(course.slug);
                const completedLessons = courseState.completedLessonIds.length;
                const progressValue = Math.round((completedLessons / course.lessons.length) * 100);
                const nextLessonId =
                  courseState.lastVisitedLessonId ||
                  getLearnAiFirstIncompleteLessonId(course, courseState.completedLessonIds);

                return (
                  <article
                    key={course.slug}
                    className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.07)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-56 overflow-hidden bg-[#141414]">
                      <img src={course.image} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                      <button
                        onClick={() => toggleFavorite(course.slug)}
                        className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur ${
                          isFavorite(course.slug)
                            ? "border-amber-300 bg-amber-300/90 text-slate-950"
                            : "border-white/25 bg-black/25 text-white"
                        }`}
                        aria-label={`Save ${course.title}`}
                      >
                        <BookMarked className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700">
                          {course.access}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                          {course.category}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[2rem] leading-tight tracking-tight text-slate-950" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{course.subtitle}</p>

                      <div className="mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>{completedLessons}/{course.lessons.length} lessons</span>
                        <span>{progressValue}% complete</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${progressValue}%` }} />
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to={nextLessonId ? `/learn-ai/${course.slug}/lessons/${nextLessonId}` : `/learn-ai/${course.slug}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
                        >
                          {completedLessons > 0 ? "Continue" : "Start"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/learn-ai/${course.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
                        >
                          Overview
                        </Link>
                      </div>

                      {courseState.certificateIssuedAt ? (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Certificate earned
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </Layout>
  );
};

export default LearnAI;
