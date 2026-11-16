import type { CharacterConfig } from "./types";

// [SPEC-002:AC-3] 오프라인에서도 즉시 동작하는 인라인 Lottie 애니메이션 데이터(통통 튀는 오브)
const SAMPLE_LOTTIE_ORB: Record<string, unknown> = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 80,
  h: 80,
  nm: "CalOrb",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Orb",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [40, 46, 0], e: [40, 28, 0], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 30, s: [40, 28, 0], e: [40, 46, 0], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 60, s: [40, 46, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [110, 90, 100], e: [95, 105, 100] },
            { t: 30, s: [95, 105, 100], e: [110, 90, 100] },
            { t: 60, s: [110, 90, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [36, 36] },
          nm: "Circle",
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.22, 0.74, 0.97, 1] },
          o: { a: 0, k: 100 },
          nm: "Fill",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

export const CHARACTER_PRESETS: CharacterConfig[] = [
  {
    id: "default-buddy",
    name: "캘리 (기본)",
    assetType: "placeholder",
  },
  {
    id: "lottie-orb",
    name: "바운스 오브 (Lottie)",
    assetType: "lottie",
    lottie: {
      animationData: SAMPLE_LOTTIE_ORB,
      loop: true,
    },
  },
];
// [/SPEC-002:AC-3]
