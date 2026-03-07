import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, Trophy, Brain, Zap, Star, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import ShowcaseCard from "@/components/ui/showcase-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Question = {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const allQuizQuestions: Question[] = [
  { id: 1, question: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence"], correctAnswer: 1, explanation: "AI stands for Artificial Intelligence, which refers to the simulation of human intelligence in machines." },
  { id: 2, question: "Who coined the term 'Artificial Intelligence'?", options: ["Alan Turing", "John McCarthy", "Marvin Minsky"], correctAnswer: 1, explanation: "John McCarthy coined the term 'Artificial Intelligence' in 1956 at the Dartmouth Conference." },
  { id: 3, question: "Which chess-playing computer defeated world champion Garry Kasparov in 1997?", options: ["Deep Blue", "Watson", "AlphaGo"], correctAnswer: 0, explanation: "Deep Blue, IBM's chess-playing computer, defeated world champion Garry Kasparov in 1997." },
  { id: 4, question: "What was the name of IBM's AI system that won at Jeopardy! in 2011?", options: ["Deep Blue", "Watson", "AlphaGo"], correctAnswer: 1, explanation: "Watson was IBM's AI system that won at Jeopardy! in 2011, demonstrating advanced natural language processing." },
  { id: 5, question: "Which company created ChatGPT?", options: ["Google", "OpenAI", "Microsoft"], correctAnswer: 1, explanation: "ChatGPT was created by OpenAI, an AI research company founded in 2015." },
  { id: 6, question: "What is Alexa?", options: ["Google's search engine", "Amazon's voice-controlled AI assistant", "Apple's smartphone"], correctAnswer: 1, explanation: "Alexa is Amazon's voice-controlled AI assistant that can perform various tasks through voice commands." },
  { id: 7, question: "Which company created Siri?", options: ["Originally by SRI, then acquired by Apple", "Google", "Microsoft"], correctAnswer: 0, explanation: "Siri was originally created by a startup called SRI, but was acquired and developed by Apple." },
  { id: 8, question: "Which company owns DeepMind?", options: ["Microsoft", "Google (Alphabet)", "Facebook"], correctAnswer: 1, explanation: "DeepMind is owned by Google (Alphabet), acquired in 2014 for AI research and development." },
  { id: 9, question: "What major breakthrough did DeepMind achieve with AlphaGo?", options: ["Defeating a world champion Go player", "Winning at chess", "Creating realistic images"], correctAnswer: 0, explanation: "DeepMind's AlphaGo achieved the breakthrough of defeating world champion Go player Lee Sedol in 2016." },
  { id: 10, question: "In which movie does the AI system HAL 9000 appear?", options: ["Blade Runner", "2001: A Space Odyssey", "The Matrix"], correctAnswer: 1, explanation: "HAL 9000 is the AI system that appears in Stanley Kubrick's '2001: A Space Odyssey'." },
  { id: 11, question: "What is the name of the AI in the Iron Man movies?", options: ["FRIDAY", "JARVIS", "EDITH"], correctAnswer: 1, explanation: "JARVIS (Just A Rather Very Intelligent System) is Tony Stark's AI assistant in the Iron Man movies." },
  { id: 12, question: "In the Terminator movies, what is the AI system that becomes self-aware?", options: ["HAL 9000", "Skynet", "The Matrix"], correctAnswer: 1, explanation: "Skynet is the AI system in the Terminator movies that becomes self-aware and turns against humanity." },
  { id: 13, question: "Which AI character from Star Wars is known for protocol and etiquette?", options: ["R2-D2", "C-3PO", "BB-8"], correctAnswer: 1, explanation: "C-3PO is the protocol droid in Star Wars known for his knowledge of etiquette and over six million forms of communication." },
  { id: 14, question: "In the movie 'Her,' what is the name of the AI operating system?", options: ["Samantha", "Cortana", "Alexa"], correctAnswer: 0, explanation: "Samantha is the AI operating system in the movie 'Her' that develops a relationship with the main character." },
  { id: 15, question: "Which video game features an AI companion named Cortana?", options: ["Call of Duty", "Halo series", "Mass Effect"], correctAnswer: 1, explanation: "Cortana is the AI companion in the Halo video game series, assisting the Master Chief." },
  { id: 16, question: "Which animated movie features a robot who develops emotions and saves humanity?", options: ["Big Hero 6", "WALL-E", "The Iron Giant"], correctAnswer: 1, explanation: "WALL-E is the Pixar animated movie about a robot who develops emotions and ultimately helps save humanity." },
  { id: 17, question: "What is the main purpose of AI in autonomous vehicles?", options: ["To play music", "To enable self-driving capabilities", "To improve fuel efficiency"], correctAnswer: 1, explanation: "AI in autonomous vehicles processes sensor data and makes driving decisions to enable self-driving capabilities." },
  { id: 18, question: "What type of AI is used in Netflix's recommendation system?", options: ["Machine learning algorithms", "Voice recognition", "Computer vision"], correctAnswer: 0, explanation: "Netflix uses machine learning and recommendation algorithms to suggest content based on viewing patterns." },
  { id: 19, question: "What is the main concern about job displacement due to AI?", options: ["AI will make jobs more difficult", "AI might replace human workers", "AI will reduce salaries"], correctAnswer: 1, explanation: "The main concern is that AI automation might replace human workers in various industries." },
  { id: 20, question: "What are 'deepfakes'?", options: ["Deep ocean exploration tools", "AI-generated fake videos or audio", "Advanced search algorithms"], correctAnswer: 1, explanation: "Deepfakes are AI-generated fake videos or audio that appear realistic but are fabricated." },
  { id: 21, question: "How long did it take ChatGPT to reach 100 million users?", options: ["About 2 months", "1 year", "6 months"], correctAnswer: 0, explanation: "ChatGPT reached 100 million users in about 2 months, making it the fastest-growing app in history at the time." },
  { id: 22, question: "Which country invests the most in AI research and development?", options: ["China", "The United States", "Japan"], correctAnswer: 1, explanation: "The United States invests the most in AI research and development, followed closely by China." },
  { id: 23, question: "What is the name of Boston Dynamics' famous robot dog?", options: ["Spot", "Atlas", "Handle"], correctAnswer: 0, explanation: "Spot is Boston Dynamics' famous four-legged robot dog known for its mobility and agility." },
  { id: 24, question: "What is the most common programming language used for AI development?", options: ["Java", "Python", "C++"], correctAnswer: 1, explanation: "Python is the most common programming language for AI development due to its simplicity and extensive libraries." },
  { id: 25, question: "True or False: AI will replace all human jobs.", options: ["True", "False", "Only in some industries"], correctAnswer: 1, explanation: "False - While AI will automate some jobs, it will also create new ones and augment human capabilities." },
  { id: 26, question: "Can current AI systems truly 'understand' like humans do?", options: ["Yes, they understand everything", "No, they process patterns but don't truly understand", "Only simple concepts"], correctAnswer: 1, explanation: "No - Current AI processes patterns in data but doesn't have consciousness or true understanding like humans." },
  { id: 27, question: "True or False: AI is only useful for tech companies.", options: ["True", "False", "Only for large companies"], correctAnswer: 1, explanation: "False - AI is used across all industries including healthcare, finance, agriculture, and education." },
  { id: 28, question: "Do AI systems have emotions?", options: ["Yes, they feel emotions", "No, they simulate but don't feel emotions", "Only advanced AI systems"], correctAnswer: 1, explanation: "No - Current AI systems can simulate emotional responses but don't actually feel emotions." },
  { id: 29, question: "Is AI currently conscious or self-aware?", options: ["Yes, advanced AI is conscious", "No, current AI is not conscious", "Only some AI systems"], correctAnswer: 1, explanation: "No - Current AI systems are not conscious or self-aware, despite appearing sophisticated." },
  { id: 30, question: "True or False: AI development is slowing down.", options: ["True", "False", "It's staying the same"], correctAnswer: 1, explanation: "False - AI development is accelerating rapidly with new breakthroughs happening regularly." },
  { id: 31, question: "What is an algorithm in the context of AI?", options: ["A type of computer", "A set of rules for solving problems", "A programming language"], correctAnswer: 1, explanation: "An algorithm is a set of rules or instructions that tells a computer how to solve a problem." },
  { id: 32, question: "What is the difference between AI and machine learning?", options: ["They are the same thing", "AI is broader, ML is a subset that learns from data", "ML is broader than AI"], correctAnswer: 1, explanation: "AI is the broader concept of intelligent machines, while machine learning is a subset of AI that learns from data." },
  { id: 33, question: "What is training data in machine learning?", options: ["Data used to test the final model", "The dataset used to teach an AI model", "Data that needs to be cleaned"], correctAnswer: 1, explanation: "Training data is the dataset used to teach an AI model how to make predictions or decisions." },
  { id: 34, question: "What does 'NLP' stand for in AI?", options: ["Natural Language Processing", "Neural Learning Protocol", "Network Learning Process"], correctAnswer: 0, explanation: "NLP stands for Natural Language Processing, which helps computers understand and work with human language." },
  { id: 35, question: "What is the potential positive impact of AI on healthcare?", options: ["Only faster appointments", "Improved diagnosis and personalized treatment", "Just cost reduction"], correctAnswer: 1, explanation: "AI can improve healthcare through better diagnosis, drug discovery, personalized treatment, and medical imaging analysis." },
  { id: 36, question: "What is machine learning?", options: ["Teaching machines to move", "AI that learns from data without explicit programming", "Programming machines manually"], correctAnswer: 1, explanation: "Machine learning is a subset of AI where computers learn and improve from data without being explicitly programmed for every task." },
  { id: 37, question: "Which AI assistant is built into iPhones?", options: ["Alexa", "Siri", "Google Assistant"], correctAnswer: 1, explanation: "Siri is Apple's AI assistant that is built into iPhones and other Apple devices." },
  { id: 38, question: "What do we call AI that can generate new images, text, or music?", options: ["Analytical AI", "Generative AI", "Predictive AI"], correctAnswer: 1, explanation: "Generative AI refers to AI systems that can create new content like images, text, or music." },
  { id: 39, question: "True or False: You need to be a programmer to use AI tools like ChatGPT.", options: ["True", "False", "Only for advanced features"], correctAnswer: 1, explanation: "False - Many AI tools like ChatGPT are designed for everyday users with simple, user-friendly interfaces." },
  { id: 40, question: "What is the main way AI learns new information?", options: ["By reading books", "By analyzing large amounts of data to find patterns", "By asking humans questions"], correctAnswer: 1, explanation: "AI learns primarily by analyzing large amounts of data to identify patterns and relationships." },
];

