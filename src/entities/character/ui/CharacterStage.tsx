import type { ReactNode } from "react";
import type { CharacterAssetType, CharacterRendererProps } from "../model/types";
import {
  LottieRenderer,
  PlaceholderRenderer,
  RiveRenderer,
  SpriteRenderer,
} from "./renderers";

// [SPEC-002:AC-2] Strategy Pattern 기반 포맷별 캐릭터 렌더러 디스패처
const RENDERER_STRATEGIES: Record<
  CharacterAssetType,
  (props: CharacterRendererProps) => ReactNode
> = {
  placeholder: (props) => <PlaceholderRenderer {...props} />,
  lottie: (props) => <LottieRenderer {...props} />,
  rive: (props) => <RiveRenderer {...props} />,
  sprite: (props) => <SpriteRenderer {...props} />,
};

export function CharacterStage(props: CharacterRendererProps) {
  const renderStrategy = RENDERER_STRATEGIES[props.config.assetType];
  return <div className="character-stage">{renderStrategy(props)}</div>;
}
// [/SPEC-002:AC-2]
