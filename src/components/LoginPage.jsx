import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import useFetch from "../hooks/useFetch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import styled from "styled-components";

const Con = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 22vh;
`;
const Form = styled.form`
  background-color: #cdd6d0;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  flex-direction: column;
`;

const InputCon = styled.div`
  margin-bottom: 15px;
  height: 75px;
`;
const CheckBoxCon = styled.div`
  position: relative;
  top: -13px;
`;
const Header = styled.h2`
  margin-left: auto;
  margin-right: auto;
`;
const SubmitButton = styled(Button)({
  backgroundColor: "#D6A99A",
  marginBottom: "5px !important",
  "&:hover": {
    backgroundColor: "#E16036",
  },
});
const Error = styled.p`
  color: rgb(255 151 151);
  background: rgb(201 22 22 / 85%);
  border: 1px solid rgb(239 45 45);
  padding: 6px;
  border-radius: 5px;
`;
const Register = styled.span`
  margin: 8px;
  cursor: pointer;
  color: rgb(205 66 20 / 73%);
  &:hover {
    color: rgb(205 66 20 / 100%);
  }
`;

function LoginPage() {
  const { setLoggedInUser } = useContext(UserContext);
  const { login: apiLogin } = useFetch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uError, setUError] = useState(null);
  const [pError, setPError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!username.length >= 2) {
      setUError("Username must be at least 2 characters");
    } else if (!username.length <= 25) {
      setUError("Username must be at max 25 characters");
    } else {
      setUError(null);
    }
  }, [username]);

  useEffect(() => {
    if (!password.length >= 4) {
      setPError("Password must be at least 4 characters");
    } else if (!password.length <= 64) {
      setPError("Password must be at max 64 characters");
    } else {
      setPError(null);
    }
  }, [password]);

  useEffect(() => {
    if (password !== repeatPassword) {
      setRpError("Password does not match");
    } else {
      setRpError(null);
    }
  }, [password, repeatPassword]);

  const login = useCallback(
    async (e) => {
      e.preventDefault();
      if (uError || pError) {
        setShowError(true);
      } else {
        const res = await apiLogin(username, password);
        if (!res.success) {
          setFormError(res.error);
        } else {
          setPassword("");
          setLoggedInUser(res.data.username);
        }
      }
    },
    [username, password, uError, pError]
  );

  return (
    <Con>
      <Form onSubmit={login}>
        {formError && <Error>{formError}</Error>}
        <Header>Login</Header>
        <InputCon>
          <TextField
            style={{ width: "250px" }}
            error={showError && !!uError}
            label="Username"
            value={username}
            helperText={showError ? uError : ""}
            onChange={(e) => setUserName(e.target.value)}
          />
        </InputCon>
        <InputCon>
          <TextField
            style={{ width: "250px" }}
            error={showError && !!pError}
            type="password"
            label="Password"
            value={password}
            helperText={showError ? pError : ""}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputCon>

        <CheckBoxCon>
          <FormControlLabel control={<Checkbox />} label="Remember Me" />
        </CheckBoxCon>
        <SubmitButton variant="contained" type="submit">
          Login
        </SubmitButton>
        <p>
          Don't have an account? <Register onClick={() => navigate("/signup")}>Register</Register>
        </p>
      </Form>
    </Con>
  );
}

export default LoginPage;
