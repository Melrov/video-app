import React from "react";
import VideoPlayer from "./Reusable/VideoPlayer";
import video from "../video.mp4";
import VideoPreview from "./Reusable/VideoPreview";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  margin: 10px;
  justify-content: space-between;
`;

const Left_Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
`;

const Right_Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
`;

function VideoPage() {
  function y() {
    let arr = [];
    for (let i = 0; i < 6; i++) {
      arr.push(
        <VideoPreview
          title="Video of the time"
          uploadDate="1 year ago"
          views={34}
          version="columnnn"
          thumbnail="http://localhost:3000/thumbnail.png"
          tooltip="5:40"
          username="johnanthan"
        />
      );
    }
    return arr;
  }

  return (
    <Container>
      <Left_Container>
        <VideoPlayer url={video} />
      </Left_Container>
      <Right_Container>{y()}</Right_Container>
    </Container>
  );
}

export default VideoPage;
