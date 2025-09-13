"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { Link } from "~/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PlusCircle, Settings, Users, MessageSquare, Calendar } from "lucide-react";

export default function MyProjectsPage() {
  const { data: session } = useSession();

  const { data: myProjects, isLoading: loadingProjects } = api.project.getMyProjects.useQuery();
  const { data: myApplications, isLoading: loadingApplications } = api.project.getMyApplications.useQuery();

  if (!session) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your projects</h1>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Projects & Applications</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="organized" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organized">My Projects</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        {/* My Projects Tab */}
        <TabsContent value="organized" className="space-y-4">
          {loadingProjects ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your projects...
            </div>
          ) : !myProjects || myProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p>Create your first project to start recruiting members</p>
              </div>
              <Button asChild>
                <Link href="/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Link href={{ pathname: "/projects/[id]", params: { id: project.id } }} className="hover:underline">
                            {project.title}
                          </Link>
                          <Badge variant={project.type === "event" ? "secondary" : "outline"}>
                            {project.type}
                          </Badge>
                          <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                            {project.recruitmentStatus}
                          </Badge>
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={{ pathname: "/projects/[id]/edit", params: { id: project.id } }}>
                            <Settings className="mr-1 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project._count.members} members</span>
                        {project.maxMembers && <span>/{project.maxMembers}</span>}
                      </div>
                      
                      {project._count.applications > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{project._count.applications} pending applications</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {loadingApplications ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your applications...
            </div>
          ) : !myApplications || myApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <h3 className="text-lg font-semibold">No applications yet</h3>
                <p>Browse projects and apply to join teams</p>
              </div>
              <Button asChild>
                <Link href="/projects">
                  Browse Projects
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Link href={{ pathname: "/projects/[id]", params: { id: application.project.id } }} className="hover:underline">
                            {application.project.title}
                          </Link>
                          <Badge variant={application.project.type === "event" ? "secondary" : "outline"}>
                            {application.project.type}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {application.project.organizer.name}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === "approved" ? "default" :
                        application.status === "rejected" ? "destructive" : "secondary"
                      }>
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {application.message && (
                      <div>
                        <p className="text-sm font-medium mb-1">Your Application:</p>
                        <p className="text-sm bg-muted p-3 rounded">
                          {application.message}
                        </p>
                      </div>
                    )}
                    
                    {application.response && (
                      <div>
                        <p className="text-sm font-medium mb-1">Organizer Response:</p>
                        <p className="text-sm bg-blue-50 p-3 rounded">
                          {application.response}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {application.updatedAt !== application.createdAt && (
                        <div className="flex items-center gap-1">
                          <span>Updated {new Date(application.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
