import { ITask } from "./task.model";

export function getTaskHateoasLings(task: ITask) {
  const links = [
    {
      rel: "self",
      href: `${process.env.SERVER_URL}/tasks/${task.id}`,
      type: "GET",
    },
    {
      rel: "cancel-task",
      href: `${process.env.SERVER_URL}/tasks/${task.id}`,
      type: "DELETE",
    },
  ];

  if (task.status === "completed") {
    links.push({
      rel: "download-medias",
      href: `${process.env.SERVER_URL}/tasks/${task.id}/medias`,
      type: "GET",
    });
  }

  return links;
}
