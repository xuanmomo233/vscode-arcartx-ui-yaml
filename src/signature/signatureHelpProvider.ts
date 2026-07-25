import * as vscode from 'vscode';
import { builtin_functions } from '../completion/structure/rule/ariaBuiltin';

interface FuncSignature {
    label: string;
    parameters: string[];
    description: string;
}

export class SignatureHelpProvider implements vscode.SignatureHelpProvider {
    private signatures: Map<string, FuncSignature[]> = new Map();

    constructor() {
        this.buildSignatures();
    }

    private buildSignatures() {
        for (const func of builtin_functions) {
            const label = func.label.replace(/\(\)$/, '');
            const parts = label.split('.');
            const funcName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
            const objPrefix = parts.length > 1 ? parts.slice(0, -1).join('.') + '.' : '';

            const params = this.extractParams(func.insertText);
            const sig: FuncSignature = {
                label: `${objPrefix}${funcName}(${params.join(', ')})`,
                parameters: params,
                description: func.detail,
            };

            const key = parts.length > 1 ? label : funcName;
            if (!this.signatures.has(key)) {
                this.signatures.set(key, []);
            }
            this.signatures.get(key)!.push(sig);
        }
    }

    private extractParams(insertText: string): string[] {
        const params: string[] = [];
        const regex = /\$\{(\d+):([^}]+)\}/g;
        let match;
        while ((match = regex.exec(insertText)) !== null) {
            params.push(match[2]);
        }
        return params;
    }

    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.SignatureHelp | undefined {
        const line = document.lineAt(position.line).text;
        const linePrefix = line.substring(0, position.character);

        const callMatch = linePrefix.match(/(\w+(?:\.\w+)*)\s*\(/g);
        if (!callMatch) return undefined;

        const lastCall = callMatch[callMatch.length - 1];
        const funcNameMatch = lastCall.match(/(\w+(?:\.\w+)*)\s*\(/);
        if (!funcNameMatch) return undefined;

        const fullFuncName = funcNameMatch[1];
        const parts = fullFuncName.split('.');
        const funcName = parts[parts.length - 1];

        let sigs: FuncSignature[] | undefined;
        if (parts.length > 1) {
            sigs = this.signatures.get(fullFuncName);
        }
        if (!sigs) {
            sigs = this.signatures.get(funcName);
        }

        if (!sigs || sigs.length === 0) return undefined;

        const callStart = linePrefix.lastIndexOf(lastCall);
        const argsText = linePrefix.substring(callStart + lastCall.length);
        const currentParam = argsText.split(',').length - 1;

        const help = new vscode.SignatureHelp();
        help.signatures = sigs.map(sig => {
            const si = new vscode.SignatureInformation(sig.label, new vscode.MarkdownString(sig.description));
            si.parameters = sig.parameters.map(p => new vscode.ParameterInformation(p));
            return si;
        });

        help.activeSignature = 0;
        help.activeParameter = Math.min(currentParam, sigs[0].parameters.length - 1);

        return help;
    }
}
