import WidgetKit
import SwiftUI

// [SPEC-008:AC-2] WidgetKit TimelineProvider 및 위젯 번들 진입점
struct CalWidgetEntry: TimelineEntry {
    let date: Date
    let events: [CalendarEventSnapshot]
}

struct CalWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalWidgetEntry {
        CalWidgetEntry(date: Date(), events: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (CalWidgetEntry) -> Void) {
        let snapshot = SnapshotStore.loadTodaySnapshot()
        completion(CalWidgetEntry(date: Date(), events: snapshot.events))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalWidgetEntry>) -> Void) {
        let snapshot = SnapshotStore.loadTodaySnapshot()
        let now = Date()
        let entry = CalWidgetEntry(date: now, events: snapshot.events)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: now)
            ?? now.addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

struct CalBoardWidget: Widget {
    let kind: String = "CalBoardWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalWidgetProvider()) { entry in
            CalWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Cal-Widget 캘린더 보드")
        .description("Google Calendar 및 CalDAV 일정을 바탕화면에서 확인합니다.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .systemExtraLarge])
    }
}

@main
struct CalWidgetExtensionBundle: WidgetBundle {
    var body: some Widget {
        CalBoardWidget()
    }
}
// [/SPEC-008:AC-2]
