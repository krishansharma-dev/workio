"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

export default function JoinWorkspace({ onJoin }: { onJoin: () => void }) {
  const supabase = createClient();
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const joinWorkspace = async () => {
    if (!slug.trim()) {
      toast.error("Please enter a workspace slug");
      return;
    }

    setLoading(true);

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast.error("You must be logged in to join a workspace");
      setLoading(false);
      return;
    }

    // Check if workspace exists and has a valid slug
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, slug")
      .eq("slug", slug)
      .single();

    if (workspaceError || !workspace || !workspace.slug) {
      toast.error("Workspace not found or invalid slug");
      setLoading(false);
      return;
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspace.id)
      .eq("user_id", user.id)
      .single();

    if (existingMember && !memberCheckError) {
      toast.error("You are already a member of this workspace");
      setLoading(false);
      return;
    }

    // Add user to workspace_members with default 'member' role
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "member",
      });

    if (memberError) {
      console.error("Error joining workspace:", memberError);
      toast.error("Failed to join workspace: " + memberError.message);
    } else {
      toast.success(`Successfully joined the workspace '${slug}'`);
      setSlug("");
      onJoin(); // Trigger refresh of workspace list
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Enter workspace slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        disabled={loading}
        className="sm:w-64"
      />
      <Button
        onClick={joinWorkspace}
        disabled={loading || !slug.trim()}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
        ) : (
          "Join Workspace"
        )}
      </Button>
    </div>
  );
}