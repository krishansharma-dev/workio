"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { Database } from "@/types/workspace";
import { createClient } from "@/lib/client";

type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
type Workspace = WorkspaceRow & { role: string };

export default function WorkspacePage() {
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("workspace_members")
      .select(
        `
        role,
        workspaces (
          id,
          name,
          slug,
          description,
          created_by,
          created_at,
          updated_at
        )
      `
      );

    if (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    } else {
      const mapped: Workspace[] =
        data
          ?.map((row) => {
            const ws = row.workspaces as WorkspaceRow | null;
            if (!ws) return null;
            return {
              ...ws,
              role: row.role,
            };
          })
          .filter((ws): ws is Workspace => ws !== null) ?? [];

      setWorkspaces(mapped);
    }

    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    const slug = generateSlug(newWorkspaceName);

    const { error } = await supabase
      .from("workspaces")
      .insert({
        name: newWorkspaceName,
        slug,
      });

    if (error) {
      console.error("Error creating workspace:", error);
      return;
    }

    setNewWorkspaceName("");
    await fetchWorkspaces();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
        <div className="flex gap-2">
          <Input
            placeholder="New workspace name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <Button onClick={createWorkspace} disabled={!newWorkspaceName}>
            <Plus className="h-4 w-4 mr-1" /> Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      ) : workspaces.length === 0 ? (
        <p className="text-muted-foreground">
          You don’t belong to any workspaces yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold">{ws.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ws.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Role: <span className="font-medium">{ws.role}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Slug: <span className="font-mono">{ws.slug}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
