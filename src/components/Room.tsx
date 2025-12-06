import { Button } from "@/components/ui/button";
import { useRef, type ChangeEvent } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type ShareFile = {
  id?: string;
  name: string;
  size?: number;
};

type RoomProps = {
  roomId: string;
  files: ShareFile[];
  onRefresh?: () => void;
  onLeave?: () => void;
  onAddFiles?: (files: File[]) => void;
};

export default function Room({
  roomId,
  files,
  onRefresh,
  onLeave,
  onAddFiles,
}: RoomProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handlePickClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.currentTarget.files ?? []);
    if (list.length) onAddFiles?.(list);
    // reset to allow picking same files again
    e.currentTarget.value = "";
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">房间 #{roomId}</h2>
      <div className="mb-3 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={handlePickClick}>添加文件</Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="secondary">离开</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认离开房间？</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => onLeave?.()}>
                离开
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-12 bg-accent/40 text-sm text-muted-foreground px-4 py-2">
          <div className="col-span-8">文件名</div>
          <div className="col-span-4 text-right pr-2">大小</div>
        </div>
        {files.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            暂无文件
          </div>
        ) : (
          <ul className="divide-y">
            {files.map((f, idx) => (
              <li
                key={f.id ?? `${f.name}-${idx}`}
                className="grid grid-cols-12 items-center px-4 py-3"
              >
                <div className="col-span-8 truncate" title={f.name}>
                  {f.name}
                </div>
                <div className="col-span-4 text-right pr-2 tabular-nums">
                  {formatSize(f.size)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatSize(size?: number) {
  if (!size && size !== 0) return "--";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let s = size;
  let i = 0;
  while (s >= 1024 && i < units.length - 1) {
    s /= 1024;
    i++;
  }
  return `${s.toFixed(s < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
