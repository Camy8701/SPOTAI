import { useEffect, useRef, useState, type RefObject } from "react";

type PointerPosition = {
  x: number;
  y: number;
};

type LookOffset = {
  x: number;
  y: number;
};

interface LandingMascotsProps {
  isTyping: boolean;
  passwordLength: number;
  showPassword: boolean;
}

interface PupilProps {
  maxDistance?: number;
  mousePosition: PointerPosition | null;
  pupilColor?: string;
  size?: number;
  forceLookX?: number;
  forceLookY?: number;
}

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  mousePosition: PointerPosition | null;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const getLookOffset = (
  ref: RefObject<HTMLDivElement | null>,
  mousePosition: PointerPosition | null,
  maxDistance: number,
  forceLookX?: number,
  forceLookY?: number,
): LookOffset => {
  if (forceLookX !== undefined && forceLookY !== undefined) {
    return { x: forceLookX, y: forceLookY };
  }

  if (!ref.current || !mousePosition) {
    return { x: 0, y: 0 };
  }

  const bounds = ref.current.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const deltaX = mousePosition.x - centerX;
  const deltaY = mousePosition.y - centerY;
  const distance = Math.min(Math.hypot(deltaX, deltaY), maxDistance);
  const angle = Math.atan2(deltaY, deltaX);

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};

const Pupil = ({
  size = 12,
  maxDistance = 5,
  mousePosition,
  pupilColor = "#2d2d2d",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const pupilRef = useRef<HTMLDivElement>(null);
  const pupilPosition = getLookOffset(
    pupilRef,
    mousePosition,
    maxDistance,
    forceLookX,
    forceLookY,
  );

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: "transform 0.12s ease-out",
      }}
    />
  );
};

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  mousePosition,
  eyeColor = "white",
  pupilColor = "#2d2d2d",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilPosition = getLookOffset(
    eyeRef,
    mousePosition,
    maxDistance,
    forceLookX,
    forceLookY,
  );

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center overflow-hidden rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: "transform 0.12s ease-out",
          }}
        />
      )}
    </div>
  );
};

