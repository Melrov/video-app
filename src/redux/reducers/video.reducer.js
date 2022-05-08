import {
  SET_WATCH_TIME,
  SET_LAST_UPDATED,
  CLEAR_LAST_UPDATED,
  SET_CURR_VID_INFO,
  CLEAR_CURR_VID_INFO,
  STATE_RESET,
} from "../actions/video.actions";

const initialState = {
  watchTime: null,
  lastUpdated: {
    id: null,
    season: null,
    episode: null,
    time: null,
  },
  currVidInfo: {
    id: null,
    season: null,
    episode: null,
  },
};

export default function videoReducer(state = initialState, action) {
  switch (action.type) {
    case SET_WATCH_TIME:
      return { ...state, watchTime: action.time };
    case SET_LAST_UPDATED:
      return { ...state, lastUpdated: action.payload };
    case CLEAR_LAST_UPDATED:
      return { ...state, lastUpdated: { id: null, season: null, episode: null, time: null } };
    case SET_CURR_VID_INFO:
      return { ...state, currVidInfo: action.payload };
    case CLEAR_CURR_VID_INFO:
      return { ...state, currVidInfo: { id: null, season: null, episode: null } };
    case STATE_RESET:
      return initialState;
    default:
      return state;
  }
}
