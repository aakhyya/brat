import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/content/library/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Failed to load stats",err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 relative overflow-hidden bg-gradient-to-br from-black via-purple-900/50 to-black">
      <section className="text-center mb-16 relative z-10">
        <h1 className="
          text-4xl font-black 
          bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200
          bg-clip-text text-transparent
          mb-6
        ">
          Let’s see what you’re into, <span className="text-green-400 font-semibold">{user?.profile.displayName || "you"}</span>.
        </h1>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20 relative z-10">
        {[
          {
            icon: "🎞️",
            title: "explore movies",
            desc: `${loadingStats ? <span className="text-gray-400 animate-pulse">loading movies…</span> 
                                  : stats?.movies || 0} movies`,
            path: "/search/movie",
          },
          {
            icon: "💿",
            title: "discover music",
            desc: `${loadingStats ? <span className="text-gray-400 animate-pulse">loading songs…</span> 
                                  : (stats?.songs || 0)} songs`,
            path: "/search/song",
          },
          {
            icon: "📖",
            title: "browse books",
            desc: `${loadingStats ? <span className="text-gray-400 animate-pulse">loading books...</span> 
                                  : (stats?.books || 0)} books`,
            path: "/search/book",
          },
          {
            icon: "🪩",
            title: "taste graph",
            desc: "your vibe, visualised.",
            path: "/taste-graph",
          },
        ].map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className="
              bg-black/40 backdrop-blur-md
              border-2 border-green-400/30
              hover:border-green-400
              hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]
              rounded-lg p-8
              transition-all duration-300
              cursor-pointer
            "
          >
            <div className="
              text-6xl mb-4
              filter drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]
            ">
              {card.icon}
            </div>

            <h3 className="
              text-2xl font-bold mb-2
              bg-gradient-to-r from-green-400 to-purple-400
              bg-clip-text text-transparent
            ">
              {card.title}
            </h3>

            <p className="text-gray-300">{card.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
