import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/Classroom";

interface AddStudentProps {
  onClose: () => void;
  onAdd: (idNumber: string, name: string) => void;
  classroomId: number;
  role: "Teacher" | "Student";
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AddStudent: React.FC<AddStudentProps> = ({
  onClose,
  onAdd,
  classroomId,
  role,
}) => {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<{ idNumber: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    idNumber: string;
    name: string;
  } | null>(null);

  const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  const fetchStudent = async () => {
    if (!debouncedQuery.trim()) {
      setStudents([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<
        {
          id: number;
          idNumber: string;
          firstName: string;
          lastName: string;
          role: string;
        }[]
      >(`${BASE_URL}/SearchUsers`, {
        params: { idNumber: debouncedQuery, classroomId },
      });

      if (res.data && res.data.length > 0) {
        const filtered = res.data.map((student) => ({
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
        }));

        if (filtered.length > 0) {
          setStudents(filtered);
        } else {
          setStudents([]);
          setError("No student found");
        }
      } else {
        setStudents([]);
        setError("No student found");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching student");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStudent();
}, [debouncedQuery, classroomId]);


  const handleAddStudents = () => {
    if (selectedStudent) {
      onAdd(selectedStudent.idNumber, selectedStudent.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-100 rounded-xl p-6 w-96 shadow">
        <div className="flex items-center gap-2 text-xl font-bold mb-4">
          Add Student
        </div>

        <input
          type="text"
          placeholder="Enter ID Number"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedStudent(null); // Reset selected student on new query
          }}
          className="w-full border-b border-gray-400 p-2 bg-transparent outline-none mb-4"
        />

        {loading && <div className="text-sm text-gray-500">Loading…</div>}

        <ul className="max-h-40 overflow-y-auto">
          {students.map((student) => (
            <li
              key={student.idNumber}
              onClick={() => setSelectedStudent(student)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-200 
                ${
                  selectedStudent?.idNumber === student.idNumber
                    ? "bg-blue-100"
                    : ""
                }`}
            >
              <strong>{student.idNumber}</strong> — {student.name}
            </li>
          ))}
        </ul>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-sm hover:underline">
            Cancel
          </button>
          <button
            disabled={!selectedStudent}
            onClick={handleAddStudents}
            className={`px-4 py-1 rounded-full text-white 
            ${
              selectedStudent
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
