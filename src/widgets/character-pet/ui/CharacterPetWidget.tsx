import { useState } from "react";
import {
  CharacterStage,
  SpeechBubble,
  type CharacterConfig,
  type CharacterMood,
} from "@/entities/character";

interface CharacterPetWidgetProps {
  upcomingCount: number;
}

const DEFAULT_CHARACTER: CharacterConfig = {
  id: "default-buddy",
  name: "캘리",
  assetType: "placeholder",
};

/**
 * 일정 개수나 인터랙션에 따라 캐릭터 상태와 대사를 반응시키는 위젯
 */
export function CharacterPetWidget({ upcomingCount }: CharacterPetWidgetProps) {
  const [mood, setMood] = useState<CharacterMood>(
    upcomingCount > 0 ? "reminder" : "idle",
  );

  const handleInteract = () => {
    setMood("greeting");
    setTimeout(() => {
      setMood(upcomingCount > 0 ? "reminder" : "idle");
    }, 1500);
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
      <CharacterStage
        config={DEFAULT_CHARACTER}
        mood={mood}
        onInteract={handleInteract}
      />
    </div>
  );
}
