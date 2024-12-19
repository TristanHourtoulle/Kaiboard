"use client";

import { useProject } from "@/hooks/useProject";
import { useTeam } from "@/hooks/useTeam";
import { useTeamRole } from "@/hooks/useTeamRole";
import { useEffect, useState } from "react";
import { FilesSection as Files } from "./Files/FilesSection";
import { OverviewSection as Overview } from "./Overview/OverviewSection";
import { SprintSection } from "./Sprint/SprintSection";
import { TasksSection as Tasks } from "./Tasks/TasksSection";

export default function PageHome({
  params: { idTeam, idProject },
}: {
  params: { idTeam: string; idProject: string };
}) {
  const {
    projects,
    tasks,
    fetchProjectById,
    addSprint,
    deleteSprint,
    updateSprint,
    fetchTasks,
    createTask,
    updateTask,
    fetchProjectStatus,
  } = useProject(idTeam);
  const { roles, fetchTeamRoles } = useTeamRole(idTeam);
  const { getTeamMembers } = useTeam();
  const [project, setProject] = useState<any | null>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [projectStatus, setProjectStatus] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Overview");

  const handleRefresh = () => {
    fetchProjectById(idProject).then((data) => {
      setProject(data);
      setSprints(data.project_sprints);
    });
    fetchTasks(idProject);
  };

  const handleDeleteSprint = async (id_sprint: string, id_project: string) => {
    await deleteSprint(id_sprint, id_project);

    // Mise à jour immédiate de l'état local
    setSprints((prevSprints) =>
      prevSprints.filter((sprint) => sprint.id !== id_sprint)
    );
  };

  const handleUpdateSprint = async (id_sprint: string, sprint: any) => {
    await updateSprint(id_sprint, sprint);

    // Mise à jour immédiate de l'état local
    setSprints((prevSprints) =>
      prevSprints.map((s) => (s.id === id_sprint ? sprint : s))
    );
  };

  const handleUpdateTask = async (id_task: string, task: any) => {
    await updateTask(id_task, task);

    fetchTasks(idProject);
  };

  const projectTabs = [
    {
      title: "Overview",
      component: <Overview project={project} />,
      icon: "📋",
    },
    {
      title: "Tasks",
      component: (
        <Tasks
          project={project}
          project_status={projectStatus}
          roles={roles}
          sprints={sprints}
          profiles={profiles}
          tasks={tasks}
          fetchTasks={fetchTasks}
          createTask={createTask}
          updateTask={handleUpdateTask}
        />
      ),
      icon: "🎯",
    },
    {
      title: "Sprints",
      component: (
        <SprintSection
          project={project}
          sprints={sprints}
          refreshFunction={handleRefresh}
          createFunction={addSprint}
          deleteFunction={handleDeleteSprint}
          updateFunction={handleUpdateSprint}
        />
      ),
      icon: "⏱️",
    },
    {
      title: "Files",
      component: <Files project={project} />,
      icon: "📊",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && idProject) {
      fetchProjectById(idProject).then((data) => {
        setProject(data);
        setSprints(data.project_sprints);
      });
      fetchProjectStatus(idProject).then((data: any) => {
        setProjectStatus(data);
      });
      getTeamMembers(idTeam).then((data) => {
        setProfiles(data);
      });
      fetchTasks(idProject);
    } else {
      console.error("No project id provided, but it should be provided.");
    }
  }, [idProject]);

  return (
    <div className="flex flex-col w-full p-4 pt-0 text-white overflow-x-hidden">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Let's work on {project?.title}</h1>
        <p className="text-sm text-gray-400">
          Here, you can manage your project.
        </p>
      </div>

      {/* Tabs */}
      <div className="">
        <div className="flex space-x-8">
          {projectTabs.map((tab) => (
            <button
              key={tab.title}
              onClick={() => setActiveTab(tab.title)}
              className={`flex items-center gap-2 py-2 border-b-2 transition-all ${
                activeTab === tab.title
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="mt-5">
        {projectTabs.find((tab) => tab.title === activeTab)?.component}
      </div>
    </div>
  );
}
