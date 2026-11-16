import Foundation

// [SPEC-008:AC-1] [SPEC-008:AC-2] Rust 백엔드가 생성한 widget-snapshot.json 디코딩 모델
struct CalendarEventSnapshot: Codable, Identifiable {
    let id: String
    let sourceId: String
    let provider: String
    let title: String
    let description: String?
    let location: String?
    let startAt: String
    let endAt: String
    let isAllDay: Bool
    let color: String?
}

struct WidgetSnapshot: Codable {
    let updatedAt: String
    let events: [CalendarEventSnapshot]
}

enum SnapshotStore {
    static let appGroupID = "group.com.worean.calwidget"

    static func loadTodaySnapshot() -> WidgetSnapshot {
        for url in candidateURLs() {
            if let data = try? Data(contentsOf: url),
               let decoded = try? JSONDecoder().decode(WidgetSnapshot.self, from: data) {
                return decoded
            }
        }
        return WidgetSnapshot(updatedAt: "", events: [])
    }

    private static func candidateURLs() -> [URL] {
        var urls: [URL] = []

        if let groupURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupID
        ) {
            urls.append(groupURL.appendingPathComponent("widget-snapshot.json"))
        }

        let home = FileManager.default.homeDirectoryForCurrentUser
        urls.append(
            home
                .appendingPathComponent("Library/Group Containers")
                .appendingPathComponent(appGroupID)
                .appendingPathComponent("widget-snapshot.json")
        )
        urls.append(
            home
                .appendingPathComponent("Library/Application Support/com.worean.calwidget/widget-snapshot.json")
        )

        return urls
    }
}
// [/SPEC-008:AC-1] [/SPEC-008:AC-2]
