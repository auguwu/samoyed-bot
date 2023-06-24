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

import 'dotenv/config';

import { hasOwnProperty, property } from '@noelware/utils';
import { serializers } from '@augu/pino-transport';
import { BskyAgent } from '@atproto/api';
import pino from 'pino';

const transports: pino.TransportTargetOptions[] = [
    {
        target: '@augu/pino-transport',
        level: property(process.env, 'LOG_LEVEL', 'info')!,
        options: {
            json:
                hasOwnProperty(process.env, 'LOG_IN_JSON') &&
                /^(yes|true|1|si*|enable|enabled)$/g.test(process.env.LOG_IN_JSON!)
        }
    }
];

const log = pino({
    name: 'samoyed',
    level: property(process.env, 'LOG_LEVEL', 'info')!,
    serializers: {
        error: serializers.createErrorSerializer(),
        err: serializers.createErrorSerializer()
    },
    transport: {
        targets: transports
    }
});

if (!hasOwnProperty(process.env, 'SAMOYED_IDENTIFIER')) {
    log.fatal('Missing `SAMOYED_IDENTIFIER` environment variable.');
    process.exit(1);
}

if (!hasOwnProperty(process.env, 'SAMOYED_PASSWORD')) {
    log.fatal('Missing `SAMOYED_PASSWORD` environment variable.');
    process.exit(1);
}

const service = hasOwnProperty(process.env, 'SAMOYED_BSKY_SERVICE') ? process.env.SAMOYED_BSKY_SERVICE! : '';
log.info(
    { service: service || 'default', identifier: process.env.SAMOYED_IDENTIFIER },
    `Connecting to service with identifier`
);

const agent = new BskyAgent({ service });
log.info({ service: service || 'default' }, 'connecting to atproto via service');

await agent.login({
    identifier: process.env.SAMOYED_IDENTIFIER!,
    password: process.env.SAMOYED_PASSWORD!
});
