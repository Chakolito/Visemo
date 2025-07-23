import React, { JSX, useEffect, useState } from "react";
import { Activity } from "../../../../types/classroom";
import {
  startActivity,
  stopActivity,
  fetchAggregatedEmotions,
  getClassroomUsers,
  fetchStudentStatus,
  fetchSubmissionStatus,
  getGenerateReport,
  getActivityStatus,
} from "../../../../api/classroomApi";
import PreAssessment from "./PreAssessment";
import CameraAccess from "../../student_dash/ActivityPage/CameraAccess";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface ActivityDetailsProps {
  activity: Activity;
  onBack: () => void;
  role: "Teacher" | "Student";
}


const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];
const INTERPRETATION_UNLOCK_SECONDS = 600;

const emotionIcons: Record<string, JSX.Element> = {
  Positive: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" width="32" height="32">
      <g>
        <path fill="#FBD433" d="M45.54,2.11c32.77-8.78,66.45,10.67,75.23,43.43c8.78,32.77-10.67,66.45-43.43,75.23 
        c-32.77,8.78-66.45-10.67-75.23-43.43C-6.67,44.57,12.77,10.89,45.54,2.11L45.54,2.11z"/>
        <path fill="#141518" d="M41.89,27.86c4.3,0,7.78,4.91,7.78,10.97c0,6.06-3.48,10.97-7.78,10.97s-7.78-4.91-7.78-10.97 
        C34.11,32.77,37.59,27.86,41.89,27.86L41.89,27.86z M28.55,67.12c16.68-0.52,51.01,0.29,65.78-0.04 
        C94.33,106.85,28.55,110.65,28.55,67.12L28.55,67.12z M80.99,27.86c4.3,0,7.78,4.91,7.78,10.97c0,6.06-3.48,10.97-7.78,10.97 
        c-4.3,0-7.78-4.91-7.78-10.97C73.21,32.77,76.69,27.86,80.99,27.86L80.99,27.86z"/>
      </g>
    </svg>
  ),
  Neutral: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
      <circle fill="#FBD433" cx="256" cy="256" r="256"/>
      <path fill="#40270E" d="M148.542 353.448c-11.076 0-20.055-8.979-20.055-20.054 0-11.076 8.979-20.055 20.055-20.055h214.917c11.075 0 20.054 8.979 20.054 20.055 0 11.075-8.979 20.054-20.054 20.054H148.542zm161.919-125.465c-11.076 0-20.055-8.979-20.055-20.055s8.979-20.055 20.055-20.055h65.814c11.075 0 20.054 8.979 20.054 20.055s-8.979 20.055-20.054 20.055h-65.814zm-174.735 0c-11.076 0-20.055-8.979-20.055-20.055s8.979-20.055 20.055-20.055h64.45c11.076 0 20.055 8.979 20.055 20.055s-8.979 20.055-20.055 20.055h-64.45z"/>
    </svg>
  ),
  Negative: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" width="32" height="32">
      <g>
        <path fill="#FBD433" d="M45.54,2.11c32.77-8.78,66.45,10.67,75.23,43.43c8.78,32.77-10.67,66.45-43.43,75.23 
        c-32.77,8.78-66.45-10.67-75.23-43.43C-6.67,44.57,12.77,10.89,45.54,2.11L45.54,2.11z"/>
        <path fill="#141518" d="M45.78,32.27c4.3,0,7.78,5.05,7.78,11.27c0,6.22-3.48,11.27-7.78,11.27c-4.3,0-7.78-5.05-7.78-11.27 
        C38,37.32,41.48,32.27,45.78,32.27L45.78,32.27z M28.12,94.7c16.69-21.63,51.01-21.16,65.78,0.04l2.41-2.39 
        c-16.54-28.07-51.56-29.07-70.7-0.15L28.12,94.7L28.12,94.7z M77.1,32.27c4.3,0,7.78,5.05,7.78,11.27c0,6.22-3.48,11.27-7.78,11.27 
        c-4.3,0-7.78-5.05-7.78-11.27C69.31,37.32,72.8,32.27,77.1,32.27L77.1,32.27z"/>
      </g>
    </svg>
  )
};


const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, name } = props;

  const RADIAN = Math.PI / 180;
  const emojiSize = 40;
  const baseRadius = outerRadius * 1.4;
  const radius =
    name === 'Neutral'
      ? baseRadius * 0.9 // pull Neutral closer
      : baseRadius;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <foreignObject
      x={x - emojiSize / 2}
      y={y - emojiSize / 2}
      width={emojiSize}
      height={emojiSize}
    >
      <div
        style={{ width: emojiSize, height: emojiSize }}
      >
        {emotionIcons[name as keyof typeof emotionIcons]}
      </div>
    </foreignObject>
  );
};

