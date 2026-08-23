import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const docsRoot = resolve(repoRoot, 'docs');
const referenceDirs = [
  resolve(docsRoot, 'plugin-api/reference'),
  resolve(docsRoot, 'en/plugin-api/reference'),
  resolve(docsRoot, 'ja/plugin-api/reference'),
];

function markdownFiles(directory: string): string[] {
  return readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

function readMarkdownTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return [readMarkdownTree(path)];
      return entry.name.endsWith('.md') ? [readFileSync(path, 'utf8')] : [];
    })
    .join('\n');
}

describe('Plugin API documentation', () => {
  it('generates the same Reference page set for Chinese, English, and Japanese', () => {
    const expected = markdownFiles(referenceDirs[0]);
    expect(expected).toContain('capabilities.md');
    expect(expected).toContain('host-dependencies.md');
    expect(expected).toContain('sync.md');
    expect(markdownFiles(referenceDirs[1])).toEqual(expected);
    expect(markdownFiles(referenceDirs[2])).toEqual(expected);
  });

  it('renders JSDoc and omits internal generator banners and missing-doc placeholders', () => {
    for (const directory of referenceDirs) {
      const content = readMarkdownTree(directory);
      expect(content).not.toMatch(/\{@link\s/);
      expect(content).not.toMatch(/^@(param|returns?|example|deprecated)\b/m);
      expect(content).not.toContain('自动生成自');
      expect(content).not.toContain('Generated from');
      expect(content).not.toContain('自動生成');
      expect(content).not.toContain('未提供额外注释');
      expect(content).not.toContain('No additional documentation is available');
      expect(content).not.toContain('追加の説明はありません');
    }
  });

  it('keeps English Reference prose free of Chinese source comments', () => {
    const content = readMarkdownTree(referenceDirs[1])
      // This is a runtime validation string in a generated schema, not JSDoc.
      .replaceAll('天线信息不能超过64字符', 'antenna info validation');
    expect(content).not.toMatch(/[\u3400-\u9fff]/u);
  });

  it('does not reintroduce removed v1 APIs or obsolete builtin paths', () => {
    const content = [
      readMarkdownTree(resolve(docsRoot, 'plugin-api')),
      readFileSync(resolve(docsRoot, 'wiki/plugin-system.md'), 'utf8'),
      readFileSync(resolve(docsRoot, 'wiki/architecture.md'), 'utf8'),
    ].join('\n');

    for (const obsolete of [
      'ctx.operator.call(',
      'ctx.radio.capabilities',
      'ctx.radio.power',
      'ctx.radio.setFrequency',
      'ctx.timers.setInterval',
      'packages/server/src/plugin/builtins/',
      'heartbeat-demo',
      'qso-session-inspector',
      'iframe-panel-demo',
    ]) {
      expect(content).not.toContain(obsolete);
    }
  });
});
