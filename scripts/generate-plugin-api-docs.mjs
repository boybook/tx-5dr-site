import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const SOURCE_ENV_NAME = 'TX5DR_SOURCE_DIR';
const SOURCE_REF_ENV_NAME = 'TX5DR_SOURCE_REF';
const DEFAULT_SOURCE_DIR = path.resolve(process.cwd(), '../tx-5dr');
const SOURCE_DIR = path.resolve(process.env[SOURCE_ENV_NAME] || DEFAULT_SOURCE_DIR);
const PLUGIN_API_SRC_DIR = path.join(SOURCE_DIR, 'packages/plugin-api/src');
const CONTRACTS_SRC_DIR = path.join(SOURCE_DIR, 'packages/contracts/src');

function detectSourceBranch() {
  try {
    return execFileSync('git', ['-C', SOURCE_DIR, 'branch', '--show-current'], { encoding: 'utf8' }).trim() || 'main';
  } catch {
    return 'main';
  }
}

const SOURCE_BRANCH = process.env[SOURCE_REF_ENV_NAME] || detectSourceBranch();
const SOURCE_BASE_URL = `https://github.com/boybook/tx-5dr/blob/${SOURCE_BRANCH}/packages/plugin-api/src`;
const CONTRACTS_SOURCE_BASE_URL = `https://github.com/boybook/tx-5dr/blob/${SOURCE_BRANCH}/packages/contracts/src`;

const PAGE_SPECS = [
  {
    kind: 'declaration',
    source: 'definition.ts',
    output: 'definition.md',
    title: 'PluginDefinition',
    description: {
      zh: '插件入口文件的默认导出结构。',
      en: 'The default export shape for a plugin entry module.',
      ja: 'プラグインエントリーモジュールのデフォルトエクスポート構造です。',
    },
  },
  {
    kind: 'declaration',
    source: 'compatibility.ts',
    output: 'compatibility.md',
    title: 'Plugin API Compatibility',
    description: {
      zh: '插件 API 版本比较、最低版本校验和兼容错误。',
      en: 'Plugin API version comparison, minimum-version checks, and compatibility errors.',
      ja: 'Plugin API バージョン比較、最低バージョン検証、互換性エラーです。',
    },
  },
  {
    kind: 'declaration',
    source: 'capabilities.ts',
    output: 'capabilities.md',
    title: 'Capabilities',
    description: {
      zh: '权限到 runtime context capability 的公开映射。',
      en: 'Public mapping from permissions to runtime context capabilities.',
      ja: '権限から runtime context capability への公開マッピングです。',
    },
  },
  {
    kind: 'declaration',
    source: 'context.ts',
    output: 'context.md',
    title: 'PluginContext',
    description: {
      zh: 'Host 在运行时提供给插件的 context。',
      en: 'Runtime contexts provided to plugins by the Host.',
      ja: 'Host が実行時にプラグインへ提供する context です。',
    },
  },
  {
    kind: 'declaration',
    source: 'hooks.ts',
    output: 'hooks.md',
    title: 'PluginHooks',
    description: {
      zh: '插件可以实现的 Hook 和相关数据类型。',
      en: 'Hooks a plugin can implement and their related data types.',
      ja: 'プラグインが実装できる Hook と関連データ型です。',
    },
  },
  {
    kind: 'declaration',
    source: 'runtime.ts',
    output: 'runtime.md',
    title: 'StrategyRuntime',
    description: {
      zh: '`strategy` 插件的运行时接口。',
      en: 'Runtime interfaces for `strategy` plugins.',
      ja: '`strategy` プラグイン向けのランタイムインターフェースです。',
    },
  },
  {
    kind: 'declaration',
    source: 'helpers.ts',
    output: 'helpers.md',
    title: 'Helper Interfaces',
    description: {
      zh: '存储、日志、定时器、网络、操作员、电台、日志本和 UI 接口。',
      en: 'Storage, logging, timers, network, operator, radio, logbook, and UI interfaces.',
      ja: 'ストレージ、ログ、タイマー、ネットワーク、オペレーター、無線機、ログブック、UI の各インターフェースです。',
    },
  },
  {
    kind: 'declaration',
    source: 'settings.ts',
    output: 'settings.md',
    title: 'Host Settings',
    description: {
      zh: '`ctx.settings` 可以访问的 Host 设置命名空间和类型。',
      en: 'Host settings namespaces and values available through `ctx.settings`.',
      ja: '`ctx.settings` から利用できる Host 設定の名前空間と値です。',
    },
  },
  {
    kind: 'declaration',
    source: 'sync.ts',
    output: 'sync.md',
    title: 'Logbook Sync',
    description: {
      zh: '日志同步 Provider、结果、进度和失败类型。',
      en: 'Logbook sync providers, results, progress events, and failure types.',
      ja: 'ログブック同期 Provider、結果、進捗イベント、失敗型です。',
    },
  },
  {
    kind: 'declaration',
    source: 'host-dependencies.ts',
    output: 'host-dependencies.md',
    title: 'Host Dependencies',
    description: {
      zh: '由 Host 加载并通过权限提供的 native 依赖接口。',
      en: 'Native dependencies loaded by the Host and exposed through permissions.',
      ja: 'Host がロードし、権限を通じて公開する native 依存インターフェースです。',
    },
  },
  {
    kind: 're-exports',
    source: 'index.ts',
    output: 're-exports.md',
    title: 'Re-exports',
    description: {
      zh: '`@tx5dr/plugin-api` 包的公开导出。',
      en: 'Public exports from the `@tx5dr/plugin-api` package.',
      ja: '`@tx5dr/plugin-api` パッケージの公開エクスポートです。',
    },
  },
  {
    kind: 'contracts',
    output: 'contracts.md',
    title: 'Contracts Re-exports',
    description: {
      zh: '`@tx5dr/plugin-api` 重新导出的 contracts 类型和值。',
      en: 'Contract types and values re-exported by `@tx5dr/plugin-api`.',
      ja: '`@tx5dr/plugin-api` が再エクスポートする contract の型と値です。',
    },
  },
];

