import type { CollectionConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import { adminPanelAccess, mediaReadAccess, mediaWriteAccess } from "../access";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300 },
      { name: "card", width: 800, height: 600 },
      { name: "hero", width: 1920, height: 1080 },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/ogg",
      "application/pdf",
    ],
  },
  admin: {
    useAsTitle: "filename",
    hidden: true,
  },
  access: {
    admin: adminPanelAccess,
    read: mediaReadAccess,
    create: mediaWriteAccess,
    update: mediaWriteAccess,
    delete: mediaWriteAccess,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt-текст",
    },
    {
      name: "caption",
      type: "text",
      label: "Подпись",
    },
  ],
};
