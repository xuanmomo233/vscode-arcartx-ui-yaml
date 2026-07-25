import * as vscode from 'vscode';
import { type_values } from '../completion/structure/rule/controlAttributeValue';

const VALID_CONTROL_TYPES = new Set(type_values.map(v => v.label.toLowerCase()));

export class DiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('arcartx-ui-yaml');

        context.subscriptions.push(this.diagnosticCollection);

        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(e.document);
            }
        }, null, context.subscriptions);

        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(doc);
            }
        }, null, context.subscriptions);

        for (const doc of vscode.workspace.textDocuments) {
            if (doc.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(doc);
            }
        }
    }

    private updateDiagnostics(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let inAriaBlock = false;
        let ariaBlockIndent = 0;
        let ariaBlockStartLine = -1;
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

            const indent = this.getIndent(line);

            if (line.includes('\t') && line.includes(' ') && !line.trim().startsWith('#')) {
                const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
                if (leadingWhitespace.includes('\t') && leadingWhitespace.includes(' ')) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(i, 0, i, leadingWhitespace.length),
                        '混合使用 Tab 和空格缩进，建议统一使用空格',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

            if (trimmed.match(/^\w+:\s*\|?-?$/)) {
                if (trimmed.endsWith('|-') || trimmed.endsWith('|')) {
                    inAriaBlock = true;
                    ariaBlockIndent = indent;
                    ariaBlockStartLine = i;
                    braceDepth = 0;
                }
                continue;
            }

            if (inAriaBlock) {
                if (indent > ariaBlockIndent || trimmed === '') {
                    const openBraces = (trimmed.match(/{/g) || []).length;
                    const closeBraces = (trimmed.match(/}/g) || []).length;
                    braceDepth += openBraces - closeBraces;
                    continue;
                } else {
                    if (braceDepth > 0) {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(ariaBlockStartLine, 0, i, 0),
                            `Aria 代码块中花括号未闭合（缺少 ${braceDepth} 个 '}'）`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                    inAriaBlock = false;
                }
            }

            const yamlKeyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
            if (yamlKeyMatch) {
                const key = yamlKeyMatch[1];
                const value = yamlKeyMatch[2];

                if (key === 'type' && value && !value.startsWith('${') && isNaN(Number(value.trim().replace(/['"]/g, '')))) {
                    const typeValue = value.trim().replace(/['"]/g, '');
                    if (!VALID_CONTROL_TYPES.has(typeValue.toLowerCase()) && typeValue !== '') {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(i, line.indexOf(value), i, line.indexOf(value) + value.length),
                            `无效的控件类型: "${typeValue}"`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }

                if (indent > 0 && indent % 2 !== 0) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(i, 0, i, indent),
                        `缩进为 ${indent} 个空格，建议使用 2 的倍数`,
                        vscode.DiagnosticSeverity.Information
                    ));
                }
            }
        }

        if (inAriaBlock && braceDepth > 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(ariaBlockStartLine, 0, lines.length - 1, 0),
                `Aria 代码块中花括号未闭合（缺少 ${braceDepth} 个 '}'）`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private getIndent(line: string): number {
        let indent = 0;
        for (const char of line) {
            if (char === ' ') indent++;
            else if (char === '\t') indent += 4;
            else break;
        }
        return indent;
    }
}