const REFERENCE_LOCALES = [
  {
    id: 'zh',
    outputDir: path.resolve(process.cwd(), 'docs/plugin-api/reference'),
    strings: {
      exports: '导出',
      kind: '类型',
      source: '源码',
      relatedSchema: '相关 schema',
      noDocs: '暂无补充说明。',
      unresolvedExport: '无法在 `packages/contracts/src` 中解析这个导出。',
      dataStructure: '数据结构',
      typeDeclaration: '类型定义',
      localExports: 'plugin-api 本地导出',
      contractTypeExports: '来自 @tx5dr/contracts 的类型导出',
      contractValueExports: '来自 @tx5dr/contracts 的值导出',
      typeExports: '类型导出',
      valueExports: '值导出',
      indexTitle: '插件 API Reference',
      indexIntro: '这些页面由公开 TypeScript 源码生成，用于查阅插件 API 签名和共享类型。',
      pageList: '页面目录',
      update: '更新方式',
      updateLead: '在站点仓库根目录执行：',
      branchLead: '当前默认读取的主仓库分支是',
      sourceDirLead: '如果 TX-5DR 主仓库不在默认的 `../tx-5dr`，请设置环境变量',
      sentenceEnd: '。',
    },
  },
  {
    id: 'en',
    outputDir: path.resolve(process.cwd(), 'docs/en/plugin-api/reference'),
    strings: {
      exports: 'Exports',
      kind: 'Kind',
      source: 'Source',
      relatedSchema: 'Related schema',
      noDocs: 'No additional documentation is available.',
      unresolvedExport: 'This export could not be resolved in `packages/contracts/src`.',
      dataStructure: 'Data structure',
      typeDeclaration: 'Type declaration',
      localExports: 'Local plugin-api exports',
      contractTypeExports: 'Type exports from @tx5dr/contracts',
      contractValueExports: 'Value exports from @tx5dr/contracts',
      typeExports: 'Type exports',
      valueExports: 'Value exports',
      indexTitle: 'Plugin API Reference',
      indexIntro: 'These pages are generated from the public TypeScript sources and document Plugin API signatures and shared types.',
      pageList: 'Pages',
      update: 'Updating the reference',
      updateLead: 'Run this command from the site repository root:',
      branchLead: 'The source repository branch used by default is',
      sourceDirLead: 'If the TX-5DR repository is not available at `../tx-5dr`, set',
      sentenceEnd: '.',
    },
  },
  {
    id: 'ja',
    outputDir: path.resolve(process.cwd(), 'docs/ja/plugin-api/reference'),
    strings: {
      exports: 'エクスポート',
      kind: '種別',
      source: 'ソース',
      relatedSchema: '関連 schema',
      noDocs: '追加の説明はありません。',
      unresolvedExport: 'このエクスポートを `packages/contracts/src` 内で解決できませんでした。',
      dataStructure: 'データ構造',
      typeDeclaration: '型定義',
      localExports: 'plugin-api のローカルエクスポート',
      contractTypeExports: '@tx5dr/contracts からの型エクスポート',
      contractValueExports: '@tx5dr/contracts からの値エクスポート',
      typeExports: '型エクスポート',
      valueExports: '値エクスポート',
      indexTitle: 'プラグイン API リファレンス',
      indexIntro: '公開 TypeScript ソースから生成された、プラグイン API のシグネチャと共有型のリファレンスです。JSDoc 本文は英語で掲載します。',
      pageList: 'ページ一覧',
      update: 'リファレンスの更新',
      updateLead: 'サイトリポジトリのルートで次のコマンドを実行します。',
      branchLead: 'デフォルトで参照するソースリポジトリのブランチは',
      sourceDirLead: 'TX-5DR リポジトリが `../tx-5dr` にない場合は、次の環境変数を設定してください:',
      sentenceEnd: '。',
    },
  },
];

