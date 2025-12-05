import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import { ArrowRightToLine } from "lucide-react";

import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [roomId, setRoomId] = useState("");
  useEffect(() => {}, []);
  async function join() {
    alert(roomId);
    await invoke("join", { roomId });
  }
  return (
    <div className="min-h-[100svh] overflow-hidden">
      <header className="w-full max-w-4xl mt-8  text-center">
        <h1 className="text-4xl font-bold text-indigo-800 flex items-center justify-center gap-3">
          <i className="fas fa-folder-open"></i>
          GoShare
        </h1>
      </header>
      <main className="flex-1 p-4 mt-4 items-center">
        <div className="flex flex-col gap-5">
          <Input
            className="py-6"
            placeholder="请输入房间号"
            onChange={(e) => {
              setRoomId(e.currentTarget.value);
            }}
          />
          <Button className="w-full py-6 text-lg" onClick={join}>
            <ArrowRightToLine />
            加入房间
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
      </main>
      <footer className="text-center text-gray-500 text-sm">
        <p>@GoShare 基于 P2P 分享文件</p>
      </footer>
    </div>
  );
}

export default App;
