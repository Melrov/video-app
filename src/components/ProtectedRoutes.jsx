import React from "react";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoutes = ({ isPrivate, children, user }) => {
  const redirectTo = isPrivate ? "/login" : "/";
  if ((user && isPrivate) || (!user && !isPrivate)) {
    return <div>{children}</div>;
  } else {
    return <Navigate to={redirectTo} />;
  }
};

const mapStateToProps = (state) => ({
  user: state.user.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoutes);
