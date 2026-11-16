import { useEffect, useRef } from "react";
import { Rive } from "@rive-app/canvas";
import type { CharacterRendererProps } from "../../model/types";

// [SPEC-002:AC-2] @rive-app/canvas 기반 인터랙티브 리깅 애니메이션 렌더러 전략
export function RiveRenderer({
  config,
  mood,
  onInteract,
}: CharacterRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config.assetUrl) return;

    const riveInstance = new Rive({
      src: config.assetUrl,
      canvas,
      autoplay: true,
      artboard: config.rive?.artboard,
      stateMachines: config.rive?.stateMachines,
      onLoad: () => {
        riveInstance.resizeDrawingSurfaceToCanvas();
      },
    });

    return () => {
      riveInstance.cleanup();
    };
  }, [config.assetUrl, config.rive]);

  return (
    <button
      type="button"
      className={`character-canvas-btn character-canvas-btn--${mood}`}
      onClick={onInteract}
      title={`${config.name} (클릭해서 인사하기)`}
    >
      <canvas ref={canvasRef} width={72} height={72} />
    </button>
  );
}
// [/SPEC-002:AC-2]
