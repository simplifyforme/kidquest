use tauri::Manager;
use std::{fs,path::PathBuf};

fn media_path(app:&tauri::AppHandle, activity_id:&str, filename:&str)->Result<PathBuf,String>{
    let valid=|value:&str|!value.is_empty()&&value.len()<=80&&value.bytes().all(|b|b.is_ascii_lowercase()||b.is_ascii_digit()||b==b'-'||b==b'_'||b==b'.');
    if !valid(activity_id)||activity_id.contains('.')||!valid(filename)||filename.starts_with('.')||filename.contains(".."){
        return Err("Invalid activity or media file name".into());
    }
    let ext=filename.rsplit('.').next().unwrap_or("");
    if !["jpg","jpeg","png","webp","gif","mp4","webm","mp3","ogg","wav"].contains(&ext){
        return Err("Media format not allowed".into());
    }
    Ok(app.path().app_local_data_dir().map_err(|e|e.to_string())?
        .join("activities").join(activity_id).join("assets").join(filename))
}

#[tauri::command]
fn activity_asset_exists(app:tauri::AppHandle,activity_id:String,filename:String)->Result<bool,String>{
    Ok(media_path(&app,&activity_id,&filename)?.is_file())
}

#[tauri::command]
fn read_activity_asset(app:tauri::AppHandle,activity_id:String,filename:String)->Result<Vec<u8>,String>{
    let path=media_path(&app,&activity_id,&filename)?;
    let size=fs::metadata(&path).map_err(|e|e.to_string())?.len();
    if size>20_000_000{return Err("Media too large".into())}
    fs::read(path).map_err(|e|e.to_string())
}

#[tauri::command]
fn save_activity_asset(app:tauri::AppHandle,activity_id:String,filename:String,bytes:Vec<u8>)->Result<(),String>{
    if bytes.is_empty()||bytes.len()>20_000_000{return Err("Invalid media size".into())}
    let path=media_path(&app,&activity_id,&filename)?;
    let directory=path.parent().ok_or("Invalid media location")?;
    fs::create_dir_all(directory).map_err(|e|e.to_string())?;
    // Write to a temporary file first, never expose a partially downloaded image.
    let temp=path.with_extension("download");
    fs::write(&temp,bytes).map_err(|e|e.to_string())?;
    if path.is_file(){fs::remove_file(&path).map_err(|e|e.to_string())?}
    fs::rename(temp,path).map_err(|e|e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        // Updater intentionally NOT registered until signing pubkey/endpoints are configured.
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            activity_asset_exists,read_activity_asset,save_activity_asset
        ])
        .run(tauri::generate_context!())
        .expect("failed to run KidQuest");
}
