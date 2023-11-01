import axios from 'axios';
import MarkdownIt from 'markdown-it';
import MarkdownItClass from 'markdown-it-class';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Constant = { name: string; value: string };
export type Content = { name: string; content: string };

export const useContentStore = defineStore('content', () => {
  const contents = ref<Record<string, string>>({});
  const constants = ref<Record<string, string>>({});
  // captures named group matching the pattern ${name}
  const re = /\$\{(?<name>\w+)\}/gm;

  const md = new MarkdownIt({
    html: true,
  });
  const classesMapping = {
    h1: 'title',
    h2: 'title',
    ul: 'list-disc',
    li: 'ml-5',
    a: 'underline underline-offset-2',
    strong: 'text-blue-400',
  };
  md.use(MarkdownItClass, classesMapping);

  async function fetchStatic() {
    const fetch_content = await axios.get<Content[]>('/content/content/');
    const fetch_constant = await axios.get<Constant[]>('/content/constant/');
    fetch_constant.data.forEach((constant: Constant) => {
      constants.value[constant.name] = constant.value;
    });
    fetch_content.data.forEach((content: Content) => {
      contents.value[content.name] = md.render(content.content.replace(re, (_, name: string) => constants.value[name]));
    });
  }

  function getContent(name: string): string {
    if (contents.value[name] === undefined) return '';

    return md.renderInline(contents.value[name]);
  }

  function getConstant(name: string): string {
    if (constants.value[name] === undefined) return '';

    return constants.value[name];
  }

  return { fetchStatic, getContent, getConstant };
});
