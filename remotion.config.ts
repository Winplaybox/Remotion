import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setCrf(18);
Config.setScale(1);

Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...(current.resolve?.alias ?? {}),
      "@core": path.resolve(process.cwd(), "packages/core/src"),
      "@motion": path.resolve(process.cwd(), "packages/motion/src"),
      "@audio": path.resolve(process.cwd(), "packages/audio/src"),
      "@visuals": path.resolve(process.cwd(), "packages/visuals/src"),
      "@camera": path.resolve(process.cwd(), "packages/camera/src"),
      "@runtime": path.resolve(process.cwd(), "packages/scene-runtime/src")
    }
  }
}));
