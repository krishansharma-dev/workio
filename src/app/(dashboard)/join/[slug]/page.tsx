// app/join/[slug]/page.tsx
"use client";
import { useEffect, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";
import JoinWorkspace from "../../workspace/_components/JoinWorkspace";

export default function JoinWorkspacePage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      setSlug(params.slug);
    }
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteId(invite);
    }
  }, [params.slug, searchParams]);

  if (!slug) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <JoinWorkspace slug={slug} />
    </div>
  );
}
