import axios from "axios";

// /**
//  * Sends a password reset request to the server.
//  * @param email - The user's email address.
//  * @param idNumber - The user's ID number.
//  * @returns A promise that resolves with the server's response.
//  */

const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7131/api/User";

axios.defaults.timeout = 10000;

// Sign Up
export const submitAuthForm = async (formData: FormData) => {
    try {
        const response = await axios.post(`${BASE_URL}/signup`, formData, {
            headers: {
                'Content-Type' : 'multipart/form-data'
            }
        });
        
        return response.data;
    } catch (error: any) {
        console.error("Error submitting form:", error);
        throw new Error(error.response?.data?.message || "Signup failed.");
    }
};

// Login Student
export const loginStudent = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/login/student`, {email,password}, {
            headers: {"Content-Type" : "application/json"}
        });

        if (response.status === 200) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("email", email);
            return response.data;
        } else {
            throw new Error("Login Failed");
        }
    } catch (error: any) {
        console.error("Error logging in:",error)
        throw new Error(error.response?.data?.message || "Login failed.");
    }
};

// Login Teacher
export const loginTeacher = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/login/teacher`, {email,password}, {
            headers: {"Content-Type" : "application/json"}
        });

        if (response.status === 200) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("email", email);
            return response.data;
        } else {
            throw new Error("Login Failed");
        }
    } catch (error: any) {
        console.error("Error logging in:",error)
        throw new Error(error.response?.data?.message || "Login failed.");
    }
};

// Forgot Password
export const forgotPassword = async (email: string, idNumber: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/forgot-password`, {email, idNumber}, {
            headers: {"Content-Type" : "application/json"},
        });

        return response.data;
    } catch (error: any) {
        console.error("Error sending password reset link", error);
        throw new Error (error.response?.data?.message || "Failed to send reset link.")
    }
};

// Reset Password
export const resetPassword = async (password: string, token: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/reset-password`, {
        password,
        token, // Backend needs this token to verify identity
      },{
        headers: {"Content-Type": "application/json"},
      });
  
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  };