import { useState, useEffect, useCallback, useMemo } from "react";

const useVideoPlayer = (videoElement, inputRef, playBtn, timeRef, controlsRef, volumeBtnRef) => {
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
  });

  useEffect(() => {
    if(!playerState.isPlaying){
      controlsRef.current.classList.add("paused")
    } else {
      controlsRef.current.classList.remove("paused")
    }
  }, [playerState])

  const loadedData = useCallback(
    (e) => {
      let videoDuration = e.target.duration;
      let totalMin = Math.floor(videoDuration / 60);
      let totalSec = Math.floor(videoDuration % 60);

      // if seconds are less then 10 then add 0 at the begning
      totalSec = totalSec < 10 ? "0" + totalSec : totalSec;
      setPlayerState({ ...playerState, duration: `${totalMin} : ${totalSec}` });
      togglePlay()
    },
    [playerState]
  );

  const togglePlay = () => {
    const playing = playerState.isPlaying;
    playBtn.current.innerText = playing ? "play_arrow" : "pause_arrow";
    setPlayerState((curr) => {
      return { ...curr, isPlaying: !playing };
    });
    setPlayerState((curr) => {
      return { ...curr, wasPlaying: !playing };
    });
  };

  useEffect(() => {
    playerState.isPlaying ? videoElement.current.play() : videoElement.current.pause();
  }, [playerState.isPlaying, videoElement]);

  const handleOnTimeUpdate = (e) => {
    let currentVideoTime = videoElement.current.currentTime;
    let currentMin = Math.floor(currentVideoTime / 60);
    let currentSec = Math.floor(currentVideoTime % 60);
    // if seconds are less then 10 then add 0 at the begning
    currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
    const progress = (videoElement.current.currentTime / videoElement.current.duration) * 100;
    setPlayerState({
      ...playerState,
      progress,
      current: `${currentMin} : ${currentSec}`,
    });
  };

  // input element events
  const input = useMemo(() => {
    return {
      change: (e) => {
        const manualChange = Number(e.target.value);
        videoElement.current.currentTime = (videoElement.current.duration / 100) * manualChange;
        setPlayerState({
          ...playerState,
          progress: manualChange,
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
        console.log(videoElement.current.buffered.end(0) / videoElement.current.duration);
      },
      mouseDown: (e) => {
        playBtn.current.innerText = "play_arrow";
        setPlayerState((curr) => {
          return { ...curr, isPlaying: false };
        });
      },
      mouseUp: (e) => {
        if(playerState.wasPlaying){
          playBtn.current.innerText = "pause_arrow"
        }
        setPlayerState((curr) => {
          return { ...curr, isPlaying: curr.wasPlaying };
        });
      },
    };
  }, [videoElement, inputRef, timeRef, playerState]);

  useEffect(() => {
    if (inputRef) {
      inputRef.current.style.backgroundSize = `${playerState.progress}% 100%`;
    }
  }, [playerState.progress, inputRef]);

  const handleVideoSpeed = (event) => {
    const speed = Number(event.target.value);
    videoElement.current.playbackRate = speed;
    setPlayerState({
      ...playerState,
      speed,
    });
  };

  const toggleMute = () => {
    volumeBtnRef.current.innerText = !playerState.isMuted ? 'volume_off' : playerState.volume <= 40 ? 'volume_down' : 'volume_up';
    setPlayerState({
      ...playerState,
      isMuted: !playerState.isMuted,
      volume: !playerState.isMuted ? 0 : playerState.wasVolume > 0 ? playerState.wasVolume : 1
    });
  };

  useEffect(() => {
    playerState.isMuted ? (videoElement.current.muted = true) : (videoElement.current.muted = false);
  }, [playerState.isMuted, videoElement]);

  const rewind = useCallback(() => {
      videoElement.current.currentTime-=10
  }, [videoElement])

  const forward = useCallback(() => {
      videoElement.current.currentTime+=10
  }, [videoElement])

  const ended = useCallback(() => {
    setPlayerState((curr) => {
      return { ...curr, wasPlaying: false, isPlaying: false };
    });
    playBtn.current.innerText = "replay"
  }, [])

  const volumeChange = useCallback((e) => {
    if(parseInt(e.target.value) === 0){
      toggleMute()
    }
    volumeBtnRef.current.innerText = parseInt(e.target.value) === 0 ? 'volume_off' : parseInt(e.target.value) <= 40 ? 'volume_down' : 'volume_up';
    setPlayerState((curr) => {
      return {
        ...curr,
        volume: e.target.value,
        wasVolume: e.target.value
      }
    })
  }, [playerState])

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
    volumeChange
  };
};

export default useVideoPlayer;
