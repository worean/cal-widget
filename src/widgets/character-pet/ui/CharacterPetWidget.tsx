import { useState } from "react";
import {
  CHARACTER_PRESETS,
  CharacterStage,
  SpeechBubble,
  type CharacterMood,
} from "@/entities/character";
import { IconButton, Tooltip } from "@/shared/ui";

interface CharacterPetWidgetProps {
  upcomingCount: number;
}

/**
 * 일정 개수나 인터랙션에 따라 캐릭터 상태와 대사를 반응시키는 위젯
 */
export function CharacterPetWidget({ upcomingCount }: CharacterPetWidgetProps) {
  // [SPEC-002:AC-3] 프리셋 전환 및 상태(mood) 인터랙션
  const [presetIndex, setPresetIndex] = useState(0);
  const [mood, setMood] = useState<CharacterMood>(
    upcomingCount > 0 ? "reminder" : "idle",
  );

  const activeCharacter = CHARACTER_PRESETS[presetIndex] ?? CHARACTER_PRESETS[0];

  const handleInteract = () => {
    setMood("greeting");
    setTimeout(() => {
      setMood(upcomingCount > 0 ? "reminder" : "idle");
    }, 1500);
  };

  const handleCyclePreset = () => {
    setPresetIndex((prev) => (prev + 1) % CHARACTER_PRESETS.length);
  };

  const bubbleText =
    mood === "greeting"
      ? "오늘도 좋은 하루 보내세요!"
      : upcomingCount > 0
        ? `오늘 일정이 ${upcomingCount}개 있어요.`
        : "오늘 일정이 비어 있어요.";

  return (
    <div className="character-pet">
      <SpeechBubble>{bubbleText}</SpeechBubble>
      <div className="character-pet__row">
        <Tooltip content={`캐릭터 전환 (${activeCharacter.name})`}>
          <IconButton onClick={handleCyclePreset} title="캐릭터 프리셋 전환">
            🎭
          </IconButton>
        </Tooltip>
        <CharacterStage
          config={activeCharacter}
          mood={mood}
          onInteract={handleInteract}
        />
      </div>
    </div>
  );
  // [/SPEC-002:AC-3]
}
