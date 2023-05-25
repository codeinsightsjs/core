import { PluginOptions } from "../models/plugins/plugin.model";
import {
  HTMLAnalyzeInfo,
  HTMLPlugin,
} from "../models/plugins/html-plugin.model";

interface HTMLTag {
  type: "tag";
  path: string;
  labels: {
    name: string;
  };
}

interface Params {
  matchPattern?: string;
}

export default class UsedHTMLTags implements HTMLPlugin {
  parser = "HTML" as const;
  allTags: HTMLTag[] = [];

  analyzeFile(
    { document, labels }: HTMLAnalyzeInfo,
    pluginOptions: PluginOptions<Params>
  ) {
    const { filePath } = labels;
    const elements = document.body.querySelectorAll("*");
    elements.forEach((element) => {
      const matchPattern = pluginOptions.params?.matchPattern;
      const tagName = element.tagName.toLowerCase();
      if (matchPattern) {
        const re = new RegExp(matchPattern);
        const isMatch = re.test(tagName);
        if (!isMatch) {
          return;
        }
      }
      this.allTags.push({
        type: "tag",
        path: filePath,
        labels: {
          name: tagName,
        },
      });
    });
  }

  onFinishProcessing() {
    return this.allTags;
  }
}
