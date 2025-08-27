"use client";
import { createClient } from "@/lib/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabase = createClient();

const ProfileOnboarding = () => {
  const [formData, setFormData] = useState({
    name: "",
    avatar_url: "",
    bio: "",
  });
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Check for authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin"); // Redirect if not signed in
        return;
      }
      setUser(user);

      // ✅ Prefill profile if exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFormData({
          name: profile.name || "",
          avatar_url: profile.avatar_url || "",
          bio: profile.bio || "",
        });
      }
    };

    fetchUser();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: formData.name,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setError(error.message);
        return;
      }

      // ✅ Redirect once profile is set
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Complete Your Profile
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label
              htmlFor="avatar_url"
              className="block text-sm font-medium text-gray-700"
            >
              Avatar URL (optional)
            </label>
            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio (optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Tell us about yourself"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
