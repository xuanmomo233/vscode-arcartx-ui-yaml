import * as vscode from 'vscode';
import { builtin_functions } from '../completion/structure/rule/ariaBuiltin';
import { control_self_functions } from '../completion/structure/rule/controlSelf';
import { self_functions } from '../completion/structure/rule/uiSelf';
import { AriaPunctuation } from '../aria/punctuation';
import { ariaContext, inlineValueStart, isAriaBlock, positionIndent, yamlAncestors } from '../yamlContext';

interface SignatureEntry {
    label: string;
    detail: string;
    insertText: string;
}

interface CallFrame {
    close: string;
    name?: string;
    parameter: number;
}

export class SignatureHelpProvider implements vscode.SignatureHelpProvider {
    private readonly builtins = this.buildSignatures(builtin_functions);
    private readonly ui = this.buildSignatures(self_functions, 'self.');
    private readonly controls = this.buildSignatures(control_self_functions, 'self.');

    private buildSignatures(entries: SignatureEntry[], prefix = '') {
        const signatures = new Map<string, vscode.SignatureInformation[]>();
        for (const entry of entries) {
            const name = prefix + entry.label.replace(/\(.*$/, '');
            const params = Array.from(entry.insertText.matchAll(/\$\{\d+:([^}]+)\}/g), match => match[1]);
            const signature = new vscode.SignatureInformation(
                name + '(' + params.join(', ') + ')', new vscode.MarkdownString(entry.detail)
            );
            signature.parameters = params.map(param => new vscode.ParameterInformation(param));
            const existing = signatures.get(name) ?? [];
            existing.push(signature);
            signatures.set(name, existing);
        }
        return signatures;
    }

    provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position): vscode.SignatureHelp | undefined {
        const parents = yamlAncestors(document, position.line, positionIndent(document, position));
        const script = ariaContext(document, position, parents);
        if (!script) {
            return undefined;
        }

        const block = parents.find(isAriaBlock);
        const stack: CallFrame[] = [];
        const punctuation = new AriaPunctuation();
        const closers: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
        for (let line = block ? block.line + 1 : position.line; line <= position.line; line++) {
            const text = document.lineAt(line).text;
            let source = line === position.line ? text.slice(0, position.character) : text;
            if (!block) {
                source = source.slice(inlineValueStart(text, line));
                // The outer quotes belong to YAML. Decode quote escapes before scanning the Aria expression.
                if (source.startsWith('"')) {
                    source = source.slice(1).replace(/\\(["\\])/g, '$1');
                } else if (source.startsWith("'")) {
                    source = source.slice(1).replace(/''/g, "'");
                }
            }
            punctuation.scan(source, (symbol, index) => {
                const frame = stack[stack.length - 1];
                const close = closers[symbol];
                if (close) {
                    const name = symbol === '('
                        ? source.slice(0, index).match(/(?:^|[^\w.])([A-Za-z_]\w*(?:\??\.[A-Za-z_]\w*)*)[ \t]*$/)?.[1]
                        : undefined;
                    stack.push({ close, name: name?.replace(/\?\./g, '.'), parameter: 0 });
                } else if (symbol === frame?.close) {
                    stack.pop();
                } else if (symbol === ',' && frame?.close === ')') {
                    frame.parameter++;
                }
            });
        }

        const call = stack.reverse().find(frame => frame.name);
        if (!call?.name) {
            return undefined;
        }
        const signatures = this.builtins.get(call.name) ?? (script === 'ui' ? this.ui : this.controls).get(call.name);
        if (!signatures?.length) {
            return undefined;
        }

        const help = new vscode.SignatureHelp();
        help.signatures = signatures;
        help.activeSignature = 0;
        if (signatures[0].parameters.length > 0) {
            help.activeParameter = Math.min(call.parameter, signatures[0].parameters.length - 1);
        }
        return help;
    }
}
