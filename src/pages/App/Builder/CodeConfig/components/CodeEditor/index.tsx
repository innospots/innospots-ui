/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, {useEffect, useRef} from 'react';
import { Button, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import {useModel} from 'umi';

require('codemirror/mode/clike/clike');
require('codemirror/theme/gruvbox-dark.css');

import styles from './style.less';

const codeMirror = require('codemirror/lib/codemirror');

let createTimer;

const CodeEditor = ({ onAppExecute }) => {

  const {
    appExecuteRequest
  } = useModel('App', model => ({
    appExecuteRequest: model.appExecuteRequest
  }));

  const editor = useRef(null);
  const editorContainer = useRef();

  useEffect(() => {
    createCodeEditor()
  }, []);

  const handleCodeChange = () => {

  }

  const handleAppExecute = () => {
    onAppExecute?.({
      action: editor.current?.doc?.getValue(),
      actionScriptType: 'JAVA'
    })
  }

  const createCodeEditor = (value?: string) => {
    const _create = () => {
      try {
        const queryTextarea = editorContainer.current;
        queryTextarea.style.display = '';
        editor.current = codeMirror.fromTextArea(queryTextarea, {
          mode: 'text/x-java',
          theme: 'gruvbox-dark',
          width: '100%',
          height: '100%',
          foldGutter: true,
          lineNumbers: true,
          lineWrapping: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter',],
        });
        // @ts-ignore
        editor.current.on('changes', handleCodeChange);

        if (value) {
          editor.current.doc.setValue(value);
        }
      } catch (e) {}
    };

    if (editor.current) {
      editor.current.off('changes', handleCodeChange);
      editor.current.toTextArea();
      _create();
    } else {
      if (createTimer) {
        clearTimeout(createTimer);
        createTimer = null;
      }

      createTimer = setTimeout(_create, 500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<PlayCircleOutlined />}
            loading={appExecuteRequest.loading}
            onClick={handleAppExecute}
          >运行</Button>
          <Button type="text" size="small" icon={<PauseCircleOutlined />}>停止</Button>
          <Button
            type="text"
            size="small"
            icon={<img src={require('./m.svg')} style={{width: 14, marginRight: 8}} />}
            onClick={() => editor.current.refresh()}
          >美化</Button>
        </Space>
      </div>
      <div className={styles.codeEditor}>
        <textarea
          ref={editorContainer}
          style={{ display: 'none' }}
          placeholder="请输入"
        />
      </div>
    </div>
  )
}

export default CodeEditor