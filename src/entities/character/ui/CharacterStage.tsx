import type { ReactNode } from "react";
import type { CharacterAssetType, CharacterConfig, CharacterMood } from "../model/types";

interface RendererProps {
  config: CharacterConfig;
  mood: CharacterMood;
  onInteract?: () => void;
}

const MOOD_EMOJI: Record<CharacterMood, string> = {
  idle: "( • ᴗ • )",
  greeting: "( ﾉ ◕ヮ◕ )ﾉ",
  reminder: "( ｡ •̀ ᴗ •́ )!",
  busy: "( ˘ ³˘ )",
};

/**
 * 기본 내장 Placeholder 렌더러 (추후 Rive/Lottie/Sprite 렌더러와 동일 인터페이스)
 */
function PlaceholderCharacterRenderer({ config, mood, onInteract }: RendererProps) {
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

/**
 * Strategy Pattern:
 * 에셋 포맷(rive, lottie, sprite 등)이 늘어나도
 * 이 매핑 테이블에 렌더러 전략만 추가하면 위젯 코드는 수정할 필요가 없습니다.
 */
const RENDERER_STRATEGIES: Record<
  CharacterAssetType,
  (props: RendererProps) => ReactNode
> = {
  placeholder: (props) => <PlaceholderCharacterRenderer {...props} />,
  rive: (props) => <PlaceholderCharacterRenderer {...props} />,
  lottie: (props) => <PlaceholderCharacterRenderer {...props} />,
  sprite: (props) => <PlaceholderCharacterRenderer {...props} />,
};

export function CharacterStage(props: RendererProps) {
  const renderStrategy = RENDERER_STRATEGIES[props.config.assetType];
  return <div className="character-stage">{renderStrategy(props)}</div>;
}
