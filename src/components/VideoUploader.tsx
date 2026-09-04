"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader, Play, Trash2 } from "lucide-react";

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function VideoUploader({ value, onChange, label }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setError("视频不能超过 100MB，建议控制在 30 秒内");
      return;
    }
    setUploading(true);
    setError("");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mycoat_uploads");

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://api.cloudinary.com/v1_1/gbcdsfq6/video/upload"
    );
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            onChange(data.secure_url);
            setProgress(100);
          } else {
            setError("上传失败，请重试");
          }
        } catch {
          setError("上传失败，请重试");
        }
      } else {
        setError("上传失败（云端拒绝了该视频格式）");
      }
      if (inputRef.current) inputRef.current.value = "";
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("网络错误，请重试");
      if (inputRef.current) inputRef.current.value = "";
    };
    xhr.send(formData);
  };

  return (
    <div>
      {label && (
        <label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">
          {label}
        </label>
      )}
      {value ? (
        <div className="relative group">
          <div className="relative w-full max-w-[220px] aspect-[9/16] overflow-hidden bg-charcoal">
            <video
              src={value}
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
            {!value && (
              <div className="absolute inset-0 flex items-center justify-center text-paper/70">
                <Play size={20} />
              </div>
            )}
          </div>
          <div className="absolute top-1 right-1 flex gap-1">
            <button
              onClick={() => onChange("")}
              title="移除视频"
              className="bg-red-600/90 text-paper p-1.5 rounded hover:bg-red-600 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <label className="absolute bottom-1 left-1 bg-paper/90 text-charcoal px-2 py-1 text-[9px] tracking-label uppercase cursor-pointer hover:bg-paper transition-colors">
            替换视频
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div>
          <label className="flex items-center gap-2 border border-dashed border-line px-4 py-3 text-xs text-smoke/50 hover:text-smoke hover:border-smoke transition-colors cursor-pointer">
            {uploading ? (
              <>
                <Loader size={14} className="animate-spin" />
                {progress > 0 ? `上传中 ${progress}%` : "上传中..."}
              </>
            ) : (
              <>
                <Upload size={14} />
                上传视频
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {uploading && progress > 0 && (
            <div className="mt-1 h-1 bg-line overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <p className="text-[9px] text-smoke/40 mt-1">
            建议竖版 9:16、30 秒内、≤100MB · 上传后自动压缩转码
          </p>
        </div>
      )}
      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
