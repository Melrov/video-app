import React, { useCallback, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import useFetch from "../hooks/useFetch";

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

function SignupPage() {
  const { signup: apiSignup } = useFetch()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [uError, setUError] = useState(null);
  const [pError, setPError] = useState(null);
  const [rpError, setRpError] = useState(null);
  const [formError, setFormError] = useState(null)
  const [showError, setShowError] = useState(false);
  const [showRpError, setShowRpError] = useState(false);
  const navigate = useNavigate();

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

  const signup = useCallback(
    async (e) => {
      e.preventDefault();
      if (uError || pError || rpError) {
        setShowError(true);
      } else {
        const res = await apiSignup(username, password);
        if (res.success) {
          navigate("/login");
        } else {
          setShowError(true);
          setError(res.error);
        }
      }
    },
    [username, password, uError, pError, rpError]
  );

  return (
    <Con>
      <Form onSubmit={signup}>
        {formError && <Error>{formError}</Error>}
        <Header>Sign Up</Header>
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

        <InputCon>
          <TextField
            style={{ width: "250px" }}
            error={!!rpError}
            type="password"
            label="Repeat your password"
            value={repeatPassword}
            helperText={!!rpError ? rpError : ""}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </InputCon>

        <SubmitButton variant="contained" type="submit">
          Sign Up
        </SubmitButton>
        <p>
          Already have an account? <Register onClick={() => navigate("/login")}>Sign in</Register>
        </p>
      </Form>
    </Con>
  );
}

export default SignupPage;