const sourceFileCache = new Map();
const contractsExportMap = new Map();
const declarationCache = new Map();
const referenceLinks = new Map();
const referenceMemberLinks = new Map();
const signaturePrinter = ts.createPrinter({
  removeComments: true,
  newLine: ts.NewLineKind.LineFeed,
});

function assertSourceAvailable() {
  const packageJsonPath = path.join(SOURCE_DIR, 'package.json');
  const pluginApiEntry = path.join(PLUGIN_API_SRC_DIR, 'index.ts');
  const contractsEntry = path.join(CONTRACTS_SRC_DIR, 'index.ts');

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(pluginApiEntry) || !fs.existsSync(contractsEntry)) {
    throw new Error(
      [
        'Unable to locate the TX-5DR source repository.',
        `Expected ${packageJsonPath}, ${pluginApiEntry} and ${contractsEntry}.`,
        `Set ${SOURCE_ENV_NAME} if your source checkout is not at ${DEFAULT_SOURCE_DIR}.`,
      ].join(' '),
    );
  }
}

function loadSourceFile(filePath) {
  const normalizedPath = path.resolve(filePath);

  if (sourceFileCache.has(normalizedPath)) {
    return sourceFileCache.get(normalizedPath);
  }

  const content = fs.readFileSync(normalizedPath, 'utf8');
  const sourceFile = ts.createSourceFile(normalizedPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = { filePath: normalizedPath, content, sourceFile };
  sourceFileCache.set(normalizedPath, result);
  return result;
}

function getPluginApiSourceFile(fileName) {
  return loadSourceFile(path.join(PLUGIN_API_SRC_DIR, fileName));
}

function getContractsSourceFile(fileName) {
  return loadSourceFile(path.join(CONTRACTS_SRC_DIR, fileName));
}

function hasExportModifier(node) {
  return (node.modifiers || []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function cleanDocBlock(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, '').replace(/\s+$/, ''))
    .filter((line) => line !== '/')
    .join('\n')
    .replace(/^\/\*\*\n?/, '')
    .replace(/\n?\*\/$/, '')
    .trim();
}

function renderInlineDocLinks(text) {
  return text.replace(/\{@link\s+([^\s}|]+)(?:\s*\|\s*([^}]+))?\}/g, (_match, target, label) => {
    const display = (label || target).trim();
    if (/^https?:\/\//.test(target)) {
      return `[${display}](${target})`;
    }

    const [root, member] = target.split(/[.#]/, 2);
    const direct = referenceLinks.get(target);
    const rootLink = referenceLinks.get(root);
    const memberCandidates = member ? referenceMemberLinks.get(member) : undefined;
    const resolved = direct
      || (memberCandidates?.length === 1 ? memberCandidates[0] : undefined)
      || rootLink;
    return resolved ? `[\`${display}\`](${resolved})` : `\`${display}\``;
  });
}

function renderDocBlock(text) {
  const description = [];
  const tags = [];
  let currentTag = null;

  for (const line of text.split('\n')) {
    const tagMatch = line.match(/^@(\S+)\s*(.*)$/);
    if (tagMatch) {
      currentTag = { name: tagMatch[1], lines: [tagMatch[2]] };
      tags.push(currentTag);
    } else if (currentTag) {
      currentTag.lines.push(line);
    } else {
      description.push(line);
    }
  }

  const sections = [];
  const renderedDescription = renderInlineDocLinks(description.join('\n').trim());
  if (renderedDescription) sections.push(renderedDescription);

  const params = tags.filter((tag) => tag.name === 'param').map((tag) => {
    const value = tag.lines.join('\n').trim();
    const match = value.match(/^(\S+)\s*(?:-\s*)?([\s\S]*)$/);
    if (!match) return `- ${renderInlineDocLinks(value)}`;
    return `- \`${match[1]}\`: ${renderInlineDocLinks(match[2].trim())}`;
  });
  if (params.length > 0) sections.push(['**Parameters**', '', ...params].join('\n'));

  for (const tag of tags) {
    const value = renderInlineDocLinks(tag.lines.join('\n').trim());
    if (tag.name === 'param') continue;
    if (tag.name === 'returns' || tag.name === 'return') {
      sections.push(`**Returns:** ${value}`);
    } else if (tag.name === 'deprecated') {
      sections.push(`> **Deprecated:** ${value}`);
    } else if (tag.name === 'example') {
      sections.push(['**Example**', '', value].join('\n'));
    } else {
      sections.push(`**@${tag.name}:** ${value}`);
    }
  }

  return sections.filter(Boolean).join('\n\n');
}

function renderJsDocText(node, content) {
  if (!node.jsDoc || node.jsDoc.length === 0) {
    return '';
  }

  return node.jsDoc
    .map((doc) => cleanDocBlock(content.slice(doc.pos, doc.end)))
    .filter(Boolean)
    .map(renderDocBlock)
    .join('\n\n');
}

function getDeclarationNames(node, sourceFile) {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations
      .map((declaration) => declaration.name)
      .filter(ts.isIdentifier)
      .map((identifier) => identifier.getText(sourceFile));
  }

  if ('name' in node && node.name) {
    return [node.name.getText(sourceFile)];
  }

  return [];
}

