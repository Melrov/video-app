import "./App.css";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import VideoPage from "./components/VideoPage";
import UploadVideoPage from "./components/UploadVideoPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { useContext, useEffect } from "react";
import useFetch from "./hooks/useFetch";
import { UserContext } from "./context/UserContext";
import SeriesPage from "./components/SeriesPage.jsx";

function App() {
  const { verify } = useFetch()
  const { setLoggedInUser } = useContext(UserContext)
  useEffect(() => {
    async function init() {
      const res = await verify();
      if (res.success) {
        setLoggedInUser(res.data.username);
      }
    }
      init();
  }, [setLoggedInUser, verify])
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/login" element={<ProtectedRoutes isPrivate={false}><LoginPage /></ProtectedRoutes>} />
        <Route path="/signup" element={<ProtectedRoutes isPrivate={false}><SignupPage /></ProtectedRoutes>} />
        <Route path="/video/:contentId" element={<VideoPage />} />
        <Route path="/video/:contentId/:season/:episodeNum" element={<SeriesPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoutes isPrivate={true}>
              <UploadVideoPage />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
