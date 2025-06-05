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

import _ from 'lodash';
import cls from 'classnames';
import { Tabs, Empty, Typography } from 'antd';
import React, { useContext, useMemo, forwardRef } from 'react';

import type { WidgetItemType } from '@/models/AppEditor';

import useI18n from '@/common/hooks/useI18n';
import ListTable from '@/components/ListTable';
import { formatListData } from '@/common/utils';

import Attachment from './Attachment'

import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less';
import resStyles from './index.less'

type TabItemType = {
  key: string;
  label: string;
};

const {Text, Paragraph} = Typography;

const defaultData = {
  "code": null,
  "body": {
    "outputs": {
      "results": {
        "list": [
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PtsuYYOACjJxoWsiz0RHQpqiBleexlJ6-PCsNLAlTpdilyz0NaN0ASU",
            "fileSize": "78.40 KB",
            "mineType": "image/png",
            "name": "1668262080702_990c595db9aa3ff40d.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PtsuYYOACjJxoWsiz0RHQpqiBleexlJ6-PCsNLAlTpdilyz0NaN0ASU"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1Pm93U2huTHHYxUFeFDLeW7ob20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg",
            "fileSize": "6.03 KB",
            "mineType": "image/png",
            "name": "1645258275635_ee31667b41b161f2f6c175408b3a134.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1Pm93U2huTHHYxUFeFDLeW7ob20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PuIEvnw7JsPFVvegBamrIeT2O8Nt5Trpsw",
            "fileSize": "9.79 KB",
            "mineType": "image/png",
            "name": "1645167048025_logo1.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PuIEvnw7JsPFVvegBamrIeT2O8Nt5Trpsw"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PmzYkTV0t35dhW2d1UQ5x7DDnC_UxdLqRA",
            "fileSize": "182.79 KB",
            "mineType": "image/png",
            "name": "1645251209501_huaxia.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PmzYkTV0t35dhW2d1UQ5x7DDnC_UxdLqRA"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PgWwFo_BBSSawcl4JvMJPNCcFBfVRjrJxK72UHNguG5H",
            "fileSize": "17.97 KB",
            "mineType": "image/png",
            "name": "1642821063381_WechatIMG17.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PgWwFo_BBSSawcl4JvMJPNCcFBfVRjrJxK72UHNguG5H"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PlAXpImrFDR-_Di9aSWmWcmcFBfVRjrJxK72UHNguG5H",
            "fileSize": "17.97 KB",
            "mineType": "image/png",
            "name": "1642907809141_WechatIMG17.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PlAXpImrFDR-_Di9aSWmWcmcFBfVRjrJxK72UHNguG5H"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PhaFUietL-Aja4ki6jJ5YXcb20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg",
            "fileSize": "6.03 KB",
            "mineType": "image/png",
            "name": "1645259117510_ee31667b41b161f2f6c175408b3a134.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PhaFUietL-Aja4ki6jJ5YXcb20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1Pj4mLyA-gpQbkmGaq3fkQl_2O8Nt5Trpsw",
            "fileSize": "9.79 KB",
            "mineType": "image/png",
            "name": "1645251136011_logo1.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1Pj4mLyA-gpQbkmGaq3fkQl_2O8Nt5Trpsw"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PiD2SHa96rWKSCL6Ur2GDmP2O8Nt5Trpsw",
            "fileSize": "9.79 KB",
            "mineType": "image/png",
            "name": "1645167066360_logo1.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PiD2SHa96rWKSCL6Ur2GDmP2O8Nt5Trpsw"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PuDWT0InkyHQ8Dt-U4MmAEKcFBfVRjrJxK72UHNguG5H",
            "fileSize": "17.97 KB",
            "mineType": "image/png",
            "name": "1642728973324_WechatIMG17.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PuDWT0InkyHQ8Dt-U4MmAEKcFBfVRjrJxK72UHNguG5H"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PkPXMy9HQbeappsS8CM9MIacFBfVRjrJxK72UHNguG5H",
            "fileSize": "17.97 KB",
            "mineType": "image/png",
            "name": "1642729110676_WechatIMG17.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PkPXMy9HQbeappsS8CM9MIacFBfVRjrJxK72UHNguG5H"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PikHe1NmZhwr3qUJIeXavF0nra5txSTOyyTkn8TZhzJY_-hkCY_hJPSIGT84351Ppw",
            "fileSize": "151.09 KB",
            "mineType": "image/png",
            "name": "1652017480589_Multiavatar-2d97ac81ac32248ac4.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PikHe1NmZhwr3qUJIeXavF0nra5txSTOyyTkn8TZhzJY_-hkCY_hJPSIGT84351Ppw"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1Pqq6UYdr2qe9qE2eQD3xJ98wSbbCcFC9t6BGLQSft9q8gRJKc81EegyaFQYiST65tQ",
            "fileSize": "2.62 KB",
            "mineType": "image/png",
            "name": "1645164738385_5bafc7dc9f2c0385628bb08619341c5.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1Pqq6UYdr2qe9qE2eQD3xJ98wSbbCcFC9t6BGLQSft9q8gRJKc81EegyaFQYiST65tQ"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PoXdr2PzDWHsFumg5eACAi2cFBfVRjrJxK72UHNguG5H",
            "fileSize": "17.97 KB",
            "mineType": "image/png",
            "name": "1642821001807_WechatIMG17.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PoXdr2PzDWHsFumg5eACAi2cFBfVRjrJxK72UHNguG5H"
          },
          {
            "resourceId": "pMH-nuQGT5GYVbAEvMV1PgGq0oLNOeeno7wE6mXKi-Mb20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg",
            "fileSize": "6.03 KB",
            "mineType": "image/png",
            "name": "1645259150116_ee31667b41b161f2f6c175408b3a134.png",
            "uri": "/innospots/api/workflow/flow-execution/resources?resourceId=pMH-nuQGT5GYVbAEvMV1PgGq0oLNOeeno7wE6mXKi-Mb20F0x94pfksoBKbC66cE41S3yGtxzjdq685jtk56Bg"
          }
        ],
        "startTime": 1726765178518,
        "consume": 0,
        "message": null,
        "pagination": {
          "pageSize": 50,
          "current": 1,
          "total": null,
          "totalPage": 0
        }
      },
      "resources": {
        "0": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVDBAyBAa6uusZ2tvicGEfZVBWugWPlXZ8ejM8uzsiMfF2iRxr082ocCiCrB9AU9Q",
            "resourceName": "1668262080702_990c595db9aa3ff40d.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVDBAyBAa6uusZ2tvicGEfZVBWugWPlXZ8ejM8uzsiMfF2iRxr082ocCiCrB9AU9Q",
            "mimeType": "image/png",
            "fileSize": "78.40 KB",
            "executionCache": false
          }
        ],
        "1": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2QqQuhDLfd_fXL83jXa8Bz8zoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "resourceName": "1645258275635_ee31667b41b161f2f6c175408b3a134.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2QqQuhDLfd_fXL83jXa8Bz8zoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "mimeType": "image/png",
            "fileSize": "6.03 KB",
            "executionCache": false
          }
        ],
        "2": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2YirHWXbx_CDdi7NsXn77MKu9lBzYLhuRw",
            "resourceName": "1645167048025_logo1.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2YirHWXbx_CDdi7NsXn77MKu9lBzYLhuRw",
            "mimeType": "image/png",
            "fileSize": "9.79 KB",
            "executionCache": false
          }
        ],
        "3": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2WDYU7AbP54e4pGGop3AkEp8wLoKp-7fsw",
            "resourceName": "1645251209501_huaxia.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2WDYU7AbP54e4pGGop3AkEp8wLoKp-7fsw",
            "mimeType": "image/png",
            "fileSize": "182.79 KB",
            "executionCache": false
          }
        ],
        "4": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2SC7RGaVllrhlhboqhdLIzhJ7Cwi3_berGusPr1sW4Da",
            "resourceName": "1642821063381_WechatIMG17.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2SC7RGaVllrhlhboqhdLIzhJ7Cwi3_berGusPr1sW4Da",
            "mimeType": "image/png",
            "fileSize": "17.97 KB",
            "executionCache": false
          }
        ],
        "5": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2VmSwW9GQacnVbSkEBRgaUhJ7Cwi3_berGusPr1sW4Da",
            "resourceName": "1642907809141_WechatIMG17.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2VmSwW9GQacnVbSkEBRgaUhJ7Cwi3_berGusPr1sW4Da",
            "mimeType": "image/png",
            "fileSize": "17.97 KB",
            "executionCache": false
          }
        ],
        "6": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2WfHan7XGpsQGUS0zLnS0CszoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "resourceName": "1645259117510_ee31667b41b161f2f6c175408b3a134.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2WfHan7XGpsQGUS0zLnS0CszoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "mimeType": "image/png",
            "fileSize": "6.03 KB",
            "executionCache": false
          }
        ],
        "7": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2Y_TP_-PHuv7JgD5JItezIKu9lBzYLhuRw",
            "resourceName": "1645251136011_logo1.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2Y_TP_-PHuv7JgD5JItezIKu9lBzYLhuRw",
            "mimeType": "image/png",
            "fileSize": "9.79 KB",
            "executionCache": false
          }
        ],
        "8": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2edS-jb2s1HpT68Oh36ENzau9lBzYLhuRw",
            "resourceName": "1645167066360_logo1.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2edS-jb2s1HpT68Oh36ENzau9lBzYLhuRw",
            "mimeType": "image/png",
            "fileSize": "9.79 KB",
            "executionCache": false
          }
        ],
        "9": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2Y3das283tGXluNhxOfN7HpJ7Cwi3_berGusPr1sW4Da",
            "resourceName": "1642728973324_WechatIMG17.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2Y3das283tGXluNhxOfN7HpJ7Cwi3_berGusPr1sW4Da",
            "mimeType": "image/png",
            "fileSize": "17.97 KB",
            "executionCache": false
          }
        ],
        "10": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2epb--khQBQd4GwGyPgsNGhJ7Cwi3_berGusPr1sW4Da",
            "resourceName": "1642729110676_WechatIMG17.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2epb--khQBQd4GwGyPgsNGhJ7Cwi3_berGusPr1sW4Da",
            "mimeType": "image/png",
            "fileSize": "17.97 KB",
            "executionCache": false
          }
        ],
        "11": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSO9jduvm-DTdvRf7MKhA91lWiebuCez8COos1OrluAPfj3OYCJhH5elXSJU238WeVEtCCBSWJcj0w",
            "resourceName": "1652017480589_Multiavatar-2d97ac81ac32248ac4.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSO9jduvm-DTdvRf7MKhA91lWiebuCez8COos1OrluAPfj3OYCJhH5elXSJU238WeVEtCCBSWJcj0w",
            "mimeType": "image/png",
            "fileSize": "151.09 KB",
            "executionCache": false
          }
        ],
        "12": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2RV2EDznmzetTdpYsqGLXAxOPxq-gcoLC_FEIR_84m2KboBk-mmqStO6I8lEMQ6y8Q",
            "resourceName": "1645164738385_5bafc7dc9f2c0385628bb08619341c5.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2RV2EDznmzetTdpYsqGLXAxOPxq-gcoLC_FEIR_84m2KboBk-mmqStO6I8lEMQ6y8Q",
            "mimeType": "image/png",
            "fileSize": "2.62 KB",
            "executionCache": false
          }
        ],
        "13": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2eOJqtIbyPqm-Cj1xoXV-JxJ7Cwi3_berGusPr1sW4Da",
            "resourceName": "1642821001807_WechatIMG17.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2eOJqtIbyPqm-Cj1xoXV-JxJ7Cwi3_berGusPr1sW4Da",
            "mimeType": "image/png",
            "fileSize": "17.97 KB",
            "executionCache": false
          }
        ],
        "14": [
          {
            "resourceId": "ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2QfWGCkbnO0visWQ2yBkZLkzoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "resourceName": "1645259150116_ee31667b41b161f2f6c175408b3a134.png",
            "pathKey": null,
            "resourceUri": "/innospots/api/workflow/flow-execution/resources?resourceId=ksF-hIO7PaLFj6IGd-IKUYep9_5UppmkJ5qGuGdCC6eX4lLgNlJZXhkQtlcVZd7Mt-vnaNgSk86-E69rz4kZppn-7eboNYPY7mshZ7cQvDRdwAS5veG0pfmb5DqXYR4IxPqtPpzeahM9k_BOmVPIs4ypNx32RzQPb-LqB387zSNVw9Qf3GJm2QfWGCkbnO0visWQ2yBkZLkzoAkZC0NKeNNHPRogcybFW3WfKItq47bbANrQNiARlg",
            "mimeType": "image/png",
            "fileSize": "6.03 KB",
            "executionCache": false
          }
        ]
      },
      "nextKeys": [],
      "name": null,
      "empty": false
    },
    "schemaFields": [
      {
        "name": "resourceId",
        "code": "resourceId",
        "valueType": "STRING",
        "value": null,
        "comment": null,
        "parentCode": null,
        "format": null,
        "fieldScope": null
      },
      {
        "name": "fileSize",
        "code": "fileSize",
        "valueType": "STRING",
        "value": null,
        "comment": null,
        "parentCode": null,
        "format": null,
        "fieldScope": null
      },
      {
        "name": "mineType",
        "code": "mineType",
        "valueType": "STRING",
        "value": null,
        "comment": null,
        "parentCode": null,
        "format": null,
        "fieldScope": null
      },
      {
        "name": "name",
        "code": "name",
        "valueType": "STRING",
        "value": null,
        "comment": null,
        "parentCode": null,
        "format": null,
        "fieldScope": null
      },
      {
        "name": "uri",
        "code": "uri",
        "valueType": "STRING",
        "value": null,
        "comment": null,
        "parentCode": null,
        "format": null,
        "fieldScope": null
      }
    ],
    "logs": {}
  },
  "contextId": "n28x_1836812405556903937",
  "consume": 51,
  "flowKey": "n28x",
  "revision": 2
}

