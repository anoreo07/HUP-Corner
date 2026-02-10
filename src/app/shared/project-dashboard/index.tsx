import ProjectActiveTasks from './active-tasks';
import ProjectActivities from './activities';
import ProjectClientList from './client-list';
import OverallProgress from './overall-progress';
import ProjectStatistics from './project-statistics';
import ProjectStats from './project-stats';
import ProjectSummary from './project-summary';
import RecentActivities from './recent-activities';
import ProjectTaskList from './task-list';

export default function ProjectDashboard() {
  return (
    <div className="@container">
      <div className="mb-6 grid grid-cols-1 items-start gap-6 @[59rem]:mb-7 @[59rem]:gap-7 @[73rem]:grid-cols-12">
        <ProjectStats className="@[73rem]:col-span-full" />
        <ProjectStatistics className="@[73rem]:col-span-8" />
        <OverallProgress className="@[73rem]:col-span-4 @[73rem]:h-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 @[59rem]:gap-7 @[96rem]:grid-cols-12">
        <div className="grid grid-cols-1 gap-6 @[59rem]:gap-7 @[60rem]:grid-cols-12 @[96rem]:col-span-8">
          <ProjectActivities className="@[60rem]:col-span-6" />
          <ProjectClientList className="@[60rem]:col-span-6" />
          <ProjectActiveTasks className="@[60rem]:col-span-full" />
          <ProjectSummary className="@[60rem]:col-span-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 @[60rem]:grid-cols-12 @[96rem]:col-span-4">
          <ProjectTaskList className="@[60rem]:col-span-6 @[96rem]:col-span-full" />
          <RecentActivities className="@[60rem]:col-span-6 @[96rem]:col-span-full" />
        </div>
      </div>
    </div>
  );
}