const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activity,
  onBack,
  role,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isStartedByTeacher, setIsStartedByTeacher] = useState(false);
  const [isEnded, setIsEnded] = useState(activity.isEnded || false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [step, setStep] = useState<"details" | "pre" | "camera">("details");
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const [students, setStudents] = useState<
    { id: number; firstName: string; lastName: string; role: string }[]
  >([]);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  } | null>(null);
  const [emotionData, setEmotionData] = useState([
    { name: "Positive", value: 0 },
    { name: "Neutral", value: 0 },
    { name: "Negative", value: 0 },
  ]);
  const [modalData, setModalData] = useState<any>(null);

  const [secondsLeft, setSecondsLeft] = useState(parseTime(activity.timer));

  function parseTime(timeStr: string) {
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    return hh * 3600 + mm * 60 + ss;
  }

  const handleTeacherStart = async () => {
    await startActivity(activity.id);
    setIsStartedByTeacher(true);
    setIsRunning(true);
  };

  const handleTeacherStop = async () => {
    await stopActivity(activity.id);
    setIsStartedByTeacher(false);
    setIsRunning(false);
    setSecondsLeft(0);
    setIsEnded(true);
  };

  const handleStudentStart = () => {
    if (isStartedByTeacher) {
      setStep("pre");
    }
  };

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId"));
    if (role === "Student" && userId) {
      fetchSubmissionStatus(activity.id, userId).then((result) =>
        setSubmitted(result.hasSubmitted)
      );
    }
  }, [activity.id, role]);

  useEffect(() => {
  let syncInterval: NodeJS.Timeout;
  let countdownInterval: NodeJS.Timeout;

  const syncWithBackend = async () => {
    const userId = Number(localStorage.getItem("userId"));
    const status = await getActivityStatus(activity.id, userId);

    if (!status) return;

    if (status.hasExpired) {
      setIsRunning(false);
      setIsEnded(true);
      setIsStartedByTeacher(false);
      setSecondsLeft(0);
      clearInterval(syncInterval);
      clearInterval(countdownInterval);
      return;
    }

    if (status.isStarted) {
      setIsStartedByTeacher(true);
      setIsRunning(true);

      const [hh, mm, ss] = status.remainingTime.split(":").map((v: string) => Math.floor(Number(v)));
      const newSeconds = hh * 3600 + mm * 60 + ss;

      // only update if backend has a lower time remaining
      setSecondsLeft(prev => {
        if (!isRunning || newSeconds < prev) {
          return newSeconds;
        }
        return prev;
      });

    } else {
      setIsStartedByTeacher(false);
      setIsRunning(false);
      // do NOT reset timer here
    }
  };

  if (role === "Teacher" || role === "Student") {
    syncWithBackend();

    syncInterval = setInterval(syncWithBackend, 1_000);

    countdownInterval = setInterval(() => {
      setSecondsLeft(prev => {
        if (isRunning && prev > 0) {
          return prev - 1;
        }
        return prev;
      });
    }, 1_000);
  }

  return () => {
    clearInterval(syncInterval);
    clearInterval(countdownInterval);
  };
}, [activity.id, role, isRunning]);


  const setEmotionPercentages = (data: {
    Positive: number;
    Neutral: number;
    Negative: number;
  }) => {
    const total = Math.max(data.Positive + data.Neutral + data.Negative, 1);
    setEmotionData([
      { name: "Positive", value: Math.round((data.Positive / total) * 100) },
      { name: "Neutral", value: Math.round((data.Neutral / total) * 100) },
      { name: "Negative", value: Math.round((data.Negative / total) * 100) },
    ]);
  };

  useEffect(() => {
  if (role !== "Teacher") return;

  const fetchClassEmotions = async () => {
    const result = await fetchAggregatedEmotions(activity.id);
    setEmotionPercentages({
      Positive: result.totalPositiveEmotions || 0,
      Neutral: result.totalNeutralEmotions || 0,
      Negative: result.totalNegativeEmotions || 0,
    });
  };

  if (isRunning) {
    fetchClassEmotions(); // initial fetch
    const interval = setInterval(fetchClassEmotions, 3000);
    return () => clearInterval(interval);
  }

  // after stopped, fetch once & keep it
  if (!isRunning && isEnded) {
    fetchClassEmotions();
  }
}, [isRunning, isEnded, role, activity.id]);

  useEffect(() => {
  if (role !== "Teacher" || !selectedStudent) return;

  const fetchStudentEmotions = async () => {
    const result = await fetchStudentStatus(activity.id, selectedStudent.id);
    setEmotionPercentages({
      Positive: result.emotions.positive || 0,
      Neutral: result.emotions.neutral || 0,
      Negative: result.emotions.negative || 0,
    });
  };

  if (isRunning) {
    fetchStudentEmotions(); // initial fetch
    const interval = setInterval(fetchStudentEmotions, 3000);
    return () => clearInterval(interval);
  }

  if (!isRunning && isEnded) {
    fetchStudentEmotions();
  }
}, [isRunning, isEnded, role, activity.id, selectedStudent]);

  useEffect(() => {
    if (role !== "Teacher") return;

    getClassroomUsers(activity.classroomId).then((users: {
        id: number;
        firstName: string;
        lastName: string;
        role: string;
      }[]) => {
        setStudents(users.filter((u) => u.role === "Student"));
      });
  }, [role, activity.classroomId]);

  const handleStudentClick = (student: typeof students[0]) => {
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null);
      setSubmitted(null);
      fetchAggregatedEmotions(activity.id).then((result) =>
        setEmotionPercentages({
          Positive: result.totalPositiveEmotions || 0,
          Neutral: result.totalNeutralEmotions || 0,
          Negative: result.totalNegativeEmotions || 0,
        })
      );
    } else {
      setSelectedStudent(student);
      fetchStudentStatus(activity.id, student.id).then((result) => {
        setEmotionPercentages({
          Positive: result.emotions.positive || 0,
          Neutral: result.emotions.neutral || 0,
          Negative: result.emotions.negative || 0,
        });
      });
      fetchSubmissionStatus(activity.id, student.id).then((result) => {
        setSubmitted(result.hasSubmitted);
      });
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const elapsedTime = activity.timer ? parseTime(activity.timer) - secondsLeft : 0;

  if (step === "pre") {
    return (
      <PreAssessment
        activityId={String(activity.id)}
        onComplete={() => setStep("camera")}
      />
    );
  }

  if (step === "camera") {
    return <CameraAccess activityId={activity.id} />;
  }

  return (
    <div className="w-full p-4">
      <button
        onClick={onBack}
        className="flex items-center text-black hover:underline mb-4"
      >
        ← Back to Activities
      </button>

      <h1 className="text-2xl font-bold">{activity.name}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {activity.instruction || "No instructions provided."}
      </p>

      <hr className="my-4" />

      <div className="flex gap-4 w-full">
        <div className="w-1/3 border-r pr-4">
          {(role === "Teacher" || (role === "Student" && !submitted)) && (
            <p className="font-mono text-xl mb-4">{formatTime(secondsLeft)}</p>
          )}

          {role === "Teacher" && (
            <div className="flex gap-2 mb-4">
              {!isEnded ? (
                <button
                  onClick={handleTeacherStart}
                  disabled={isStartedByTeacher}
                  className={`px-4 py-2 rounded ${
                    isStartedByTeacher
                      ? "bg-gray-400 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {isStartedByTeacher ? "Started" : "Start Activity"}
                </button>
              ) : (
                <div className="px-4 py-2 rounded bg-gray-600 text-white">
                  Activity Ended
                </div>
              )}

              {isStartedByTeacher && !isEnded && (
                <button
                  onClick={() => setShowStopModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Stop Activity
                </button>
              )}
            </div>
          )}

          {role === "Student" &&
            (submitted ? (
              <button
                onClick={() => {
                  window.open(
                    `/student-ide/${activity.id}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
              >
                View Activity
              </button>
            ) : (
              <button
                onClick={handleStudentStart}
                disabled={!isStartedByTeacher || isEnded}
                className={`px-4 py-2 rounded text-white mb-4 ${
                  isStartedByTeacher && !isEnded ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {isStartedByTeacher && !isEnded
                  ? (isRunning ? "Continue Activity" : "Start Activity")
                  : "Waiting for Teacher…"}
              </button>
            ))}

          {role === "Teacher" && (
            <div>
              <h2 className="text-lg font-bold mb-2">Student Works</h2>
              <div className="flex flex-col">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className={`cursor-pointer px-4 py-2 border-b ${
                      selectedStudent?.id === student.id
                        ? "bg-gray-300 font-semibold"
                        : "hover:bg-gray-300"
                    }`}
                  >
                    {student.firstName} {student.lastName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {role === "Teacher" && (
          <div className="flex-1 p-4">
            <h2 className="text-lg font-bold mt-4">
              {selectedStudent
                ? `Emotion Overview: ${selectedStudent.firstName} ${selectedStudent.lastName}`
                : "Class Emotion Overview"}
            </h2>

            <div className="flex flex-wrap gap-20 items-center">
            <PieChart width={320} height={300}>
              <Pie
                data={emotionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomLabel}
                onClick={async () => {
                  if (
                    selectedStudent &&
                    elapsedTime >= INTERPRETATION_UNLOCK_SECONDS
                  ) {
                    const report = await getGenerateReport(
                      activity.id,
                      selectedStudent.id
                    );
                    setModalData(report);
                  }
                }}
              >
                {emotionData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend />
            </PieChart>

           {selectedStudent && (
        <div className="ml-4">
          <button
            onClick={() => {
              window.open(
                `/teacher-ide/${activity.id}/${selectedStudent.id}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            View Activity
          </button>
        </div>
            )}
          </div>
          </div>
        )}
        </div>

      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-lg shadow-lg w-[400px] relative">
            <button
              onClick={() => setModalData(null)}
              className="absolute top-2 right-2 text-xl border rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✖
            </button>

            <div className="text-xl font-bold mb-4">
              Analysis of {selectedStudent?.firstName} {selectedStudent?.lastName}
            </div>

            {modalData.error ? (
              <div className="text-red-600">{modalData.error}</div>
            ) : (
              <div className="text-sm">
                {modalData.interpretation || "No interpretation available."}
              </div>
            )}
          </div>
        </div>
      )}

      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-[350px] relative">
            <h2 className="text-lg font-bold mb-4">Confirm Stop</h2>
            <p>Are you sure you want to stop the activity?</p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleTeacherStop();
                  setShowStopModal(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
