<script setup>
import { ref, onMounted } from "vue";
import logo from "../assets/logo do projeto.png";
import Resultados from "../components/Resultados.vue";
import { extrairImagensPDF } from "../services/extrair.js";

// Arquivo
const arquivoSelecionado = ref(null);

// Upload
const arrastandoArquivo = ref(false);
const mensagemErro = ref("");

// Resultados
const imagens = ref([]);
const processado = ref(false);

// Arrastar arquivo
function aoArrastarSobre() {
  arrastandoArquivo.value = true;
}

function aoSairDaArea() {
  arrastandoArquivo.value = false;
}

// Selecionar arquivo
function aoSelecionarArquivo(event) {
  const arquivo = event.target.files[0];

  if (!arquivo) {
    return;
  }

  if (arquivo.type !== "application/pdf") {
    mensagemErro.value = "Por favor, envie apenas arquivos PDF.";
    return;
  }

  mensagemErro.value = "";
  arquivoSelecionado.value = arquivo;
}

// Soltar arquivo
function aoSoltarArquivo(event) {
  arrastandoArquivo.value = false;

  const arquivo = event.dataTransfer.files[0];

  if (!arquivo) {
    return;
  }

  if (arquivo.type !== "application/pdf") {
    mensagemErro.value = "Por favor, envie apenas arquivos PDF.";
    return;
  }

  mensagemErro.value = "";
  arquivoSelecionado.value = arquivo;
}

// Processar PDF
async function processarArquivo() {
  if (!arquivoSelecionado.value) {
    return;
  }

  try {
    mensagemErro.value = "";

    const resultado = await extrairImagensPDF(arquivoSelecionado.value);

    imagens.value = resultado.map((imagem, index) => ({
      id: index,
      url: URL.createObjectURL(imagem.blob),
      pagina: imagem.pagina,
      tamanho: imagem.tamanho,
    }));

    processado.value = true;
  } catch (erro) {
    mensagemErro.value = erro.message;
  }
}

// Extrair outro PDF
function extrairOutroPDF() {
  imagens.value.forEach((imagem) => {
    if (imagem.url) {
      URL.revokeObjectURL(imagem.url);
    }
  });

  imagens.value = [];
  arquivoSelecionado.value = null;
  processado.value = false;
  mensagemErro.value = "";

  const input = document.getElementById("pdf-file");

  if (input) {
    input.value = "";
  }
}

// Bloqueia o drop fora da área
onMounted(() => {
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  window.addEventListener("drop", (event) => {
    event.preventDefault();
  });
});
</script>

<template>
  <!-- Cabeçalho -->
  <header class="topbar">
    <img :src="logo" alt="Logo do PDFly" class="logo" />

    <div>
      <h1>PDFly</h1>

      <p>Extraia imagens dos seus arquivos PDF</p>
    </div>
  </header>

  <!-- Conteúdo principal -->
  <main class="home">
    <!-- Upload -->
    <section class="upload-section">
      <label
        class="drop-area"
        :class="{ 'drop-area--ativo': arrastandoArquivo }"
        for="pdf-file"
        @dragover.prevent="aoArrastarSobre"
        @dragleave.prevent="aoSairDaArea"
        @drop.prevent="aoSoltarArquivo"
      >
        <div class="pdf-icon"></div>

        <p class="drop-text">Arraste seu PDF aqui</p>

        <p class="drop-description">ou clique para escolher um arquivo do seu computador</p>

        <input id="pdf-file" type="file" accept=".pdf" @change="aoSelecionarArquivo" />
      </label>

      <!-- Arquivo selecionado -->
      <p v-if="arquivoSelecionado" class="selected-file">
        Arquivo selecionado:
        {{ arquivoSelecionado.name }}
      </p>

      <!-- Mensagem de erro -->
      <p v-if="mensagemErro" class="error-message">
        {{ mensagemErro }}
      </p>

      <!-- Botão enviar -->
      <button class="upload-button" :disabled="!arquivoSelecionado" @click="processarArquivo">
        Enviar Arquivo
      </button>
    </section>

    <!-- Resultados -->
    <Resultados :imagens="imagens" :processado="processado" @extrair-outro="extrairOutroPDF" />
  </main>
</template>
