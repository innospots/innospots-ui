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

import React, {memo, useEffect, useRef, useState} from 'react'
import {Button, Upload} from 'antd'
import {EyeOutlined, FileImageOutlined} from '@ant-design/icons'
import BraftEditor from 'braft-editor'
import {ContentUtils} from 'braft-utils'
import Table from 'braft-extensions/dist/table'

import _ from 'lodash';
import cls from 'classnames';

import 'braft-editor/dist/index.css'
import 'braft-extensions/dist/table.css'
import styles from './style.less'

import {uploadCommentImage} from '@/services/Tasks'

const options = {
  defaultColumns: 3, // 默认列数
  defaultRows: 3, // 默认行数
  withDropdown: true, // 插入表格前是否弹出下拉菜单
  columnResizable: true, // 是否允许拖动调整列宽，默认false
  exportAttrString: 'border="1" style="border-collapse: collapse"', // 指定输出HTML时附加到table标签上的属性字符串
  // includeEditors: ['id-1'], // 指定该模块对哪些BraftEditor生效，不传此属性则对所有BraftEditor有效
  // excludeEditors: ['id-2']  // 指定该模块对哪些BraftEditor无效
};

const Editor: React.FC<any> = memo((props: any) => {
  const ref = useRef<any>(null)

  const [content, setContent] = useState(BraftEditor.createEditorState(null));

  BraftEditor.use(Table(options));

  const {
    value,
    onChange,
    placeholder = '在此处输入内容',
  } = props;

  useEffect(() => {
    if (ref && ref.current) {
      // setContent(BraftEditor.createEditorState(value || null))
      // ref.current.onChange(BraftEditor.createEditorState(value || null))
      handleChange(BraftEditor.createEditorState(value || null))
    }
  }, [value])

  const handleChange = (v) => {
    const value = BraftEditor.createEditorState(v || null)
    setContent(value);
    onChange && _.isFunction(onChange) && onChange(value);
  };

  const uploadHandler = async (param: any) => {
    if (!param.file) {
      return false
    }

    const fd = new FormData();
    fd.append('images', param.file);

    const res = await uploadCommentImage(fd); // 上传图片到本地服务器
    const imageUrl= res && res[0]

    setContent(ContentUtils.insertMedias(content, [{
      type: 'IMAGE',
      url: imageUrl
    }]));
  };

  const preview = () => {
    const win: any = window
    let previewWindow = win.previewWindow

    if (previewWindow) {
      previewWindow.close()
    }

    previewWindow = window.open();
    previewWindow.document.write(buildPreviewHtml());
    previewWindow.document.close()
  };

  const buildPreviewHtml = () => {
    return `
              <!Doctype html>
              <html lang="">
                <head>
                  <title>Preview Content</title>
                  <style>
                    html,body{
                      height: 100%;
                      margin: 0;
                      padding: 0;
                      overflow: auto;
                      background-color: #f1f2f3;
                    }
                    .container{
                      box-sizing: border-box;
                      width: 1000px;
                      max-width: 100%;
                      min-height: 100%;
                      margin: 0 auto;
                      padding: 30px 20px;
                      overflow: hidden;
                      background-color: #fff;
                      border-right: solid 1px #eee;
                      border-left: solid 1px #eee;
                    }
                    .container img,
                    .container audio,
                    .container video{
                      max-width: 100%;
                      height: auto;
                    }
                    .container p{
                      white-space: pre-wrap;
                      min-height: 1em;
                    }
                    .container pre{
                      padding: 15px;
                      background-color: #f1f1f1;
                      border-radius: 5px;
                    }
                    .container blockquote{
                      margin: 0;
                      padding: 15px;
                      background-color: #f1f1f1;
                      border-left: 3px solid #d1d1d1;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">${content.toHTML()}</div>
                </body>
              </html>
        `;
  };

  const controls: any = ['bold', 'italic', 'emoji', 'list-ul', 'list-ol', 'table', 'blockquote', 'code', 'link']

  const extendControls: any = [
    {
      key: 'custom-button',
      type: 'component',
      component: (
        <Button
          className="control-item button upload-button"
          data-title="内容预览"
          onClick={preview}
        >
          <EyeOutlined/>
        </Button>
      ),
    },
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={uploadHandler}
        >
          <Button
            className="control-item button upload-button"
            data-title="插入图片"
          >
            <FileImageOutlined/>
          </Button>
        </Upload>
      )
    }
  ];

  return (
    <>
      <div>
        <div className={cls("editor-wrapper", styles.myEditor)}>
          <BraftEditor
            {...props}
            ref={ref}
            value={content}
            controls={controls}
            placeholder={placeholder}
            contentStyle={{height: 150}}
            extendControls={extendControls}
            onChange={(e) => handleChange(e)}
          />
        </div>
      </div>
    </>
  );

})
export default Editor;
