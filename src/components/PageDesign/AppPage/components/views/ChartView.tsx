import React, { useMemo } from 'react'
import ReactEcharts from 'echarts-for-react';

import { ViewProps } from './type'

const ChartView: React.FC<ViewProps> = ({ dataSource, extProps }) => {
  // const echartsRef = useRef<InstanceType<typeof ReactEcharts>>(null);

  // const boxRef = useRef<HTMLDivElement>(null);
  // const size = useSize(boxRef);

  // useEffect(() => {
  //   if (echartsRef.current && size?.width) {
  //     // const echartsInstance = echartsRef.current.getEchartsInstance();
  //     // echartsInstance.resize({
  //     //   width: size.width,
  //     // });
  //   }
  // }, [echartsRef.current, size?.width])

  const options = useMemo(() => {
    if (!dataSource) return null
    return dataSource.data
  }, [dataSource])
  
  const renderChart = useMemo(() => {
    if (!options) return null
    return (
      <div style={{ width: '100%', height: '100%' }} >
        <ReactEcharts option={options} />
      </div>
    )
  }, [options])

  return renderChart
}

export default ChartView