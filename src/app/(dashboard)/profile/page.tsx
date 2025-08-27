
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import { createClient } from '@/lib/server';

interface ProfilePageProps {
  params: { id?: string };
}

const ProfilePage: NextPage<ProfilePageProps> = async ({ params }) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Determine which profile to fetch: current user or specific user by ID
  const profileId = params.id || user.id;

  // Fetch profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, bio, created_at, updated_at')
    .eq('id', profileId)
    .single();

  // Handle errors or missing profile
  if (error || !profile) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p>{error?.message || 'No profile data available.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{profile.name || 'Unnamed User'}</h1>
      {profile.avatar_url && (
        <img
          src={profile.avatar_url}
          alt={`${profile.name}'s avatar`}
          className="w-24 h-24 rounded-full mb-4"
        />
      )}
      <p className="text-lg mb-2"><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
      <p className="text-sm text-gray-500">
        <strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-500">
        <strong>Last Updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ProfilePage;