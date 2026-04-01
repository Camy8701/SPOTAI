import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LearnAIAssessmentResult = {
  answers: Record<string, string>;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
};

export type LearnAICourseState = {
  startedAt: string | null;
  lastVisitedLessonId: string | null;
  completedLessonIds: string[];
  assessment: LearnAIAssessmentResult | null;
  certificateIssuedAt: string | null;
};

export type LearnAIState = {
  favorites: string[];
  courses: Record<string, LearnAICourseState>;
};

type LearnAIContextType = {
  state: LearnAIState;
  isFavorite: (courseSlug: string) => boolean;
  toggleFavorite: (courseSlug: string) => void;
  getCourseState: (courseSlug: string) => LearnAICourseState;
  setLastVisitedLesson: (courseSlug: string, lessonId: string) => void;
  markLessonComplete: (courseSlug: string, lessonId: string) => void;
  markLessonIncomplete: (courseSlug: string, lessonId: string) => void;
  submitAssessment: (
    courseSlug: string,
    result: Omit<LearnAIAssessmentResult, "completedAt">,
  ) => void;
  clearAssessment: (courseSlug: string) => void;
  resetCourse: (courseSlug: string) => void;
};

const STORAGE_KEY = "spotai.learn-ai.v1";

const emptyCourseState = (): LearnAICourseState => ({
  startedAt: null,
  lastVisitedLessonId: null,
  completedLessonIds: [],
  assessment: null,
  certificateIssuedAt: null,
});

const defaultState: LearnAIState = {
  favorites: [],
  courses: {},
};

const LearnAIContext = createContext<LearnAIContextType | undefined>(undefined);

const readStoredState = (): LearnAIState => {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as LearnAIState;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      courses: parsed.courses && typeof parsed.courses === "object" ? parsed.courses : {},
    };
  } catch {
    return defaultState;
  }
};

export const LearnAIProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LearnAIState>(readStoredState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getCourseState = (courseSlug: string) => state.courses[courseSlug] || emptyCourseState();

  const patchCourse = (courseSlug: string, updater: (current: LearnAICourseState) => LearnAICourseState) => {
    setState((currentState) => {
      const currentCourseState = currentState.courses[courseSlug] || emptyCourseState();

      return {
        ...currentState,
        courses: {
          ...currentState.courses,
          [courseSlug]: updater(currentCourseState),
        },
      };
    });
  };

  const toggleFavorite = (courseSlug: string) => {
    setState((currentState) => {
      const isFavorite = currentState.favorites.includes(courseSlug);

      return {
        ...currentState,
        favorites: isFavorite
          ? currentState.favorites.filter((item) => item !== courseSlug)
          : [...currentState.favorites, courseSlug],
      };
    });
  };

  const setLastVisitedLesson = (courseSlug: string, lessonId: string) => {
    patchCourse(courseSlug, (courseState) => ({
      ...courseState,
      startedAt: courseState.startedAt || new Date().toISOString(),
      lastVisitedLessonId: lessonId,
    }));
  };

  const markLessonComplete = (courseSlug: string, lessonId: string) => {
    patchCourse(courseSlug, (courseState) => ({
      ...courseState,
      startedAt: courseState.startedAt || new Date().toISOString(),
      lastVisitedLessonId: lessonId,
      completedLessonIds: courseState.completedLessonIds.includes(lessonId)
        ? courseState.completedLessonIds
        : [...courseState.completedLessonIds, lessonId],
    }));
  };

  const markLessonIncomplete = (courseSlug: string, lessonId: string) => {
    patchCourse(courseSlug, (courseState) => ({
      ...courseState,
      completedLessonIds: courseState.completedLessonIds.filter((item) => item !== lessonId),
      certificateIssuedAt: null,
    }));
  };

  const submitAssessment = (
    courseSlug: string,
    result: Omit<LearnAIAssessmentResult, "completedAt">,
  ) => {
    patchCourse(courseSlug, (courseState) => ({
      ...courseState,
      assessment: {
        ...result,
        completedAt: new Date().toISOString(),
      },
      certificateIssuedAt: result.passed ? courseState.certificateIssuedAt || new Date().toISOString() : null,
    }));
  };

  const clearAssessment = (courseSlug: string) => {
    patchCourse(courseSlug, (courseState) => ({
      ...courseState,
      assessment: null,
      certificateIssuedAt: null,
    }));
  };

  const resetCourse = (courseSlug: string) => {
    patchCourse(courseSlug, () => emptyCourseState());
  };

  return (
    <LearnAIContext.Provider
      value={{
        state,
        isFavorite: (courseSlug: string) => state.favorites.includes(courseSlug),
        toggleFavorite,
        getCourseState,
        setLastVisitedLesson,
        markLessonComplete,
        markLessonIncomplete,
        submitAssessment,
        clearAssessment,
        resetCourse,
      }}
    >
      {children}
    </LearnAIContext.Provider>
  );
};

export const useLearnAI = () => {
  const context = useContext(LearnAIContext);

  if (!context) {
    throw new Error("useLearnAI must be used within LearnAIProvider");
  }

  return context;
};
