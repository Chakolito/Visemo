import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/api/User`;
axios.defaults.timeout = 30000;

const saveUserInfo = (user: any, token: string) => {
  const userPayload = {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    id: user.id,
  };

  localStorage.setItem("user", JSON.stringify(userPayload));
  localStorage.setItem("token", token);
  localStorage.setItem("userId", String(user.id));
};

export const submitAuthForm = async (data: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/signup`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    console.error("Error submitting form:", err);
    throw new Error(err.response?.data?.message || "Signup failed.");
  }
};

export const loginStudent = async (email: string, password: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/login/student`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.status === 200) {
      saveUserInfo(res.data.user, res.data.token);
      return res.data;
    }
    throw new Error("Login failed.");
  } catch (err: any) {
    console.error("Error logging in:", err);
    throw new Error(err.response?.data?.message || "Login failed.");
  }
};

export const loginTeacher = async (email: string, password: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/login/teacher`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.status === 200) {
      saveUserInfo(res.data.user, res.data.token);
      return res.data;
    }
    throw new Error("Login failed.");
  } catch (err: any) {
    console.error("Error logging in:", err);
    throw new Error(err.response?.data?.message || "Login failed.");
  }
};

export const forgotPassword = async (email: string, idNumber: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/forgot-password`,
      { email, idNumber },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err: any) {
    console.error("Error sending reset link:", err);
    throw new Error(err.response?.data?.message || "Failed to send reset link.");
  }
};

export const resetPassword = async (password: string, token: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/reset-password`,
      { password, token },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err: any) {
    console.error("Error resetting password:", err);
    throw new Error(err.response?.data?.message || "Password reset failed.");
  }
};

export const checkUser = async (userId: number) => {
  try {
    const res = await axios.get(`${BASE_URL}/CheckUser`, {
      params: { userId },
    });

    if (res.status === 200) return res.data;
    throw new Error("Failed to fetch user info.");
  } catch (err: any) {
    console.error("Error checking user:", err);
    throw new Error(err.response?.data?.message || "Could not fetch user data.");
  }
};
