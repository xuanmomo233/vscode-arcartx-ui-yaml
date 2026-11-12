type Scope =
    | { kind: 'string'; quote: string }
    | { kind: 'comment' }
    | { kind: 'interpolation'; depth: number };

/** Finds punctuation in Aria code while retaining multiline strings and comments across lines. */
export class AriaPunctuation {
    private readonly scopes: Scope[] = [];

    scan(line: string, visit: (symbol: string, index: number) => void): void {
        for (let index = 0; index < line.length; index++) {
            const symbol = line[index];
            const scope = this.scopes[this.scopes.length - 1];
            if (scope?.kind === 'comment') {
                if (line.startsWith('*/', index)) {
                    this.scopes.pop();
                    index++;
                }
                continue;
            }
            if (scope?.kind === 'string') {
                if (symbol === '\\') {
                    index++;
                } else if (line.startsWith(scope.quote, index)) {
                    this.scopes.pop();
                    index += scope.quote.length - 1;
                } else if (symbol === '{' && scope.quote !== "'") {
                    this.scopes.push({ kind: 'interpolation', depth: 1 });
                }
                continue;
            }

            if (line.startsWith('//', index)) {
                break;
            }
            if (line.startsWith('/*', index)) {
                this.scopes.push({ kind: 'comment' });
                index++;
            } else if (symbol === '"' || symbol === "'") {
                const quote = line.startsWith('"""', index) ? '"""' : symbol;
                this.scopes.push({ kind: 'string', quote });
                index += quote.length - 1;
            } else if (scope?.kind === 'interpolation') {
                if (symbol === '{') {
                    scope.depth++;
                } else if (symbol === '}' && --scope.depth === 0) {
                    this.scopes.pop();
                }
            } else if ('()[]{},'.includes(symbol)) {
                visit(symbol, index);
            }
        }

        const singleLineString = this.scopes.findIndex(scope => scope.kind === 'string' && scope.quote !== '"""');
        if (singleLineString !== -1) {
            this.scopes.length = singleLineString;
        }
    }
}
