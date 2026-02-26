import { useEffect, useState } from "react";
import api from "../services/api";
import TasteGraphVisualization from "../components/visualization/TasteGraphVisualization";

function TasteProfile() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchGraphData(isManualRefresh = false) {
    if (isManualRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await api.get("/api/auth/taste-graph");
      setGraphData(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch taste graph", err);
      setError("Failed to load taste graph. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  function formatLastUpdated() {
    if (!lastUpdated) return "";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);

    if (diff < 60) return `${diff}s ago`;
    else if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    else return lastUpdated.toLocaleTimeString();
  }

  if (loading && !graphData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-base sm:text-lg">Loading your taste graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg sm:text-xl mb-4">🚨 {error}</p>
          <button
            onClick={() => fetchGraphData(true)}
            className="px-6 py-2 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="text-center">
          <div className="text-6xl sm:text-8xl mb-6">𓏲ּ𝄢</div>
          <p className="text-xl sm:text-2xl mb-4">No taste data yet</p>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">Rate some content to unlock your taste graph</p>
          <a
            href="/search"
            className="px-6 py-3 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition inline-block"
          >
            Go to Search
          </a>
        </div>
      </div>
    );
  }

  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.edges.length;
  const strongestPreference = [...graphData.nodes].sort((a, b) => b.value - a.value)[0];
  const weakestPreference = [...graphData.nodes].sort((a, b) => a.value - b.value)[0];

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black uppercase text-chrome">
              Your Taste Graph
            </h1>
            <p className="text-pink-200 mt-2 text-sm sm:text-base">𓏲ּ𝄢 your vibe, visualised</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-pink-200 text-xs sm:text-sm font-mono">Updated {formatLastUpdated()}</div>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchGraphData(true)}
              disabled={loading}
              className="px-3 sm:px-4 py-2 border border-neon-green text-chrome-silver font-bold rounded-lg hover:text-neon-green transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              {loading ? "Refreshing..." : "⟳ Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {/* Graph Container - Responsive Height */}
            <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] bg-black/40 border border-green-400/30 rounded-lg overflow-hidden">
              <TasteGraphVisualization data={graphData} />
            </div>

            {/* Instructions */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-black/40 border border-red-300 rounded-lg">
              <p className="text-xs sm:text-sm md:text-base font-serif text-green-400">
                <span className="hidden sm:inline">💥 Drag nodes to move them • Scroll to zoom • Hover for details</span>
                <span className="sm:hidden">💥 Pinch to zoom • Tap for details</span>
              </p>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
              {/* Legend */}
              <div className="p-4 sm:p-6 bg-black/40 border border-pink-300 rounded-lg">
                <h3 className="text-base sm:text-lg font-bold italic text-neon-green mb-3">Legend</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <div className="text-purple-300 font-extrabold">✦</div>
                    <span>Genre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-green-300 font-extrabold">✦</div>
                    <span>Mood</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-cyan-300 font-extrabold">✦</div>
                    <span>Theme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-pink-300 font-extrabold">✦</div>
                    <span>Era</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-amber-300 font-extrabold">✦</div>
                    <span>Complexity</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 sm:p-6 bg-black/40 border border-pink-300 rounded-lg">
                <h3 className="text-base sm:text-lg font-bold italic text-neon-green mb-3">Stats</h3>
                <div className="font-mono space-y-3 text-sm">
                  <div>
                    <p className="text-chrome-silver">
                      ⌖ Dimensions: <span className="text-lg sm:text-xl text-pink-200">{totalNodes}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-chrome-silver">
                      ⌖ Connections: <span className="text-lg sm:text-xl text-pink-200">{totalEdges}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-chrome-silver">
                      ⌖ Strongest: <span className="text-lg sm:text-xl text-green-400">{(strongestPreference.value * 100).toFixed(0)}%</span>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-green-400 truncate">{strongestPreference.label}</p>
                  </div>
                  <div>
                    <p className="text-chrome-silver">
                      ⌖ Weakest: <span className="text-lg sm:text-xl text-red-400">{(weakestPreference.value * 100).toFixed(0)}%</span>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-red-400 truncate">{weakestPreference.label}</p>
                  </div>
                </div>
              </div>

              {/* Top Preferences */}
              <div className="p-4 sm:p-6 bg-black/40 border border-pink-300 rounded-lg">
                <h3 className="text-base sm:text-lg font-bold italic text-neon-green mb-3">Top 5</h3>
                <div className="space-y-2 font-mono text-sm">
                  {[...graphData.nodes]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((node) => (
                      <div key={node.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div style={{ color: node.color }}>✰</div>
                          <span className="truncate">{node.label}</span>
                        </div>
                        <span className="text-xs text-neon-green whitespace-nowrap">{(node.value * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasteProfile;
