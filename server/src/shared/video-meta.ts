import ffmpeg from "fluent-ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

ffmpeg.setFfprobePath(ffprobePath);

export interface VideoMeta {
  durationSeconds: number;
  width: number;
  height: number;
}

export function extractVideoMeta(url: string): Promise<VideoMeta | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) {
        resolve(null);
        return;
      }
      const stream = metadata.streams.find((s) => s.codec_type === "video");
      if (!stream) {
        resolve(null);
        return;
      }
      resolve({
        durationSeconds:
          parseFloat(String(metadata.format?.duration ?? "0")) || 0,
        width: stream.width ?? 0,
        height: stream.height ?? 0,
      });
    });
  });
}
