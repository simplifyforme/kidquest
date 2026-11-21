#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // If a native startup panic occurs on a user's PC, keep a small diagnostic
    // in Windows TEMP. No child profile, answers, or other personal data is logged.
    std::panic::set_hook(Box::new(|panic_info| {
        use std::io::Write;
        let path = std::env::temp_dir().join("KidQuest-startup-error.log");
        if let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
        {
            let _ = writeln!(file, "{:?}: {}", std::time::SystemTime::now(), panic_info);
        }
    }));
    kidquest_lib::run();
}
