import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers";
const thunkMiddleware = require("redux-thunk").default;

export default createStore(rootReducer, applyMiddleware(thunkMiddleware));
