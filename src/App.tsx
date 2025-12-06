import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import { ArrowRightToLine, Loader } from "lucide-react";

import "./App.css";
import { useEffect, useState } from "react";
import Room, { type ShareFile } from "@/components/Room";

function App() {
  const [roomId, setRoomId] = useState("9527");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(true);
  const [files, setFiles] = useState<ShareFile[]>([]);
  useEffect(() => {}, []);

  async function join() {
    if (!roomId.trim()) {
      toast.warning("请输入房间号");
      return;
    }

    setIsLoading(true);
    setIsJoined(true);
    setIsLoading(false)
    return
    try {
      const response = (await invoke("join", { roomId })) as unknown;
      console.log(response);
      // Try parse server text to extract files (optional schema)
      if (typeof response === "string") {
        try {
          const data = JSON.parse(response);
          if (Array.isArray(data?.files)) {
            const mapped: ShareFile[] = data.files.map((f: any) => ({
              id: f.id ?? undefined,
              name: String(f.name ?? f.filename ?? "未知文件"),
              size: typeof f.size === "number" ? f.size : undefined,
            }));
            setFiles(mapped);
          }
        } catch {}
      }
      setIsJoined(true);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsJoined(true);
      setIsLoading(false);
    }
  }
  function leave() {
    setIsJoined(false);
    setFiles([]);
  }
  function refresh() {
    // Placeholder: real implementation can request file list via WebSocket/command
    toast.info("刷新文件列表");
  }
  function addFiles(list: File[]) {
    if (!list?.length) return;
    const mapped: ShareFile[] = list.map((f) => ({
      id: (globalThis.crypto?.randomUUID?.() as string) || `${f.name}-${f.size}-${Date.now()}`,
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...mapped]);
    toast.success(`已添加 ${mapped.length} 个文件`);
  }
  return (
    <div className="min-h-[100svh] overflow-hidden">
      <Toaster richColors position="top-center" />

      <header className="mx-6 my-8">
        <h1 className="text-4xl font-bold text-center">GoShare</h1>
      </header>

      <main className="m-6 items-center">
        {isJoined ? (
          <Room
            roomId={roomId}
            files={files}
            onLeave={leave}
            onRefresh={refresh}
            onAddFiles={addFiles}
          />
        ) : (
          <div className="space-y-6">
            <Input
              className="py-6"
              placeholder="请输入房间号"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.currentTarget.value);
              }}
            />
            <Button
              className="w-full py-6 text-lg"
              onClick={join}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <ArrowRightToLine />
              )}
              {isLoading ? "连接中..." : "加入房间"}
            </Button>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                如何获取房间号？
              </h3>
              <p className="text-sm text-gray-600">
                联系房间创建者获取 6 位数字房间号，或创建新房间开始共享文件。
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 text-sm">
        @GoShare 基于 P2P 分享文件
      </footer>
    </div>
  );
}

export default App;
