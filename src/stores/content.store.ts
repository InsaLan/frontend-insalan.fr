import axios from 'axios';
import MarkdownIt from 'markdown-it';
import MarkdownItClass from 'markdown-it-class';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Constant = { name: string; value: string };
export type Content = { name: string; content: string };
export type File = { name: string; file: string };

export const useContentStore = defineStore('content', () => {
  const contents = ref<Record<string, string>>({});
  const constants = ref<Record<string, string>>({});
  const files = ref<Record<string, string>>({});

  // captures named group matching the pattern ${name}
  const re_constant = /\$\{(?<name>\w+)\}/gm;
  const re_file = /\$\[(?<name>\w+)\]/gm;

  const md = new MarkdownIt({
    html: true,
  });
  const classesMapping = {
    h1: 'title',
    h2: 'text-3xl title',
    h4: 'text-center text-2xl text-bold',
    ul: 'list-disc',
    li: 'ml-5',
    a: 'c-underline underline-offset-2',
    strong: 'bold',
  };
  md.use(MarkdownItClass, classesMapping);

  async function fetchStatic() {
    const fetch_cms = await axios.get<{
      contents:Content[];
      constants:Constant[];
      files:File[];
    }>('/content/full/');
    fetch_cms.data.constants.forEach((constant: Constant) => {
      constants.value[constant.name] = constant.value;
    });
    fetch_cms.data.files.forEach((file: File) => {
      files.value[file.name] = file.file;
    });
    fetch_cms.data.contents.forEach((content: Content) => {
      contents.value[content.name] = md.render(
        content.content
          .replace(re_constant, (_, name: string) => constants.value[name])
          .replace(re_file, (_, name: string) => `[${name}](${files.value[name]})`),
      );
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

  function getFile(name: string): string {
    if (files.value[name] === undefined) return '';

    return files.value[name];
  }

  return {
    md,
    fetchStatic,
    getContent,
    getConstant,
    getFile,
  };
});
