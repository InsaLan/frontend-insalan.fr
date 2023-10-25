import axios from 'axios';
import MarkdownIt from 'markdown-it';
import MarkdownItClass from 'markdown-it-class';
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Content {
  name: string;
  content: string;
}

interface Constant {
  name: string;
  value: string;
}

export const useContentStore = defineStore('content', () => {
  const contents = ref<{ [key: string]: string }>({});
  const constants = ref<{ [key: string]: string }>({});
  // captures named group matching the pattern ${name}
  const re = /\$\{(?<name>\w+)\}/gm;

  const md = new MarkdownIt({
    html: true,
  });
  const classessMapping = {
    h1: 'title',
    h2: 'title',
  };
  md.use(MarkdownItClass, classessMapping);

  async function fetchStatic() {
    const fetch_content = await axios.get<Content[]>('/content/content/');
    const fetch_constant = await axios.get<Constant[]>('/content/constant/');
    fetch_constant.data.forEach((constant) => {
      constants.value[constant.name] = constant.value;
    });
    fetch_content.data.forEach((content) => {
      contents.value[content.name] = md.render(content.content.replace(
        re,
        (_, name: string) => constants.value[name],
      ));
    });
  }

  function getContent(name: string): string {
    if (contents.value[name] === undefined) return '';

    return md.renderInline(
      contents.value[name],
    );
  }

  function getConstant(name: string): string {
    if (constants.value[name] === undefined) return '';

    return constants.value[name];
  }

  return { fetchStatic, getContent, getConstant };
});
