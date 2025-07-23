import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import CodeEditor from "./ActivityPage/CodeEditor";
import { getSubmittedCode } from "../../../api/classroomApi";

const StudentIde: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const userId = Number(localStorage.getItem("userId"));

  const [code, setCode] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      if (!activityId || !userId) {
        setError("Invalid parameters.");
        setLoading(false);
        return;
      }

      try {
        const result = await getSubmittedCode(Number(activityId), userId);
        if (!result?.code) {
          setCode("// No code submitted yet.");
        } else {
          setCode(result.code);
        }
      } catch (err) {
        console.error("Failed to fetch submitted code", err);
        setError("Failed to load code.");
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [activityId, userId]);

  if (loading) {
    return <div className="p-4 text-center">Loading submitted code...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Navbar logoText="VISEMO" />

      <div className="flex-1">
        <CodeEditor
          activityId={Number(activityId)}
          instruction="Viewing your submission"
          readonly
          submittedCode={code}
          isCapturing={false}
          stream={null}
          onSnapshot={() => {}}
          onFinalSubmit={() => {}}
        />
      </div>
    </div>
  );
};

export default StudentIde;
