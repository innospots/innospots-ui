import _ from 'lodash';
import AceEditor from 'react-ace';
import { useDeepCompareEffect } from 'ahooks';
import React, { useState, useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';

import 'ace-builds/src-noconflict/snippets/sql'
import 'ace-builds/src-noconflict/snippets/json'
import 'ace-builds/src-noconflict/snippets/java'
import 'ace-builds/src-noconflict/snippets/python'
import 'ace-builds/src-noconflict/snippets/groovy'
import 'ace-builds/src-noconflict/snippets/javascript'
import 'ace-builds/src-noconflict/snippets/powershell'

import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-powershell';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/ext-language_tools';

import beautify from 'ace-builds/src-noconflict/ext-beautify'

import styles from './index.less';
import { CustomCompleter } from './customCompleter';

const editorProps = {
  width: '100%',
  height: '100%',
  mode: 'java',
  theme: 'tomorrow',
  fontSize: 14,
  lineHeight: 24,
  wrapEnabled: true,
  setOptions: {
    tabSize: 2,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
  },
};

const AceCodeEditor: React.FC<any> = forwardRef((props, ref) => {
  const editorRef = useRef<any>();
  const [newProps, setNewProps] = useState(editorProps);
  useDeepCompareEffect(() => {
    setNewProps(_.merge({}, newProps, props));
  }, [props]);

  const editorKey = useMemo(() => {
    return `${props.name || 'AceCodeEditor'}-${+new Date()}`;
  }, [ props.name ]);

  useImperativeHandle(ref, () => {
    return {
      beautifyCode() {
        beautify.beautify(editorRef.current.editor.session);
      }
    };
  }, []);

  useEffect(() => {
    const { completer, completions } = props;
    if (editorRef.current && completer && completions?.length) {
      const customCompleter = new CustomCompleter(completions);
      // customCompleter.prefix = props.completerPrefix;

      const completers = editorRef.current.editor.completers;
      const hasCompleter = completers.find(item => item.id === customCompleter.id);
      if (!hasCompleter) {
        completers.push(customCompleter);
      }
    }
  }, [ editorRef.current, props.completer, props.completions ]);

  return (
    <div className={[styles.editor, 'AceCodeEditor'].join(' ')}>
      <AceEditor ref={editorRef} key={editorKey} {...newProps} />
    </div>
  );
})

export default AceCodeEditor;
