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

import React, {useEffect, useMemo, useState, useRef} from 'react';
import {useControllableValue} from 'ahooks';
import {Row, Col} from 'antd';
import _ from 'lodash';

require('codemirror/mode/clike/clike');
require('codemirror/mode/shell/shell');
require('codemirror/mode/python/python');
require('codemirror/mode/groovy/groovy');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');

import {FullscreenOutlined} from '@ant-design/icons';
import useI18n from '@/common/hooks/useI18n';
import CodeEditorModal from './CodeEditorModal';

import styles from './index.less';

const codeMirror = require('codemirror/lib/codemirror');

const CODE_MODE = {
  'SQL': 'text/x-sql',
  'JAVA': 'text/x-java',
  'SHELL': 'text/x-sh',
  'PYTHON': 'text/x-python',
  'GROOVY': 'text/x-groovy',
  'JAVASCRIPT': 'text/javascript',
};

const CodeEditor = ({schema, readOnly, addons, viewType, ...rest}) => {

  const {t} = useI18n(['workflow', 'common']);

  const editor = useRef(null);
  const createTimer = useRef();
  const editorContainer = useRef();
  const [editorState, setEditorState] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);

  const [editorValue, setEditorValue] = useControllableValue(rest);

  const formData = addons?.formData || {};
  const dataSourceValue = formData[schema.dependencies];

  const codeType = useMemo(() => {
    let type;
    if (schema.isFixedType) {
      type = schema.codeType;
    } else if (dataSourceValue) {
      type = dataSourceValue;
    }
    return type || 'JAVA'
  }, [ dataSourceValue, schema.codeType ])

  useEffect(() => {
    createCodeEditor(codeType, editorValue);
  }, [codeType]);

  useEffect(() => {
    if (editorValue && editor.current && editor.current.doc.getValue() !== editorValue) {
      editor.current.doc.setValue(editorValue);
    }
  }, [editorValue, editor.current]);

  useEffect(() => {
    return destroyCodeEditor;
  }, []);

  const toggleEditorModal = () => {
    setEditorVisible(!editorVisible);
  };

  const updateCurAction = (code) => {
    if (code && editor.current) {
      editor.current.doc.setValue(code);
    }
    setEditorVisible(false);
  };

  const handleCodeChange = _.debounce((cm, changes) => {
    setEditorValue(cm.doc.getValue());
  }, 500);

  const createCodeEditor = _.debounce((codeType, value) => {
    const _create = () => {
      const queryTextarea = editorContainer.current;

      if (!queryTextarea) return;

      queryTextarea.style.display = '';
      editor.current = codeMirror.fromTextArea(queryTextarea, {
        readOnly,
        mode: CODE_MODE[codeType] || 'text/javascript',
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
      // @ts-ignore
      editor.current.on('changes', handleCodeChange);

      if (value) {
        editor.current.doc.setValue(value);
      }

      setEditorState(editor.current);
    };

    if (editor.current) {
      editor.current.off('changes', handleCodeChange);
      editor.current.toTextArea();
      _create();
    } else {
      if (createTimer.current) {
        clearTimeout(createTimer.current);
        createTimer.current = null;
      }

      createTimer.current = setTimeout(_create, 100);
    }
  }, 200);

  const destroyCodeEditor = () => {
    if (createTimer.current) {
      clearTimeout(createTimer.current);
      createTimer.current = null;
    }
    if (editor.current) {
      editor.current.toTextArea();
      editor.current = null;
      try {
        const queryTextarea = editorContainer.current;
        queryTextarea.style.display = 'none';
      } catch (e) {
      }
    }
  };

  const getCodeEditorModal = () => {
    let action;
    if (editor.current && editorVisible) {
      action = editor.current.doc.getValue();
    }

    return (
      <CodeEditorModal
        code={action}
        isViewInfo={readOnly}
        visible={editorVisible}
        codeType={CODE_MODE[codeType]}
        onSubmit={updateCurAction}
        onCancel={toggleEditorModal}
      />
    );
  };

  return (
      <div className="form-item-wrapper">
        <Row justify="end">
          <Col>
            <span className="cur-btn" onClick={toggleEditorModal}>
                <FullscreenOutlined/> {t('workflow.script.button.expand')}
            </span>
          </Col>
        </Row>
        <div className={styles.codeContainer}>
          <textarea
            ref={editorContainer}
            style={{display: 'none'}}
            placeholder={t('common.input.placeholder')}
          />
        </div>
        {getCodeEditorModal()}
    </div>
  );
};

export default CodeEditor;
