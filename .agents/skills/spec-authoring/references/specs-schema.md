# `docs/specs/specs.json` 스키마 가이드

```json
{
  "project": "cal-widget",
  "updated_at": "2026-11-16",
  "specs": [
    {
      "id": "001",
      "slug": "tauri-widget-window",
      "title": "Tauri v2 초기화 & 투명 바탕화면 위젯 창 / 트레이 구성",
      "status": "planned",
      "priority": "high",
      "depends_on": ["000"],
      "layers": ["src-tauri", "src/app", "src/pages"],
      "doc_path": "docs/specs/001-tauri-widget-window.md",
      "acceptance_criteria": [
        {
          "id": "AC-1",
          "text": "yarn tauri dev 실행 시 투명 프레임리스 위젯 창이 열린다",
          "done": false
        }
      ],
      "updated_at": "2026-11-16"
    }
  ]
}
```

## 필드 규칙
* `status`: `"planned"` | `"in_progress"` | `"done"` | `"blocked"`
* `priority`: `"high"` | `"medium"` | `"low"`
* `depends_on`: 선행 스펙 `id` 배열 (없으면 `[]`)
* `layers`: 영향받는 아키텍처 계층 목록 (`src-tauri`, `src/shared`, `src/entities`, `src/features`, `src/widgets`, `src/pages`, `src/app`)
* `doc_path`: 상세 마크다운 문서가 아직 없으면 `null` 허용
