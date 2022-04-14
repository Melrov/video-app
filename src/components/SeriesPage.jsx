import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "./Reusable/VideoPlayer";
import styled from "styled-components";
import useFetch from "../hooks/useFetch";

const MainContainer = styled.div`
  display: flex;,
  max-width: '1300px',
`;
const LeftContainer = styled.div``;
const ContainerItem = styled.div`
  background-color: "#3b4042",
  padding '5px',
  margin-bottom: '10px',
`;
const VideoContainer = styled.div`
  padding: '0px',
  margin: '0px,'
  margin-bottom: '10px',
`;

//#1c2227

function SeriesPage() {
  const { contentId, season, episodeNum } = useParams();
  const navigate = useNavigate()
  const { videoInfo, homeVideos } = useFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
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
    init();
  }, [contentId, videoInfo]);
  return (
    <>
      {data && (
        <MainContainer>
          <LeftContainer>
            <VideoContainer>
              <VideoPlayer videoId={contentId} episodeNum={isNaN(parseInt(episodeNum)) ? 0 : parseInt(episodeNum)} />
            </VideoContainer>
            <ContainerItem>
              {data.episodes.map((episode, idx) => {
                return <button key={idx} onClick={() => navigate(`/video/${contentId}/${episode.episodeNumber}`)}>{episode.episodeNumber}</button>;
              })}
              {
                // this is where the episode selector will be
              }
            </ContainerItem>
            <ContainerItem>
              {
                // this is where the Video info goes
              }
            </ContainerItem>
          </LeftContainer>
        </MainContainer>
      )}
    </>
  );
}

export default SeriesPage;
