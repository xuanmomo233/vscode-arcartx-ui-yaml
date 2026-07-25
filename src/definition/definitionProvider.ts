import * as vscode from 'vscode';

export class DefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
        const range = document.getWordRangeAtPosition(position, /[\w.]+/);
        if (!range) return undefined;

        const word = document.getText(range);
        const line = document.lineAt(position.line).text;

        const scopeMatch = word.match(/^(var|val|global|client|server)\.(\w+)$/);
        if (scopeMatch) {
            const scope = scopeMatch[1];
            const varName = scopeMatch[2];
            return this.findVariableDefinition(document, scope, varName);
        }

        const controlRefMatch = line.match(/self\[['"]([^'"]+)['"]\]/);
        if (controlRefMatch) {
            const controlName = controlRefMatch[1];
            return this.findControlDefinition(document, controlName);
        }

        const createMatch = line.match(/self\.create\(\s*['"]([^'"]+)['"]/);
        if (createMatch) {
            const templateId = createMatch[1];
            return this.findTemplateDefinition(document, templateId);
        }

        const screenOpenMatch = line.match(/Screen\.open\(\s*['"]([^'"]+)['"]/);
        if (screenOpenMatch) {
            const uiId = screenOpenMatch[1];
            return this.findUiDefinition(document, uiId);
        }

        return undefined;
    }

    private findVariableDefinition(
        document: vscode.TextDocument,
        scope: string,
        varName: string
    ): vscode.Location | undefined {
        const text = document.getText();
        const regex = new RegExp(`(${scope}\\.${varName})\\s*=`, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            return new vscode.Location(document.uri, pos);
        }
        return undefined;
    }

    private findControlDefinition(
        document: vscode.TextDocument,
        controlName: string
    ): vscode.Location | undefined {
        const lines = document.getText().split('\n');
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.endsWith(':') && trimmed.replace(':', '').trim() === controlName) {
                return new vscode.Location(document.uri, new vscode.Position(i, 0));
            }
        }
        return undefined;
    }

    private findTemplateDefinition(
        document: vscode.TextDocument,
        templateId: string
    ): vscode.Location | undefined {
        const lines = document.getText().split('\n');
        let inTemplateSection = false;
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed === 'template:') {
                inTemplateSection = true;
                continue;
            }
            if (inTemplateSection) {
                if (trimmed.endsWith(':') && trimmed.replace(':', '').trim() === templateId) {
                    return new vscode.Location(document.uri, new vscode.Position(i, 0));
                }
                const indent = this.getIndent(lines[i]);
                if (indent === 0 && trimmed !== '' && !trimmed.startsWith('#')) {
                    inTemplateSection = false;
                }
            }
        }
        return undefined;
    }

    private findUiDefinition(
        document: vscode.TextDocument,
        uiId: string
    ): vscode.Location[] | undefined {
        const results: vscode.Location[] = [];
        const files = vscode.workspace.textDocuments.filter(
            doc => doc.languageId === 'arcartx-ui-yaml'
        );
        for (const doc of files) {
            const lines = doc.getText().split('\n');
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (trimmed.endsWith(':') && trimmed.replace(':', '').trim() === uiId) {
                    results.push(new vscode.Location(doc.uri, new vscode.Position(i, 0)));
                }
            }
        }
        return results.length > 0 ? results : undefined;
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
