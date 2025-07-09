import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import ClassRoomGrid from "../teacher_dash/ClassRoomGrid";
import { getClassrooms } from "../../../api/classroomApi";
import { Classroom, Activity } from "../../../types/classroom";
import ActivityDetails from "../teacher_dash/classroom/ActivityDetails";
import ClassroomDetails from "../teacher_dash/pages/ClassroomDetails";

interface User {
  name: string;
  role: "Student" | "Teacher";
  avatarUrl?: string;
}

const StudentLandingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("email");
      if (!email) {
        console.error("No email found in localStorage.");
        return;
      }

      try {
        const response = await fetch(
          `https://localhost:7131/api/user/CheckUser?email=${encodeURIComponent(email)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        const backendUser = data.user;

        // Build full, safe avatar URL
        let avatarPath = backendUser.idImage
          ? `https://localhost:7131/${backendUser.idImage.replace(/\\/g, "/")}`
          : `https://localhost:7131/uploads/default-avatar.png`;

        avatarPath = encodeURI(avatarPath);

        setUser({
          name: `${backendUser.firstName} ${backendUser.middleInitial}. ${backendUser.lastName}`,
          role: backendUser.role,
          avatarUrl: avatarPath,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const data = await getClassrooms();
        setClassrooms(data);
      } catch (err) {
        console.log("Failed to fetch classrooms", err);
      }
    };

    fetchClassrooms();
  }, []);

  const handleClassClick = (id: number) => {
    const classroom = classrooms.find((c) => c.id === id) || null;
    setSelectedClass(classroom);
    setSelectedActivity(null);
  };

  const handleBackToActivities = () => {
    setSelectedActivity(null);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        <Navbar user={user} logoText="VISEMO" />
      </div>

      <div
        className={`
          flex-1 bg-green-500 overflow-auto
          transition-all duration-300
          ${isVisible ? "mt-0" : "-mt-16"}
        `}
      >
        {selectedClass === null && (
          <ClassRoomGrid
            classRooms={classrooms}
            onClassClick={handleClassClick}
            role={"Student"}
          />
        )}

        {selectedClass && !selectedActivity && (
          <ClassroomDetails
            classroomId={selectedClass.id as number}
            onBack={handleBackToClasses}
            role="Student"
          />
        )}
      </div>

      {selectedActivity && (
        <div className="p-4">
          <ActivityDetails activity={selectedActivity} onBack={handleBackToActivities} />
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default StudentLandingPage;
