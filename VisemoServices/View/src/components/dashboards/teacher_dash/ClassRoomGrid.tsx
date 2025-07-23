import { Classroom } from "../../../types/classroom";
import React, { useState } from "react";

interface ClassRoomGridProps {
  classRooms: Classroom[];
  onClassClick: (id: number) => void;
  onDeleteClass?: (id: number) => void;
  role: "Teacher" | "Student";
}

const ClassRoomGrid: React.FC<ClassRoomGridProps> = ({
  classRooms,
  onClassClick,
  onDeleteClass,
  role
}) => {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const confirmDelete = () => {
    if (confirmId !== null && onDeleteClass) {
      onDeleteClass(confirmId);
      setConfirmId(null);
    }
  };

  return (
    <div className="mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {classRooms.map((classroom) => (
          <div
            key={classroom.id}
            onClick={() => onClassClick(Number(classroom.id))}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer 
              hover:scale-105 transition-transform duration-200 z-20 relative"
          >
            <div className="bg-yellow-300 p-4 relative">
              <h2 className="text-xl font-bold">{classroom.className}</h2>

              {role === "Teacher" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmId(Number(classroom.id));
                  }}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 z-10"
                  title="Delete Class"
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
                </button>
              )}
            </div>

            {confirmId === classroom.id && role === "Teacher" && (
              <div
                className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center gap-2 text-center p-4 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm">Are you sure you want to delete this class?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-1 bg-gray-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            <div className="p-4">
              <ul className="list-disc list-inside">
                {classroom.activities && classroom.activities.length > 0 ? (
                  classroom.activities.map((activity: any, index: number) => (
                    <li key={index}>
                      <strong>{activity.name || "Unnamed activity"}</strong>
                    </li>
                  ))
                ) : (
                  <li>No activities yet</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassRoomGrid;