function getNodeHeading(node, sourceFile) {
  const declarationNames = getDeclarationNames(node, sourceFile);
  if (declarationNames.length > 0) {
    return declarationNames[0];
  }
  return 'anonymous';
}

function getNodeKind(node) {
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isVariableStatement(node)) return 'value';
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isClassDeclaration(node)) return 'class';
  return 'symbol';
}

function getSignature(node, sourceFile) {
  return signaturePrinter.printNode(ts.EmitHint.Unspecified, node, sourceFile).trim();
}

function getMemberName(member, sourceFile) {
  if ('name' in member && member.name) {
    return member.name.getText(sourceFile);
  }
  return member.kind === ts.SyntaxKind.CallSignature ? '(call)' : '(member)';
}

function renderMemberSections(node, content, sourceFile) {
  if (!('members' in node) || !node.members || node.members.length === 0) {
    return '';
  }

  const sections = node.members.map((member) => {
    const parent = getNodeHeading(node, sourceFile);
    const title = getMemberName(member, sourceFile);
    const doc = renderJsDocText(member, content);
    const signature = getSignature(member, sourceFile);

    return [
      `### ${parent}.${title}`,
      ...(doc ? [doc] : []),
      '```ts',
      signature,
      '```',
    ].join('\n\n');
  });

  return sections.join('\n\n');
}

