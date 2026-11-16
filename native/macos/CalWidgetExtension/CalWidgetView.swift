import SwiftUI
import WidgetKit

// [SPEC-008:AC-2] [SPEC-008:AC-4] macOS 네이티브 WidgetKit 캘린더 보드 뷰 (Small ~ ExtraLarge)
struct CalWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: CalWidgetEntry

    var body: some View {
        Group {
            if family == .systemExtraLarge {
                extraLargeLayout
            } else {
                compactLayout
            }
        }
        .padding(14)
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(URL(string: "calwidget://open"))
    }

    private var compactLayout: some View {
        VStack(alignment: .leading, spacing: 8) {
            headerView
            eventsListView(limit: maxVisibleCount, showMeta: family == .systemLarge)
        }
    }

    private var extraLargeLayout: some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                headerView
                MiniMonthGridView(referenceDate: entry.date)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: 230)

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("오늘의 일정")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                eventsListView(limit: 10, showMeta: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    @ViewBuilder
    private func eventsListView(limit: Int, showMeta: Bool) -> some View {
        if entry.events.isEmpty {
            Spacer()
            Text("오늘 예정된 일정이 없습니다.")
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
        } else {
            VStack(alignment: .leading, spacing: 6) {
                ForEach(entry.events.prefix(limit)) { event in
                    EventRowView(event: event, showMeta: showMeta)
                }
            }
            Spacer(minLength: 0)
        }
    }

    private var maxVisibleCount: Int {
        switch family {
        case .systemSmall:
            return 2
        case .systemMedium:
            return 3
        case .systemLarge:
            return 7
        default:
            return 10
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

private struct MiniMonthGridView: View {
    let referenceDate: Date
    private let weekdays = ["일", "월", "화", "수", "목", "금", "토"]

    var body: some View {
        let calendar = Calendar.current
        let comps = calendar.dateComponents([.year, .month], from: referenceDate)
        let firstDay = calendar.date(from: comps) ?? referenceDate
        let firstWeekday = calendar.component(.weekday, from: firstDay) - 1
        let daysCount = calendar.range(of: .day, in: .month, for: firstDay)?.count ?? 30
        let todayDay = calendar.component(.day, from: referenceDate)
        let cells: [Int?] = Array(repeating: nil, count: firstWeekday) + (1...daysCount).map { Optional($0) }

        VStack(spacing: 6) {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 7), spacing: 4) {
                ForEach(weekdays, id: \.self) { w in
                    Text(w)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                ForEach(Array(cells.enumerated()), id: \.offset) { _, day in
                    if let day {
                        Text("\(day)")
                            .font(.system(size: 11, weight: day == todayDay ? .bold : .regular))
                            .frame(width: 24, height: 22)
                            .background(
                                day == todayDay
                                    ? Color(red: 0.22, green: 0.74, blue: 0.97).opacity(0.28)
                                    : Color.clear,
                                in: RoundedRectangle(cornerRadius: 6)
                            )
                    } else {
                        Color.clear.frame(width: 24, height: 22)
                    }
                }
            }
        }
    }
}

private struct EventRowView: View {
    let event: CalendarEventSnapshot
    let showMeta: Bool

    var body: some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: event.color ?? "#38BDF8"))
                .frame(width: 3, height: showMeta ? 30 : 24)

            VStack(alignment: .leading, spacing: 1) {
                Text(event.title)
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(1)

                HStack(spacing: 4) {
                    Text(formattedTime)
                    if showMeta, let location = event.location, !location.isEmpty {
                        Text("· \(location)")
                            .lineLimit(1)
                    }
                    if showMeta {
                        Text(event.provider.uppercased())
                            .font(.system(size: 9, weight: .bold))
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.secondary.opacity(0.16), in: RoundedRectangle(cornerRadius: 4))
                    }
                }
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
