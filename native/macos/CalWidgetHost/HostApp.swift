import SwiftUI

// [SPEC-008:AC-3] WidgetKit 익스텐션 빌드를 위한 최소 Host 앱 엔트리
@main
struct CalWidgetHostApp: App {
    var body: some Scene {
        WindowGroup {
            Text("Cal-Widget Host")
                .padding()
        }
    }
}
// [/SPEC-008:AC-3]