function getRelatedSchemaName(node, sourceFile) {
  if (!ts.isTypeAliasDeclaration(node)) {
    return null;
  }

  const match = node.type.getText(sourceFile).match(/^z\.infer<\s*typeof\s+([A-Za-z0-9_]+)\s*>$/);
  return match ? match[1] : null;
}

function toAnchor(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildReferenceLinks() {
  for (const spec of PAGE_SPECS.filter((entry) => entry.kind === 'declaration')) {
    const { sourceFile } = getPluginApiSourceFile(spec.source);
    const page = `./${spec.output.replace(/\.md$/, '')}`;
    for (const declaration of getExportedDeclarationsFromFile(sourceFile.fileName)) {
      for (const name of getDeclarationNames(declaration, sourceFile)) {
        referenceLinks.set(name, `${page}#${toAnchor(name)}`);
        if (!('members' in declaration) || !declaration.members) continue;
        for (const member of declaration.members) {
          const memberName = getMemberName(member, sourceFile);
          const href = `${page}#${toAnchor(`${name}-${memberName}`)}`;
          referenceLinks.set(`${name}.${memberName}`, href);
          const candidates = referenceMemberLinks.get(memberName) ?? [];
          candidates.push(href);
          referenceMemberLinks.set(memberName, candidates);
        }
      }
    }
  }
}

function assertPluginApiJsDocCoverage() {
  const missing = [];
  for (const spec of PAGE_SPECS.filter((entry) => entry.kind === 'declaration')) {
    const { content, sourceFile } = getPluginApiSourceFile(spec.source);
    for (const declaration of getExportedDeclarationsFromFile(sourceFile.fileName)) {
      const declarationName = getNodeHeading(declaration, sourceFile);
      if (!renderJsDocText(declaration, content)) {
        missing.push(`${spec.source}:${declarationName}`);
      }
      if (!('members' in declaration) || !declaration.members) continue;
      for (const member of declaration.members) {
        if (!renderJsDocText(member, content)) {
          missing.push(`${spec.source}:${declarationName}.${getMemberName(member, sourceFile)}`);
        }
      }
    }
  }
  if (missing.length > 0) {
    throw new Error(`Public Plugin API declarations require JSDoc:\n${missing.map((item) => `- ${item}`).join('\n')}`);
  }
}

function getSourceInfo(filePath) {
  const normalizedPath = path.resolve(filePath);
  const relativePluginPath = path.relative(PLUGIN_API_SRC_DIR, normalizedPath);
  if (!relativePluginPath.startsWith('..') && relativePluginPath !== '') {
    return {
      relativePath: path.relative(process.cwd(), normalizedPath),
      sourceUrl: `${SOURCE_BASE_URL}/${relativePluginPath.replace(/\\/g, '/')}`,
    };
  }

  const relativeContractsPath = path.relative(CONTRACTS_SRC_DIR, normalizedPath);
  if (!relativeContractsPath.startsWith('..') && relativeContractsPath !== '') {
    return {
      relativePath: path.relative(process.cwd(), normalizedPath),
      sourceUrl: `${CONTRACTS_SOURCE_BASE_URL}/${relativeContractsPath.replace(/\\/g, '/')}`,
    };
  }

  return {
    relativePath: path.relative(process.cwd(), normalizedPath),
    sourceUrl: null,
  };
}

function getExportedDeclarationsFromFile(filePath) {
  const { sourceFile } = loadSourceFile(filePath);
  return sourceFile.statements.filter(
    (statement) => hasExportModifier(statement)
      && (
        ts.isInterfaceDeclaration(statement)
        || ts.isTypeAliasDeclaration(statement)
        || ts.isVariableStatement(statement)
        || ts.isFunctionDeclaration(statement)
        || ts.isEnumDeclaration(statement)
        || ts.isClassDeclaration(statement)
      ),
  );
}

function resolveLocalModulePath(baseDir, moduleName) {
  if (!moduleName.startsWith('.')) {
    return null;
  }

  return path.resolve(baseDir, moduleName.replace(/\.js$/, '.ts'));
}

function buildContractsExportMap() {
  const { sourceFile } = getContractsSourceFile('index.ts');

  for (const declaration of sourceFile.statements) {
    if (!ts.isExportDeclaration(declaration)) {
      continue;
    }

    const moduleName = declaration.moduleSpecifier && ts.isStringLiteral(declaration.moduleSpecifier)
      ? declaration.moduleSpecifier.text
      : null;
    const targetFilePath = moduleName ? resolveLocalModulePath(CONTRACTS_SRC_DIR, moduleName) : null;

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      continue;
    }

    if (declaration.exportClause && ts.isNamedExports(declaration.exportClause)) {
      for (const element of declaration.exportClause.elements) {
        const exportedName = element.name.text;
        if (!contractsExportMap.has(exportedName)) {
          contractsExportMap.set(exportedName, targetFilePath);
        }
      }
      continue;
    }

    const targetSourceFile = loadSourceFile(targetFilePath).sourceFile;
    for (const statement of getExportedDeclarationsFromFile(targetFilePath)) {
      for (const exportedName of getDeclarationNames(statement, targetSourceFile)) {
        if (!contractsExportMap.has(exportedName)) {
          contractsExportMap.set(exportedName, targetFilePath);
        }
      }
    }
  }
}

