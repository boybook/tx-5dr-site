import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const SOURCE_ENV_NAME = 'TX5DR_SOURCE_DIR';
const DEFAULT_SOURCE_DIR = path.resolve(process.cwd(), '../tx-5dr');
const SOURCE_DIR = path.resolve(process.env[SOURCE_ENV_NAME] || DEFAULT_SOURCE_DIR);
const PLUGIN_API_SRC_DIR = path.join(SOURCE_DIR, 'packages/plugin-api/src');
const CONTRACTS_SRC_DIR = path.join(SOURCE_DIR, 'packages/contracts/src');
const OUTPUT_DIR = path.resolve(process.cwd(), 'docs/plugin-api/reference');

function detectSourceBranch() {
  try {
    return execFileSync('git', ['-C', SOURCE_DIR, 'branch', '--show-current'], { encoding: 'utf8' }).trim() || 'main';
  } catch {
    return 'main';
  }
}

const SOURCE_BRANCH = detectSourceBranch();
const SOURCE_BASE_URL = `https://github.com/boybook/tx-5dr/blob/${SOURCE_BRANCH}/packages/plugin-api/src`;
const CONTRACTS_SOURCE_BASE_URL = `https://github.com/boybook/tx-5dr/blob/${SOURCE_BRANCH}/packages/contracts/src`;

const PAGE_SPECS = [
  {
    kind: 'declaration',
    source: 'definition.ts',
    output: 'definition.md',
    title: 'PluginDefinition',
    description: '该页对应插件入口文件的默认导出结构。',
  },
  {
    kind: 'declaration',
    source: 'context.ts',
    output: 'context.md',
    title: 'PluginContext',
    description: '该页对应宿主在运行时注入给插件的上下文对象。',
  },
  {
    kind: 'declaration',
    source: 'hooks.ts',
    output: 'hooks.md',
    title: 'PluginHooks',
    description: '该页列出插件可注册的 Hook 入口。',
  },
  {
    kind: 'declaration',
    source: 'runtime.ts',
    output: 'runtime.md',
    title: 'StrategyRuntime',
    description: '该页对应 `strategy` 类型插件的运行时接口。',
  },
  {
    kind: 'declaration',
    source: 'helpers.ts',
    output: 'helpers.md',
    title: 'Helper Interfaces',
    description: '该页列出 `KVStore`、日志、定时器、操作员控制等辅助接口。',
  },
  {
    kind: 'declaration',
    source: 'settings.ts',
    output: 'settings.md',
    title: 'Host Settings',
    description: '该页列出 `ctx.settings` 可访问的宿主设置命名空间与类型。',
  },
  {
    kind: 're-exports',
    source: 'index.ts',
    output: 're-exports.md',
    title: 'Re-exports',
    description: '该页列出 `index.ts` 对外转出的本包接口和 contracts 类型。',
  },
  {
    kind: 'contracts',
    output: 'contracts.md',
    title: 'Contracts Re-exports',
    description: '该页列出 `@tx5dr/plugin-api` 转出的 `@tx5dr/contracts` 类型和值定义。',
  },
];

const sourceFileCache = new Map();
const contractsExportMap = new Map();
const declarationCache = new Map();

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

function renderJsDocText(node, content) {
  if (!node.jsDoc || node.jsDoc.length === 0) {
    return '';
  }

  return node.jsDoc
    .map((doc) => cleanDocBlock(content.slice(doc.pos, doc.end)))
    .filter(Boolean)
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
  return node.getText(sourceFile).trim();
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
    const title = getMemberName(member, sourceFile);
    const doc = renderJsDocText(member, content);
    const signature = member.getText(sourceFile).trim();

    return [
      `### ${title}`,
      doc || '未提供额外注释。',
      '```ts',
      signature,
      '```',
    ].join('\n\n');
  });

  return ['## 成员', ...sections].join('\n\n');
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

function renderExportedDeclarationPage(spec) {
  const { filePath, content, sourceFile } = getPluginApiSourceFile(spec.source);
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
    spec.description,
    '',
    `> 自动生成自 \`${sourceInfo.relativePath}\``,
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
      `- Kind: \`${kind}\``,
      `- Source: [${path.basename(filePath)}](${sourceInfo.sourceUrl})`,
      '',
      doc || '未提供额外注释。',
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

  return [...intro, '## 导出', '', ...toc, '', ...sections, ''].join('\n');
}

