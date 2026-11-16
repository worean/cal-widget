import SwiftUI
import WidgetKit

// [SPEC-008:AC-3] WidgetKit 익스텐션 빌드를 위한 최소 Host 앱 엔트리
@main
struct CalWidgetHostApp: App {
    init() {
        WidgetCenter.shared.reloadAllTimelines()
    }

    var body: some Scene {
        WindowGroup {
            VStack(spacing: 8) {
                Text("Cal-Widget Host")
                    .font(.headline)
                Button("위젯 타임라인 새로고침") {
                    WidgetCenter.shared.reloadAllTimelines()
                }
            }
            .padding()
        }
    }
}
// [/SPEC-008:AC-3]