function findExportedDeclaration(filePath, exportName) {
  const cacheKey = `${path.resolve(filePath)}::${exportName}`;
  if (declarationCache.has(cacheKey)) {
    return declarationCache.get(cacheKey);
  }

  const info = loadSourceFile(filePath);
  const declaration = getExportedDeclarationsFromFile(filePath).find((statement) => {
    const names = getDeclarationNames(statement, info.sourceFile);
    return names.includes(exportName);
  }) || null;

  const result = declaration ? { ...info, declaration } : null;
  declarationCache.set(cacheKey, result);
  return result;
}

function getContractsDeclaration(exportName) {
  const targetFilePath = contractsExportMap.get(exportName);
  if (!targetFilePath) {
    return null;
  }

  return findExportedDeclaration(targetFilePath, exportName);
}

function collectPluginApiReExports() {
  const { filePath, sourceFile } = getPluginApiSourceFile('index.ts');
  const exportDeclarations = sourceFile.statements.filter(ts.isExportDeclaration);
  const localExports = [];
  const contractsTypeExports = [];
  const contractsValueExports = [];

  for (const declaration of exportDeclarations) {
    const moduleName = declaration.moduleSpecifier && ts.isStringLiteral(declaration.moduleSpecifier)
      ? declaration.moduleSpecifier.text
      : null;
    const namedExports = declaration.exportClause && ts.isNamedExports(declaration.exportClause)
      ? declaration.exportClause.elements.map((element) => element.name.text)
      : [];

    if (!moduleName || namedExports.length === 0) {
      continue;
    }

    if (moduleName === '@tx5dr/contracts') {
      if (declaration.isTypeOnly) {
        contractsTypeExports.push(...namedExports);
      } else {
        contractsValueExports.push(...namedExports);
      }
      continue;
    }

    localExports.push({ moduleName, namedExports, typeOnly: declaration.isTypeOnly });
  }

  return { filePath, localExports, contractsTypeExports, contractsValueExports };
}

