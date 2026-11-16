import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import type { CharacterMood, CharacterRendererProps } from "../../model/types";

// [SPEC-002:AC-3] 상태(mood)에 따른 Lottie 재생 속도 매핑
const MOOD_SPEED: Record<CharacterMood, number> = {
  idle: 0.8,
  greeting: 1.8,
  reminder: 1.4,
  busy: 1.1,
};
// [/SPEC-002:AC-3]

// [SPEC-002:AC-2] lottie-web 기반 벡터 애니메이션 렌더러 전략
export function LottieRenderer({
  config,
  mood,
  onInteract,
}: CharacterRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const anim = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: config.lottie?.loop ?? true,
      autoplay: true,
      ...(config.lottie?.animationData
        ? { animationData: config.lottie.animationData }
        : { path: config.assetUrl }),
    });

    animRef.current = anim;

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [config.assetUrl, config.lottie]);

  useEffect(() => {
    animRef.current?.setSpeed(MOOD_SPEED[mood]);
  }, [mood]);

  return (
    <button
      type="button"
      className={`character-canvas-btn character-canvas-btn--${mood}`}
      onClick={onInteract}
      title={`${config.name} (클릭해서 인사하기)`}
    >
      <div ref={containerRef} className="character-lottie-box" />
    </button>
  );
}
// [/SPEC-002:AC-2]