const LandingMascots = ({
  isTyping,
  passwordLength,
  showPassword,
}: LandingMascotsProps) => {
  const [mousePosition, setMousePosition] = useState<PointerPosition | null>(null);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let blinkTimeout: number | undefined;
    let resetTimeout: number | undefined;

    const scheduleBlink = () => {
      blinkTimeout = window.setTimeout(() => {
        setIsPurpleBlinking(true);
        resetTimeout = window.setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    scheduleBlink();

    return () => {
      if (blinkTimeout !== undefined) window.clearTimeout(blinkTimeout);
      if (resetTimeout !== undefined) window.clearTimeout(resetTimeout);
    };
  }, []);

  useEffect(() => {
    let blinkTimeout: number | undefined;
    let resetTimeout: number | undefined;

    const scheduleBlink = () => {
      blinkTimeout = window.setTimeout(() => {
        setIsBlackBlinking(true);
        resetTimeout = window.setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    scheduleBlink();

    return () => {
      if (blinkTimeout !== undefined) window.clearTimeout(blinkTimeout);
      if (resetTimeout !== undefined) window.clearTimeout(resetTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false);
      return;
    }

    setIsLookingAtEachOther(true);
    const timer = window.setTimeout(() => {
      setIsLookingAtEachOther(false);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!(passwordLength > 0 && showPassword)) {
      setIsPurplePeeking(false);
      return;
    }

    let peekTimeout: number | undefined;
    let resetTimeout: number | undefined;

    const schedulePeek = () => {
      peekTimeout = window.setTimeout(() => {
        setIsPurplePeeking(true);
        resetTimeout = window.setTimeout(() => {
          setIsPurplePeeking(false);
          schedulePeek();
        }, 800);
      }, Math.random() * 3000 + 2000);
    };

    schedulePeek();

    return () => {
      if (peekTimeout !== undefined) window.clearTimeout(peekTimeout);
      if (resetTimeout !== undefined) window.clearTimeout(resetTimeout);
    };
  }, [passwordLength, showPassword]);

  const calculatePosition = (ref: RefObject<HTMLDivElement | null>) => {
    if (!ref.current || !mousePosition) {
      return { faceX: 0, faceY: 0, bodySkew: 0 };
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mousePosition.x - centerX;
    const deltaY = mousePosition.y - centerY;

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  };

  const purplePosition = calculatePosition(purpleRef);
  const blackPosition = calculatePosition(blackRef);
  const yellowPosition = calculatePosition(yellowRef);
  const orangePosition = calculatePosition(orangeRef);
  const isPasswordVisible = passwordLength > 0 && showPassword;
  const isPasswordHidden = passwordLength > 0 && !showPassword;

  return (
    <div
      aria-hidden="true"
      className="relative hidden h-[420px] w-full max-w-[540px] items-end justify-center xl:flex"
    >
      <div className="absolute inset-x-10 top-8 h-48 rounded-full bg-[radial-gradient(circle,rgba(108,63,245,0.12),transparent_65%)] blur-3xl" />
      <div className="absolute inset-x-16 bottom-10 h-14 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.12),transparent_70%)] blur-2xl" />
      <div className="absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative h-[400px] w-[550px] scale-[0.92] 2xl:scale-100">
        <div
          ref={purpleRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "70px",
            width: "180px",
            height: isTyping || isPasswordHidden ? "440px" : "400px",
            backgroundColor: "#6c3ff5",
            borderRadius: "12px 12px 0 0",
            zIndex: 1,
            transform: isPasswordVisible
              ? "skewX(0deg)"
              : isTyping || isPasswordHidden
                ? `skewX(${purplePosition.bodySkew - 12}deg) translateX(40px)`
                : `skewX(${purplePosition.bodySkew}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 28px 60px rgba(108, 63, 245, 0.18)",
          }}
        >
          <div
            className="absolute flex gap-8 transition-all duration-700 ease-in-out"
            style={{
              left: isPasswordVisible
                ? "20px"
                : isLookingAtEachOther
                  ? "55px"
                  : `${45 + purplePosition.faceX}px`,
              top: isPasswordVisible
                ? "35px"
                : isLookingAtEachOther
                  ? "65px"
                  : `${40 + purplePosition.faceY}px`,
            }}
          >
            <EyeBall
              size={18}
              pupilSize={7}
              maxDistance={5}
              mousePosition={mousePosition}
              eyeColor="white"
              pupilColor="#2d2d2d"
              isBlinking={isPurpleBlinking}
              forceLookX={isPasswordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
              forceLookY={isPasswordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
            />
            <EyeBall
              size={18}
              pupilSize={7}
              maxDistance={5}
              mousePosition={mousePosition}
              eyeColor="white"
              pupilColor="#2d2d2d"
              isBlinking={isPurpleBlinking}
              forceLookX={isPasswordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
              forceLookY={isPasswordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
            />
          </div>
        </div>

        <div
          ref={blackRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "240px",
            width: "120px",
            height: "310px",
            backgroundColor: "#2d2d2d",
            borderRadius: "10px 10px 0 0",
            zIndex: 2,
            transform: isPasswordVisible
              ? "skewX(0deg)"
              : isLookingAtEachOther
                ? `skewX(${blackPosition.bodySkew * 1.5 + 10}deg) translateX(20px)`
                : isTyping || isPasswordHidden
                  ? `skewX(${blackPosition.bodySkew * 1.5}deg)`
                  : `skewX(${blackPosition.bodySkew}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 24px 48px rgba(15, 23, 42, 0.18)",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-700 ease-in-out"
            style={{
              left: isPasswordVisible
                ? "10px"
                : isLookingAtEachOther
                  ? "32px"
                  : `${26 + blackPosition.faceX}px`,
              top: isPasswordVisible
                ? "28px"
                : isLookingAtEachOther
                  ? "12px"
                  : `${32 + blackPosition.faceY}px`,
            }}
          >
            <EyeBall
              size={16}
              pupilSize={6}
              maxDistance={4}
              mousePosition={mousePosition}
              eyeColor="white"
              pupilColor="#2d2d2d"
              isBlinking={isBlackBlinking}
              forceLookX={isPasswordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
              forceLookY={isPasswordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
            />
            <EyeBall
              size={16}
              pupilSize={6}
              maxDistance={4}
              mousePosition={mousePosition}
              eyeColor="white"
              pupilColor="#2d2d2d"
              isBlinking={isBlackBlinking}
              forceLookX={isPasswordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
              forceLookY={isPasswordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
            />
          </div>
        </div>

        <div
          ref={orangeRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "0px",
            width: "240px",
            height: "200px",
            zIndex: 3,
            backgroundColor: "#ff9b6b",
            borderRadius: "120px 120px 0 0",
            transform: isPasswordVisible ? "skewX(0deg)" : `skewX(${orangePosition.bodySkew}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 18px 40px rgba(255, 155, 107, 0.18)",
          }}
        >
          <div
            className="absolute flex gap-8 transition-all duration-200 ease-out"
            style={{
              left: isPasswordVisible ? "50px" : `${82 + orangePosition.faceX}px`,
              top: isPasswordVisible ? "85px" : `${90 + orangePosition.faceY}px`,
            }}
          >
            <Pupil
              size={12}
              maxDistance={5}
              mousePosition={mousePosition}
              pupilColor="#2d2d2d"
              forceLookX={isPasswordVisible ? -5 : undefined}
              forceLookY={isPasswordVisible ? -4 : undefined}
            />
            <Pupil
              size={12}
              maxDistance={5}
              mousePosition={mousePosition}
              pupilColor="#2d2d2d"
              forceLookX={isPasswordVisible ? -5 : undefined}
              forceLookY={isPasswordVisible ? -4 : undefined}
            />
          </div>
        </div>

        <div
          ref={yellowRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "310px",
            width: "140px",
            height: "230px",
            backgroundColor: "#e8d754",
            borderRadius: "70px 70px 0 0",
            zIndex: 4,
            transform: isPasswordVisible ? "skewX(0deg)" : `skewX(${yellowPosition.bodySkew}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 18px 42px rgba(232, 215, 84, 0.18)",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-200 ease-out"
            style={{
              left: isPasswordVisible ? "20px" : `${52 + yellowPosition.faceX}px`,
              top: isPasswordVisible ? "35px" : `${40 + yellowPosition.faceY}px`,
            }}
          >
            <Pupil
              size={12}
              maxDistance={5}
              mousePosition={mousePosition}
              pupilColor="#2d2d2d"
              forceLookX={isPasswordVisible ? -5 : undefined}
              forceLookY={isPasswordVisible ? -4 : undefined}
            />
            <Pupil
              size={12}
              maxDistance={5}
              mousePosition={mousePosition}
              pupilColor="#2d2d2d"
              forceLookX={isPasswordVisible ? -5 : undefined}
              forceLookY={isPasswordVisible ? -4 : undefined}
            />
          </div>
          <div
            className="absolute h-1 w-20 rounded-full bg-[#2d2d2d] transition-all duration-200 ease-out"
            style={{
              left: isPasswordVisible ? "10px" : `${40 + yellowPosition.faceX}px`,
              top: isPasswordVisible ? "88px" : `${88 + yellowPosition.faceY}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingMascots;
