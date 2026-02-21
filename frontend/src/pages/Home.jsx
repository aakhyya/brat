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
          `${import.meta.env.VITE_API_URL}/api/content/library?limit=100`,  // ✅ Use existing endpoint
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const data = await res.json();
        const counts = data.data.reduce((acc, item) => {
          const type = item.content.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        setStats({ movies: counts.movie || 0, songs: counts.song || 0, books: counts.book || 0 });

      } catch (err) {
        console.error("Failed to load stats", err);
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
        <div className="mt-6 flex justify-center gap-8 text-md tracking-wider text-neon-green">
          <div>
            {loadingStats ? "..." : `💿 ${stats?.songs || 0} ${(stats?.songs) <=1 ? `song` : `songs`}`}
          </div>
          <div>
            {loadingStats ? "..." : `🎞️ ${stats?.movies || 0} ${(stats?.movies) <=1 ? `movie` : `movies`}`}
          </div>
          <div>
            {loadingStats ? "..." : `📖 ${stats?.books || 0} ${(stats?.books) <=1 ? `book` : `books`}`}
          </div>
        </div>


      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20 relative z-10">
        {[
          {
            icon: "☠︎",
            title: "discover content",
            desc: "show us what you're into",
            path: "/search",
          },
          {
            icon: "🀥",
            title: "your content",
            desc:"content you heavily fw", 
              path: "/library",
          },
        {
          icon: "🔗",
        title: "recommendations",
        desc: "what's your arc today?",
        path: "/recommendations",
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
