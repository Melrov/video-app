import { CLEAR_USER, SET_USER } from "../actions/user.actions";

const initialState = { user: null };

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user };
    case CLEAR_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}
