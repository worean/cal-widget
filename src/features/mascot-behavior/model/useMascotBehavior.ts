import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  currentMonitor,
  getCurrentWindow,
  PhysicalPosition,
} from "@tauri-apps/api/window";
import type { CharacterMood } from "@/entities/character";
import { isTauriRuntime } from "@/shared/lib/platform";

// [SPEC-007:AC-2] 마스코트 자율 행동 상태 머신 및 물리 엔진 훅
export type MascotAction =
  | "idle"
  | "walk"
  | "fall"
  | "edge_cling"
  | "drag"
  | "react";

export type MascotFacing = "left" | "right";

export interface WindowRect {
  title: string;
  owner: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseMascotBehaviorResult {
  action: MascotAction;
  facing: MascotFacing;
  mood: CharacterMood;
  statusText: string;
  triggerReact: () => void;
  startDrag: () => void;
}

const ACTION_TO_MOOD: Record<MascotAction, CharacterMood> = {
  idle: "idle",
  walk: "busy",
  fall: "reminder",
  edge_cling: "reminder",
  drag: "greeting",
  react: "greeting",
};

const ACTION_TEXT: Record<MascotAction, string> = {
  idle: "쉬는 중...",
  walk: "산책 중~",
  fall: "으악!",
  edge_cling: "벽에 착!",
  drag: "어디 가요?",
  react: "반가워요!",
};

export function useMascotBehavior(): UseMascotBehaviorResult {
  const [action, setAction] = useState<MascotAction>("idle");
  const [facing, setFacing] = useState<MascotFacing>("right");

  const actionRef = useRef<MascotAction>("idle");
  const posRef = useRef({ x: 160, y: 160 });
  const velRef = useRef({ vx: 2.2, vy: 0 });
  const nextDecisionAtRef = useRef<number>(Date.now() + 2000);
  const windowsCacheRef = useRef<WindowRect[]>([]);

  const updateAction = useCallback((next: MascotAction) => {
    actionRef.current = next;
    setAction(next);
  }, []);

  const triggerReact = useCallback(() => {
    updateAction("react");
    nextDecisionAtRef.current = Date.now() + 1600;
  }, [updateAction]);

  // [SPEC-007:AC-3] Tauri 창 드래그 시작 후 마우스 놓으면 낙하 상태로 전이
  const startDrag = useCallback(() => {
    updateAction("drag");
    if (!isTauriRuntime()) return;

    void getCurrentWindow()
      .startDragging()
      .finally(async () => {
        try {
          const pos = await getCurrentWindow().outerPosition();
          posRef.current = { x: pos.x, y: pos.y };
        } catch {
          // ignore
        }
        velRef.current.vy = 0;
        updateAction("fall");
      });
  }, [updateAction]);
  // [/SPEC-007:AC-3]

  // [SPEC-007:AC-4] 주기적 OS 활성 창 경계 조회
  useEffect(() => {
    if (!isTauriRuntime()) return;

    const pollWindows = async () => {
      try {
        windowsCacheRef.current = await invoke<WindowRect[]>("get_visible_windows");
      } catch {
        windowsCacheRef.current = [];
      }
    };

    void pollWindows();
    const timer = window.setInterval(() => void pollWindows(), 2000);
    return () => window.clearInterval(timer);
  }, []);
  // [/SPEC-007:AC-4]

  // [SPEC-007:AC-2] [SPEC-007:AC-3] 자율 이동 & 화면 경계 충돌 루프
  useEffect(() => {
    if (!isTauriRuntime()) {
      // 브라우저 단독 테스트 시 상태 순환 시뮬레이션
      const timer = window.setInterval(() => {
        if (actionRef.current === "react") {
          updateAction("idle");
          return;
        }
        const next: MascotAction = Math.random() > 0.5 ? "walk" : "idle";
        setFacing(Math.random() > 0.5 ? "right" : "left");
        updateAction(next);
      }, 2600);
      return () => window.clearInterval(timer);
    }

    let cancelled = false;
    const win = getCurrentWindow();

    const initPos = async () => {
      try {
        const pos = await win.outerPosition();
        posRef.current = { x: pos.x, y: pos.y };
      } catch {
        // ignore
      }
    };
    void initPos();

    const tick = async () => {
      if (cancelled) return;
      const current = actionRef.current;
      if (current === "drag") return;

      const now = Date.now();
      const monitor = await currentMonitor().catch(() => null);
      const size = await win.innerSize().catch(() => ({ width: 150, height: 150 }));

      const areaX = monitor?.workArea.position.x ?? 0;
      const areaY = monitor?.workArea.position.y ?? 0;
      const areaW = monitor?.workArea.size.width ?? 1280;
      const areaH = monitor?.workArea.size.height ?? 800;

      const minX = areaX;
      const maxX = areaX + areaW - size.width;
      const floorY = areaY + areaH - size.height;

      // 다른 OS 창 상단 테두리 후보 계산
      const mascotCenterX = posRef.current.x + size.width / 2;
      const mascotBottom = posRef.current.y + size.height;
      const surfaceBelow = windowsCacheRef.current.find(
        (w) =>
          mascotCenterX >= w.x &&
          mascotCenterX <= w.x + w.width &&
          mascotBottom <= w.y + 12 &&
          mascotBottom >= w.y - 16,
      );

      if (current === "fall") {
        velRef.current.vy = Math.min(velRef.current.vy + 1.4, 18);
        posRef.current.y += velRef.current.vy;

        if (surfaceBelow && posRef.current.y + size.height >= surfaceBelow.y) {
          posRef.current.y = surfaceBelow.y - size.height;
          velRef.current.vy = 0;
          updateAction("idle");
          nextDecisionAtRef.current = now + 1800;
        } else if (posRef.current.y >= floorY) {
          posRef.current.y = floorY;
          velRef.current.vy = 0;
          updateAction("idle");
          nextDecisionAtRef.current = now + 2000;
        }
        await win
          .setPosition(
            new PhysicalPosition(
              Math.round(posRef.current.x),
              Math.round(posRef.current.y),
            ),
          )
          .catch(() => {});
        return;
      }

      if (current === "walk") {
        posRef.current.x += velRef.current.vx;

        if (posRef.current.x <= minX) {
          posRef.current.x = minX;
          velRef.current.vx = Math.abs(velRef.current.vx);
          setFacing("right");
          updateAction("edge_cling");
          nextDecisionAtRef.current = now + 1400;
        } else if (posRef.current.x >= maxX) {
          posRef.current.x = maxX;
          velRef.current.vx = -Math.abs(velRef.current.vx);
          setFacing("left");
          updateAction("edge_cling");
          nextDecisionAtRef.current = now + 1400;
        }

        // 바닥보다 위에 있고 창 위도 아니라면 낙하
        if (posRef.current.y < floorY - 4 && !surfaceBelow) {
          updateAction("fall");
          return;
        }

        await win
          .setPosition(
            new PhysicalPosition(
              Math.round(posRef.current.x),
              Math.round(posRef.current.y),
            ),
          )
          .catch(() => {});
      }

      // 다음 행동 랜덤 결정
      if (now >= nextDecisionAtRef.current) {
        if (current === "react" || current === "edge_cling") {
          updateAction("walk");
          nextDecisionAtRef.current = now + 2500 + Math.random() * 2500;
        } else {
          const goWalk = Math.random() > 0.45;
          if (goWalk) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            velRef.current.vx = dir * (2 + Math.random() * 1.5);
            setFacing(dir > 0 ? "right" : "left");
            updateAction("walk");
            nextDecisionAtRef.current = now + 2500 + Math.random() * 3000;
          } else {
            updateAction("idle");
            nextDecisionAtRef.current = now + 2000 + Math.random() * 2500;
          }
        }
      }
    };

    const timer = window.setInterval(() => {
      void tick();
    }, 33);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [updateAction]);
  // [/SPEC-007:AC-2] [/SPEC-007:AC-3]

  return {
    action,
    facing,
    mood: ACTION_TO_MOOD[action],
    statusText: ACTION_TEXT[action],
    triggerReact,
    startDrag,
  };
}
// [/SPEC-007:AC-2]
