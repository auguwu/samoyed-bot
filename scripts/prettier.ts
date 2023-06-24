/*
 * 🐻‍❄️� samoyed-bot: Automative Bluesky bot to post samoyed pics every hour!
 * Copyright (c) 2023 Noel Towa <cutie@floofy.dev>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { readFile, writeFile } from 'fs/promises';
import { relative, resolve } from 'path';
import { globby } from 'globby';
import getLogger from './util/log';
import assert from 'assert';

const { format, default: prettier } = await import('prettier');
const EXT = ['json', 'yaml', 'yml', 'ts', 'md'] as const;
const log = getLogger('prettier');

const config = await prettier.resolveConfig(resolve(process.cwd(), '.prettierrc.json'));
assert(config !== null, "couldn't resolve .prettierrc.json!");

for (const file of await globby(
    EXT.map((f) => `**/*.${f}`),
    { onlyFiles: true, throwErrorOnBrokenSymbolicLink: true, gitignore: true }
)) {
    const start = Date.now();
    log.await(`./${relative(process.cwd(), file)}`);

    const info = await prettier.getFileInfo(file, { resolveConfig: true });
    if (info.ignored || info.inferredParser === null) {
        log.warn(`...Ignoring since the file was ignored or the parser couldn't be inferred`);
        continue;
    }

    const src = format(await readFile(file, 'utf-8'), { ...config, parser: info.inferredParser! });
    await writeFile(resolve(process.cwd(), file), src, { encoding: 'utf-8' });

    log.success(`...took ${Date.now() - start}ms to format!`);
}
