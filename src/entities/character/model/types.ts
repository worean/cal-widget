/**
 * 캐릭터의 감정/동작 상태 (일정 상태나 사용자 클릭에 따라 전이)
 */
export type CharacterMood = "idle" | "greeting" | "reminder" | "busy";

/**
 * 지원할 애니메이션 포맷 (Strategy Pattern의 키로 사용)
 */
export type CharacterAssetType = "placeholder" | "rive" | "lottie" | "sprite";

export interface CharacterConfig {
  id: string;
  name: string;
  assetType: CharacterAssetType;
  assetUrl?: string;
}
