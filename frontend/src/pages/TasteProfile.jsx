import { useEffect, useState } from "react";
import api from "../services/api";

export default function TasteProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/api/auth/taste-profile");
        setProfile(res.data.data);  
      } catch (err) {
        console.error("Failed to fetch taste profile", err);
        setError("Failed to load taste profile. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading your vibe matrix...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!profile || !profile.strongPreferences?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Rate some content to unlock your taste aura ✨
      </div>
    );
  }

  function renderBar(item, isStrong) {
    const width = Math.min(Math.abs(item.value) * 100, 100);

    const glowClass = isStrong
      ? "border-neon-green"
      : "border-red-300";

    const gradientClass = isStrong
      ? "from-green-200 to-green-600"
      : "from-red-200 to-red-600";

    return (
      <div
        key={item.dimension}
        className={`p-5 rounded-2xl backdrop-blur-md bg-black/40 border-2 mb-5 ${glowClass}`}
      >
        <div className="flex justify-between mb-3 text-sm tracking-wider">
          <span className="opacity-90 font-serif italic">{item.dimension}</span>
          <span className="text-md font-semibold font-mono">{item.value.toFixed(2)}</span>
        </div>

        <div className="w-full bg-black/50 border border-chrome-silver rounded-full h-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-br ${gradientClass}`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 p-8 text-white bg-black relative overflow-hidden">

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Chrome Title */}
        <h1 className="tetext-7xl
                                md:text-4xl
                                font-serif
                                font-black
                                uppercase
                                text-chrome
                                mb-8
                                text-center">
          Your Taste Profile
        </h1>

        <p className="text-center mb-12 text-lg opacity-80">
            <span className="text-neon-green">𓆩༺ </span>you're in your <span className="text-neon-green font-semibold">{profile.strongPreferences[0]?.dimension}</span> arc<span className="text-neon-green"> ༻𓆪</span>
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl mb-6 font-serif text-center text-green-400">
              GOAT
            </h2>
            {profile.strongPreferences.map((item) => renderBar(item, true))}
          </div>

          <div>
            <h2 className="text-3xl mb-6 font-serif text-center text-red-400">
              HATE
            </h2>
            {profile.weakPreferences.map((item) => renderBar(item, false))}
          </div>
        </div>
      </div>
    </div>
  );
}
