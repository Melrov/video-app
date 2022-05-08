import React, { useCallback, useEffect, useRef } from "react";
import "./VideoPlayer.css";
import useVideoPlayer from "../hooks/useVideoPlayer";
import styled from "styled-components";
import { connect } from "react-redux";
import { setWatchTime, submitWatchTime, unmountSubmitWatchTime, videoSwitch } from "../../redux/actions/video.actions";
import Theme from "../../components/Theme";

const Input = styled.input`
  -webkit-appearance: none;
  width: calc(100% - 5px);
  height: 7px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-image: linear-gradient(${(props) => props.theme.colors.accent} 100%, ${(props) => props.theme.colors.accent} 0%);
  background-size: 70% 100%;
  background-repeat: no-repeat;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 0px;
    width: 0px;
    border-radius: 50%;
    background: ${(props) => props.theme.colors.accent};
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
  display: ${(props) => (props.hidden ? "none" : "block")};
`;

const LoadingCircle = styled.div`
  @keyframes spinner {
    0% {
      transform: translate3d(-50%, -50%, 0) rotate(0deg);
    }
    100% {
      transform: translate3d(-50%, -50%, 0) rotate(360deg);
    }
  }
  animation: 1.5s linear infinite spinner;
  animation-play-state: inherit;
  border: solid 5px ${(props) => props.theme.colors.secondaryLight};
  border-bottom-color: ${(props) => props.theme.colors.accent};
  border-radius: 50%;
  height: 40px;
  width: 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  will-change: transform;
`;

const VideoPlayer = ({
  videoId,
  episodeNum,
  season,
  file,
  watchTime = null,
  setWatchTime,
  submitWatchTime,
  unmountSubmitWatchTime,
  videoSwitch,
}) => {
  const videoElement = useRef(null);
  const inputRef = useRef();
  const playBtn = useRef();
  const timeRef = useRef();
  const controlsRef = useRef();
  const volumeBtnRef = useRef();
  const fullscreen = useRef();
  const updateWatchTime = useCallback(() => {
    //console.log("callback setter");
    //submitWatchTime(videoId, season, episodeNum)
  }, [videoId, season, episodeNum]);
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
    startLoading,
  } = useVideoPlayer(videoElement, inputRef, playBtn, timeRef, controlsRef, volumeBtnRef, fullscreen, watchTime, updateWatchTime);

  useEffect(() => {
    reset();
    playBtn.current.innerText = "play_arrow";
    inputRef.current.value = 0;
  }, [reset, videoId, season, episodeNum]);

  useEffect(() => {
    //console.log("switch");
    //console.log(videoId, season, episodeNum);
    videoSwitch(videoId, season, episodeNum);
  }, [videoId, season, episodeNum]);

  useEffect(() => {
    return () => {
      //console.log("unmount setter");
      unmountSubmitWatchTime();
    };
  }, []);

  return (
    <Theme>
      <div className="video-wrapper">
        <Video
          id="videoPlayerElement"
          src={file ? file : `/api/video/stream/${videoId}${episodeNum > 0 && season ? `/${season}/${episodeNum}` : ""}`}
          ref={videoElement}
          onTimeUpdate={(e) => {
            handleOnTimeUpdate(e);
            setWatchTime(e.target.currentTime);
          }}
          onLoadedData={loadedData}
          onEnded={ended}
          controls={false}
          disablePictureInPicture={true}
          autoPlay={false}
          onWaiting={() => startLoading()}
        />
        <div className="progressAreaTime" ref={timeRef}>
          0:00
        </div>
        {playerState.loading && <LoadingCircle />}
        <Controls className="controls" ref={controlsRef} hidden={playerState.superHidden}>
          <InputContainer>
            <Input
              type="range"
              min="0"
              max="100"
              value={isNaN(playerState.progress) ? 0 : playerState.progress}
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
                <input type="range" min="0" max="100" className="volume_range" value={playerState.volume} onChange={volumeChange} />
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
    </Theme>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  setWatchTime,
  submitWatchTime,
  unmountSubmitWatchTime,
  videoSwitch,
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoPlayer);
