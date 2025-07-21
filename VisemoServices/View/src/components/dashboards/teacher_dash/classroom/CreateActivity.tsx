import React, { useState } from "react";
import { createActivity } from "../../../../api/classroomApi";
import { MenuItem, FormControl, InputLabel, Select, TextField, Button } from "@mui/material";

interface CreateActivityProps {
  classroomId: number;
  onClose: () => void;
  onCreated: () => void;
}

const topics = [
  "Syntax",
  "Output",
  "Comments",
  "Variables",
  "Data Types",
  "Type Casting",
  "User Input",
  "Operators",
  "Math",
  "Strings",
  "Booleans",
  "If..Else",
  "Switch",
  "While Loop",
  "For Loop",
  "Break/Continue",
  "Arrays",
  "Methods"
];

const CreateActivity: React.FC<CreateActivityProps> = ({
  classroomId,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [instruction, setInstruction] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const timer = `00:${duration}:00`;

      await createActivity(classroomId, name, timer, instruction);

      onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create activity", err);
      alert("Failed to create activity. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/2 lg:w-1/3 h-full p-6 shadow-lg animate-slide-in-right overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Activity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <TextField
            fullWidth
            label="Title of Activity"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="topic-label">Select Topic</InputLabel>
              <Select
                labelId="topic-label"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                label="Select Topic"
              >
                {topics.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Instructions"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            required
          />

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="timer-label">Set Timer</InputLabel>
            <Select
              labelId="timer-label"
              id="timer"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              label="Set Timer"
            >
              <MenuItem value={30}>30 mins</MenuItem>
              <MenuItem value={60}>60 mins</MenuItem>
            </Select>
          </FormControl>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;
