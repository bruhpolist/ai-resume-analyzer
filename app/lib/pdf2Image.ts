export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc =
    window.location.origin + "/pdf.worker.min.mjs";

  pdfjsLib = pdfjs;
  isLoading = false;
  return pdfjsLib;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const pdf = await lib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              imageUrl: "",
              file: null,
              error: "Failed to generate image",
            });
          }

          const extension = blob.type.split("/")[1] || "png";
          const imageFile = new File([blob], `converted.${extension}`, {
            type: blob.type,
          });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/jpeg",
        0.95
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `PDF conversion error: ${(err as Error).message}`,
    };
  }
}
