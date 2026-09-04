<script setup>
import { ref, onMounted } from "vue";
import logo from "../assets/logo do projeto.png";

const arquivoSelecionado = ref(null);
const arrastandoArquivo = ref(false);
const mensagemErro = ref("");

function aoArrastarSobre() {
  arrastandoArquivo.value = true;
}

function aoSairDaArea() {
  arrastandoArquivo.value = false;
}

function aoSelecionarArquivo(event) {
  const arquivo = event.target.files[0];

  if (arquivo.type !== "application/pdf") {
    mensagemErro.value = "Por favor, envie apenas arquivos PDF.";
    return;
  }

  mensagemErro.value = "";
  arquivoSelecionado.value = arquivo;
}

function aoSoltarArquivo(event) {
  arrastandoArquivo.value = false;
  const arquivo = event.dataTransfer.files[0];
  if (arquivo.type !== "application/pdf") {
    mensagemErro.value = "Por favor, envie apenas arquivos PDF.";
    return;
  }
  mensagemErro.value = "";
  arquivoSelecionado.value = arquivo;
}

onMounted(() => {
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
    window.addEventListener("drop", (event) => {
      event.preventDefault();
    });
  });
});
</script>

<template>
  <header class="topbar">
    <img :src="logo" alt="Logo do PDFly" class="topbar-logo" />
    <div>
      <h1>PDFly</h1>
      <p>Extraia imagens dos seus arquivos PDF</p>
    </div>
  </header>
  <main class="home">
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

      <p v-if="arquivoSelecionado" class="selected-file">
        Arquivo selecionado: {{ arquivoSelecionado.name }}
      </p>

      <p v-if="mensagemErro" class="error-message">{{ mensagemErro }}</p>

      <button class="upload-button" :disabled="!arquivoSelecionado">Enviar Arquivo</button>
    </section>
  </main>
</template>
