use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn join(room_id: String) -> Result<String, String> {
    // 连接到 WebSocket 服务器
    let ws_url = "ws://127.0.0.1:7788/ws";

    println!("房间ID: {}", room_id);

    let (ws_stream, _) = connect_async(ws_url)
        .await
        .map_err(|e| format!("连接失败: {}", e))?;

    let (mut write, mut read) = ws_stream.split();

    // 发送加入房间消息
    let join_msg = serde_json::json!({
        "type": "join_room",
        "room_id": room_id
    });

    write
        .send(Message::Text(join_msg.to_string()))
        .await
        .map_err(|e| format!("发送消息失败: {}", e))?;

    // 接收第一条消息（连接确认）
    let first_response = if let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => text,
            Ok(_) => return Err("收到非文本消息".to_string()),
            Err(e) => return Err(format!("接收消息失败: {}", e)),
        }
    } else {
        return Err("未收到服务器响应".to_string());
    };

    // 在后台任务中保持连接并处理消息
    tokio::spawn(async move {
        println!("WebSocket 连接已建立，开始监听消息...");
        
        while let Some(msg) = read.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    println!("收到消息: {}", text);
                    // TODO: 在这里处理其他消息类型
                    // 可以通过 Tauri 的事件系统发送到前端
                }
                Ok(Message::Close(frame)) => {
                    println!("连接关闭: {:?}", frame);
                    break;
                }
                Ok(Message::Ping(data)) => {
                    println!("收到 Ping");
                    // 一般库会自动回复 Pong，但如果需要手动处理：
                    // write.send(Message::Pong(data)).await.ok();
                }
                Err(e) => {
                    eprintln!("WebSocket 错误: {}", e);
                    break;
                }
                _ => {}
            }
        }
        
        println!("WebSocket 连接已断开");
    });

    Ok(first_response)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![join])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
