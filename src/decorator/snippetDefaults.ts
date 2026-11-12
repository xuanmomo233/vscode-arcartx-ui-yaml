/**
 * Expands the default fields used by the built-in templates for preview and copy.
 * Repeated tab stops share the default of their first declaration.
 */
export function snippetDefaults(snippet: string): string {
    const token = /\\([$}\\])|\$\{(\d+)(?::((?:\\.|[^\\}])*)|\|((?:\\.|[^\\|])*)\|)?\}|\$(\d+)/g;
    const defaults = new Map<string, string>();
    for (const [, , index, placeholder, choices] of snippet.matchAll(token)) {
        if (defaults.has(index)) {
            continue;
        }
        if (placeholder !== undefined) {
            defaults.set(index, placeholder.replace(/\\([$}\\])/g, '$1'));
        } else if (choices !== undefined) {
            const first = choices.match(/^(?:\\.|[^\\,])*/)?.[0] ?? '';
            defaults.set(index, first.replace(/\\([,|\\])/g, '$1'));
        }
    }
    return snippet.replace(token, (_match, literal, index, _placeholder, _choices, mirror) =>
        literal ?? defaults.get(index ?? mirror) ?? '');
}
