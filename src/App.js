import "./App.css";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { connect } from "react-redux";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import VideoPage from "./components/VideoPage";
import UploadVideoPage from "./components/UploadVideoPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { useEffect, useState } from "react";
import useFetch from "./shared/hooks/useFetch";
import SeriesPage from "./components/SeriesPage.jsx";
import { setUser } from "./redux/actions/user.actions";

function App({ setUser }) {
  const [loading, setLoading] = useState(true);
  const { verify } = useFetch();
  useEffect(() => {
    async function init() {
      const res = await verify();
      if (res.success) {
        setUser(res.data.username);
      }
      setLoading(false);
    }
    init();
  }, [setUser, verify]);
  return (
    <>
      {!loading && (
        <Router>
          <NavBar />
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <ProtectedRoutes isPrivate={false}>
                  <LoginPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoutes isPrivate={false}>
                  <SignupPage />
                </ProtectedRoutes>
              }
            />
            <Route path="/video/:contentId" element={<VideoPage />} />
            <Route path="/series/:contentId" element={<SeriesPage />} />
            <Route path="/series/:contentId/:season/:episodeNum" element={<SeriesPage />} />
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
      )}
    </>
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  setUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