function renderExportedDeclarationPage(spec, locale) {
  const { filePath, content, sourceFile } = getPluginApiSourceFile(spec.source);
  const { strings } = locale;
  const declarations = sourceFile.statements.filter(
    (statement) => hasExportModifier(statement)
      && (
        ts.isInterfaceDeclaration(statement)
        || ts.isTypeAliasDeclaration(statement)
        || ts.isVariableStatement(statement)
        || ts.isFunctionDeclaration(statement)
      ),
  );

  const sourceInfo = getSourceInfo(filePath);
  const intro = [
    `# ${spec.title}`,
    '',
    spec.description[locale.id],
    '',
  ];

  const toc = declarations.map((declaration) => {
    const name = getNodeHeading(declaration, sourceFile);
    return `- [${name}](#${toAnchor(name)})`;
  });

  const sections = declarations.map((declaration) => {
    const name = getNodeHeading(declaration, sourceFile);
    const doc = renderJsDocText(declaration, content);
    const kind = getNodeKind(declaration);
    const signature = getSignature(declaration, sourceFile);
    const memberSections = renderMemberSections(declaration, content, sourceFile);

    const body = [
      `## ${name}`,
      '',
      `- ${strings.kind}: \`${kind}\``,
      `- ${strings.source}: [${path.basename(filePath)}](${sourceInfo.sourceUrl})`,
      '',
      doc || strings.noDocs,
      '',
      '```ts',
      signature,
      '```',
    ];

    if (memberSections) {
      body.push('', memberSections);
    }

    return body.join('\n');
  });

  return [...intro, `## ${strings.exports}`, '', ...toc, '', ...sections, ''].join('\n');
}

function renderReExportsPage(spec, locale) {
  const { localExports, contractsTypeExports, contractsValueExports } = collectPluginApiReExports();
  const { strings } = locale;
  const separator = locale.id === 'en' ? ', ' : '、';

  return [
    `# ${spec.title}`,
    '',
    spec.description[locale.id],
    '',
    `## ${strings.localExports}`,
    '',
    ...localExports.map((entry) => `- \`${entry.moduleName}\`: ${entry.namedExports.map((name) => `\`${name}\``).join(separator)}`),
    '',
    `## ${strings.contractTypeExports}`,
    '',
    ...contractsTypeExports.map((name) => `- [\`${name}\`](./contracts#${toAnchor(name)})`),
    '',
    `## ${strings.contractValueExports}`,
    '',
    ...contractsValueExports.map((name) => `- [\`${name}\`](./contracts#${toAnchor(name)})`),
    '',
  ].join('\n');
}

