import { ViewSidebar } from "@mui/icons-material";
import React from "react";
import "./VideoPreview.css";

function VideoPreview({ thumbnail, tooltip, title, username, views, uploadDate, version = "row" }) {
  return (
    <div className={`container-${version === "column" ? "col" : "row"}`}>
      <div className="thumbnail-con">
        <img className="img" src={thumbnail} />
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
