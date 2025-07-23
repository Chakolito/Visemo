import React, {useState, useEffect} from "react";
import AddStudent from "./AddStudent";
import axios from "axios";

interface StudentTabProps {
    classroomId: number;
    role: "Teacher" | "Student"
}

const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7131/api/Classroom";

const StudentTab: React.FC<StudentTabProps> = ({classroomId, role}) =>  {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<{ idNumber: string; name: string }[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{idNumber: string; name: string} | null>(null);

      useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/GetUser`, {
          params: { id: classroomId },
        });

        // adapt response to your expected shape
        const loaded = res.data.map((s: any) => ({
          idNumber: s.idNumber,
          name: `${s.firstName} ${s.lastName}`,
        }));

        setStudents(loaded);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };

    fetchStudents();
  }, [classroomId]);

    const handleAddStudent = async (idNumber: string, name: string) => {
        try {
        await axios.post(`${BASE_URL}/AddUser?classroomId=${classroomId}&idNumber=${idNumber}`, {
        classroomId,
        idNumber
      });
    
        const newStudent = { idNumber, name };

    setStudents((prev) => [...prev, newStudent]);
    } catch (err) {
      console.error("Failed to add student to classroom", err);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      await axios.delete(`${BASE_URL}/RemoveUser`, {
        params: { classroomId, idNumber: studentToRemove.idNumber },
      });

      setStudents((prev) =>
        prev.filter((s) => s.idNumber !== studentToRemove.idNumber)
      );

      setShowConfirm(false);
      setStudentToRemove(null);
    } catch (err) {
      console.error("Failed to remove student from classroom", err);
    }
  };

  const confirmRemoveStudent = (student: { idNumber: string; name: string }) => {
    setStudentToRemove(student);
    setShowConfirm(true);
  };

    return (
        <div>
            <div className="flex justify-between items-center my-6"> 
                <div className="font-bold text-lg">Students</div>
                {role === "Teacher" && (
                <button 
                onClick={() => setShowModal(true)}
                className="bg-gray-300 px-3 py-1 rounded flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Student
                </button>
                )}
            </div>

            {/* List of students */}
      <div className="space-y-2">
        {students.map((student, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white border rounded-lg px-4 py-2 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-black rounded-full"></span>
              <span>{student.name} ({student.idNumber})</span>
            </div>
            {role === "Teacher" && (
            <button
              onClick={() => confirmRemoveStudent(student)}
              className="hover:text-black"
              title="Remove Student"
            ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="red"
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
      ))}
    </div>

    {/* Confirmation Modal */}
    {showConfirm && studentToRemove && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl">
            <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
            <p>
              Are you sure you want to remove <strong>{studentToRemove.name}</strong>?
            </p>
            
             <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setStudentToRemove(null);
                }}
                className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >Cancel</button>
              <button
                onClick={handleRemoveStudent}
                className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

        {showModal && (
        <AddStudent
          classroomId={classroomId}
          onClose={() => setShowModal(false)}
          onAdd={handleAddStudent}
          role= "Teacher"
        />
      )}
        </div>
    );
};

export default StudentTab;