import * as vscode from 'vscode';
import { strict as assert } from 'assert';
import { snippetDefaults } from '../decorator/snippetDefaults';

const extensionId = 'ArcartXProject.arcartx-aria-ui';

async function open(source: string) {
    const marker = source.indexOf('§');
    assert.ok(marker >= 0);
    const document = await vscode.workspace.openTextDocument({
        language: 'arcartx-ui-yaml', content: source.replace('§', ''),
    });
    return { document, position: document.positionAt(marker) };
}

async function complete(document: vscode.TextDocument, position: vscode.Position, label: string) {
    const result = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider', document.uri, position
    );
    return result?.items.find(item => (typeof item.label === 'string' ? item.label : item.label.label) === label);
}

async function applyCompletion(source: string, label: string): Promise<string> {
    const { document, position } = await open(source);
    const editor = await vscode.window.showTextDocument(document);
    const item = await complete(document, position, label);
    assert.ok(item?.insertText instanceof vscode.SnippetString, `缺少补全 ${label}`);
    assert.ok(item.range instanceof vscode.Range);
    assert.equal(await editor.insertSnippet(item.insertText, item.range), true);
    return document.getText();
}

suite('ArcartX language features', () => {
    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension(extensionId);
        assert.ok(extension);
        await extension.activate();
    });

    test('inserts a RepeatGrid template at the control indentation', async () => {
        const result = await applyCompletion('controls:\n  players:\n    type: Rep§', 'RepeatGrid');
        assert.match(result, /^controls:\n  players:\n    type: RepeatGrid\n    attribute:\n      items: Player\.getTabPlayers\(\)/);
        assert.match(result, /\n    children:\n      player:\n        type: Text/);
    });

    test('replaces a quoted type without moving its comment', async () => {
        const result = await applyCompletion('controls:\n  players:\n    type: "Rep§eatGrid" # 玩家列表', 'RepeatGrid');
        assert.equal(result, 'controls:\n  players:\n    type: "RepeatGrid" # 玩家列表');
    });

    test('completes a call without replacing its existing argument list', async () => {
        const result = await applyCompletion('controls:\n  players:\n    type: RepeatGrid\n    attribute:\n      items: Player.getTa§bPlayers()', 'Player.getTabPlayers()');
        assert.match(result, /items: Player\.getTabPlayers\(\)$/);
    });

    test('shows RepeatGrid item documentation through a parent call', async () => {
        const grid = 'controls:\n  suite:players:\n    type: RepeatGrid\n    children:\n      row:\n        type: Canvas\n        children:\n          name:\n            type: Text\n            attribute:\n';
        const { document, position } = await open(grid + '              texts: "self?.parent()?.i§tem"');
        assert.ok(await complete(document, position, 'item'));
        const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider', document.uri, position
        );
        const docs = hovers?.flatMap(hover => hover.contents).map(content => typeof content === 'string' ? content : content.value);
        assert.match(docs?.join('\n') ?? '', /当前列表元素/);
    });

    test('counts only the outer call parameters in multiline scripts', async () => {
        const { document, position } = await open('ui:\n  action:\n    open: |-\n      Camera.setCameraPosition(\n        Cast.toInt(\'1,2\'), /* , */\n        20,\n        §\n      )');
        const help = await vscode.commands.executeCommand<vscode.SignatureHelp>(
            'vscode.executeSignatureHelpProvider', document.uri, position
        );
        assert.match(help?.signatures[0].label ?? '', /^Camera\.setCameraPosition\(/);
        assert.equal(help?.activeParameter, 2);
    });

    test('inserts BossBar layers as a YAML sequence', async () => {
        const result = await applyCompletion('root_control:\n  type: Canvas\n  children:\n    health:\n      type: BossB§', 'BossBar');
        assert.match(result, /      type: BossBar\n      attribute:\n        width: 360\n        height: 16\n        textures:\n          - ~190,58,70\n          - ~215,145,62/);
    });

    test('loop templates initialize and update the same variable', async () => {
        const result = await applyCompletion('tasks:\n  ?§', 'loop-task');
        assert.match(result, /tasks:\n  循环计数:\n    type: loop/);
        assert.match(result, /var\.taskTicks ~= 0\n      var\.taskTicks \+= 1/);
    });

    test('previews snippet choices and linked fields as plain YAML', () => {
        const source = [
            'follow: ${1|true,false|}',
            'run: |-',
            '  var.${2:taskTicks} ~= 0',
            '  var.$2 += 1',
            '$0',
        ].join('\n');
        assert.equal(snippetDefaults(source), [
            'follow: true',
            'run: |-',
            '  var.taskTicks ~= 0',
            '  var.taskTicks += 1',
            '',
        ].join('\n'));
    });

    test('shows type documentation for Tooltip and task templates', async () => {
        const cases = [
            ['tip:\n  match: default\nroot_control:\n  type: "T§ip"', /配置物品提示的根控件/],
            ['tasks:\n  refresh:\n    type: lo§op', /按周期循环执行/],
        ] as const;
        for (const [source, expected] of cases) {
            const { document, position } = await open(source);
            const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider', document.uri, position
            );
            const docs = hovers?.flatMap(hover => hover.contents).map(content =>
                typeof content === 'string' ? content : content.value);
            assert.match(docs?.join('\n') ?? '', expected);
        }
    });
});
