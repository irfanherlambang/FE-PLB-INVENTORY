import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import api from "../api/api";

import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm({ onLogin, setIsLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotDialog, setOpenForgotDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.user.login({
        email,
        pwd: password,
      });  

      if (res.data.kode === 200) {
        onLogin(res.data.data);
      } else {
        setError(res.data.message || "Login gagal.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch("http://localhost:801/user/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      console.log("TOKEN:", response.credential);

      const result = await res.json();

      if (result.kode === 200) {
        onLogin(result.data); 
      } else {
        console.log("Login gagal:", result.message);
      }

    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        slotProps={{
          inputAdornment: {
            position: 'end',
            children: (
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          },
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
      </Button>

      <GoogleLogin
        onSuccess={handleGoogleResponse}
        onError={() => console.log("Google Login Failed")}
      />

      <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
        <Grid>
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsLogin(false)}
            sx={{ cursor: "pointer" }}
          >
            Register
          </Link>
        </Grid>
        <Grid>
          <Link
            component="button"
            variant="body2"
            onClick={() => setOpenForgotDialog(true)}
            sx={{ cursor: "pointer" }}
          >
            Forgot password?
          </Link>
        </Grid>
      </Grid>

      <ForgotPasswordDialog
        open={openForgotDialog}
        onClose={() => setOpenForgotDialog(false)}
      />
    </Box>
  );
}