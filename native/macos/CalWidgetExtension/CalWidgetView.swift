import SwiftUI
import WidgetKit

// [SPEC-008:AC-2] [SPEC-008:AC-4] macOS 네이티브 WidgetKit 캘린더 보드 뷰 (Small / Medium / Large)
struct CalWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: CalWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            headerView

            if entry.events.isEmpty {
                Spacer()
                Text("오늘 예정된 일정이 없습니다.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(entry.events.prefix(maxVisibleCount)) { event in
                        EventRowView(event: event)
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .padding(12)
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(URL(string: "calwidget://open"))
    }

    private var maxVisibleCount: Int {
        switch family {
        case .systemSmall:
            return 2
        case .systemMedium:
            return 3
        default:
            return 6
        }
    }

    private var headerView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 1) {
                Text("TODAY")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Color(red: 0.22, green: 0.74, blue: 0.97))
                Text(formattedToday)
                    .font(.headline)
            }
            Spacer()
            Text("\(entry.events.count)")
                .font(.caption.bold())
                .padding(.horizontal, 7)
                .padding(.vertical, 2)
                .background(Color.accentColor.opacity(0.18), in: Capsule())
        }
    }

    private var formattedToday: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ko_KR")
        formatter.dateFormat = "M월 d일 (E)"
        return formatter.string(from: entry.date)
    }
}

private struct EventRowView: View {
    let event: CalendarEventSnapshot

    var body: some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: event.color ?? "#38BDF8"))
                .frame(width: 3, height: 26)

            VStack(alignment: .leading, spacing: 1) {
                Text(event.title)
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(1)

                Text(formattedTime)
                    .font(.system(size: 10))
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
    }

    private var formattedTime: String {
        if event.isAllDay {
            return "종일"
        }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let fallbackIso = ISO8601DateFormatter()

        let startDate = iso.date(from: event.startAt) ?? fallbackIso.date(from: event.startAt)
        let endDate = iso.date(from: event.endAt) ?? fallbackIso.date(from: event.endAt)

        guard let startDate, let endDate else {
            return event.provider.uppercased()
        }

        let fmt = DateFormatter()
        fmt.dateFormat = "HH:mm"
        return "\(fmt.string(from: startDate)) - \(fmt.string(from: endDate))"
    }
}

private extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
// [/SPEC-008:AC-2] [/SPEC-008:AC-4]
