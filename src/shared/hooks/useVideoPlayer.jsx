import { useState, useEffect, useCallback, useMemo } from "react";

const useVideoPlayer = (
  videoCon,
  videoElement,
  inputRef,
  playBtn,
  timeRef,
  controlsRef,
  volumeBtnRef,
  fullscreen,
  watchTime,
  updateWatchTime
) => {
  const [playerState, setPlayerState] = useState({
    wasPlaying: false,
    isPlaying: false,
    progress: 0,
    speed: 1,
    isMuted: false,
    current: "0 : 00",
    duration: "0 : 00",
    volume: 100,
    wasVolume: 100,
    superHidden: true,
    loading: false,
  });

  //resets player state things when video src changes
  const reset = useCallback(() => {
    setPlayerState((curr) => {
      return {
        ...curr,
        wasPlaying: false,
        isPlaying: false,
        progress: 0,
        superHidden: true,
      };
    });
  }, []);

  //sets up state on video load
  const loadedData = useCallback(
    (e) => {
      let videoDuration = e.target.duration;
      let totalMin = Math.floor(videoDuration / 60);
      let totalSec = Math.floor(videoDuration % 60);
      // if seconds are less then 10 then add 0 at the begning
      totalSec = totalSec < 10 ? "0" + totalSec : totalSec;
      //console.log("load", watchTime);
      if (watchTime) {
        e.target.currentTime = watchTime;
        let currentVideoTime = watchTime;
        let currentMin = Math.floor(currentVideoTime / 60);
        let currentSec = Math.floor(currentVideoTime % 60);
        // if seconds are less then 10 then add 0 at the begning
        currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
        const progress = (currentVideoTime / e.target.duration) * 100;
        setPlayerState((curr) => {
          return {
            ...curr,
            progress,
            current: `${currentMin} : ${currentSec}`,
            duration: `${totalMin} : ${totalSec}`,
            superHidden: false,
          };
        });
      } else {
        setPlayerState((curr) => {
          return { ...curr, duration: `${totalMin} : ${totalSec}`, progress: 0, superHidden: false };
        });
      }
    },
    [watchTime]
  );

  //changes the playing key of player state
  const togglePlay = useCallback(() => {
    const playing = playerState.isPlaying;
    playBtn.current.innerText = playing ? "play_arrow" : "pause_arrow";
    setPlayerState((curr) => {
      return { ...curr, isPlaying: !playing, wasPlaying: !playing };
    });
  }, [playerState.isPlaying, playBtn]);

  //makes the player pause or play on playerState.isPlaying changing
  useEffect(() => {
    playerState.isPlaying ? videoElement.current.play() : videoElement.current.pause();
  }, [playerState.isPlaying, videoElement]);

  //adds the paused class to controls ref which makes it stay open when paused
  useEffect(() => {
    if (!playerState.isPlaying) {
      controlsRef.current.classList.add("paused");
    } else {
      controlsRef.current.classList.remove("paused");
    }
  }, [playerState, controlsRef]);

  useEffect(() => {
    //this is disabled due to firing on video load
    //console.log('pause setter')
    //if (!playerState.isPlaying) updateWatchTime();
  }, [playerState.isPlaying]);

  const handleOnTimeUpdate = useCallback(
    (e) => {
      if (videoElement) {
        let currentVideoTime = videoElement.current.currentTime;
        let currentMin = Math.floor(currentVideoTime / 60);
        let currentSec = Math.floor(currentVideoTime % 60);
        // if seconds are less then 10 then add 0 at the begning
        currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
        const progress = videoElement.current.currentTime;
        setPlayerState((curr) => {
          return { ...curr, progress, current: `${currentMin} : ${currentSec}` };
        });
      }
    },
    [videoElement]
  );

  // input element events
  const input = useMemo(() => {
    return {
      change: (e) => {
        const manualChange = parseInt(e.target.value);
        videoElement.current.currentTime = e.target.value;
        setPlayerState((curr) => {
          return { ...curr, progress: manualChange };
        });
      },
      mouseMove: (e) => {
        let progressWidthval = inputRef.current.clientWidth;
        let x = e.nativeEvent.offsetX;
        timeRef.current.style.setProperty("--x", `${x}px`);
        timeRef.current.style.display = "block";
        let videoDuration = videoElement.current.duration;
        let progressTime = Math.round((x / progressWidthval) * videoDuration);
        let currentMin = Math.floor(progressTime / 60);
        let currentSec = Math.floor(progressTime % 60);
        // if seconds are less then 10 then add 0 at the begning
        currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
        timeRef.current.innerHTML = `${currentMin} : ${currentSec}`;
      },
      mouseLeave: (e) => {
        timeRef.current.style.display = "none";
      },
      mouseDown: (e) => {
        playBtn.current.innerText = "play_arrow";
        setPlayerState((curr) => {
          return { ...curr, isPlaying: false };
        });
      },
      mouseUp: (e) => {
        if (playerState.wasPlaying) {
          playBtn.current.innerText = "pause_arrow";
        }
        setPlayerState((curr) => {
          return { ...curr, isPlaying: curr.wasPlaying };
        });
      },
    };
  }, [videoElement, inputRef, timeRef, playerState.wasPlaying, playBtn]);

  //makes the bar input bar have color to current time
  useEffect(() => {
    if (inputRef) {
      inputRef.current.style.backgroundSize = `${playerState.progress ? (playerState.progress / videoElement.current.duration) * 100 : 0}% 100%`;
    }
  }, [playerState.progress, inputRef]);

  //not used was old video speed change with select element
  const handleVideoSpeed = useCallback(
    (event) => {
      const speed = Number(event.target.value);
      videoElement.current.playbackRate = speed;
      setPlayerState((curr) => {
        return { ...curr, speed };
      });
    },
    [videoElement]
  );

  //changes player speed and state speed
  const setSpeed = useCallback(
    (speed) => {
      if (videoElement) {
        videoElement.current.playbackRate = playerState.speed;
      }
      setPlayerState((curr) => {
        return { ...curr, speed };
      });
    },
    [setPlayerState, videoElement]
  );

  //mutes the video and sets the correct symbol for volume
  const toggleMute = useCallback(() => {
    volumeBtnRef.current.innerText = !playerState.isMuted ? "volume_off" : playerState.volume <= 40 ? "volume_down" : "volume_up";
    playerState.isMuted ? (videoElement.current.muted = true) : (videoElement.current.muted = false);
    setPlayerState((curr) => {
      return {
        ...curr,
        isMuted: !playerState.isMuted,
        volume: !playerState.isMuted ? 0 : playerState.wasVolume > 0 ? playerState.wasVolume : 1,
      };
    });
  }, [playerState.isMuted, playerState.wasVolume, playerState.volume, volumeBtnRef, videoElement]);

  const rewind = useCallback(() => {
    videoElement.current.currentTime -= 10;
  }, [videoElement]);

  const forward = useCallback(() => {
    videoElement.current.currentTime += 10;
  }, [videoElement]);

  const ended = useCallback(() => {
    playBtn.current.innerText = "replay";
    setPlayerState((curr) => {
      return { ...curr, wasPlaying: false, isPlaying: false };
    });
  }, [playBtn]);

  const volumeChange = useCallback(
    (e) => {
      e.target.style.backgroundSize = `${e.target.value}% 100%`;
      videoElement.current.volume = e.target.value / 100;
      if (parseInt(e.target.value) === 0) {
        volumeBtnRef.current.innerText = "volume_off";
        setPlayerState((curr) => {
          return {
            ...curr,
            volume: e.target.value,
            wasVolume: e.target.value,
            isMuted: true,
          };
        });
      } else {
        volumeBtnRef.current.innerText = parseInt(e.target.value) <= 40 ? "volume_down" : "volume_up";
        setPlayerState((curr) => {
          return {
            ...curr,
            volume: e.target.value,
            wasVolume: e.target.value,
            isMuted: false,
          };
        });
      }
    },
    [volumeBtnRef, videoElement]
  );

  //toggles fullscreen on the video container
  const fullscreenClick = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setPlayerState((curr) => {
        return { ...curr, fullscreen: false };
      });
    } else if (document.webkitFullscreenElement) {
      // Need this to support Safari
      document.webkitExitFullscreen();
      setPlayerState((curr) => {
        return { ...curr, fullscreen: false };
      });
    } else if (videoCon.current.webkitRequestFullscreen) {
      // Need this to support Safari
      videoCon.current.webkitRequestFullscreen();
      setPlayerState((curr) => {
        return { ...curr, fullscreen: true };
      });
    } else {
      videoCon.current.requestFullscreen();
      setPlayerState((curr) => {
        return { ...curr, fullscreen: true };
      });
    }
  }, [videoCon]);

  //changes the fullscreen logo when the playerState.fullscreen changes
  useEffect(() => {
    if (playerState.fullscreen) {
      fullscreen.current.innerText = "fullscreen_exit";
    } else {
      fullscreen.current.innerText = "fullscreen";
    }
  }, [playerState.fullscreen]);

  //sets loading to true and when it is true the loading circle should show
  const startLoading = useCallback(() => {
    setPlayerState((curr) => {
      return { ...curr, loading: true };
    });
  }, []);

  //this disables loading when the progress updates meaning the video is playing
  useEffect(() => {
    if (playerState.loading) {
      setPlayerState((curr) => {
        return { ...curr, loading: false };
      });
    }
  }, [playerState.progress]);

  return {
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
    setSpeed,
  };
};

export default useVideoPlayer;
