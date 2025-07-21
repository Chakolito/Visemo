import React, { useState, useEffect, useCallback } from "react";
import { getActivities, deleteActivity } from "../../../../api/classroomApi";
import CreateActivity from "./CreateActivity";
import { Activity } from "../../../../types/classroom";


interface ActivitiesTabProps {
  classroomId: number;
  onActivityClick?: (activity: Activity) => void;
  hideCreateButton?: boolean;
  role: "Teacher" | "Student";
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  classroomId,
  onActivityClick,
  hideCreateButton,
  role
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

    const handleDeleteActivity = async () => {
    if (!activityToDelete) return;
    try {
      await deleteActivity(activityToDelete.id);
      console.log("✅ Activity deleted");
      setShowDeleteModal(false);
      fetchActivities();
    } catch (err) {
      console.error("❌ Failed to delete activity:", err);
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      const data = await getActivities(classroomId);
      console.log("Fetched activities:", data);

      if (Array.isArray(data)) {
        setActivities(data);
      } else if (data && Array.isArray(data.activities)) {
        setActivities(data.activities);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("Failed to load activities", err);
      setActivities([]);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="w-full">
      {!hideCreateButton && (
        <div className="flex justify-center my-6">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-yellow-400 text-lg font-bold px-6 py-2 rounded-full hover:scale-105 transition flex items-center gap-2 shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Activity
          </button>
        </div>
      )}

      {showCreate && (
        <CreateActivity
          classroomId={classroomId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchActivities}
        />
      )}

      <div className="mt-8">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500">No activities yet.</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded border border-black shadow mb-4 flex justify-between items-center"
            >
              <div onClick={() => onActivityClick?.(act)} className="cursor-pointer">
                <h3 className="text-lg font-semibold">{act.name}</h3>
                <p className="text-sm">Timer: {act.timer}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Created: {new Date(act.createdAt).toLocaleDateString()}
                </p>
              </div>
               {role === "Teacher" && (
                <button
                  onClick={() => {
                    setActivityToDelete(act);
                    setShowDeleteModal(true);
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22"
                    />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showDeleteModal && role === "Teacher" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">Are you sure?</h2>
            <p className="text-gray-700 mb-6">
              Do you really want to delete{" "}
              <strong>{activityToDelete?.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteActivity}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;
