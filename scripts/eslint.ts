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

import { startGroup, endGroup, error, warning } from '@actions/core';
import { fileURLToPath } from 'url';
import getLogger from './util/log';
import { dirname, relative, resolve } from 'path';
import { ESLint } from 'eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));
const paths = ['**/*.ts', 'scripts/**/*.ts'] as const;
const isCI = process.env.CI !== undefined;
const log = getLogger('eslint');

isCI ? startGroup('Linting with pattern [**/*.ts]') : log.await('Linting with pattern [**/*.ts]');
const eslint = new ESLint({
    useEslintrc: true,
    fix: !isCI
});

let now = Date.now();
const results = await eslint.lintFiles(['**/*.ts']);
for (const result of results) {
    const path = relative(process.cwd(), result.filePath);
    const hasWarnings = result.warningCount > 0;
    const hasErrors = result.errorCount > 0;

    log[hasWarnings ? 'warn' : hasErrors ? 'errors' : 'success'](`./${path} [~${Date.now() - now}ms]`);
    for (const message of result.messages) {
        if (isCI) {
            const method = message.severity === 1 ? warning : error;
            method(`[eslint] ${message.message} (${message.ruleId})`, {
                endColumn: message.endColumn,
                endLine: message.endLine,
                file: result.filePath,
                startLine: message.line,
                startColumn: message.column
            });
        } else {
            const method = message.severity === 1 ? log.warn : log.error;
            method(`${message.message} (${message.ruleId}) [${result.filePath}:${message.line}:${message.column}]`);
        }
    }

    now = Date.now();
}

isCI && endGroup();
