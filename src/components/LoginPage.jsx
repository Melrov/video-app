import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/user.actions";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../shared/hooks/useFetch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import styled from "styled-components";
import Theme from "./Theme";

const Con = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 22vh;
  color: ${(props) => props.theme.text.primary};
`;
const Form = styled.form`
  background: ${(props) => props.theme.colors.secondaryLight};
  border-radius: 15px;
  padding: 25px;
  display: flex;
  flex-direction: column;
`;

const InputCon = styled.div`
  margin-bottom: 15px;
  height: 75px;
  color: white !important;
`;
const CheckBoxCon = styled.div`
  position: relative;
  top: -13px;
`;
const Header = styled.h2`
  margin-left: auto;
  margin-right: auto;
`;

const SubmitButton = styled(Button)(({ theme }) => ({
  marginBottom: "5px !important",
  "&:hover": {
    backgroundColor: "#2fc6dc",
  },
}));

const Error = styled.p`
  color: rgb(255 151 151);
  background: rgb(201 22 22 / 36%);
  border: 1px solid rgb(239 45 45);
  padding: 6px;
  border-radius: 5px;
  text-align: center;
`;
const Register = styled.span`
  margin: 8px;
  cursor: pointer;
  color: ${(props) => props.theme.text.accentDark};
  &:hover {
    color: ${(props) => props.theme.text.accent};
    text-decoration: underline;
  }
`;
const Message = styled.span`
  color: ${(props) => props.theme.text.accentDark};
  background: ${(props) => props.theme.colors.secondary};
  border: 1px solid ${(props) => props.theme.colors.accent};
  padding: 6px;
  border-radius: 5px;
  text-align: center;
`;

export const LoginPage = ({ setUser }) => {
  const { state } = useLocation();
  const { login: apiLogin } = useFetch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uError, setUError] = useState(null);
  const [pError, setPError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (username.length < 2) {
      setUError("Username must be at least 2 characters");
    } else if (username.length > 25) {
      setUError("Username must be at max 25 characters");
    } else {
      setUError(null);
    }
  }, [username]);

  useEffect(() => {
    if (password.length < 4) {
      setPError("Password must be at least 4 characters");
    } else if (password.length > 64) {
      setPError("Password must be at max 64 characters");
    } else {
      setPError(null);
    }
  }, [password]);

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
          await setUser(res.data);
          navigate("/upload");
        }
      }
    },
    [username, password, uError, pError, apiLogin, navigate, setUser]
  );

  return (
    <Theme>
      <Con>
        <Form onSubmit={login}>
          {formError && <Error>{formError}</Error>}
          {state && !formError && state.message && <Message>{state.message}</Message>}
          <Header>Login</Header>
          <InputCon>
            <TextField
              color="primary"
              sx={{
                input: { color: "rgb(255,255,255)" },
                width: "260px",
                "& .MuiInputLabel-root": { color: "rgb(255,255,255)" },
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,1)",
                  },
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
                },
              }}
              error={showError && !!uError}
              label="Username"
              value={username}
              helperText={showError ? uError : ""}
              onChange={(e) => setUsername(e.target.value)}
              variant={"outlined"}
            />
          </InputCon>
          <InputCon>
            <TextField
              color="primary"
              sx={{
                input: { color: "rgb(255,255,255)" },
                width: "260px",
                "& .MuiInputLabel-root": { color: "rgb(255,255,255)" },
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,1)",
                  },
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
                },
              }}
              error={showError && !!pError}
              type="password"
              label="Password"
              value={password}
              helperText={showError ? pError : ""}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputCon>

          {/* <CheckBoxCon>
            <FormControlLabel control={<Checkbox />} label="Remember Me" />
          </CheckBoxCon> */}
          <SubmitButton variant="contained" type="submit">
            Login
          </SubmitButton>
          <p>
            Don't have an account? <Register onClick={() => navigate("/signup")}>Register</Register>
          </p>
        </Form>
      </Con>
    </Theme>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  setUser: setUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