function renderContractsExportSection(exportName, locale) {
  const detail = getContractsDeclaration(exportName);
  const { strings } = locale;

  if (!detail) {
    return [
      `## ${exportName}`,
      '',
      `- ${strings.kind}: \`unresolved\``,
      `- ${strings.source}: \`@tx5dr/contracts\``,
      '',
      strings.unresolvedExport,
    ].join('\n');
  }

  const { filePath, content, sourceFile, declaration } = detail;
  const relatedSchemaName = getRelatedSchemaName(declaration, sourceFile);
  const relatedSchema = relatedSchemaName ? findExportedDeclaration(filePath, relatedSchemaName) : null;
  const doc = renderJsDocText(declaration, content)
    || (relatedSchema ? renderJsDocText(relatedSchema.declaration, relatedSchema.content) : '');
  const kind = getNodeKind(declaration);
  const signature = getSignature(declaration, sourceFile);
  const schemaSignature = relatedSchema
    ? getSignature(relatedSchema.declaration, relatedSchema.sourceFile)
    : '';
  const sourceInfo = getSourceInfo(filePath);
  const memberSections = renderMemberSections(declaration, content, sourceFile);

  const body = [
    `## ${exportName}`,
    '',
    `- ${strings.kind}: \`${kind}\``,
    `- ${strings.source}: [${path.relative(CONTRACTS_SRC_DIR, filePath).replace(/\\/g, '/')}](${sourceInfo.sourceUrl})`,
    ...(relatedSchemaName ? [`- ${strings.relatedSchema}: \`${relatedSchemaName}\``] : []),
    '',
    doc || strings.noDocs,
    '',
    ...(schemaSignature
      ? [
        `### ${strings.dataStructure}`,
        '',
        '```ts',
        schemaSignature,
        '```',
        '',
        `### ${strings.typeDeclaration}`,
        '',
        '```ts',
        signature,
        '```',
      ]
      : [
        '```ts',
        signature,
        '```',
      ]),
  ];

  if (memberSections) {
    body.push('', memberSections);
  }

  return body.join('\n');
}

function renderContractsExportsPage(spec, locale) {
  const { contractsTypeExports, contractsValueExports } = collectPluginApiReExports();
  const { strings } = locale;

  return [
    `# ${spec.title}`,
    '',
    spec.description[locale.id],
    '',
    `## ${strings.typeExports}`,
    '',
    ...contractsTypeExports.map((name) => `- [${name}](#${toAnchor(name)})`),
    '',
    `## ${strings.valueExports}`,
    '',
    ...contractsValueExports.map((name) => `- [${name}](#${toAnchor(name)})`),
    '',
    ...contractsTypeExports.map((name) => renderContractsExportSection(name, locale)),
    '',
    ...contractsValueExports.map((name) => renderContractsExportSection(name, locale)),
    '',
  ].join('\n');
}

function writeOutput(outputDir, relativePath, content) {
  const outputPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${content.trimEnd()}\n`);
}

function renderReferenceIndex(locale) {
  const { strings } = locale;
  const links = PAGE_SPECS.map((spec) => `- [${spec.title}](./${spec.output.replace(/\.md$/, '')})`);
  return [
    `# ${strings.indexTitle}`,
    '',
    strings.indexIntro,
    '',
    `## ${strings.pageList}`,
    '',
    ...links,
    '',
    `## ${strings.update}`,
    '',
    strings.updateLead,
    '',
    '```bash',
    'npm run docs:sync-plugin-api',
    '```',
    '',
    `${strings.branchLead} \`${SOURCE_BRANCH}\`${strings.sentenceEnd}`,
    '',
    `${strings.sourceDirLead} \`${SOURCE_ENV_NAME}\`${strings.sentenceEnd}`,
    '',
  ].join('\n');
}

function main() {
  assertSourceAvailable();
  buildContractsExportMap();
  buildReferenceLinks();
  assertPluginApiJsDocCoverage();

  for (const locale of REFERENCE_LOCALES) {
    fs.rmSync(locale.outputDir, { recursive: true, force: true });
    fs.mkdirSync(locale.outputDir, { recursive: true });

    for (const spec of PAGE_SPECS) {
      const content = spec.kind === 're-exports'
        ? renderReExportsPage(spec, locale)
        : spec.kind === 'contracts'
          ? renderContractsExportsPage(spec, locale)
          : renderExportedDeclarationPage(spec, locale);
      writeOutput(locale.outputDir, spec.output, content);
    }

    writeOutput(locale.outputDir, 'index.md', renderReferenceIndex(locale));
  }
  process.stdout.write(`Generated ${REFERENCE_LOCALES.length} Plugin API reference locales from ${SOURCE_DIR}\n`);
}

main();
