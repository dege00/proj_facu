<script setup>
import { onBeforeUnmount } from "vue";

// Props
const props = defineProps({
  imagens: {
    type: Array,
    default: () => [],
  },

  processado: {
    type: Boolean,
    default: false,
  },
});

// Eventos
const emit = defineEmits(["extrair-outro"]);

// Baixar imagem
function baixarImagem(imagem, index) {
  const link = document.createElement("a");

  link.href = imagem.url;
  link.download = `imagem_${index + 1}.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Extrair outro PDF
function extrairOutroPDF() {
  emit("extrair-outro");
}

// Formatar tamanho
function formatarTamanho(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

// Liberar imagens
function liberarImagens() {
  props.imagens.forEach((imagem) => {
    if (imagem.url) {
      URL.revokeObjectURL(imagem.url);
    }
  });
}

onBeforeUnmount(() => {
  liberarImagens();
});
</script>

<template>
  <section v-if="processado" class="results">
    <div class="results-title">
      <h2>Imagens encontradas</h2>

      <span class="counter">
        {{ props.imagens.length }}
        {{ props.imagens.length === 1 ? "imagem" : "imagens" }}
      </span>
    </div>

    <div v-if="props.imagens.length === 0" class="empty">
      <div class="empty-icon">🖼️</div>

      <h3>Nenhuma imagem encontrada</h3>

      <p>Este PDF não possui imagens incorporadas que possam ser extraídas.</p>
    </div>

    <div v-else class="gallery">
      <article v-for="(imagem, index) in props.imagens" :key="imagem.id" class="image-card">
        <div class="image-preview">
          <img :src="imagem.url" :alt="'Imagem ' + (index + 1)" />
        </div>

        <div class="image-content">
          <div class="image-details">
            <strong> imagem_{{ index + 1 }}.png </strong>

            <span>
              Página {{ imagem.pagina }}
              •
              {{ formatarTamanho(imagem.tamanho) }}
            </span>
          </div>

          <button class="download-button" @click="baixarImagem(imagem, index)">↓ Baixar</button>
        </div>
      </article>
    </div>

    <!-- Outro PDF -->
    <button class="other-pdf-button" @click="extrairOutroPDF">Extrair outro PDF</button>
  </section>
</template>

<style scoped>
.results {
  width: 100%;
  max-width: 900px;
  margin-top: 40px;
}

.results-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.results-title h2 {
  margin: 0;
  font-size: 18px;
}

.counter {
  background: #e9343b;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 17px;
}

.image-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e1e4e9;
}

.image-preview {
  height: 120px;
  background: #172746;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-content {
  padding: 13px;
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.image-details strong {
  font-size: 13px;
}

.image-details span {
  color: #9297a1;
  font-size: 11px;
}

.download-button {
  width: 100%;
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #1c2635;
  border-radius: 7px;
  background: white;
  color: #1c2635;
  font-weight: bold;
  cursor: pointer;
}

.download-button:hover {
  background: #142442;
  color: white;
}

.other-pdf-button {
  display: block;
  margin: 25px auto 0;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #142442;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.other-pdf-button:hover {
  opacity: 0.85;
}

.empty {
  background: white;
  padding: 50px 20px;
  text-align: center;
  border-radius: 12px;
}

.empty-icon {
  font-size: 45px;
}

.empty h3 {
  margin: 12px 0 8px;
}

.empty p {
  color: #858b96;
  margin: 0;
}

@media (max-width: 850px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .results {
    width: 100%;
  }

  .gallery {
    grid-template-columns: 1fr;
  }

  .image-preview {
    height: 210px;
  }
}
</style>
