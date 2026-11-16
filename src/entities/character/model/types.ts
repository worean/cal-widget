// [SPEC-002:AC-1] 캐릭터 상태 및 애니메이션 포맷별 옵션 타입 정의
/**
 * 캐릭터의 감정/동작 상태 (일정 상태나 사용자 클릭에 따라 전이)
 */
export type CharacterMood = "idle" | "greeting" | "reminder" | "busy";

/**
 * 지원할 애니메이션 포맷 (Strategy Pattern의 키로 사용)
 */
export type CharacterAssetType = "placeholder" | "rive" | "lottie" | "sprite";

export interface LottieOptions {
  /** 외부 URL 대신 인라인 JSON 객체를 직접 전달할 때 사용 */
  animationData?: Record<string, unknown>;
  loop?: boolean;
}

export interface RiveOptions {
  artboard?: string;
  stateMachines?: string | string[];
}

export interface SpriteSheetOptions {
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  assetType: CharacterAssetType;
  assetUrl?: string;
  lottie?: LottieOptions;
  rive?: RiveOptions;
  sprite?: SpriteSheetOptions;
}

export interface CharacterRendererProps {
  config: CharacterConfig;
  mood: CharacterMood;
  onInteract?: () => void;
}
// [/SPEC-002:AC-1]
