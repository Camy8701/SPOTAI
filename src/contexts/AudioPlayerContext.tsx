import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import AudioPlayer, { type AudioQueueItem } from "@/components/AudioPlayer";

type AudioSession = {
  current: AudioQueueItem;
  queue: AudioQueueItem[];
  queueItemLabel: string;
};

type PlayAudioOptions = {
  track: AudioQueueItem;
  queue?: AudioQueueItem[];
  queueItemLabel?: string;
};

type AudioPlayerContextValue = {
  currentTrack: AudioQueueItem | null;
  playAudio: (options: PlayAudioOptions) => void;
  closeAudio: () => void;
};

const AUDIO_SESSION_STORAGE_KEY = "spotai-audio-session-v1";

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

const normalizeQueue = (track: AudioQueueItem, queue?: AudioQueueItem[]) => {
  const merged = queue?.length ? queue : [track];
  const seen = new Set<string>();
  const normalized: AudioQueueItem[] = [];

  [track, ...merged].forEach((item) => {
    const key = item.id || item.src;
    if (!key || seen.has(key)) return;
    seen.add(key);
    normalized.push(item);
  });

  return normalized;
};

const readStoredSession = (): AudioSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUDIO_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AudioSession> | null;
    if (
      !parsed?.current?.src ||
      !parsed.current.title ||
      !parsed.current.id ||
      !Array.isArray(parsed.queue)
    ) {
      return null;
    }

    const queue = parsed.queue.filter(
      (item): item is AudioQueueItem =>
        Boolean(item?.id) && Boolean(item?.src) && Boolean(item?.title),
    );

    return {
      current: parsed.current,
      queue: normalizeQueue(parsed.current, queue),
      queueItemLabel: parsed.queueItemLabel || "item",
    };
  } catch {
    return null;
  }
};

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AudioSession | null>(null);
  const [playRequestId, setPlayRequestId] = useState(0);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setSession(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!session) {
      window.localStorage.removeItem(AUDIO_SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUDIO_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const playAudio = useCallback(({ track, queue, queueItemLabel = "item" }: PlayAudioOptions) => {
    setSession({
      current: track,
      queue: normalizeQueue(track, queue),
      queueItemLabel,
    });
    setPlayRequestId((value) => value + 1);
  }, []);

  const selectTrack = useCallback((track: AudioQueueItem) => {
    setSession((current) => ({
      current: track,
      queue: normalizeQueue(track, current?.queue),
      queueItemLabel: current?.queueItemLabel || "item",
    }));
    setPlayRequestId((value) => value + 1);
  }, []);

  const closeAudio = useCallback(() => {
    setSession(null);
  }, []);

  const contextValue = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack: session?.current || null,
      playAudio,
      closeAudio,
    }),
    [closeAudio, playAudio, session?.current],
  );

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
      {session?.current ? (
        <AudioPlayer
          src={session.current.src}
          title={session.current.title}
          onClose={closeAudio}
          queue={session.queue}
          currentId={session.current.id}
          onSelectTrack={selectTrack}
          queueItemLabel={session.queueItemLabel}
          playRequestId={playRequestId}
        />
      ) : null}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  }

  return context;
};
