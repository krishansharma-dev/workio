
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Copy } from "lucide-react";
import { Database } from "@/types/workspace";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import JoinWorkspace from "./_components/JoinWorkspace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
type Workspace = WorkspaceRow & { role: string };

export default function WorkspacePage() {
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [joinSlug, setJoinSlug] = useState("");

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
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required.");
      return;
    }

    const slug = generateSlug(newWorkspaceName);
    const { error } = await supabase
      .from("workspaces")
      .insert({
        name: newWorkspaceName,
        slug,
        privacy: "private",
      });

    if (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace: " + error.message);
      return;
    }

    toast.success("Workspace created successfully!");
    setNewWorkspaceName("");
    await fetchWorkspaces();
  };

  const copyInviteLink = async (workspaceId: string, slug: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("You must be logged in to invite.");
      return;
    }

    // Check for existing pending invitation
    const { data: existingInvite, error: fetchError } = await supabase
      .from("invitations")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("invited_by", user.id)
      .eq("status", "pending")
      .maybeSingle(); // Use maybeSingle() to avoid errors if no rows are found

    let inviteId = existingInvite?.id;

    // If no existing pending invitation, create one
    if (!inviteId) {
      const { data: newInvite, error: insertError } = await supabase
        .from("invitations")
        .insert({
          workspace_id: workspaceId,
          invited_by: user.id,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating invitation:", insertError);
        toast.error("Failed to create invitation: " + insertError.message);
        return;
      }
      inviteId = newInvite.id;
    }

    const inviteLink = `${window.location.origin}/join/${slug}?invite=${inviteId}`;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Join Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Workspace</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Enter workspace slug"
                value={joinSlug}
                onChange={(e) => setJoinSlug(e.target.value)}
              />
              {joinSlug && <JoinWorkspace slug={joinSlug} onJoin={fetchWorkspaces} />}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      ) : workspaces.length === 0 ? (
        <p className="text-muted-foreground">You don’t belong to any workspaces yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-4 space-y-2">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ws.id && ws.slug && copyInviteLink(ws.id, ws.slug)}
                  disabled={!ws.slug}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy Invite Link
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
