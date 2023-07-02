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

import React, { useRef, useEffect } from 'react';
import _ from 'lodash';

import type { FormItemProps } from './types';

import styles from '../index.less';

require('codemirror/mode/sql/sql');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');

const codeMirror = require('codemirror/lib/codemirror');

let changeTimer;

const SqlEditor: React.FC<FormItemProps> = (props) => {
    const { value, schema, readOnly, onChange } = props;

    const editor = useRef(null);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        createSQLEditor(value);
    }, [value]);

    useEffect(() => {
        return destroySQLEditor;
    }, []);

    const handleSQLContentChange = _.debounce((cm, changes) => {
        onChange?.(cm.doc.getValue());
        // const curInputFields = nodeInfo.inputFields
        // if (curInputFields && curInputFields.length && !queryFields.length) {
        //     setQueryFields(_.map(curInputFields, item => ({
        //         code: item.code,
        //         value: item.code,
        //         title: item.name,
        //         nodeKey: item.fieldKey
        //     })))
        // } else {
        //     matchQueryFields(cm.doc.getValue())
        // }
    }, 500);

    const destroySQLEditor = () => {
        if (editor.current) {
            editor.current.off('change', handleSQLContentChange);
            editor.current.off('keypress', handleEditorChange);
            editor.current.toTextArea();
            editor.current = null;
            const queryTextarea = textareaRef.current;
            if (queryTextarea) {
                queryTextarea.style.display = 'none';
            }
        }
    };

    const handleEditorChange = (editor, change) => {
        if (changeTimer) {
            clearTimeout(changeTimer);
            changeTimer = null;
        }

        changeTimer = setTimeout(() => {
            editor.showHint();
        }, 200);
    };

    const createSQLEditor = (value) => {
        if (editor.current) {
            // @ts-ignore
            // editor.current.doc.setValue(value)
            return;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // @ts-ignore
        timerRef.current = setTimeout(() => {
            try {
                const queryTextarea = textareaRef.current;
                // @ts-ignore
                queryTextarea.style.display = '';

                editor.current = codeMirror.fromTextArea(queryTextarea, {
                    mode: 'text/x-sql',
                    theme: 'eclipse',
                    width: '100%',
                    height: '100%',
                    lineNumbers: true,
                    lineWrapping: true,
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    foldGutter: true,
                    readOnly: readOnly,
                    gutters: [
                        'CodeMirror-lint-markers',
                        'CodeMirror-linenumbers',
                        'CodeMirror-foldgutter',
                    ],
                });

                // @ts-ignore
                editor.current.on('changes', handleSQLContentChange);
                editor.current.on('keypress', handleEditorChange);

                if (value) {
                    // @ts-ignore
                    editor.current.doc.setValue(value);
                    // @ts-ignore
                    handleSQLContentChange(editor.current);
                }
            } catch (e) {}
        }, 500);
    };

    return (
        <div className={styles.codeContainer}>
            <textarea
                ref={textareaRef}
                style={{ display: 'none' }}
                placeholder={schema?.placeholder}
            />
        </div>
    );
};

export default SqlEditor;
