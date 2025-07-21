import React, { useState } from "react";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { loginStudent, loginTeacher, submitAuthForm } from "../../services/authService";

interface AuthFormProps {
  type: "login" | "signup";
  role: "Student" | "Teacher";
}

const AuthForm: React.FC<AuthFormProps> = ({ type, role }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    email: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
    role,
  });

  const [errors, setErrors] = useState<{ confirmPassword: string }>({ confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const navigate = useNavigate();

  const roleImages: Record<string, Record<string, string>> = {
    Student: {
      login: "https://cdn.builder.io/api/v1/image/assets/TEMP/c4398f704c288aaee98d97e7dbf910a6a79dad28",
      signup: "https://cdn.builder.io/api/v1/image/assets/TEMP/3ed37bfbc7442acd53a8035d94760c5e75b9ca94",
    },
    Teacher: {
      login: "https://cdn.builder.io/api/v1/image/assets/TEMP/97ac33657fa7044fa2cbf542d66251fd44ac1060",
      signup: "https://cdn.builder.io/api/v1/image/assets/TEMP/2935d2db3c636340ed9447ae7f4e92782374777a",
    },
  };

  const selectedImage = roleImages[role]?.[type] || "/images/default.png";

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.password ? "Passwords do not match" : "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "signup") {
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleInitial: formData.middleInitial,
        email: formData.email,
        idNumber: formData.idNumber,
        password: formData.password,
        role,
      };

      try {
        await submitAuthForm(payload);
        setSignupSuccess(true);
      } catch (err: any) {
        alert(err.message || "Signup failed");
      }
    } else if (type === "login") {
      try {
        const res = await (role === "Student" ? loginStudent : loginTeacher)(
          formData.email,
          formData.password
        );
        console.log("Login successful:", res);

        if (role === "Student") navigate("/student-dashboard");
        else if (role === "Teacher") navigate("/teacher-dashboard");
      } catch {
        alert("Login failed. Please check your credentials.");
      }
    }
  };

  const toggleAuthType = () => {
    navigate(`/loginauth/${role.toLowerCase()}/${type === "login" ? "signup" : "login"}`);
  };

  const handleModalClose = () => {
    setSignupSuccess(false);
    navigate(`/loginauth/${role.toLowerCase()}/login`);
  };

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-1/2 flex flex-col items-center justify-center px-16 bg-white">
        <div className="absolute top-4 left-4">
          <IconButton onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
        </div>

        <h1 className="text-3xl font-bold text-center mb-3">VISEMO</h1>
        <h2 className="text-2xl font-semibold mt-2 text-center">
          {type === "login" ? `Welcome back, ${role}!` : `Sign Up as ${role}!`}
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-md mt-4">
          {type === "signup" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input-style"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input-style"
                />
                <input
                  type="text"
                  name="middleInitial"
                  placeholder="M.I"
                  value={formData.middleInitial}
                  onChange={handleChange}
                  required
                  className="input-style"
                />
              </div>

              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="input-style mt-5"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-style mt-5 w-full"
          />

          <div className="relative mt-5">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-style w-full pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
              <IconButton
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
          </div>

          {type === "signup" && (
            <div className="relative mt-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-style w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <IconButton
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 w-full rounded-md mt-6"
          >
            {type === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <button
          onClick={toggleAuthType}
          className="mt-4 text-blue-600 hover:underline"
        >
          {type === "login" ? "Don’t have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>

      {/* Right */}
      <div
        className={`w-1/2 flex items-center justify-center ${
          type === "login" ? "bg-green-500" : "bg-yellow-400"
        }`}
      >
        <img src={selectedImage} alt={`${role} ${type}`} className="max-w-full max-h-full" />
      </div>

      {signupSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">🎉 Account Created!</h2>
            <p className="mb-4">You can now log in with your credentials.</p>
            <button
              onClick={handleModalClose}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
