import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import VisemoLanding from './components/VisemoLanding';
import './index.css';
import TeacherSignUp from './components/loginauth/TeacherSignup';
import TeacherLogin from './components/loginauth/TeacherLogin';
import StudentSignUp from './components/loginauth/StudentSignup';
import StudentLogin from './components/loginauth/StudentLogin';
import ForgotPassword from './components/loginauth/ForgotPassword';
import SetNewPassword from './components/loginauth/SetNewPassword';
import StudentLandingPage from './components/dashboards/student_dash/StudentLandingPage';
import TeacherLandingPage from './components/dashboards/teacher_dash/TeacherLandingPage';
import CodeEditorPage from './components/dashboards/student_dash/ActivityPage/CodeEditorPage';
import TeacherIde from './components/dashboards/teacher_dash/classroom/TeacherIde';
import Playground from './components/common/TabSystem/playground';
import StudentIde from './components/dashboards/student_dash/StudentIde';

function App() {
  return (
<Router>
  <Routes>
    {/* Landing Page */}
    <Route path="/" element={<VisemoLanding />} />

    {/* Authentication */}
    <Route path="/loginauth/teacher/login" element={<TeacherLogin />} />
    <Route path="/loginauth/teacher/signup" element={<TeacherSignUp />} />

    <Route path="/loginauth/student/login" element={<StudentLogin />} />
    <Route path="/loginauth/student/signup" element={<StudentSignUp />} />


    {/* Redirects */}
    <Route path="/loginauth/student/*" element={<Navigate to="/loginauth/student/login" replace />} />
    <Route path="/loginauth/teacher/*" element={<Navigate to="/loginauth/teacher/login" replace />} />

    {/* Forgot Password */}
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/set-new-password" element={<SetNewPassword />} />

    {/* Teacher Dashboard */}
    <Route path="/teacher-dashboard" element={<TeacherLandingPage />}/>
    <Route path="/teacher-ide/:activityId/:userId" element={<TeacherIde />} />

    {/* Student Dashboard */}
    <Route path="/student-dashboard" element={<StudentLandingPage />} />
    <Route path ="/editor" element={<CodeEditorPage/>}/>
    <Route path="/student-ide/:activityId" element={<StudentIde />} />

    {/* Playground */}
    <Route path="/playground" element={<Playground />} />
  </Routes>
</Router>
  );
}

export default App;