function renderReExportsPage(spec) {
  const { filePath, localExports, contractsTypeExports, contractsValueExports } = collectPluginApiReExports();
  const sourceInfo = getSourceInfo(filePath);

  return [
    `# ${spec.title}`,
    '',
    spec.description,
    '',
    `> 自动生成自 \`${sourceInfo.relativePath}\``,
    '',
    '## plugin-api 本地导出',
    '',
    ...localExports.map((entry) => `- \`${entry.moduleName}\`: ${entry.namedExports.map((name) => `\`${name}\``).join('、')}`),
    '',
    '## 来自 @tx5dr/contracts 的类型导出',
    '',
    ...contractsTypeExports.map((name) => `- [\`${name}\`](./contracts#${toAnchor(name)})`),
    '',
    '## 来自 @tx5dr/contracts 的值导出',
    '',
    ...contractsValueExports.map((name) => `- [\`${name}\`](./contracts#${toAnchor(name)})`),
    '',
  ].join('\n');
}

function renderContractsExportSection(exportName) {
  const detail = getContractsDeclaration(exportName);

  if (!detail) {
    return [
      `## ${exportName}`,
      '',
      '- Kind: `unresolved`',
      '- Source: `@tx5dr/contracts`',
      '',
      '未能解析该导出在 `packages/contracts/src` 中的源定义。',
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
    `- Kind: \`${kind}\``,
    `- Source: [${path.relative(CONTRACTS_SRC_DIR, filePath).replace(/\\/g, '/')}](${sourceInfo.sourceUrl})`,
    ...(relatedSchemaName ? [`- Related schema: \`${relatedSchemaName}\``] : []),
    '',
    doc || '未提供额外注释。',
    '',
    ...(schemaSignature
      ? [
        '### 数据结构',
        '',
        '```ts',
        schemaSignature,
        '```',
        '',
        '### 类型导出',
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

function renderContractsExportsPage(spec) {
  const { filePath, contractsTypeExports, contractsValueExports } = collectPluginApiReExports();
  const contractsIndexPath = path.join(CONTRACTS_SRC_DIR, 'index.ts');

  return [
    `# ${spec.title}`,
    '',
    spec.description,
    '',
    `> 自动生成自 \`${getSourceInfo(filePath).relativePath}\` 与 \`${path.relative(process.cwd(), contractsIndexPath)}\``,
    '',
    '## 类型导出',
    '',
    ...contractsTypeExports.map((name) => `- [${name}](#${toAnchor(name)})`),
    '',
    '## 值导出',
    '',
    ...contractsValueExports.map((name) => `- [${name}](#${toAnchor(name)})`),
    '',
    ...contractsTypeExports.map((name) => renderContractsExportSection(name)),
    '',
    ...contractsValueExports.map((name) => renderContractsExportSection(name)),
    '',
  ].join('\n');
}

function writeOutput(relativePath, content) {
  const outputPath = path.join(OUTPUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function renderReferenceIndex() {
  const links = PAGE_SPECS.map((spec) => `- [${spec.title}](./${spec.output.replace(/\.md$/, '')})`);
  return [
    '# 插件 API Reference',
    '',
    '这一组页面由脚本自动从 `packages/plugin-api/src` 与 `packages/contracts/src` 生成，用于查阅插件公开接口及其转出的共享类型。',
    '',
    '## 页面目录',
    '',
    ...links,
    '',
    '## 更新方式',
    '',
    '在站点仓库根目录执行：',
    '',
    '```bash',
    'npm run docs:sync-plugin-api',
    '```',
    '',
    `当前默认读取的主仓库分支是 \`${SOURCE_BRANCH}\`。`,
    '',
    `如果 TX-5DR 主仓库不在默认的 \`../tx-5dr\`，请先设置环境变量 \`${SOURCE_ENV_NAME}\`。`,
    '',
  ].join('\n');
}

function main() {
  assertSourceAvailable();
  buildContractsExportMap();
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const spec of PAGE_SPECS) {
    const content = spec.kind === 're-exports'
      ? renderReExportsPage(spec)
      : spec.kind === 'contracts'
        ? renderContractsExportsPage(spec)
        : renderExportedDeclarationPage(spec);
    writeOutput(spec.output, content);
  }

  writeOutput('index.md', renderReferenceIndex());
  process.stdout.write(`Generated plugin API docs from ${SOURCE_DIR}\n`);
}

main();
