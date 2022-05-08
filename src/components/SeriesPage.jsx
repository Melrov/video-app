import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../shared/components/VideoPlayer";
import styled from "styled-components";
import useFetch from "../shared/hooks/useFetch";
import VideoPreview from "../shared/components/VideoPreview";
import Carousel from "./Carousel";
import Theme from "./Theme";

const MainContainer = styled.div`
  display: flex;
  max-width: 1200px;
`;
const LeftContainer = styled.div``;
const RightContainer = styled.div`
  max-width: 350px;
`;
const ContainerItem = styled.div`
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.text.primary};
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

const TitleContainer = styled.div`
  display: flex;
`;
const TitleImage = styled.img`
  max-width: 30%;
  max-height: 200px;
  border-radius: 3px;
`;
const ContainerTitle = styled.h1`
  padding: 0px;
  margin: 0px;
  font-size: ${(props) => (props.small ? "19px" : "25px")};
  margin-bottom: 10px;
  font-weight: unset;
`;
const CarouselBox = styled.div`
  @media (min-width: 860px) {
    display: none;
  }
`;
const SeasonSide = styled.div`
  @media (max-width: 860px) {
    display: none;
  }
`;
//#1c2227

function SeriesPage() {
  const { state } = useLocation();
  const { contentId, season, episodeNum } = useParams();
  const navigate = useNavigate();
  const { videoInfo, homeVideos } = useFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [currSeason, setCurrSeason] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    if (data && data.type !== "series") {
      navigate(`/video/${data.id}`);
    }
  }, [data, navigate]);

  useEffect(() => {
    async function init() {
      if (state && state.data && state.homeData) {
        setData(state.data);
        //setHomeData(state.homeData)
      } else if (contentId) {
        const res = await videoInfo(contentId);
        //console.log(res);
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
    if (data && selectedSeason) {
      //console.log(data);
      //console.log(data.seasons.find((season) => season.season === parseInt(selectedSeason)) || []);
      setCurrSeason(data.seasons.find((season) => season.season === parseInt(selectedSeason)) || []);
    }
  }, [data, selectedSeason]);

  useEffect(() => {
    if (data && data.seasons && data.seasons.length) {
      setSelectedSeason(data.seasons[0].season);
    }
  }, [data]);

  const click = useCallback(
    (season) => {
      setSelectedSeason(season);
    },
    [setSelectedSeason]
  );

  return (
    <Theme>
      {data && (
        <MainContainer>
          <LeftContainer>
            <VideoContainer>
              {contentId && season && episodeNum && data.seasons.length > 0 && data.seasons[0].episodes.length > 0 && (
                <VideoPlayer
                  videoId={contentId}
                  episodeNum={isNaN(parseInt(episodeNum)) ? 0 : parseInt(episodeNum)}
                  season={season}
                  watchTime={data.seasons.find((seasonLoop) => seasonLoop.season === parseInt(season)).episodes[episodeNum - 1].watchTime}
                />
              )}
            </VideoContainer>
            <ContainerItem>
              <ContainerTitle small={true}>Episodes</ContainerTitle>
              {/* {data.seasons && data.seasons.length > 0 && (
                <>
                  <label htmlFor="seasons">Select a season:</label>
                  <select name="seasons" onChange={(e) => setSelectedSeason(e.target.value)}>
                    {data.seasons.map((season, idx) => {
                      return <option value={season.season} key={"s" + idx}>{`Season - ${season.season}`}</option>;
                    })}
                  </select>
                </>
              )} */}
              {currSeason && currSeason.episodes.length > 0 && (
                <>
                  {currSeason.episodes.map((episode, idx) => {
                    return (
                      <button key={"e" + idx} onClick={() => navigate(`/series/${contentId}/${selectedSeason}/${episode.episodeNumber}`)}>
                        {episode.episodeNumber}
                      </button>
                    );
                  })}
                </>
              )}
              {currSeason && currSeason.episodes.length === 0 && (
                <>
                  <span>No episodes found</span>
                </>
              )}
            </ContainerItem>
            <CarouselBox>
              <ContainerItem>
                <ContainerTitle>Seasons</ContainerTitle>
                {currSeason && <Carousel contentId={contentId} arr={data.seasons} selectedSeason={currSeason.season} click={click} />}
              </ContainerItem>
            </CarouselBox>
            <ContainerItem>
              <TitleContainer>
                <TitleImage src={`/api/video/thumbnail/${contentId}`} alt={data.title} title={data.title} />
                <div style={{ marginLeft: "10px" }}>
                  <span>{data.title}</span>
                  <p>{data.description}</p>
                </div>
              </TitleContainer>
            </ContainerItem>
          </LeftContainer>
          <RightContainer>
            <SeasonSide>
              <ContainerItem>
                <ContainerTitle>Seasons</ContainerTitle>
                {currSeason && data.seasons && data.seasons.length > 0 && (
                  <>
                    {data.seasons.map((season, idx) => (
                      <VideoPreview
                        key={"rs" + idx}
                        uuid={contentId}
                        title={season.title}
                        season={season.season}
                        episodes={season.episodes.length}
                        type={"series"}
                        selected={currSeason.season === season.season}
                        click={click}
                      />
                    ))}
                  </>
                )}
              </ContainerItem>
            </SeasonSide>
          </RightContainer>
        </MainContainer>
      )}
    </Theme>
  );
}

export default SeriesPage;
