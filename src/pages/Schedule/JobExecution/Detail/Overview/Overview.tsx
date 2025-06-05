import React from 'react';

// import Features from './Features';
import TaskList from './TaskList';
import PlanInformation from './PlanInformation';

const Overview: React.FC<{
  data: any
}> = ({ data }) => {
  return (
    <div>
      {
        data && (
          <>
          {/* <Features data={data} /> */}
          <PlanInformation data={data} />
          <TaskList data={data} />
          </>
        )
      }
    </div>
  );
};

export default Overview;
