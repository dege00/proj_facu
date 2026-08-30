import { getDocument, OPS } from "pdfjs-dist";
import JSZip from "jszip";

export async function extrairImagensPDF(file) {
  const zip = new JSZip();

  const buffer = await file.arrayBuffer();

  const pdf = await getDocument({
    data: buffer,
    isOffscreenCanvasSupported: false,
  }).promise;

  let contador = 0;

  for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
    const page = await pdf.getPage(pagina);
    const ops = await page.getOperatorList();

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];

      if (fn !== OPS.paintImageXObject) {
        continue;
      }

      const nome = ops.argsArray[i][0];

      const imagem = await new Promise((resolve) => {
        page.objs.get(nome, resolve);
      });

      if (!imagem || !imagem.data) {
        continue;
      }

      const canvas = document.createElement("canvas");

      canvas.width = imagem.width;
      canvas.height = imagem.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        continue;
      }

      const imageData = new ImageData(
        imagem.data,
        imagem.width,
        imagem.height
      );

      ctx.putImageData(imageData, 0, 0);

      const png = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!png) {
        continue;
      }

      contador++;

      zip.file(
        `imagem-${contador}.png`,
        png
      );
    }
  }

  if (contador === 0) {
    throw new Error("Nenhuma imagem encontrada no PDF.");
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
  });

  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "imagens-do-pdf.zip";

  link.click();

  URL.revokeObjectURL(url);
}
