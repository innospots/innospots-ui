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
import {Modal} from 'antd';
import useI18n from '@/common/hooks/useI18n';
import styles from './index.less';

require('codemirror/mode/clike/clike');
require('codemirror/mode/shell/shell');
require('codemirror/mode/python/python');
require('codemirror/mode/groovy/groovy');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');

const codeMirror = require('codemirror/lib/codemirror');

const CodeEditorModal = ({code, visible, isViewInfo, codeType, onSubmit, ...rest}) => {
  const {t} = useI18n(['workflow', 'common']);
  const editor = useRef(null);
  const createTimer = useRef();
  const editorContainer = useRef();

  useEffect(() => {
    if (visible) {
      createCodeEditor(codeType, code);
    } else {
      destroySQLEditor();
    }
  }, [visible, code, codeType]);

  const destroySQLEditor = () => {
    try {
      if (createTimer.current) {
        clearTimeout(createTimer.current);
        createTimer.current = null;
      }

      if (editor.current) {
        editor.current.toTextArea();
        editor.current = null;
        editorContainer.current.style.display = 'none';
      }
    } catch (e) {
    }
  };

  const createCodeEditor = (type, value) => {
    const _create = () => {
      const queryTextarea = editorContainer.current;
      queryTextarea.style.display = '';
      editor.current = codeMirror.fromTextArea(queryTextarea, {
        readOnly: !!isViewInfo,
        mode: type || 'text/javascript',
        theme: 'eclipse',
        width: '100%',
        height: '100%',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter',],
      });

      if (value) {
        editor.current.doc.setValue(value);
      }
    };

    if (editor.current) {
      editor.current.toTextArea();
      _create();
    } else {
      if (createTimer.current) {
        clearTimeout(createTimer.current);
        createTimer.current = null;
      }

      createTimer.current = setTimeout(_create, 500);
    }
  };

  const saveCode = () => {
    if (onSubmit && editor.current) {
      onSubmit(editor.current.doc.getValue());
    }
  };

  return (
    <Modal
      width={840}
      open={visible}
      title={t('workflow.script.button.edit')}
      maskClosable={false}
      onOk={saveCode}
      okButtonProps={{
        style: {display: isViewInfo ? 'none' : ''},
      }}
      {...rest}
    >
      <div className={styles.codeContainer}>
        <textarea
          ref={editorContainer}
          style={{display: 'none'}}
          placeholder={t('common.input.placeholder')}
        />
      </div>
    </Modal>
  );
};

export default React.memo(CodeEditorModal);
