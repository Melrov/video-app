import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoPreview.css";
import styled from "styled-components";
import Theme from "../../components/Theme";

const ThumbnailCon = styled.div`
  width: ${(props) => (props.full ? "100%" : "20%")};
  width: ${(props) => (props.season ? "" : "250px")};
  height: ${(props) => (props.season ? "" : "140px")};
  position: relative;
  max-height: 160px;
`;
const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
`;
const InfoCon = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding-left: 10px;
  padding-top: 5px;
`;
const InfoLine = styled.div`
  font-size: ${(props) => (props.subtext ? "12px" : "14px")};
  color: ${(props) => (props.subtext ? props.theme.text.secondary : props.theme.primary)};
  margin-bottom: 3px;
`;
const PreviewCon = styled.div`
  background: ${(props) => (props.selected ? props.theme.colors.primary : props.theme.colors.secondary)};
  border-left: ${(props) => (props.selected ? `3px solid ${props.theme.colors.accent}` : `3px solid ${props.theme.colors.secondary}`)};
  box-shadow: ${(props) => (props.selected ? "0px 0px 5px 0px black" : "")};
  border-radius: 3px;
  display: flex;
  cursor: pointer;
  color: ${(props) => props.theme.text.primary};
  flex-direction: ${(props) => (props.version === "row" ? "row" : "column")};
  margin-bottom: ${(props) => (props.version === "row" ? "8px" : "")};
  align-items: ${(props) => (props.version === "carousel" ? "center" : "")};
  flex-basis: ${(props) => (props.version === "carousel" ? "20%" : "")};
  margin-left: ${(props) => (props.version === "carousel" ? "10px" : "")};
  margin-rigth: ${(props) => (props.version === "carousel" ? "10px" : "")};
  &:hover {
    background: ${(props) => (props.selected ? "" : props.theme.colors.primaryLight)};
    box-shadow: ${(props) => (props.selected ? "" : "0px 0px 5px 0px black;")};
  }
`;

function VideoPreview({ uuid, duration, episodes, title, username, views, uploadDate, type, version = "row", season, selected, click }) {
  const navigate = useNavigate();
  return (
    <Theme>
      <PreviewCon
        selected={selected}
        version={version}
        onClick={() => {
          click && season ? click(season) : navigate(type === "series" ? `/series/${uuid}/1/1` : `/video/${uuid}`);
        }}
        title={title}
      >
        <ThumbnailCon full={version === "carousel"} season={season}>
          <Thumbnail src={`/api/video/thumbnail/${uuid}${season ? "/" + season : ""}`} alt={title} />
          {duration && (
            <div className="tooltip">{`${Math.floor(duration / 60)}:${
              Math.floor(duration % 60) < 10 ? "0" + Math.floor(duration % 60) : Math.floor(duration % 60)
            }`}</div>
          )}
        </ThumbnailCon>
        <InfoCon>
          {season && (
            <InfoLine>
              <span>{`Season ${season}`}</span>
            </InfoLine>
          )}
          <InfoLine>
            <span>{title}</span>
          </InfoLine>
          {username && (
            <InfoLine>
              <span>{username}</span> <br />
            </InfoLine>
          )}
          <InfoLine subtext={true}>
            {views && <span>{views + " views "}</span>}
            {uploadDate && <span>{uploadDate + " "}</span>}
            {episodes && version !== "carousel" && <span>{episodes + " episodes"}</span>}
          </InfoLine>
        </InfoCon>
      </PreviewCon>
    </Theme>
  );
}

export default VideoPreview;
