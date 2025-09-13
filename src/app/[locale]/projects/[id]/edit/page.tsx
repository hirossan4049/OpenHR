import { ProjectEditPage } from "~/components/projects/project-edit-page";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return <ProjectEditPage projectId={params.id} />;
}