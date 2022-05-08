import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Theme from "./Theme";

const TagCon = styled.div`
  display: block;
  padding-bottom: 3px;
`;

const Tag = styled.span`
  color: blue;
  margin-right: 8px;
`;

const Title = styled.span`
  display: block;
  font-size: 18px;
  padding-bottom: 5px;
`;

const ActionsCon = styled.span`
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid black;
`;

const LeftCon = styled.div``;

const RightCon = styled.div``;

const Interaction = styled.div`
  display: inline-Block;
  margin-left: 8px;
`;

const UserCon = styled.div``;

const User = styled.span`
  cursor: pointer;
`;
const InfoCon = styled.div`
  color: ${(props) => props.theme.text.primary};
`;

function VideoInfo({ tags, title, username, description, views, uploadDate, likes, dislikes }) {
  const navigate = useNavigate();
  return (
    <Theme>
      <InfoCon>
        <TagCon>
          {tags &&
            tags.split("-").map((tag) => {
              return <Tag>{`#${tag}`}</Tag>;
            })}
        </TagCon>
        <Title>{title}</Title>
        <ActionsCon>
          <LeftCon>
            <span>{`${views} views | ${uploadDate}`}</span>
          </LeftCon>
          <RightCon>
            <Interaction>
              <button title="like">like</button>
              <span>{likes}</span>
            </Interaction>
            <Interaction>
              <button title="dislike">dislike</button>
              <span>{dislikes}</span>
            </Interaction>
          </RightCon>
        </ActionsCon>
        <UserCon>
          {/* <div>
          <img />
        </div> */}
          <div>
            <User onClick={() => navigate(`/channel/${username}`)} title={username}>
              {username}
            </User>
            <p>{description}</p>
          </div>
        </UserCon>
      </InfoCon>
    </Theme>
  );
}

export default VideoInfo;
