import React, { useEffect, useState } from "react";
import VideoPlayer from "./Reusable/VideoPlayer";
import VideoPreview from "./Reusable/VideoPreview";
import styled from "styled-components";
import VideoInfo from "./VideoInfo";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";

const Container = styled.div`
  display: flex;
  margin: 10px;
  justify-content: center;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 975px;
  margin-right: 30px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

function VideoPage() {
  const { contentId } = useParams();
  const { videoInfo, homeVideos } = useFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    async function init(){
      if (contentId) {
        const res = await videoInfo(contentId);
        if (res.success) {
          setData(res.data);
        } else {
          setData(null);
          setError(res.error);
        }
      }
    }
    init()
  }, [contentId, videoInfo]);

  useEffect(() => {
    async function init(){
      const res = await homeVideos(contentId);
    if (res.success) {
      let a = res.data.filter((video) => {
        if (video.id !== contentId) {
          return true;
        }
        return false;
      });
      setHomeData(a);
    } else {
      setHomeData(null);
    }
    }
    init()
  }, [contentId, videoInfo, homeVideos]);

  return (
    <Container>
      {error && <span>{error}</span>}
      {data && (
        <>
          <LeftContainer>
            <VideoPlayer videoId={contentId} />
            <VideoInfo
              title={data.title}
              uploadDate={data.uploadDate}
              views={data.views}
              username={data.username}
              tags={data.tags}
              likes={data.likes}
              dislikes={data.dislikes}
              description={data.description}
            />
          </LeftContainer>
          <RightContainer>
            {homeData && (
              <>
                {homeData.map((video) => {
                  return (
                    <VideoPreview
                      key={video.id}
                      title={video.title}
                      uploadDate={video.uploadDate}
                      views={video.views}
                      version="row"
                      uuid={video.id}
                      tooltip={video.duration}
                      username={video.username}
                    />
                  );
                })}
              </>
            )}
          </RightContainer>
        </>
      )}
    </Container>
  );
}

export default VideoPage;
