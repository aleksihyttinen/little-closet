import { apiRequest } from "../api";
export type ClothingAnalysis = {
  name: string;
  size: {
    id: string;
    name: string;
  };
  size_source: "tag" | "estimated";
  category: {
    id: string;
    name: string;
    parent_id: string | null;
  };
};

export async function prepareClothingImage(file: File): Promise<File> {
  const MAX_BYTES = 3.5 * 1024 * 1024;
  const MAX_DIMENSION = 2000;

  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;

  if (Math.max(width, height) > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);

    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create image canvas");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.82;
  let blob: Blob | null = null;

  while (quality >= 0.4) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) {
      throw new Error("Could not compress image");
    }

    if (blob.size <= MAX_BYTES) {
      break;
    }

    quality -= 0.05;
  }

  if (!blob || blob.size > MAX_BYTES) {
    throw new Error("Could not compress image below 3.5 MB");
  }

  return new File(
    [blob],
    file.name.replace(/\.[^.]+$/, "") + ".jpg",
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    },
  );
}

export async function analyzeClothing(
  file: File,
  language: "en" | "fi",
): Promise<ClothingAnalysis> {
  const image = await prepareClothingImage(file);

  const body = new FormData();
  body.append("image", image, image.name);
  body.append("language", language);

  return apiRequest("/ai/analyze-image", {
    method: "POST",
    body,
  }) as Promise<ClothingAnalysis>;
}