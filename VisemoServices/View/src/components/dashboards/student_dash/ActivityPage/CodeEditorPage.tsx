import React from "react";
import Navbar from "../../Navbar";
import CodeEditor from "./CodeEditor";
import { useLocation, useNavigate } from "react-router-dom";
import { useCamera } from "../CameraContext";
import { getActivityStatus, submitStudentCode } from "../../../../api/classroomApi";

const CodeEditorPage: React.FC = () => {
  const location = useLocation();
  const { activityId, viewMode = false } = location.state || {};
  const { streamRef } = useCamera();
  const navigate = useNavigate();

  const [isRunning, setIsRunning] = React.useState(true);
  const [isEnded, setIsEnded] = React.useState(false);
  const [editorRef, setEditorRef] = React.useState<any>(null);
  const [showTimeoutModal, setShowTimeoutModal] = React.useState(false);

  React.useEffect(() => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId || !activityId) return;

    const interval = setInterval(async () => {
      try {
        const result = await getActivityStatus(activityId, userId);
        console.log("Activity status:", result);

        setIsRunning(result.isStarted);
        setIsEnded(result.isEnded);

        // when activity ends, auto-submit and redirect
        if (result.isEnded || !result.isStarted) {
          if (editorRef) {
            const code = editorRef.getValue?.() || "";
            await submitStudentCode({ userId, activityId, code });
          }

          setShowTimeoutModal(true);

          clearInterval(interval);

          setTimeout(() => {
            navigate("/student-dashboard");
          }, 3000);
        }
      } catch (err) {
        console.error("Failed to fetch activity status", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activityId, editorRef, navigate]);

  if (!activityId) {
    return (
      <div className="text-center text-white p-8">
        ⚠️ No activity ID provided.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="flex-1 bg-gray-900 text-white pt-16 overflow-hidden relative">
        <CodeEditor
          activityId={activityId}
          isCapturing={true}
          stream={streamRef.current}
          onSnapshot={(image) => console.log("Captured", image)}
          readonly={!isRunning || isEnded || viewMode}
          viewMode={viewMode}
          setEditorRef={setEditorRef}
          isEnded={!isRunning} // 👈 pass down the editorRef setter
        />

        {showTimeoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4">⏰ Time’s Up!</h2>
              <p>Your work has been submitted automatically. Redirecting to dashboard…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPage;
