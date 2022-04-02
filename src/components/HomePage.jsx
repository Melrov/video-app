import React, { useContext, useEffect } from "react";
import VideoPreview from "./Reusable/VideoPreview";
import styled from "styled-components";
import { VideosContext } from "../context/VideosContext";
import { UserContext } from "../context/UserContext";

const VideosCon = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 10px;
`;

function HomePage() {
  const {videos, error, refresh} = useContext(VideosContext)
  const { user } = useContext(UserContext)

  useEffect(() => {
    refresh()
  }, [refresh, user]);

  return (
    <div>
      {error && <span>{error}</span>}
      {videos && (
        <VideosCon>
          {videos.map((video) => {
            return (
              <VideoPreview
                key={video.id}
                uuid={video.id}
                thumbnail={"/thumbnail.png"}
                tooltip={video.duration}
                title={video.title}
                username={video.username}
                views={video.views}
                uploadDate={video.uploadDate}
                version="home"
              />
            );
          })}
        </VideosCon>
      )}
    </div>
  );
}

export default HomePage;
