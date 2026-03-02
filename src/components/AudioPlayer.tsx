import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioPlayer = ({ src, title, onClose }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
    setPlaying(!playing);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const changeSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl"
      >
        <audio ref={audioRef} src={src} preload="metadata" />
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{title}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => skip(-10)} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Back 10s">
                <SkipBack size={18} className="text-foreground" />
              </button>
              <button onClick={togglePlay} className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => skip(10)} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Forward 10s">
                <SkipForward size={18} className="text-foreground" />
              </button>
              <button
                onClick={changeSpeed}
                className="px-2 py-1 rounded-md bg-secondary text-foreground text-xs font-bold min-w-[40px] hover:bg-muted transition-colors"
              >
                {speed}x
              </button>
            </div>

            {/* Time & Seek */}
            <div className="hidden sm:flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground w-10 text-right">{fmt(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={seek}
                className="flex-1 h-1 accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-10">{fmt(duration)}</span>
            </div>

            {/* Close */}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Close player">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
