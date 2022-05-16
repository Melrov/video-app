import React, { useEffect, useState } from "react";
import VideoPlayer from "../shared/components/VideoPlayer";
import VideoPreview from "../shared/components/VideoPreview";
import styled from "styled-components";
import VideoInfo from "./VideoInfo";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useFetch from "../shared/hooks/useFetch";
import Theme from "./Theme";

const OuterContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const MainContainer = styled.div`
  display: flex;
  max-width: 1400px;
`;
const Container = styled.div`
  display: flex;
  margin: 10px;
  justify-content: center;
  @media (max-width: 1050px) {
    flex-direction: column;
  }
`;

const LeftContainer = styled.div``;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const ContainerItem = styled.div`
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.text.main};
  padding: 10px;
  margin: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  box-shadow: 0px 0px 7px 0px black;
`;

const VideoContainer = styled.div`
  padding: 0px;
  margin: 10px;
  margin-bottom: 10px;
`;

function VideoPage() {
  const { state } = useLocation();
  const { contentId } = useParams();
  const { videoInfo, homeVideos } = useFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.type === "series") {
      navigate(`/series/${data.id}`, { state: { data, homeData } });
      //  /${data.seasons[0].season}/${data.seasons[0].episodes[0].episodeNumber}
    }
  }, [data, navigate]);

  useEffect(() => {
    async function init() {
      if (state && state.data && state.homeData) {
        setData(state.data);
        setHomeData(state.homeData);
      } else if (contentId) {
        const res = await videoInfo(contentId);
        if (res.success) {
          setData(res.data);
        } else {
          setData(null);
          setError(res.error);
        }
      }
    }
    init();
  }, [contentId, videoInfo]);

  useEffect(() => {
    async function init() {
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
    init();
  }, [contentId, videoInfo, homeVideos]);

  return (
    <Theme>
      <OuterContainer>
        <MainContainer>
          <Container>
            {error && <span>{error}</span>}
            {data && (
              <>
                <LeftContainer>
                  <VideoContainer>
                    <VideoPlayer videoId={contentId} watchTime={data.watchTime} />
                  </VideoContainer>
                  <ContainerItem>
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
                  </ContainerItem>
                </LeftContainer>
                <RightContainer>
                  <ContainerItem>
                    {homeData && (
                      <>
                        {homeData.map((video) => {
                          return (
                            <VideoPreview
                              key={video.id}
                              title={video.title}
                              type={video.type}
                              uploadDate={video.uploadDate}
                              views={video.views}
                              version="row"
                              uuid={video.id}
                              duration={video.duration}
                              username={video.username}
                            />
                          );
                        })}
                      </>
                    )}
                  </ContainerItem>
                </RightContainer>
              </>
            )}
          </Container>
        </MainContainer>
      </OuterContainer>
    </Theme>
  );
}

export default VideoPage;
