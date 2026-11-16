import type { CharacterMood, CharacterRendererProps } from "../../model/types";

// [SPEC-002:AC-2] 기본 내장 Placeholder 캐릭터 렌더러
const MOOD_EMOJI: Record<CharacterMood, string> = {
  idle: "( • ᴗ • )",
  greeting: "( ﾉ ◕ヮ◕ )ﾉ",
  reminder: "( ｡ •̀ ᴗ •́ )!",
  busy: "( ˘ ³˘ )",
};

export function PlaceholderRenderer({
  config,
  mood,
  onInteract,
}: CharacterRendererProps) {
  return (
    <button
      type="button"
      className={`character-avatar character-avatar--${mood}`}
      onClick={onInteract}
      title={`${config.name} (클릭해서 인사하기)`}
    >
      <span className="character-avatar__face">{MOOD_EMOJI[mood]}</span>
    </button>
  );
}
// [/SPEC-002:AC-2]
