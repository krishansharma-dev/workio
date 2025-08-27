"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

export default function JoinWorkspace({
  slug,
  onJoin,
}: {
  slug: string;
  onJoin?: () => void;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<{ id: string; name: string; privacy: string } | null>(null);
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");
  const router = useRouter();

  useEffect(() => {
    if (slug) fetchWorkspace();
  }, [slug]);

  const fetchWorkspace = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, privacy")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      toast.error("Workspace not found.");
      setWorkspace(null);
      setLoading(false);
      return;
    }

    setWorkspace(data);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!workspace) return;
    setLoading(true);

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("You must be logged in to join a workspace.");
      setLoading(false);
      return;
    }

    // 2. Check if already a member
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspace.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      toast.info("You are already a member of this workspace.");
      setLoading(false);
      return;
    }

    try {
      if (workspace.privacy === "public") {
        // Public workspace → auto join
        const { error } = await supabase
          .from("workspace_members")
          .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "member",
            invitation_status: "auto_joined",
          });

        if (error) throw error;

        toast.success("Joined workspace successfully!");
        onJoin?.();
        router.push(`/workspace/${workspace.id}`);
      } else {
        // Private workspace → must have invitation
        if (!inviteId) {
          toast.error("You need an invitation to join this workspace.");
          setLoading(false);
          return;
        }

        // Check if the invitation is valid
        const { data: invitation, error: inviteError } = await supabase
          .from("invitations")
          .select("id, workspace_id, invited_by, status")
          .eq("id", inviteId)
          .eq("workspace_id", workspace.id)
          .eq("status", "pending")
          .maybeSingle();

        if (!invitation) {
          toast.error("Invalid or expired invitation.");
          setLoading(false);
          return;
        }

        // Join as member
        const { error: memberError } = await supabase
          .from("workspace_members")
          .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "member",
            invitation_status: "accepted",
            invited_by: invitation.invited_by,
          });

        if (memberError) throw memberError;

        // Update invitation status
        const { error: updateError } = await supabase
          .from("invitations")
          .update({ status: "accepted" })
          .eq("id", invitation.id);

        if (updateError) throw updateError;

        toast.success("Joined workspace successfully!");
        onJoin?.();
        router.push(`/workspace/${workspace.id}`);
      }
    } catch (error: any) {
      toast.error("Failed to join: " + error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (!workspace) {
    return <p className="text-muted-foreground">Workspace not found.</p>;
  }

  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <h1 className="text-xl font-bold">{workspace.name}</h1>
      <p className="text-sm text-muted-foreground">
        {workspace.privacy === "public"
          ? "This is a public workspace. You can join instantly."
          : "This workspace is private. You must have an invitation to join."}
      </p>
      <Button onClick={handleJoin} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Workspace"}
      </Button>
    </div>
  );
}
