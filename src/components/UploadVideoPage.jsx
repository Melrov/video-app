import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";

function UploadVideoPage() {
  const { createVideo } = useFetch()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("video");
  const [visibility, setVisibility] = useState("public")
  const videoFile = useRef()
  const thumbnailFile = useRef()
  const [error, setError] = useState(null)

  const submit = useCallback( async (e) => {
    e.preventDefault()
    const res = await createVideo(title, description, type, visibility, videoFile.current.files[0], thumbnailFile.current.files[0])
    if(!res.success){
      setError(res.error)
    } else {
      navigate(`/video/${res.data}`)
    }
  }, [createVideo, navigate, title, description, type, visibility, videoFile, thumbnailFile])
  return (
    <div>
      {error && <span>{error}</span>}
      <form onSubmit={(e) => submit(e)}>
        <label htmlFor="title">Title</label>
        <input type="text" name="title" onChange={(e) => setTitle(e.target.value)}></input>
        <label htmlFor="description">description</label>
        <input type="text" name="description" onChange={(e) => setDescription(e.target.value)}></input>
        <label htmlFor="type">What type is it</label>
        <select name="type" onChange={(e) => setType(e.target.value)}>
          <option value="video">Video</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
        </select>
        <label htmlFor="visibility">What type is it</label>
        <select name="visibility" onChange={(e) => setVisibility(e.target.value)}>
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
          <option value="private">private</option>
        </select>
        {type !== "series" && (
          <>
            <label htmlFor="video">Select Video</label>
            <input type="file" name="video" accept="video/*" ref={videoFile}></input>
            <label htmlFor="thumbnail">Select Thumbnail</label>
            <input type="file" name="thumbnail" accept="image/*" ref={thumbnailFile}></input>
          </>
        )}
        <input type="submit" value="Submit"/>
      </form>
    </div>
  );
}

export default UploadVideoPage;
