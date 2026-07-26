import * as vscode from 'vscode';
import { StructureCompletionProvider } from './completion/structure/structure'
import { VariableCompletionProvider } from './completion/aria/variable';
import { TempVariableCompletionProvider } from './completion/aria/tempVariable';
import { HoverProvider } from './hover/hoverProvider';
import { SignatureHelpProvider } from './signature/signatureHelpProvider';
import { DiagnosticProvider } from './diagnostics/diagnosticProvider';
import { DefinitionProvider } from './definition/definitionProvider';
import { ColorDecorator } from './decorator/colorDecorator';
import { ColorPickerCommand } from './decorator/colorPicker';


export function activate(context: vscode.ExtensionContext) {

    const structureCompletionProvider = vscode.languages.registerCompletionItemProvider(
        'arcartx-ui-yaml',
        new StructureCompletionProvider(),
        '?', '/', '.', ':'
    );

    const variableCompletionProvider = vscode.languages.registerCompletionItemProvider(
        'arcartx-ui-yaml',
        new VariableCompletionProvider(),
        '.' 
    );

    const tempVariableCompletionProvider = vscode.languages.registerCompletionItemProvider(
        'arcartx-ui-yaml',
        new TempVariableCompletionProvider()
    );

    const hoverProvider = vscode.languages.registerHoverProvider(
        'arcartx-ui-yaml',
        new HoverProvider()
    );

    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
        'arcartx-ui-yaml',
        new SignatureHelpProvider(),
        '(', ','
    );

    const diagnosticProvider = new DiagnosticProvider(context);

    const definitionProvider = vscode.languages.registerDefinitionProvider(
        'arcartx-ui-yaml',
        new DefinitionProvider()
    );

    const colorDecorator = new ColorDecorator(context);

    const colorPickerCommand = ColorPickerCommand.register(context);

    context.subscriptions.push(
        structureCompletionProvider,
        variableCompletionProvider,
        tempVariableCompletionProvider,
        hoverProvider,
        signatureHelpProvider,
        definitionProvider,
        colorPickerCommand,
    );
}


export function deactivate() {}
