import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../shared/hooks/useFetch";
import VideoPlayer from "../shared/components/VideoPlayer";
import styled from "styled-components";

const MainContainer = styled.div`
  color: white;
  padding: 30px;
  display: flex;
  justify-content: center;
`;
const LeftContainer = styled.div`
  margin: 10px 10px 10px 0px;
`;
const RightContainer = styled.div`
  margin: 10px 0px 10px 10px;
  display: flex;
  flex-direction: column;
  max-width: 263px;
`;
const FormContainer = styled.form`
  display: flex;
`;
const InputCon = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`;
const InputElement = styled.input`

`

function UploadVideoPage() {
  const { createVideo, createSeriesSeason, createSeriesEpisode, userSeries } = useFetch();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [type, setType] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [season, setSeason] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const thumbnailFile = useRef();
  const [error, setError] = useState(null);
  const [usersSeries, setUsersSeries] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [recapChecked, setRecapChecked] = useState(false);
  const [recapVal, setRecapVal] = useState([0, 0]);
  const [introChecked, setIntroChecked] = useState(false);
  const [introVal, setIntroVal] = useState([0, 0]);
  const [outroChecked, setOutroChecked] = useState(false);
  const [outroVal, setOutroVal] = useState([0, 0]);
  const [nextPreviewChecked, setNextPreviewChecked] = useState(false);
  const [nextPreviewVal, setNextPreviewVal] = useState([0, 0]);
  const [videoElement, setVideoElement] = useState(null);

  useEffect(() => {
    async function init() {
      const res = await userSeries();
      if (res.success) {
        setUsersSeries(res.data);
      } else {
        setError(res.error);
      }
    }
    init();
  }, [userSeries]);

  const submit = useCallback(async () => {
    function resBack(res) {
      if (!res.success) {
        setError(res.error);
      } else {
        if (type !== "series" && type !== "episode" && type !== "season") {
          navigate(`/video/${res.data}`);
        } else {
          navigate(
            `/series/${res.data.contentId ? res.data.contentId : res.data}${
              res.data.season ? (res.data.episode ? "/" + res.data.season + "/" + res.data.episode : "/" + res.data.season) : ""
            }`
          );
        }
      }
    }
    if (type === "video" || type === "movie") {
      let vid = document.getElementById("videoPlayerElement");
      const res = await createVideo(title, description, type, visibility, thumbnailFile.current.files[0], videoFile, vid.duration);
      resBack(res);
    } else if (type === "series") {
      const res = await createVideo(title, description, type, visibility, thumbnailFile.current.files[0], videoFile, null);
      resBack(res);
    } else if (type === "season") {
      const res = await createSeriesSeason(contentId, title, description, thumbnailFile.current.files[0]);
      resBack(res);
    } else if (type === "episode") {
      let vid = document.getElementById("videoPlayerElement");
      const res = await createSeriesEpisode(
        contentId,
        title,
        description,
        season,
        videoFile,
        vid.duration,
        recapChecked ? recapVal : null,
        introChecked ? introVal : null,
        outroChecked ? outroVal : null,
        nextPreviewChecked ? nextPreviewVal : null
      );
      resBack(res);
    }
  }, [
    createVideo,
    navigate,
    title,
    description,
    visibility,
    videoFile,
    thumbnailFile,
    type,
    contentId,
    season,
    createSeriesEpisode,
    createSeriesSeason,
    recapChecked,
    recapVal,
    introChecked,
    introVal,
    outroChecked,
    outroVal,
    nextPreviewChecked,
    nextPreviewVal,
  ]);

  useEffect(() => {
    if (usersSeries) {
      const content = usersSeries.find((series) => series.contentId === contentId);
      if (content && content.seasons.length > 0) {
        setSeason(content.seasons[0].season);
      }
    }
  }, [contentId, setSeason, usersSeries]);

  useEffect(() => {
    if (usersSeries && usersSeries.length > 0) {
      setContentId(usersSeries[0].contentId);
    }
  }, [usersSeries, setContentId]);

  useEffect(() => {
    if (videoFile) {
      setBlobUrl(URL.createObjectURL(videoFile));
    } else {
      setBlobUrl(null);
    }
  }, [videoFile]);

  const setToCurrentTime = useCallback(
    (setter, idx) => {
      let vid;
      if (!videoElement) {
        vid = document.getElementById("videoPlayerElement");
        setVideoElement(vid);
      } else {
        vid = videoElement;
      }
      if (vid) {
        setter((curr) => [...curr.slice(0, idx), vid.currentTime, ...curr.slice(idx + 1)]);
      }
    },
    [videoElement, setVideoElement]
  );

  return (
    <MainContainer>
      {error && <span>{error}</span>}
      <form onSubmit={(e) => e.preventDefault()}>
        <select onChange={(e) => setType(e.target.value)}>
          <option value={null}>Select a type</option>
          <option value={"video"}>Video</option>
          <option value={"movie"}>Movie</option>
          <option value={"series"}>Series</option>
          <option value={"season"}>Series season</option>
          <option value={"episode"}>Series episode</option>
        </select>
        <FormContainer>
          {(type === "video" || type === "movie" || type === "episode") && (
            <LeftContainer>
              <VideoPlayer file={blobUrl} />
              <label htmlFor="video">Select Video</label>
              <input required={true} type="file" name="video" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])}></input>

              {blobUrl && type === "episode" && (
                <>
                  <label htmlFor="recapCheck">Recap</label>
                  <input name="recapCheck" type="checkbox" checked={recapChecked} onChange={(e) => setRecapChecked(e.target.checked)} />
                  {recapChecked && (
                    <>
                      <label htmlFor="recapStart">Start of recap</label>
                      <input
                        name="recapStart"
                        type="number"
                        min={0}
                        max={recapVal[1]}
                        value={recapVal[0]}
                        onChange={(e) => setRecapVal((curr) => [e.target.value, curr[1]])}
                      />
                      <button onClick={() => setToCurrentTime(setRecapVal, 0)}>Set to current time</button>
                      <label htmlFor="recapEnd">End of recap</label>
                      <input
                        name="recapEnd"
                        type="number"
                        min={recapVal[0]}
                        max={document.getElementById("videoPlayerElement").duration}
                        value={recapVal[1]}
                        onChange={(e) => setRecapVal((curr) => [curr[0], e.target.value])}
                      />
                      <button onClick={() => setToCurrentTime(setRecapVal, 1)}>Set to current time</button>
                    </>
                  )}
                  <label htmlFor="introCheck">Intro</label>
                  <input name="introCheck" type="checkbox" checked={introChecked} onChange={(e) => setIntroChecked(e.target.checked)} />
                  {introChecked && (
                    <>
                      <label htmlFor="introStart">Start of intro</label>
                      <input
                        name="introStart"
                        type="number"
                        min={0}
                        max={introVal[1]}
                        value={introVal[0]}
                        onChange={(e) => setIntroVal((curr) => [e.target.value, curr[1]])}
                      />
                      <button onClick={() => setToCurrentTime(setIntroVal, 0)}>Set to current time</button>
                      <label htmlFor="introEnd">End of intro</label>
                      <input
                        name="introEnd"
                        type="number"
                        min={introVal[0]}
                        max={document.getElementById("videoPlayerElement").duration}
                        value={introVal[1]}
                        onChange={(e) => setIntroVal((curr) => [curr[0], e.target.value])}
                      />
                      <button onClick={() => setToCurrentTime(setIntroVal, 1)}>Set to current time</button>
                    </>
                  )}
                  <label htmlFor="outroCheck">Outro</label>
                  <input name="outroCheck" type="checkbox" checked={outroChecked} onChange={(e) => setOutroChecked(e.target.checked)} />
                  {outroChecked && (
                    <>
                      <label htmlFor="outroStart">Start of outro</label>
                      <input
                        name="outroStart"
                        type="number"
                        min={0}
                        max={outroVal[1]}
                        value={outroVal[0]}
                        onChange={(e) => setOutroVal((curr) => [e.target.value, curr[1]])}
                      />
                      <button onClick={() => setToCurrentTime(setOutroVal, 0)}>Set to current time</button>
                      <label htmlFor="outroEnd">End of outro</label>
                      <input
                        name="outroEnd"
                        type="number"
                        min={outroVal[0]}
                        max={document.getElementById("videoPlayerElement").duration}
                        value={outroVal[1]}
                        onChange={(e) => setOutroVal((curr) => [curr[0], e.target.value])}
                      />
                      <button onClick={() => setToCurrentTime(setOutroVal, 1)}>Set to current time</button>
                    </>
                  )}
                  <label htmlFor="nextPreviewCheck">Next Preview</label>
                  <input
                    name="nextPreviewCheck"
                    type="checkbox"
                    checked={nextPreviewChecked}
                    onChange={(e) => setNextPreviewChecked(e.target.checked)}
                  />
                  {nextPreviewChecked && (
                    <>
                      <label htmlFor="nextPreviewStart">Start of next preview</label>
                      <input
                        name="nextPreviewStart"
                        type="number"
                        min={0}
                        max={nextPreviewVal[1]}
                        value={nextPreviewVal[0]}
                        onChange={(e) => setNextPreviewVal((curr) => [e.target.value, curr[1]])}
                      />
                      <button onClick={() => setToCurrentTime(setNextPreviewVal, 0)}>Set to current time</button>
                      <label htmlFor="nextPreviewEnd">End of next preview</label>
                      <input
                        name="nextPreviewEnd"
                        type="number"
                        min={nextPreviewVal[0]}
                        max={document.getElementById("videoPlayerElement").duration}
                        value={nextPreviewVal[1]}
                        onChange={(e) => setNextPreviewVal((curr) => [curr[0], e.target.value])}
                      />
                      <button onClick={() => setToCurrentTime(setNextPreviewVal, 1)}>Set to current time</button>
                    </>
                  )}
                </>
              )}
            </LeftContainer>
          )}
          <RightContainer>
            {type && type !== "Select a type" && (
              <>
                <InputCon>
                  <label htmlFor="title">Title</label>
                  <input required={true} type="text" name="title" onChange={(e) => setTitle(e.target.value)}></input>
                </InputCon>
                <InputCon>
                  <label htmlFor="description">description</label>
                  <input required={true} type="text" name="description" onChange={(e) => setDescription(e.target.value)}></input>
                </InputCon>
                {(type === "video" || type === "movie" || type === "series") && (
                  <>
                    <InputCon>
                      <label htmlFor="visibility">Visibility</label>
                      <select required={true} name="visibility" onChange={(e) => setVisibility(e.target.value)}>
                        <option value="public">public</option>
                        <option value="unlisted">unlisted</option>
                        <option value="private">private</option>
                      </select>
                    </InputCon>
                  </>
                )}
                {(type === "episode" || type === "season") && (
                  <>
                    <InputCon>
                      <label htmlFor="seriesSelect">Pick a Series</label>
                      <select required={true} name="seriesSelect" onChange={(e) => setContentId(e.target.value)}>
                        {usersSeries.map((series) => {
                          return (
                            <option
                              key={series.contentId}
                              value={series.contentId}
                            >{`${series.title} - [${series.seasons.length}] seasons`}</option>
                          );
                        })}
                      </select>
                    </InputCon>
                  </>
                )}
                {type === "episode" && contentId && (
                  <>
                    <InputCon>
                      <label htmlFor="seasonSelect">Pick a Season</label>
                      <select required={true} name="seasonSelect" onChange={(e) => setSeason(e.target.value)}>
                        {usersSeries
                          .find((series) => series.contentId === contentId)
                          .seasons.map((season) => {
                            return (
                              <option key={season.season} value={season.season}>
                                {season.title}
                              </option>
                            );
                          })}
                      </select>
                    </InputCon>
                  </>
                )}
                <>
                  <label htmlFor="thumbnail">Select Thumbnail</label>
                  <input required={true} type="file" name="thumbnail" accept="image/*" ref={thumbnailFile}></input>{" "}
                </>
                <button onClick={() => submit()}>Submit</button>
              </>
            )}
          </RightContainer>
        </FormContainer>
      </form>
    </MainContainer>
  );
}

export default UploadVideoPage;