// 表格数据，应答消息，文件附件，执行日志
const TABS_CONFIG: TabItemType[] = [
  {
    key: 'payload',
    label: 'Payload',
  },
  {
    key: 'message',
    label: '应答消息',
  },
  {
    key: 'attachment',
    label: '文件附件',
  },
  {
    key: 'log',
    label: '执行日志',
  },
];

const getValue = v => {
  if (v === '' || v === undefined || v === null) {
    return '-';
  } else if (_.isArray(v)) {
    return v.map((item, index) => {
      return (
        <span key={index}>{ getValue(item) }</span>
      )
    })
  } else if (_.isObject(v)) {
    return JSON.stringify(v);
  }
  return v.toString();
}

const Response: React.FC<WidgetItemType> = forwardRef(
  ({ settings = {}, widgetType, value }, ref) => {
    const { t } = useI18n(['workflow', 'common']);

    const { size } = useContext(WidgetContext);
    const resData = useMemo(() => ((value || {})?.body || {}), [ value ])
    const payloadData = useMemo(() => {
      const results = resData.outputs?.results || {}
      const dataList = results.list || []

      if (!dataList.length) return null

      const dataRow = {
        ...dataList[0]
      }
      const pagination = {
        ...(results.pagination || {})
      }
      const dataSource = formatListData(dataList)

      const columns = _.map(_.keys(dataRow), (k) => ({
        key: k,
        title: k,
        dataIndex: k,
        // width: getWidth(Math.min(Math.max((dataRow[k] + '').length, k.length), 200)),
        render: getValue
      }));

      const resultData: any = {
        columns,
        dataSource
      }

      if (pagination) {
        pagination.showQuickJumper = true
        pagination.pageSizeOptions = [
          20,
          50,
          100,
          200,
          500
        ]
        resultData.pagination = pagination
      }

      return resultData
    }, [ resData ])

    const contentSize = useMemo(() => {
      if (size && size.height) {
        return {
          ...size,
          height: size.height - 100,
        };
      }
      return {};
    }, [size]);

    const renderPayload = () => {

      return (
        <div className={resStyles.payload}>
          {
            payloadData ? (
              <ListTable
                zebra
                noSpacing
                size="small"
                { ...payloadData }
              />
            ) : (
              <Empty />
            )
          }
        </div>
      )
    };

    const renderLogs = () => {
      const logsData = resData.logs || {};
      const keys = _.keys(logsData);

      if (!keys.length) {
        return (
          <div>
            <p>
              <Text strong>{t('workflow.builder.execution.empty')}</Text>
            </p>
            <p>{t('workflow.builder.execution.empty.desc')}</p>
          </div>
        );
      }

      return _.map(keys, (key) => (
        <Paragraph key={key}>
          {key}: {logsData[key] || '-'}
        </Paragraph>
      ));
    }

    const renderAttachment = () => {
      return (
        <Attachment resources={resData.outputs?.resources} />
      )
    }

    const renderMessage = () => {
      return (
        <div>
          <Empty />
        </div>
      )
    }

    const renderTabChildren = ({ key }: TabItemType) => {
      let renderContent;

      if (key === 'payload') {
        renderContent = renderPayload();
      } else if (key === 'log') {
        renderContent = renderLogs()
      } else if (key === 'attachment') {
        renderContent = renderAttachment()
      } else if (key === 'message') {
        renderContent = renderMessage()
      }

      return (
        <div style={contentSize} className="custom-scrollbar">
          { renderContent }
        </div>
      );
    };

    const tabItems = useMemo(
      () =>
        _.map(TABS_CONFIG, (item) => ({
          ...item,
          children: renderTabChildren(item),
        })),
      [value, contentSize],
    );

    return (
      <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
        <div className={styles.inner}>
          <div className={styles.formItem}>
            <Tabs items={tabItems} />
          </div>
        </div>
      </div>
    );
  },
);

export default Response;
