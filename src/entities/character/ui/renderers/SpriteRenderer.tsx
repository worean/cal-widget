import { useEffect, useState } from "react";
import type { CharacterRendererProps } from "../../model/types";

// [SPEC-002:AC-2] 2D 스프라이트 시트 프레임 재생 렌더러 전략
export function SpriteRenderer({
  config,
  mood,
  onInteract,
}: CharacterRendererProps) {
  const [frame, setFrame] = useState(0);
  const sprite = config.sprite ?? {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 1,
    fps: 8,
  };

  useEffect(() => {
    if (sprite.frameCount <= 1 || sprite.fps <= 0) return;

    const intervalMs = Math.max(16, Math.round(1000 / sprite.fps));
    const timer = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % sprite.frameCount);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [sprite.frameCount, sprite.fps]);

  return (
    <button
      type="button"
      className={`character-canvas-btn character-canvas-btn--${mood}`}
      onClick={onInteract}
      title={`${config.name} (클릭해서 인사하기)`}
    >
      <div
        className="character-sprite-box"
        style={{
          width: sprite.frameWidth,
          height: sprite.frameHeight,
          backgroundImage: config.assetUrl ? `url(${config.assetUrl})` : undefined,
          backgroundPosition: `-${frame * sprite.frameWidth}px 0px`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </button>
  );
}
// [/SPEC-002:AC-2]
