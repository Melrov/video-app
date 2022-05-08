import React from "react";
import VideoPreview from "../shared/components/VideoPreview";
import styled from "styled-components";

const CarouselContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ItemsContainer = styled.div`
  display: flex;
`;
const ArrowHover = styled.div`
  background: radial-gradient(gray, 0%, transparent);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  flex-basis: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s cubic-bezier(0, 0.99, 0.47, 1.32) 0s;
  &:hover {
    background: radial-gradient(gray, 60%, transparent);
  }
`;
const Arrow = styled.div`
  width: 10px;
  height: 10px;
  border-left: 5px solid black;
  border-top: 5px solid black;
  transform: rotate(${(props) => (props.direction === "left" ? "-45deg" : "135deg")});
`;

function Carousel({ contentId, arr, selectedSeason, click }) {
  return (
    <CarouselContainer>
      {arr.length > 5 && (
        <ArrowHover>
          <Arrow direction={"left"} />
        </ArrowHover>
      )}
      <ItemsContainer>
        {arr.map((season, idx) => (
          <VideoPreview
            key={"cs" + idx}
            uuid={contentId}
            title={season.title}
            season={season.season}
            episodes={season.episodes.length}
            type={"series"}
            version={"carousel"}
            selected={selectedSeason === season.season}
            click={click}
          />
        ))}
      </ItemsContainer>
      {arr.length > 5 && (
        <ArrowHover>
          <Arrow direction={"right"} />
        </ArrowHover>
      )}
    </CarouselContainer>
  );
}

export default Carousel;
