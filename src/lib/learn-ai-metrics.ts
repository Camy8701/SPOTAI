import { learnAiCourses, type LearnAICourse } from "@/data/learn-ai-courses";
import type { LearnAIState } from "@/contexts/LearnAIContext";

export type LearnAIMetrics = {
  courses: number;
  featuredCourses: number;
  lessons: number;
  assessments: number;
  freeCourses: number;
  proCourses: number;
  favorites: number;
  startedCourses: number;
  completedCourses: number;
  certificates: number;
  passedAssessments: number;
  assessmentAttempts: number;
  averageScore: number;
};

export const getLearnAICourseProgress = (
  course: LearnAICourse,
  state: LearnAIState,
) => {
  const courseState = state.courses[course.slug];
  const completedLessons = courseState?.completedLessonIds.length ?? 0;
  const progressPercent =
    course.lessons.length > 0 ? Math.round((completedLessons / course.lessons.length) * 100) : 0;

  return {
    completedLessons,
    progressPercent,
    hasStarted: Boolean(courseState?.startedAt || completedLessons > 0 || courseState?.lastVisitedLessonId),
    isCompleted: completedLessons === course.lessons.length,
    hasCertificate: Boolean(courseState?.certificateIssuedAt),
    isFavorite: state.favorites.includes(course.slug),
    assessment: courseState?.assessment ?? null,
  };
};

export const getLearnAIMetrics = (
  state: LearnAIState,
  courses = learnAiCourses,
): LearnAIMetrics => {
  const courseProgress = courses.map((course) => getLearnAICourseProgress(course, state));
  const assessments = courseProgress
    .map((course) => course.assessment)
    .filter((assessment): assessment is NonNullable<typeof assessment> => Boolean(assessment));

  const averageScore =
    assessments.length > 0
      ? Math.round(
          assessments.reduce((sum, assessment) => {
            const ratio = assessment.total > 0 ? (assessment.score / assessment.total) * 100 : 0;
            return sum + ratio;
          }, 0) / assessments.length,
        )
      : 0;

  return {
    courses: courses.length,
    featuredCourses: courses.filter((course) => course.featured).length,
    lessons: courses.reduce((sum, course) => sum + course.lessons.length, 0),
    assessments: courses.reduce((sum, course) => sum + course.assessment.length, 0),
    freeCourses: courses.filter((course) => course.access === "Free").length,
    proCourses: courses.filter((course) => course.access === "Pro").length,
    favorites: state.favorites.length,
    startedCourses: courseProgress.filter((course) => course.hasStarted).length,
    completedCourses: courseProgress.filter((course) => course.isCompleted).length,
    certificates: courseProgress.filter((course) => course.hasCertificate).length,
    passedAssessments: assessments.filter((assessment) => assessment.passed).length,
    assessmentAttempts: assessments.length,
    averageScore,
  };
};
