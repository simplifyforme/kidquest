#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        // Updater intentionally NOT registered until signing pubkey/endpoints are configured.
        // Registering it without configuration can panic and prevent the app from launching.
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("failed to run KidQuest");
}
