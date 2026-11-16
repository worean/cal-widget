pub mod caldav;
pub mod google;

use crate::storage::db::{CalendarEventDto, ProviderAccountRecord};

// [SPEC-004:AC-1] 외부 캘린더 프로바이더 공통 동기화 결과 및 디스패처
pub struct ProviderSyncResult {
    pub events: Vec<CalendarEventDto>,
    pub updated_credentials_json: Option<String>,
}

pub trait CalendarProvider {
    fn provider_name(&self) -> &'static str;
}

pub async fn sync_provider_account(
    account: &ProviderAccountRecord,
) -> Result<ProviderSyncResult, String> {
    match account.provider.as_str() {
        p if p == google::GoogleCalendarProvider.provider_name() => {
            google::sync_google_account(account).await
        }
        p if p == caldav::CalDavProvider.provider_name() => {
            caldav::sync_caldav_account(account).await
        }
        other => Err(format!("지원하지 않는 프로바이더입니다: {other}")),
    }
}
// [/SPEC-004:AC-1]
