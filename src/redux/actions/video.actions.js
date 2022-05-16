import axios from "axios";
export const SET_WATCH_TIME = "Set_Watch_Time";
export const SET_LAST_UPDATED = "Set_Last_Updated";
export const CLEAR_LAST_UPDATED = "Clear_Last_Updated";
export const SET_CURR_VID_INFO = "Set_Curr_Vid_Info";
export const CLEAR_CURR_VID_INFO = "Clear_Curr_Vid_Info";
export const STATE_RESET = "State_Reset";

export const setWatchTime = (time) => {
  return { type: SET_WATCH_TIME, time };
};

export const setLastUpdated = (payload) => {
  return { type: SET_LAST_UPDATED, payload };
};

export const clearLastUpdated = () => {
  return { type: SET_LAST_UPDATED };
};

export const setCurrVidInfo = (payload) => {
  return { type: SET_CURR_VID_INFO, payload };
};

export const clearCurrVidInfo = () => {
  return { type: CLEAR_CURR_VID_INFO };
};

export const stateReset = () => {
  return { type: STATE_RESET };
};

export const videoSwitch = (contentId, season, episode) => (dispatch, getState) => {
  const state = getState();
  //console.log("actions")
  //console.log(contentId, season, episode)
  //console.log(state.video.watchTime, state.video.currVidInfo.id, state.video.currVidInfo.season, state.video.currVidInfo.episode)
  if (state.video.currVidInfo.id && state.video.watchTime) {
    axios
      .put("/api/video/watchtime", {
        time: state.video.watchTime,
        contentId: state.video.currVidInfo.id,
        season: state.video.currVidInfo.season,
        episode: state.video.currVidInfo.episode,
      })
      .then((res) => {
        //console.log("res", res.data)
      })
      .catch((error) => {
        //console.log(error);
      });
  }
  dispatch(setCurrVidInfo({ id: contentId, season, episode }));
};

export const submitWatchTime = (contentId, season, episode) => (dispatch, getState) => {
  const state = getState();
  //console.log(state.video.watchTime, contentId, season, episode)
  axios
    .put("/api/video/watchtime", {
      time: state.video.watchTime,
      contentId,
      season,
      episode,
    })
    .then((res) => {
      if (res.success) {
        dispatch(setLastUpdated({ id: contentId, season, episode, time: res.data.data }));
      }
    })
    .catch((error) => {
      //console.log(error);
    });
};

export const unmountSubmitWatchTime = () => (dispatch, getState) => {
  const state = getState();
  //console.log("unmount submitter")
  //console.log(state.video.watchTime, state.video.currVidInfo.id, state.video.currVidInfo.season, state.video.currVidInfo.episode)
  if (state.video.currVidInfo.id && state.video.watchTime) {
    axios
      .put("/api/video/watchtime", {
        time: state.video.watchTime,
        contentId: state.video.currVidInfo.id,
        season: state.video.currVidInfo.season,
        episode: state.video.currVidInfo.episode,
      })
      .then((res) => {
        //console.log("res", res.data)
        dispatch(stateReset);
      })
      .catch((error) => {
        dispatch(stateReset);
        //console.log(error);
      });
  }
};
