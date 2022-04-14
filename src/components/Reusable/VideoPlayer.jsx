import React, { useEffect, useRef } from "react";
import "./VideoPlayer.css";
import useVideoPlayer from "../../hooks/useVideoPlayer";
import styled from "styled-components";

const Input = styled.input`
  -webkit-appearance: none;
  width: calc(100% - 5px);
  height: 7px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-image: linear-gradient(rgb(255 69 0 / 100%), rgb(255 69 0 / 20%));
  background-size: 70% 100%;
  background-repeat: no-repeat;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 0px;
    width: 0px;
    border-radius: 50%;
    background: #ff4500;
    cursor: pointer;
    box-shadow: 0 0 2px 0 #555;
    transition: all 0.125s ease-in-out;
  }

  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    box-shadow: none;
    border: none;
    background: transparent;
    cursor: pointer;
  }
`;

const InputContainer = styled.div`
  &:hover {
    ${Input} {
      &::-webkit-slider-thumb {
        height: 15px;
        width: 15px;
      }
    }
  }
`;

const Video = styled.video`
  width: 100%;
  height: 99%;
  background-color: black;
`;

const Controls = styled.div`
  display: ${props => props.hidden ? 'none' : 'block'};
`

const VideoPlayer = ({ videoId, episodeNum = 0 }) => {
  const videoElement = useRef(null);
  const inputRef = useRef();
  const playBtn = useRef();
  const timeRef = useRef();
  const controlsRef = useRef();
  const volumeBtnRef = useRef();
  const fullscreen = useRef()
  const {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoSpeed,
    toggleMute,
    loadedData,
    input,
    rewind,
    forward,
    ended,
    volumeChange,
    fullscreenClick,
    reset,
  } = useVideoPlayer(videoElement, inputRef, playBtn, timeRef, controlsRef, volumeBtnRef, fullscreen);

  useEffect(() => {
    reset()
    playBtn.current.innerText = 'play_arrow'
    inputRef.current.value = 0;
  }, [reset, videoId])

  return (
    <div className="video-wrapper">
      <Video
        src={`/api/video/stream/${videoId}${episodeNum > 0 ? `/${episodeNum}` : ""}`}
        ref={videoElement}
        onTimeUpdate={handleOnTimeUpdate}
        onLoadedData={loadedData}
        onEnded={ended}
        controls={false}
        disablePictureInPicture={true}
        autoPlay={false}
      />
      <div className="progressAreaTime" ref={timeRef}>
        0:00
      </div>
      <Controls className="controls" ref={controlsRef} hidden={playerState.superHidden}>
        <InputContainer>
          <Input
            type="range"
            min="0"
            max="100"
            value={playerState.progress}
            onChange={input.change}
            onMouseMove={input.mouseMove}
            onMouseLeave={input.mouseLeave}
            onMouseDown={input.mouseDown}
            onMouseUp={input.mouseUp}
            ref={inputRef}
          />
        </InputContainer>
        <div className="actions">
          <div className="actions-left">
            <button className="icon">
              <i className="material-icons fast-rewind" onClick={rewind}>
                replay_10
              </i>
            </button>
            <button onClick={togglePlay}>
              <i className="material-icons play_pause" ref={playBtn}>
                play_arrow
              </i>
            </button>
            <button className="icon">
              <i className="material-icons fast-forward" onClick={forward}>
                forward_10
              </i>
            </button>
            <div className="timer">
              <span>
                {playerState.current} / {playerState.duration}
              </span>
            </div>
            <button className="icon volume_box">
              <i className="material-icons volume" ref={volumeBtnRef} onClick={toggleMute}>
                volume_up
              </i>
              <input
                type="range"
                min="0"
                max="100"
                className="volume_range"
                value={playerState.volume}
                onChange={volumeChange}
              />
            </button>
          </div>
          <div className="actions-right">
            <select className="velocity" value={playerState.speed} onChange={(e) => handleVideoSpeed(e)}>
              <option value="0.50">0.50x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="2">2x</option>
            </select>
            <button className="icon">
                <i className="material-icons fullscreen" ref={fullscreen} onClick={fullscreenClick}>
                  fullscreen
                </i>
              </button>
          </div>
        </div>
      </Controls>
    </div>
  );
};

export default VideoPlayer;
