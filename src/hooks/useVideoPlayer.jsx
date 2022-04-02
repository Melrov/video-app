import { useState, useEffect, useCallback, useMemo } from "react";

const useVideoPlayer = (videoElement, inputRef, playBtn, timeRef, controlsRef, volumeBtnRef, fullscreen) => {
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
  });

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

  useEffect(() => {
    if (!playerState.isPlaying) {
      controlsRef.current.classList.add("paused");
    } else {
      controlsRef.current.classList.remove("paused");
    }
  }, [playerState, controlsRef]);

  const loadedData = useCallback((e) => {
    let videoDuration = e.target.duration;
    let totalMin = Math.floor(videoDuration / 60);
    let totalSec = Math.floor(videoDuration % 60);

    // if seconds are less then 10 then add 0 at the begning
    totalSec = totalSec < 10 ? "0" + totalSec : totalSec;
    setPlayerState((curr) => {
      return { ...curr, duration: `${totalMin} : ${totalSec}`, progress: 0, superHidden: false };
    });
  }, []);

  const togglePlay = useCallback(() => {
    const playing = playerState.isPlaying;
    playBtn.current.innerText = playing ? "play_arrow" : "pause_arrow";
    setPlayerState((curr) => {
      return { ...curr, isPlaying: !playing };
    });
    setPlayerState((curr) => {
      return { ...curr, wasPlaying: !playing };
    });
  },[playerState.isPlaying, playBtn]);

  useEffect(() => {
    playerState.isPlaying ? videoElement.current.play() : videoElement.current.pause();
  }, [playerState.isPlaying, videoElement]);

  const handleOnTimeUpdate = useCallback(
    (e) => {
      if(videoElement){
        let currentVideoTime = videoElement.current.currentTime;
        let currentMin = Math.floor(currentVideoTime / 60);
        let currentSec = Math.floor(currentVideoTime % 60);
        // if seconds are less then 10 then add 0 at the begning
        currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
        const progress = (videoElement.current.currentTime / videoElement.current.duration) * 100;
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
        const manualChange = Number(e.target.value);
        videoElement.current.currentTime = (videoElement.current.duration / 100) * manualChange;
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
        let progressTime = Math.floor((x / progressWidthval) * videoDuration);
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

  useEffect(() => {
    if (inputRef) {
      inputRef.current.style.backgroundSize = `${playerState.progress}% 100%`;
    }
  }, [playerState.progress, inputRef]);

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

  const toggleMute = useCallback(() => {
    volumeBtnRef.current.innerText = !playerState.isMuted
      ? "volume_off"
      : playerState.volume <= 40
      ? "volume_down"
      : "volume_up";
    setPlayerState((curr) => {
      return {
        ...curr,
        isMuted: !playerState.isMuted,
        volume: !playerState.isMuted ? 0 : playerState.wasVolume > 0 ? playerState.wasVolume : 1,
      };
    });
  }, [playerState.isMuted, playerState.wasVolume, playerState.volume, volumeBtnRef]);

  useEffect(() => {
    playerState.isMuted ? (videoElement.current.muted = true) : (videoElement.current.muted = false);
  }, [playerState.isMuted, videoElement]);

  const rewind = useCallback(() => {
    videoElement.current.currentTime -= 10;
  }, [videoElement]);

  const forward = useCallback(() => {
    videoElement.current.currentTime += 10;
  }, [videoElement]);

  const ended = useCallback(() => {
    setPlayerState((curr) => {
      return { ...curr, wasPlaying: false, isPlaying: false };
    });
    playBtn.current.innerText = "replay";
  }, [playBtn]);

  const volumeChange = useCallback(
    (e) => {
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

  const fullscreenClick = useCallback(() => {
    if (!videoElement.current.classList.contains("openFullScreen")) {
      videoElement.current.classList.add("openFullScreen");
      fullscreen.current.innerHTML = "fullscreen_exit";
      videoElement.current.requestFullscreen();
    } else {
      videoElement.current.classList.remove("openFullScreen");
      fullscreen.current.innerHTML = "fullscreen";
      document.exitFullscreen();
    }
  }, [videoElement, fullscreen]);

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
  };
};

export default useVideoPlayer;
