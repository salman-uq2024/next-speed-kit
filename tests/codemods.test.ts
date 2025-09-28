import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { getCodemod } from '../src/codemods/index';
import { runCodemod } from '../src/codemods/runner';

const createTempProject = async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'nsk-codemod-'));
  return dir;
};

describe('codemod transformations', () => {
  it('adds dimensions to next/image usage', async () => {
    const projectDir = await createTempProject();
    const filePath = path.join(projectDir, 'page.tsx');
    await writeFile(
      filePath,
      `import Image from 'next/image';\nexport default function Page() {\n  return <Image src="/hero.png" alt="Hero" />;\n}\n`
    );

    const mod = getCodemod('next-image-dimensions');
    expect(mod).toBeDefined();

    await runCodemod({ codemod: mod!, targetDir: projectDir, dryRun: false });

    const output = await readFile(filePath, 'utf8');
    expect(output).toContain('width={640}');
    expect(output).toContain('height={360}');
  });

  it('converts heavy imports to dynamic()', async () => {
    const projectDir = await createTempProject();
    const filePath = path.join(projectDir, 'heavy.tsx');
    await writeFile(
      filePath,
      `import ReactMarkdown from 'react-markdown';\nexport default function Heavy() {\n  return <ReactMarkdown># hello</ReactMarkdown>;\n}\n`
    );

    const mod = getCodemod('dynamic-heavy-modules');
    expect(mod).toBeDefined();

    await runCodemod({ codemod: mod!, targetDir: projectDir, dryRun: false });

    const output = await readFile(filePath, 'utf8');
    expect(output).toContain("import dynamic from 'next/dynamic';");
    expect(output).toContain("const ReactMarkdown = dynamic(() => import('react-markdown')");
    expect(output).toContain('ssr: false');
  });
});
