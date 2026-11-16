import { invoke } from "@tauri-apps/api/core";
import {
  CHARACTER_PRESETS,
  CharacterStage,
  SpeechBubble,
} from "@/entities/character";
import { useMascotBehavior } from "@/features/mascot-behavior";
import { isTauriRuntime } from "@/shared/lib/platform";

// [SPEC-007:AC-1] 독립 투명 마스코트 창 전용 페이지
export function MascotPage() {
  const { facing, mood, statusText, triggerReact, startDrag } =
    useMascotBehavior();

  const handleDoubleClick = () => {
    if (isTauriRuntime()) {
      void invoke("toggle_calendar_board");
    }
  };

  return (
    <main
      className="mascot-window"
      onMouseDown={(e) => {
        if (e.button === 0 && e.detail === 1) {
          // 드래그 시작은 살짝 움직이거나 길게 누를 때 startDragging이 처리됨
          startDrag();
        }
      }}
      onDoubleClick={handleDoubleClick}
      title="드래그로 이동 · 클릭으로 인사 · 더블클릭으로 캘린더 열기/닫기"
    >
      <SpeechBubble className="mascot-window__bubble">{statusText}</SpeechBubble>
      <div className={`mascot-window__actor mascot-window__actor--${facing}`}>
        <CharacterStage
          config={CHARACTER_PRESETS[0]}
          mood={mood}
          onInteract={triggerReact}
        />
      </div>
    </main>
  );
}
// [/SPEC-007:AC-1]
