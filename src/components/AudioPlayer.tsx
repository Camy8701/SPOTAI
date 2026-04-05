import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface AudioQueueItem {
  id: string;
  src: string;
  title: string;
}

interface AudioPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
  queue?: AudioQueueItem[];
  currentId?: string;
  onSelectTrack?: (item: AudioQueueItem) => void;
  queueItemLabel?: string;
  playRequestId?: number;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const AUDIO_PROGRESS_STORAGE_KEY = "spotai-audio-progress-v1";

const readProgressStore = () => {
  if (typeof window === "undefined") return {} as Record<string, number>;

  try {
    const raw = window.localStorage.getItem(AUDIO_PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
};

const writeProgressStore = (store: Record<string, number>) => {
  if (typeof window === "undefined") return;

  try {
    if (Object.keys(store).length === 0) {
      window.localStorage.removeItem(AUDIO_PROGRESS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUDIO_PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage failures to avoid interrupting playback.
  }
};

const AudioPlayer = ({
  src,
  title,
  onClose,
  queue,
  currentId,
  onSelectTrack,
  queueItemLabel = "item",
  playRequestId = 0,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastHandledPlayRequestRef = useRef(playRequestId);
  const lastPersistedSecondRef = useRef(-1);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const trackKey = currentId || src;

  const currentIndex = useMemo(() => {
    if (!queue?.length || !currentId) return -1;
    return queue.findIndex((item) => item.id === currentId);
  }, [currentId, queue]);

  const previousItem =
    currentIndex > 0 && queue ? queue[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && queue && currentIndex < queue.length - 1
      ? queue[currentIndex + 1]
      : null;
  const hasQueueNavigation = Boolean(queue?.length && onSelectTrack && currentIndex !== -1);

  const persistProgress = (time: number, mediaDuration: number) => {
    if (!trackKey || !Number.isFinite(time)) return;

    const nextStore = readProgressStore();
    const roundedTime = Math.max(0, Math.floor(time));
    const shouldClear =
      roundedTime < 3 ||
      (Number.isFinite(mediaDuration) &&
        mediaDuration > 0 &&
        roundedTime >= Math.floor(mediaDuration) - 3);

    if (shouldClear) {
      delete nextStore[trackKey];
    } else {
      nextStore[trackKey] = roundedTime;
    }

    writeProgressStore(nextStore);
    lastPersistedSecondRef.current = roundedTime;
  };

  const clearSavedProgress = () => {
    if (!trackKey) return;

    const nextStore = readProgressStore();
    delete nextStore[trackKey];
    writeProgressStore(nextStore);
    lastPersistedSecondRef.current = -1;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);

      const roundedTime = Math.floor(audio.currentTime);
      if (roundedTime > 0 && roundedTime % 5 === 0 && roundedTime !== lastPersistedSecondRef.current) {
        persistProgress(audio.currentTime, audio.duration);
      }
    };

    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      persistProgress(audio.currentTime, audio.duration);
    };
    const onEnd = () => {
      clearSavedProgress();
      if (nextItem && onSelectTrack) {
        onSelectTrack(nextItem);
        return;
      }
      setPlaying(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, [nextItem, onSelectTrack, trackKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    let onReady: (() => void) | null = null;

    const shouldAutoPlay = playRequestId !== lastHandledPlayRequestRef.current;
    if (shouldAutoPlay) {
      lastHandledPlayRequestRef.current = playRequestId;
    }

    const restoreAndMaybePlay = () => {
      if (cancelled) return;

      const savedTime = readProgressStore()[trackKey] ?? 0;
      const canResume =
        savedTime > 0 &&
        (!Number.isFinite(audio.duration) ||
          audio.duration <= 0 ||
          savedTime < Math.floor(audio.duration) - 3);

      if (canResume) {
        audio.currentTime = savedTime;
        setCurrentTime(savedTime);
        lastPersistedSecondRef.current = savedTime;
      } else {
        audio.currentTime = 0;
        setCurrentTime(0);
        lastPersistedSecondRef.current = -1;
      }

      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

      if (!shouldAutoPlay) {
        setPlaying(false);
        return;
      }

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setPlaying(false);
        });
      }
    };

    audio.pause();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    audio.load();

    if (audio.readyState >= 1) {
      restoreAndMaybePlay();
    } else {
      onReady = () => restoreAndMaybePlay();
      audio.addEventListener("loadedmetadata", onReady, { once: true });
    }

    return () => {
      cancelled = true;
      persistProgress(audio.currentTime, audio.duration);
      if (onReady) {
        audio.removeEventListener("loadedmetadata", onReady);
      }
    };
  }, [playRequestId, src, trackKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const audio = audioRef.current;
      if (!audio) return;
      persistProgress(audio.currentTime, audio.duration);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [trackKey]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        setPlaying(false);
      });
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    persistProgress(nextTime, duration);
  };

  const jumpToQueueItem = (item: AudioQueueItem | null) => {
    if (!item || !onSelectTrack) return;
    onSelectTrack(item);
  };

  const handlePrevious = () => {
    if (hasQueueNavigation) {
      jumpToQueueItem(previousItem);
      return;
    }
    skip(-10);
  };

  const handleNext = () => {
    if (hasQueueNavigation) {
      jumpToQueueItem(nextItem);
      return;
    }
    skip(10);
  };

  const changeSpeed = () => {
    const index = SPEEDS.indexOf(speed);
    const nextSpeed = SPEEDS[(index + 1) % SPEEDS.length];
    setSpeed(nextSpeed);
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
    persistProgress(nextTime, duration);
  };

  const fmt = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-2xl"
      >
        <audio ref={audioRef} src={src} preload="metadata" />
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{title}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="rounded-full p-2 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  hasQueueNavigation
                    ? previousItem
                      ? `Previous ${queueItemLabel}`
                      : `No previous ${queueItemLabel}`
                    : "Back 10s"
                }
                disabled={hasQueueNavigation && !previousItem}
              >
                <SkipBack size={18} className="text-foreground" />
              </button>
              <button
                onClick={togglePlay}
                className="rounded-full bg-primary p-3 text-primary-foreground transition-opacity hover:opacity-90"
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={handleNext}
                className="rounded-full p-2 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  hasQueueNavigation
                    ? nextItem
                      ? `Next ${queueItemLabel}`
                      : `No next ${queueItemLabel}`
                    : "Forward 10s"
                }
                disabled={hasQueueNavigation && !nextItem}
              >
                <SkipForward size={18} className="text-foreground" />
              </button>
              <button
                onClick={changeSpeed}
                className="min-w-[40px] rounded-md bg-secondary px-2 py-1 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                {speed}x
              </button>
            </div>

            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="w-10 text-right text-xs text-muted-foreground">{fmt(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={seek}
                className="h-1 flex-1 cursor-pointer accent-primary"
              />
              <span className="w-10 text-xs text-muted-foreground">{fmt(duration)}</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-secondary"
              title="Close player"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
