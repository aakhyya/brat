import { useEffect, useState } from "react";
import api from "../services/api";
import TasteGraphVisualization from "../components/visualization/TasteGraphVisualization";

function TasteProfile() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  async function fetchGraphData() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/auth/taste-graph");
      setGraphData(res.data.data);
    }
    catch (err) {
      console.error("Failed to fetch taste graph", err);
      setError("Failed to load taste graph. Try again later.");
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGraphData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your taste graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={fetchGraphData}
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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No taste data yet</p>
          <p className="text-gray-400 mb-6">Rate some content to unlock your taste graph</p>
          <a
            href="/search"
            className="px-6 py-2 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition inline-block"
          >
            Go to Search
          </a>
        </div>
      </div>
    );
  }

  const totalNodes = graphData.nodes.length; //dimensions = 30
  const totalEdges = graphData.edges.length; // connections
  const strongestPreference = [...graphData.nodes] // highest value of node
    .sort((a, b) => b.value - a.value)[0];
  const weakestPreference = [...graphData.nodes] // lowest value of node
    .sort((a, b) => a.value - b.value)[0];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-7xl
                                md:text-4xl
                                font-serif
                                font-black
                                uppercase
                                text-chrome">
            Your Taste Graph
          </h1>
          <button
            onClick={fetchGraphData}
            className="px-4 py-2 border border-neon-green text-chrome-silver font-bold rounded-lg hover:text-neon-green transition"
          >
            ⟳ Refresh
          </button>
        </div>
        <p className="text-pink-200 mt-2">
          𓏲ּ𝄢 your vibe, visualised 
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Graph Visualization (70% width on large screens) */}
        <div className="lg:col-span-3">
          <div className="h-[800px]">
            <TasteGraphVisualization data={graphData} />
          </div>

          {/* Instructions */}
          <div className="mt-10 p-4 bg-black/40 border border-red-300 rounded-lg">
            <p className="text-md font-serif text-green-400">
              💥 Drag nodes to move them • Scroll to zoom • Hover for details
            </p>
          </div>
        </div>

        {/* Stats Panel (30% width on large screens) */}
        <div className="lg:col-span-1 space-y-16">

          {/* Legend */}
          <div className="p-6 bg-black/40 border border-pink-300 rounded-lg">
            <h3 className="text-lg font-bold italic text-neon-green mb-3"> Legend</h3>
            <div className="space-y-2 font-mono">
              <div className="flex items-center gap-2">
                <div className="text-purple-300 font-extrabold">✦</div>
                <span className="text-sm">Genre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-300 font-extrabold">✦</div>
                <span className="text-sm">Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-cyan-300 font-extrabold">✦</div>
                <span className="text-sm">Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-pink-300 font-extrabold">✦</div>
                <span className="text-sm">Era</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-amber-300 font-extrabold">✦</div>
                <span className="text-sm">Complexity</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 bg-black/40 border border-pink-300 rounded-lg">
            <h3 className="text-lg font-bold italic text-neon-green mb-3">Stats</h3>
            <div className=" font-mono space-y-3">
              <div>
                <p className="text-md text-chrome-silver">⌖ Total Dimensions:<span className="text-xl text-pink-200"> {totalNodes}</span></p>
              </div>
              <div>
                <p className="text-md text-chrome-silver">⌖ Connections:<span className="text-xl text-pink-200"> {totalEdges}</span></p>
              </div>
              <div>
                <p className="text-md text-chrome-silver">⌖ Strongest:
                  <span className="text-xl text-green-400"> {(strongestPreference.value * 100).toFixed(0)}%</span></p>
                <p className="text-sm font-bold text-green-400">
                  {strongestPreference.label}
                </p>  
              </div>
              <div>
                <p className="text-md text-chrome-silver">⌖ Weakest: 
                  <span className="text-xl text-red-400"> {(weakestPreference.value * 100).toFixed(0)}%</span></p>
                <p className="text-sm font-bold text-red-400">
                  {weakestPreference.label}
                </p>  
              </div>
            </div>
          </div>

          {/* Top Preferences */}
          <div className="p-6 bg-black/40 border border-pink-300 rounded-lg">
            <h3 className="text-lg font-bold italic text-neon-green mb-3">Top 5</h3>
            <div className="space-y-2 font-mono">
              {[...graphData.nodes]
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((node) => (
                  <div key={node.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ color: node.color }}
                      >✰</div>
                      <span className="text-sm">{node.label}</span>
                    </div>
                    <span className="text-xs text-neon-green">
                      {(node.value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TasteProfile;