import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ContentSearch from "./pages/ContentSearch";
import Library from "./pages/Library";
import Home from "./pages/Home";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import TasteProfile from "./pages/TasteProfile";
import Recommendations from "./pages/Recommendations";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/" element={
        <ProtectedRoute><Dashboard/></ProtectedRoute>
      } />

      <Route path="/home" element={
        <ProtectedRoute>
          <Layout><Home /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/search" element={
        <ProtectedRoute>
          <Layout><ContentSearch /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/taste-graph" element={
        <ProtectedRoute>
          <Layout><TasteProfile/></Layout>
        </ProtectedRoute>
      } />

      <Route path="/library" element={
        <ProtectedRoute>
          <Layout><Library /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/recommendations" element={
        <ProtectedRoute>
          <Layout><Recommendations /></Layout>
        </ProtectedRoute>
      } />
    </Routes>

  );
}

export default App;

//“interesting taste. let’s verify.”
