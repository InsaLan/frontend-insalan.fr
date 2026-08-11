import axios from 'axios';
import MarkdownIt from 'markdown-it';
import MarkdownItClass from 'markdown-it-class';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import i18n from "@/i18n";

export type Constant = { name: string; lang: string; value: string };
export type Content = { name: string; lang: string; content: string };
export type File = { name: string; file: string };

export const useContentStore = defineStore('content', () => {
  const contents = ref<Record<string, Record<string, string>>>({});
  const constants = ref<Record<string, Record<string, string>>>({});
  const files = ref<Record<string, string>>({});

  // captures named group matching the pattern ${name}
  const re_constant = /\$\{(?<name>\w+)\}/gm;
  const re_file = /\$\[(?<name>\w+)\]/gm;

  const md = new MarkdownIt({
    html: true,
  });
  const classesMapping = {
    a: 'c-link',
    strong: 'u-bold',
  };
  md.use(MarkdownItClass, classesMapping);

  async function fetchStatic() {
    const fetch_cms = await axios.get<{
      contents:Content[];
      constants:Constant[];
      files:File[];
    }>('/content/full/');
    fetch_cms.data.constants.forEach((constant: Constant) => {
      if (constants.value[constant.lang] === undefined) constants.value[constant.lang] = {};
      constants.value[constant.lang][constant.name] = constant.value;
    });
    fetch_cms.data.files.forEach((file: File) => {
      files.value[file.name] = file.file;
    });
    fetch_cms.data.contents.forEach((content: Content) => {
      if (contents.value[content.lang] === undefined) contents.value[content.lang] = {};
      contents.value[content.lang][content.name] = md.render(
        content.content
          .replace(re_constant, (_, name: string) => constants.value[content.lang][name])
          .replace(re_file, (_, name: string) => `[${name}](${files.value[name]})`),
      );
    });
  }

  function getContent(name: string, lang: string = 'fr'): string {
    if (contents.value[lang] === undefined || contents.value[lang][name] === undefined) return '';
    let rawContent = contents.value[lang][name];
    if (rawContent === undefined) {
      for (let i = 0; i < i18n.global.availableLocales.length; i += 1) {
        const availableLang = i18n.global.availableLocales[i];
        // return the first available content
        if (contents.value[availableLang] && contents.value[availableLang][name]) {
          rawContent = contents.value[availableLang][name];
          break;
        }
      }
    }
    return md.renderInline(rawContent);
  }

  function getConstant(name: string, lang: string = 'fr'): string {
    if (constants.value[lang] === undefined || constants.value[lang][name] === undefined) return '';
    let element = constants.value[lang][name];
    if (element === undefined) {
      for (let i = 0; i < i18n.global.availableLocales.length; i += 1) {
        const availableLang = i18n.global.availableLocales[i];
        // return the first available constant
        if (constants.value[availableLang] && constants.value[availableLang][name]) {
          element = constants.value[availableLang][name];
          break;
        }
      }
    }

    return element;
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
