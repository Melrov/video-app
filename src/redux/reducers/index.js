import { combineReducers } from "redux";
import userReducer from "./user.reducer";
import videoReducer from "./video.reducer";

const rootReducer = combineReducers({
  user: userReducer,
  video: videoReducer,
});

export default rootReducer;
