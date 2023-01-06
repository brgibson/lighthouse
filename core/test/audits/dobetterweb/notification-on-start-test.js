/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import assert from 'assert/strict';

import NotificationOnStart from '../../../audits/dobetterweb/notification-on-start.js';
import {networkRecordsToDevtoolsLog} from '../../network-records-to-devtools-log.js';

describe('UX: notification audit', () => {
  it('fails when notification has been automatically requested', async () => {
    const records = [
      {url: 'https://example.com/'},
      {url: 'https://example2.com/two'},
      {url: 'http://abc.com/'},
      {url: 'https://example.com/two'},
    ];
    const text = 'Do not request notification permission without a user action.';
    const context = {computedCache: new Map()};
    const auditResult = await NotificationOnStart.audit({
      ConsoleMessages: [
        {source: 'violation', url: 'https://example.com/', text},
        {source: 'violation', url: 'https://example2.com/two', text},
        {source: 'violation', url: 'http://abc.com/', text: 'No document.write'},
        {source: 'deprecation', url: 'https://example.com/two'},
      ],
      SourceMaps: [],
      Scripts: [],
      devtoolsLogs: {defaultPass: networkRecordsToDevtoolsLog(records)},
      URL: {},
    }, context);
    assert.equal(auditResult.score, 0);
    assert.equal(auditResult.details.items.length, 2);
    assert.deepStrictEqual(auditResult.details.items.map(item => item.entity),
      ['example.com', 'example2.com']);
  });

  it('passes when notification has not been automatically requested', async () => {
    const context = {computedCache: new Map()};
    const auditResult = await NotificationOnStart.audit({
      ConsoleMessages: [],
      SourceMaps: [],
      Scripts: [],
      devtoolsLogs: {defaultPass: []},
      URL: {},
    }, context);
    assert.equal(auditResult.score, 1);
    assert.equal(auditResult.details.items.length, 0);
  });
});
