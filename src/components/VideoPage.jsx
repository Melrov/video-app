import React, { useEffect, useState } from "react";
import VideoPlayer from "./Reusable/VideoPlayer";
import video from "../video.mp4";
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

const Left_Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 975px;
  margin-right: 30px;
`;

const Right_Container = styled.div`
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

  useEffect(async () => {
    if (contentId) {
      const res = await videoInfo(contentId);
      if (res.success) {
        setData(res.data);
      } else {
        setData(null);
        setError(res.error);
      }
    }
  }, [contentId, videoInfo]);

  useEffect(async () => {
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
  }, [contentId, videoInfo]);

  return (
    <Container>
      {error && <span>{error}</span>}
      {data && (
        <>
          <Left_Container>
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
          </Left_Container>
          <Right_Container>
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
          </Right_Container>
        </>
      )}
    </Container>
  );
}

export default VideoPage;
