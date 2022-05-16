import React, { useContext, useEffect } from "react";
import VideoPreview from "../shared/components/VideoPreview";
import styled from "styled-components";
import { VideosContext } from "../context/VideosContext";

const VideosCon = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 10px;
`;

const ContainerItem = styled.div`
  background-color: #24272c;
  color: white;
  margin: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
`;

function HomePage() {
  const { videos, error, refresh } = useContext(VideosContext);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      {error && <span>{error}</span>}
      {videos && (
        <VideosCon>
          {videos.map((video) => {
            return (
              <ContainerItem key={video.id}>
                <VideoPreview
                  uuid={video.id}
                  type={video.type}
                  duration={video.duration}
                  title={video.title}
                  username={video.username}
                  views={video.views}
                  uploadDate={video.uploadDate}
                  version="home"
                />
              </ContainerItem>
            );
          })}
        </VideosCon>
      )}
    </div>
  );
}

export default HomePage;
