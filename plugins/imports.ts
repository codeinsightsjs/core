import { AnalyzedEntityMetrics } from "../src/shared/models/analyze.model";
import {
  TypeScriptAnalyzeInfo,
  TypeScriptPlugin,
} from "../src/shared/models/plugins/typescript-plugin.model";

interface ImportDefinition {
  type: "import";
  path: string;
  metrics: AnalyzedEntityMetrics;
  labels: {
    name: string;
    importedFrom: string;
  };
}

class ImportsPlugin implements TypeScriptPlugin {
  allFilesImports: ImportDefinition[] = [];
  parser = "TypeScript" as const;

  analyzeFile({ labels, visit }: TypeScriptAnalyzeInfo) {
    const { filePath } = labels;
    const allFilesImports: ImportDefinition[] = [];
    visit({
      visitImportDeclaration(path) {
        const importPath = path.node.source.value as string;
        const importItems = path.node.specifiers;
        if (importItems?.length) {
          for (const item of importItems) {
            const getName = () => {
              if (
                item.type === "ImportDefaultSpecifier" ||
                item.type === "ImportNamespaceSpecifier"
              ) {
                return item.local?.name;
              }
              return item.imported.name;
            };
            const importDefinition: ImportDefinition = {
              type: "import",
              metrics: {},
              path: filePath,
              labels: {
                name: getName() as string,
                importedFrom: importPath,
              },
            };
            allFilesImports.push(importDefinition);
          }
        }
        this.traverse(path);
      },
    });
    this.allFilesImports.push(...allFilesImports);
  }

  onFinishProcessing() {
    return this.allFilesImports;
  }
}

export default ImportsPlugin;
