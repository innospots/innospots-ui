import React, { useMemo } from 'react';

import { ViewProps } from './type';

const width = '100%';
const height = '100%';

const Video: React.FC<ViewProps> = ({ dataSource }) => {
  const renderVideo = useMemo(() => {
    if (!dataSource) return null;

    const src = dataSource.src;
    return (
      <video width={width} height={height} controls title={dataSource.title} poster={dataSource.previewUrl}>
        <source src={src} type="video/mp4" />
        <source src={src} type="video/ogg" />
        <source src={src} type="video/webm" />
        <object data={src} width={width} height={height}>
          <embed src={src} width={width} height={height} />
        </object>
      </video>
    );
  }, [dataSource]);

  return renderVideo;
};

export default Video;