const getRandomQuestions = (questions: Question[], count: number): Question[] => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const gameCards = [
  {
    title: "AI Knowledge Arena",
    subtitle: "History, tools, ethics, and pop culture",
    tag: "Trivia",
    image:
      "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Prompt Speed Run",
    subtitle: "Quick rounds, faster scoring, bonus points",
    tag: "Challenge",
    image:
      "https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?auto=format&fit=crop&w=1400&q=80",
  },
];

const Quiz = () => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionPool, setQuestionPool] = useState<Question[]>(allQuizQuestions);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [quizSeed, setQuizSeed] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      setQuestionsLoading(true);
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error || !data || data.length === 0) {
        setQuestionPool(allQuizQuestions);
        setQuestionsLoading(false);
        return;
      }

      const mappedQuestions = data
        .map((item) => {
          const options = Array.isArray(item.options)
            ? item.options.map((option) => String(option))
            : [];

          if (options.length < 2) return null;

          return {
            id: item.id as string | number,
            question: item.question,
            options,
            correctAnswer: item.correct_answer,
            explanation: item.explanation || "No explanation provided.",
          } as Question;
        })
        .filter((item): item is Question => !!item);

      setQuestionPool(mappedQuestions.length > 0 ? mappedQuestions : allQuizQuestions);
      setQuestionsLoading(false);
    };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, []);

  const quizQuestions = useMemo(
    () => getRandomQuestions(questionPool, Math.min(10, questionPool.length)),
    [questionPool, quizSeed],
  );

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background text-foreground">
          <section className="border-b border-border bg-secondary">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Games
                </h1>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Learn and play with SPOTAI
                </p>
              </div>
              <div className="relative mx-auto mt-8 max-w-2xl">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search games"
                  className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-pink-500"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {gameCards.map((card) => (
                <ShowcaseCard
                  key={card.title}
                  title={card.title}
                  subtitle={card.subtitle}
                  tag={card.tag}
                  image={card.image}
                  className="min-h-[32rem]"
                  imageClassName="h-[21rem]"
                />
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] border border-border bg-card px-8 py-10 text-center shadow-[0_8px_26px_rgba(16,24,40,0.06)]">
              <Brain className="mx-auto mb-4 h-14 w-14 text-pink-600" />
              <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Log In To Start Quiz
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Sign in to play the AI Knowledge Arena, save your scores, and unlock bonus rounds.
              </p>
              <Link
                to="/auth"
                className="mt-6 inline-flex h-12 items-center rounded-full border border-pink-500 bg-pink-500 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-pink-600"
              >
                Enter The Arena
              </Link>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === quizQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const getScoreMessage = (score: number) => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 90) return "🎉 AI Master! Outstanding knowledge!";
    if (percentage >= 80) return "🚀 AI Expert! Excellent work!";
    if (percentage >= 70) return "⭐ AI Enthusiast! Great job!";
    if (percentage >= 60) return "📚 AI Learner! Good progress!";
    return "🌱 AI Beginner! Keep learning!";
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
    setQuizStarted(false);
    setResultSaved(false);
    setQuizSeed((value) => value + 1);
  };

  const score = calculateScore();
  const pointsEarned = score * 10;

  useEffect(() => {
    if (!user || !quizCompleted || !showResults || resultSaved || quizQuestions.length === 0) return;

    const saveResult = async () => {
      const { error } = await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_title: "AI Knowledge Arena",
        score,
        total_questions: quizQuestions.length,
        answers: selectedAnswers,
      });

      if (error) {
        toast({
          title: "Could not save quiz result",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResultSaved(true);
      toast({
        title: "Quiz result saved",
        description: "Your score is now available in your dashboard and admin analytics.",
      });
    };

    saveResult();
  }, [quizCompleted, quizQuestions.length, resultSaved, score, selectedAnswers, showResults, toast, user]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Games
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Play, learn, and level up your AI knowledge
              </p>
            </div>
            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search game modes"
                className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-pink-500"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {!quizStarted ? (
            <>
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {gameCards.map((card) => (
                  <ShowcaseCard
                    key={card.title}
                    title={card.title}
                    subtitle={card.subtitle}
                    tag={card.tag}
                    image={card.image}
                    className="min-h-[32rem]"
                    imageClassName="h-[21rem]"
                  />
                ))}
              </div>

              <div className="mt-10 rounded-[2rem] border border-border bg-card px-8 py-10 text-center shadow-[0_8px_26px_rgba(16,24,40,0.06)]">
                <div className="mx-auto mb-4 flex w-fit items-center gap-3 rounded-full border border-pink-200 bg-pink-100 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-700">
                  <Zap className="h-4 w-4" />
                  {quizQuestions.length} Questions
                </div>
                <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Ready For The AI Knowledge Arena?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  {questionsLoading
                    ? "Loading the current quiz bank..."
                    : `You will get ${quizQuestions.length} questions from the current quiz bank. Finish the round to unlock your score and answer review.`}
                </p>
                <button
                  onClick={() => setQuizStarted(true)}
                  disabled={questionsLoading || quizQuestions.length === 0}
                  className="mt-6 inline-flex h-12 items-center rounded-full border border-pink-500 bg-pink-500 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-pink-600"
                >
                  {questionsLoading ? "Loading..." : "Start Quiz"}
                </button>
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-8 shadow-[0_8px_30px_rgba(20,20,20,0.08)]">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Brain className="h-8 w-8 text-pink-600" />
                  <h2 className="text-3xl font-bold text-foreground">AI Knowledge Quiz</h2>
                  <Zap className="h-8 w-8 text-violet-600" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Test your knowledge about artificial intelligence and machine learning.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!showResults ? (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="w-full rounded-full bg-secondary h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>

                    <div className="text-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {currentQuestion + 1} of {quizQuestions.length}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-6">
                      <h3 className="text-xl font-semibold mb-6 text-foreground">{quizQuestions[currentQuestion].question}</h3>

                      <div className="space-y-3 mb-6">
                        {quizQuestions[currentQuestion].options.map((option, index) => {
                          const isSelected = selectedAnswers[currentQuestion] === index;
                          return (
                            <motion.button
                              key={index}
                              onClick={() => handleAnswerSelect(index)}
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                                isSelected
                                  ? "border-pink-400 bg-pink-50 text-foreground"
                                  : "border-border text-foreground hover:border-pink-300 hover:bg-pink-50/70"
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => setQuizStarted(false)}
                          className="rounded-full border border-input px-5 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                        >
                          Back
                        </button>
                        <motion.button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[currentQuestion] === undefined}
                          className="rounded-full border border-pink-500 bg-pink-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-pink-600"
                          whileHover={{ scale: selectedAnswers[currentQuestion] !== undefined ? 1.03 : 1 }}
                          whileTap={{ scale: selectedAnswers[currentQuestion] !== undefined ? 0.97 : 1 }}
                        >
                          {currentQuestion === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                  >
                    <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 p-8 text-white">
                      <Trophy className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                      <p className="text-xl mb-2">
                        You scored {score} out of {quizQuestions.length}
                      </p>
                      <p className="text-lg mb-4">{getScoreMessage(score)}</p>
                      <div className="flex justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          <span>+{pointsEarned} Points Earned</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-foreground">Review Your Answers</h4>
                      {quizQuestions.map((question, index) => {
                        const userAnswer = selectedAnswers[index];
                        const isCorrect = userAnswer === question.correctAnswer;
                        return (
                          <div
                            key={question.id}
                            className={`p-4 rounded-xl border-2 text-left ${
                              isCorrect
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-2">
                                  {index + 1}. {question.question}
                                </p>
                                <p className={`text-sm mb-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                                  Your answer: {question.options[userAnswer] || "No answer selected"}
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm text-green-700 mb-2">
                                    Correct answer: {question.options[question.correctAnswer]}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <motion.button
                      onClick={resetQuiz}
                      className="mx-auto flex items-center gap-2 rounded-full border border-pink-500 bg-pink-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-pink-600"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <RotateCcw className="h-5 w-5" />
                      Take New Quiz
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Quiz;
