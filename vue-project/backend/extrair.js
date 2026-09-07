// Imports
import { getDocument, OPS, GlobalWorkerOptions } from "pdfjs-dist";

import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerUrl;

// Extrair imagens
export async function extrairImagensPDF(file) {
  const imagens = [];

  // Ler arquivo
  const buffer = await file.arrayBuffer();

  // Abrir PDF
  const pdf = await getDocument({
    data: buffer,
    isOffscreenCanvasSupported: false,
  }).promise;

  // Percorrer páginas
  for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
    const page = await pdf.getPage(pagina);
    const ops = await page.getOperatorList();

    // Procurar imagens
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];

      if (fn !== OPS.paintImageXObject) {
        continue;
      }

      const nome = ops.argsArray[i][0];

      // Pegar imagem
      const imagem = await new Promise((resolve) => {
        page.objs.get(nome, resolve);
      });

      if (!imagem || !imagem.data) {
        continue;
      }

      // Criar canvas
      const canvas = document.createElement("canvas");

      canvas.width = imagem.width;
      canvas.height = imagem.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        continue;
      }

      // Converter imagem para RGBA
      const dados = new Uint8Array(imagem.data);
      const pixels = imagem.width * imagem.height;
      const canais = dados.length / pixels;

      const rgba = new Uint8ClampedArray(pixels * 4);

      for (let i = 0; i < pixels; i++) {
        const origem = i * canais;
        const destino = i * 4;

        if (canais === 4) {
          rgba[destino] = dados[origem];
          rgba[destino + 1] = dados[origem + 1];
          rgba[destino + 2] = dados[origem + 2];
          rgba[destino + 3] = dados[origem + 3];
        } else if (canais === 3) {
          rgba[destino] = dados[origem];
          rgba[destino + 1] = dados[origem + 1];
          rgba[destino + 2] = dados[origem + 2];
          rgba[destino + 3] = 255;
        } else if (canais === 1) {
          rgba[destino] = dados[origem];
          rgba[destino + 1] = dados[origem];
          rgba[destino + 2] = dados[origem];
          rgba[destino + 3] = 255;
        }
      }

      // Colocar imagem no canvas
      const imageData = new ImageData(rgba, imagem.width, imagem.height);

      ctx.putImageData(imageData, 0, 0);

      // Converter para PNG
      const png = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!png) {
        continue;
      }

      // Guardar imagem
      imagens.push({
        blob: png,
        pagina: pagina,
        tamanho: png.size,
      });
    }
  }

  // Verificar imagens
  if (imagens.length === 0) {
    throw new Error("Nenhuma imagem encontrada no PDF.");
  }

  // Retornar imagens
  return imagens;
}
