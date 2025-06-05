import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { useSafeState } from 'ahooks';
import React, { useMemo, useEffect, useContext, forwardRef } from 'react';

import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Row,
  Col,
  message,
  Progress,
  Upload as AntdUpload,
  Button,
  UploadProps,
  Typography,
  Popconfirm,
} from 'antd';

import { APPS_AJAX_PREFIX } from '@/common/constants';
import { getAuthHeader } from '@/common/request/header';
import type { WidgetItemType } from '@/models/AppEditor';
import { isRequestSuccess, isPermissionDenied } from '@/common/utils';

import request from '@/common/request';

import { WidgetContext } from '../../WidgetProvider';

import styles from '../../style.less';

const { Paragraph } = Typography;

type Props = {
  inForm?: boolean;
} & UploadProps &
  WidgetItemType;

const Upload: React.FC<Props> = forwardRef(
  ({ settings = {}, pageType, value, widgetType, onChange, ...props }, ref) => {
    const { currentAppInfo, updateWidgetProcessing } = useModel('App', (model) => ({
      currentAppInfo: model.currentAppInfo,
      updateWidgetProcessing: model.updateWidgetProcessing,
    }));

    const widgetId = props.id

    const [uploading, setUploading] = useSafeState(false);
    const [downLoadingMap, setDownLoadingMap] = useSafeState<Record<string, boolean>>({});

    useEffect(() => {
      updateWidgetProcessing(widgetId, uploading);
    }, [uploading, widgetId]);

    const { size } = useContext(WidgetContext);
    const containerStyle = useMemo(() => {
      const height = size?.height;
      return {
        height: height ? height - 40 : 40,
      };
    }, [size]);

    const readOnly = widgetType === 'view';

    const [fileList, setFileList] = useSafeState<
      Array<{
        status: string;
        uid: any;
        name: any;
        url: any;
        response: {
          code: string;
          body: any;
        };
      }>
    >([]);

    // useDeepCompareEffect(() => {
    //   if (readOnly) return

    //   const values: any = []
    //   _.map(fileList, (item: any) => {
    //     const res = item.response || {}
    //     if (res.code === '10000') {
    //       values.push(res.body)
    //     }
    //   })
    //   onChange?.(values)
    // }, [ fileList, readOnly ])

    const submitData = (fileList: any) => {
      const values: any = [];
      _.map(fileList, (item: any) => {
        const res = item.response || {};
        if (isRequestSuccess(res.code)) {
          const body = res.body;
          values.push({
            ...body,
            resourceName: decodeURIComponent(body.resourceName),
          });
        }
      });
      onChange?.(values);
    };

    const downloadFile = async (url: string, name: string) => {
      try {
        const res = await request(url, {
          responseType: 'blob',
        });

        const blob = new Blob([res], { type: res.type });
        if (['application/json', 'text/json'].includes(res.type)) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const json = JSON.parse(event.target?.result as string);
            if (isPermissionDenied(json.code)) {
              message.error('Permission denied');
            } else {
              message.error(json.message);
            }
          };
          reader.readAsText(blob);
          return;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
      } catch (error) {
        message.error('Download failed');
      } finally {
        setDownLoadingMap({});
      }
    };

    useEffect(() => {
      setFileList(
        _.map(value, (item: any) => ({
          status: 'done',
          type: item.mimeType,
          uid: item.resourceId,
          name: item.resourceName,
          url: item.resourceUri,
          percent: 100,
          response: {
            code: '100000',
            body: item,
          },
        })),
      );
    }, [value]);

    const inputProps = useMemo(() => {
      return _.merge(_.pick(settings, ['disabled', 'maxCount']), {
        fileList,
        name: 'upFile',
        disabled: readOnly || uploading,
        action: `${APPS_AJAX_PREFIX}/data/${currentAppInfo?.appKey}/upload`,
        headers: getAuthHeader(),
        onChange(info) {
          setFileList(info.fileList);
          if (info.file.status === 'done') {
            if (!readOnly) {
              submitData(info.fileList);
            }
          }
          setUploading(info.file.status === 'uploading');
        },
        beforeUpload(file) {
          const newFileName = encodeURIComponent(file.name); // 对文件名进行 URL 编码
          const newFile = new File([file], newFileName, { type: file.type });
          return Promise.resolve(newFile);
        },
        itemRender: (event, file) => {

          if (file.status === 'uploading') {
            return (
              <div style={{ width: '80%' }}>
                <Progress size="small" percent={Math.floor(file.percent)} />
              </div>
            );
          }

          const fileName = decodeURIComponent(file.name);

          return (
            <Row
              wrap={false}
              align="middle"
              style={{
                width: '100%',
              }}
            >
              <Col flex="auto">
                <Paragraph
                  ellipsis={{
                    tooltip: fileName,
                  }}
                  style={{
                    margin: 0,
                  }}
                >
                  {fileName}
                </Paragraph>
              </Col>
              <Col flex={'36px'}>
                <Row>
                  {readOnly && (
                    <Col>
                      <Button
                        type="link"
                        title="Download"
                        icon={<DownloadOutlined />}
                        loading={downLoadingMap[file.uid]}
                        onClick={() => {
                          downloadFile(file.url, fileName);
                          setDownLoadingMap({
                            [file.uid]: true,
                          });
                        }}
                      />
                    </Col>
                  )}
                  {!readOnly && (
                    <Col>
                      <Popconfirm
                        title="Are you sure you want to delete this file?"
                        onConfirm={() => {
                          const newFileList = _.filter(fileList, (item) => item.uid !== file.uid);
                          setFileList(newFileList);
                          submitData(newFileList);
                        }}
                      >
                        <Button type="link" title="Delete" icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          );
        },
      });
    }, [settings, uploading, fileList, readOnly, currentAppInfo?.appKey, downLoadingMap]);

    return (
      <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
        <div className={styles.inner}>
          <div className={cls(styles.formItem, 'custom-scrollbar')} style={containerStyle}>
            <AntdUpload {...inputProps}>
              {!readOnly && (
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {settings.placeholder}
                </Button>
              )}
            </AntdUpload>
          </div>
        </div>
      </div>
    );
  },
);

export default Upload;
