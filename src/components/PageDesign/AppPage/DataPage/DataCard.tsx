import cls from 'classnames'
import {useSize} from 'ahooks'
import React, {useRef, useMemo} from 'react'
import {Typography} from 'antd';
import { ProfileOutlined, CloudDownloadOutlined } from '@ant-design/icons'

import {KeyValues} from '@/common/types/Types'

import File from '../components/File';
import Video from '../components/Video';
import Embed from '../components/Embed';
import Image from '../components/Image';

import styles from './style.less';

const {Paragraph} = Typography;

const DataCard: React.FC<{
  dataSource: KeyValues
  onDetail: () => void
}> = ({
        dataSource: {
          src,
          data,
          title,
          viewType,
          previewUrl,
          downloadUrl,
          description
        },
        onDetail
      }) => {

  const ref = useRef(null);
  const size = useSize(ref);

  const containerStyle = useMemo(() => {
    if (!size?.width) return {}

    return {
      height: size.width / 2
    }
  }, [size?.width])

  const renderCardTitle = (rows = 1) => {
    return title && (
      <Paragraph strong className={styles.cardTitle} ellipsis={{
        rows
      }}>{title}</Paragraph>
    )
  }

  const renderCardActions = () => {
    const actions: any[] = [{
      type: 'detail',
      icon: <ProfileOutlined />,
      label: '详情',
      onClick: onDetail
    }]

    if (downloadUrl) {
      actions.push({
        type: 'download',
        icon: <CloudDownloadOutlined />,
        label: '下载',
        href: downloadUrl,
        target: 'blank'
      })
    }

    return (
      <div className={styles.cardActions}>
        {
          actions.map(({ type, icon, label, ...rest }) => (
            <a key={type} className={styles.button} { ...rest }>
              { icon } { label }
            </a>
          ))
        }
      </div>
    )
  }

  const renderCardNode = (children) => {
    return (
      <div ref={ref} className={styles.cardItem} style={containerStyle}>
        <div className={cls(styles.cardInner, styles[viewType])}>
          { children }
        </div>
        { renderCardTitle() }
        { renderCardActions() }
      </div>
    )
  }

  const renderNormalContent = () => {
    return description && (
      <Paragraph ellipsis={{
        rows: 8
      }}>{description}</Paragraph>
    )
  }

  const renderImageContent = () => {
    return (
      <Image
        src={src}
        alt={title}
        previewUrl={previewUrl}
      />
    )
  }

  const renderVideoContent = () => {
    return (
      <Video src={src} />
    )
  }

  const renderEmbedContent = () => {
    return (
      <Embed src={ src } />
    )
  }

  const renderFileContent = () => {
    return (
      <File dataSource={data || {}} />
    )
  }

  const renderCard = () => {
    let content
    if (viewType === 'image') {
      content = renderImageContent()
    } else if (viewType === 'video') {
      content = renderVideoContent()
    } else if (viewType === 'embed') {
      content = renderEmbedContent()
    } else if (viewType === 'file') {
      content = renderFileContent()
    } else {
      content = renderNormalContent()
    }

    return renderCardNode(content)
  }

  return renderCard()
}

export default DataCard