import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const VALID_ACTIONS = ['create', 'join'] as const;

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 401 });
    }
    if (userError) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Failed to retrieve user' }, { status: 401 });
    }
    if (!session || !user) {
      console.error('No session or user found');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const { name, workspaceId, action } = await request.json();

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "create" or "join"' }, { status: 400 });
    }

    if (action === 'create') {
      if (!name?.trim()) {
        return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
      }

      // Generate slug
      const slug = name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50);
      const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;

      // Check if slug already exists
      const { data: existingSlug, error: slugError } = await supabase
        .from('workspaces')
        .select('slug')
        .eq('slug', uniqueSlug)
        .maybeSingle();

      if (slugError) {
        console.error('Slug check error:', slugError);
        return NextResponse.json({ error: 'Failed to validate slug' }, { status: 500 });
      }
      if (existingSlug) {
        return NextResponse.json({ error: 'Generated slug already exists, please try again' }, { status: 400 });
      }

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: name.trim(),
          slug: uniqueSlug,
          created_by: user.id,
        })
        .select('id, name, slug, description, created_by, created_at')
        .single();

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError);
        if (workspaceError.code === '23505') {
          return NextResponse.json({ error: 'A workspace with this slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
      }

      console.log('Workspace created successfully:', workspace.id);
      return NextResponse.json({ data: workspace });
    }

    if (action === 'join') {
      if (!workspaceId?.trim()) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(workspaceId.trim())) {
        return NextResponse.json({ error: 'Invalid workspace ID format' }, { status: 400 });
      }

      // Check if workspace exists
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, name, slug, created_by')
        .eq('id', workspaceId.trim())
        .single();

      if (workspaceError || !workspace) {
        console.error('Workspace lookup error:', workspaceError);
        return NextResponse.json({
          error: 'Workspace not found or you do not have permission to join it',
        }, { status: 404 });
      }

      // Optional: Check for invitation requirement
      /*
      if (workspace.created_by !== user.id) {
        const { data: invitation, error: inviteError } = await supabase
          .from('invitations')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (inviteError || !invitation) {
          return NextResponse.json({ error: 'You need an invitation to join this workspace' }, { status: 403 });
        }
      }
      */

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('id, role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError) {
        console.error('Member check error:', memberCheckError);
        return NextResponse.json({ error: 'Failed to check membership status' }, { status: 500 });
      }

      if (existingMember) {
        return NextResponse.json({
          error: `You are already a ${existingMember.role} of this workspace`,
        }, { status: 400 });
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: user.id,
          role: 'member',
          invited_by: null,
        });

      if (memberError) {
        console.error('Member join error:', memberError);
        if (memberError.code === '23505') {
          return NextResponse.json({ error: 'You are already a member of this workspace' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 });
      }

      console.log('User joined workspace successfully:', workspaceId);
      return NextResponse.json({ data: workspace });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 401 });
    }
    if (userError) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Failed to retrieve user' }, { status: 401 });
    }
    if (!session || !user) {
      console.error('No session or user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspaces with their role
    const { data: memberships, error: membershipError } = await supabase
      .from('workspace_members')
      .select(`
        role,
        joined_at,
        workspaces!inner (
          id,
          name,
          slug,
          description,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });

    if (membershipError) {
      console.error('Error fetching workspaces:', membershipError);
      return NextResponse.json({ error: `Failed to fetch workspaces: ${membershipError.message}` }, { status: 500 });
    }

    // Transform data for frontend
    const workspaces = memberships?.map(membership => ({
      ...membership.workspaces,
      user_role: membership.role,
      joined_at: membership.joined_at,
    })) || [];

    return NextResponse.json({ data: workspaces });
  } catch (error) {
    console.error('GET API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}