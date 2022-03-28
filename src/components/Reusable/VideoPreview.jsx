import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoPreview.css";

function VideoPreview({ uuid, tooltip, title, username, views, uploadDate, version = "row" }) {
  const navigate = useNavigate()
  return (
    <div className={`container-${version === "home" ? "home" : "row"}`} onClick={() => {navigate(`/video/${uuid}`)}} title={title}>
      <div className="thumbnail-con">
        <img className="img" src={`/api/video/thumbnail/${uuid}`} />
        <div className="tooltip">{tooltip}</div>
      </div>
      <div className="info-con">
        <span>{title}</span> <br/>
        <span>{username}</span> <br/>
        <span>{views + " views " + uploadDate}</span>
      </div>
    </div>
  );
}

export default VideoPreview;
