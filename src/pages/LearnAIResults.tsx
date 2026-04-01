import { useState } from "react";
import { Award, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { useAuth } from "@/contexts/AuthContext";
import { useLearnAI } from "@/contexts/LearnAIContext";
import { getLearnAiCourseBySlug } from "@/data/learn-ai-courses";

const headerBackClassName =
  "border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:text-rose-800";

const LearnAIResults = () => {
  const { slug } = useParams();
  const course = slug ? getLearnAiCourseBySlug(slug) : null;
  const { profile, user } = useAuth();
  const { getCourseState, submitAssessment, clearAssessment } = useLearnAI();

  if (!course) {
    return <Navigate to="/learn-ai" replace />;
  }

  const courseState = getCourseState(course.slug);
  const allLessonsComplete = courseState.completedLessonIds.length === course.lessons.length;

  if (!allLessonsComplete) {
    return <Navigate to={`/learn-ai/${course.slug}`} replace />;
  }

  const existingAssessment = courseState.assessment;
  const [answers, setAnswers] = useState<Record<string, string>>(existingAssessment?.answers || {});
  const [showAnswers, setShowAnswers] = useState(Boolean(existingAssessment));
  const scorePercent = existingAssessment
    ? Math.round((existingAssessment.score / existingAssessment.total) * 100)
    : 0;
  const learnerName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "SpotAI learner";

  const handleSubmit = () => {
    const score = course.assessment.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    submitAssessment(course.slug, {
      answers,
      score,
      total: course.assessment.length,
      passed: score / course.assessment.length >= 0.7,
    });
    setShowAnswers(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title={`${course.title} Results`}
          subtitle="Assessment score, completion record, and certificate"
          topLabel="Course results"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-rose-700/75"
          backTo={`/learn-ai/${course.slug}`}
          backLabel="Back to course"
        />

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr]">
            <div className="space-y-8">
              {!existingAssessment ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_42px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">{course.assessmentLabel}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        Finish this assessment to save your final result and unlock the course certificate. Passing score: 70%.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    {course.assessment.map((question, index) => (
                      <div key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Question {index + 1}
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-slate-950">{question.question}</p>
                        <div className="mt-4 space-y-3">
                          {question.options.map((option) => {
                            const isSelected = answers[question.id] === option;
                            return (
                              <button
                                key={option}
                                onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "border-rose-300 bg-rose-50 text-rose-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 rounded-full border ${
                                    isSelected ? "border-rose-500 bg-rose-500" : "border-slate-300"
                                  }`}
                                />
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== course.assessment.length}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Save results
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_42px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Final result</p>
                        <h2 className="mt-3 text-3xl font-semibold text-slate-950">{scorePercent}% score</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          You answered {existingAssessment.score} out of {existingAssessment.total} questions correctly.
                        </p>
                      </div>
                      <div
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                          existingAssessment.passed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {existingAssessment.passed ? "Passed" : "Retake recommended"}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          clearAssessment(course.slug);
                          setAnswers({});
                          setShowAnswers(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake assessment
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
                      >
                        <Award className="h-4 w-4" />
                        Print certificate
                      </button>
                    </div>
                  </div>

                  {showAnswers ? (
                    <div className="space-y-4">
                      {course.assessment.map((question) => {
                        const selectedAnswer = existingAssessment.answers[question.id];
                        const isCorrect = selectedAnswer === question.correctAnswer;

                        return (
                          <div key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                            <p className="text-lg font-semibold leading-8 text-slate-950">{question.question}</p>
                            <div className="mt-4 space-y-2 text-sm">
                              <p className={`${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                                Your answer: <span className="font-semibold">{selectedAnswer || "No answer"}</span>
                              </p>
                              {!isCorrect ? (
                                <p className="text-slate-500">
                                  Correct answer: <span className="font-semibold text-slate-900">{question.correctAnswer}</span>
                                </p>
                              ) : null}
                              <p className="leading-7 text-slate-500">{question.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_42px_rgba(15,23,42,0.06)]">
                <div className="rounded-[1.75rem] border border-emerald-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {course.certificateTitle}
                  </p>
                  <h3 className="mt-6 text-3xl leading-tight text-slate-950" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                    {learnerName}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    has completed the {course.title} learning track on SpotAI.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white bg-white/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lessons</p>
                      <p className="mt-2 font-semibold text-slate-950">{course.lessons.length} completed</p>
                    </div>
                    <div className="rounded-2xl border border-white bg-white/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Assessment</p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {existingAssessment ? `${scorePercent}%` : "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                    <Award className="h-4 w-4 text-emerald-600" />
                    {existingAssessment?.passed
                      ? "Certificate issued and saved on this device."
                      : "Certificate unlocks once you pass the assessment."}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_42px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-semibold text-slate-950">Completion summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Lessons completed</span>
                    <span className="font-semibold text-slate-950">{course.lessons.length}/{course.lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Assessment questions</span>
                    <span className="font-semibold text-slate-950">{course.assessment.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Certificate status</span>
                    <span className="font-semibold text-slate-950">
                      {existingAssessment?.passed ? "Unlocked" : "Waiting on pass"}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/learn-ai/${course.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
                >
                  Back to course overview
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LearnAIResults;
