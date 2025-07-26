import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import {
  getActivityById,
  submitBuild,
  submitPicture,
  submitStudentCode,
} from "../../../../api/classroomApi";

interface CodeEditorProps {
  activityId?: number;
  isCapturing?: boolean;
  stream?: MediaStream | null;
  onSnapshot?: (imageData: string) => void;
  instruction?: string;
  readonly?: boolean;
  submittedCode?: string;
  viewMode?: boolean;
  setEditorRef?: (editor: any) => void;
  isEnded?: boolean;
  onFinalSubmit?: () => void
}

const DEFAULT_CODE = `using System;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
    }
}`;

const CodeEditor: React.FC<CodeEditorProps> = ({
  activityId,
  isCapturing = false,
  stream = null,
  onSnapshot = () => {},
  instruction: initialInstruction,
  readonly = false,
  submittedCode,
  viewMode = false,
  setEditorRef,
  isEnded = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const [code, setCode] = useState(submittedCode || DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState(initialInstruction || "Loading...");
  const [videoReady, setVideoReady] = useState(false);
  const [timeUntilNextCapture, setTimeUntilNextCapture] = useState(30);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (submittedCode) setCode(submittedCode);
  }, [submittedCode]);

  useEffect(() => {
    if (!activityId) return;
    const fetchActivity = async () => {
      try {
        const activity = await getActivityById(activityId);
        setInstruction(activity.instruction || "No instructions provided.");
      } catch {
        setInstruction("Failed to load instructions.");
      }
    };
    fetchActivity();
  }, [activityId]);

  useEffect(() => {
    setVideoReady(false);
    if (!stream) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.srcObject = stream;

    const handleCanPlay = () => setVideoReady(true);
    videoEl.addEventListener("canplay", handleCanPlay);
    videoEl.play().catch(console.error);

    return () => {
      videoEl.pause();
      videoEl.srcObject = null;
      videoEl.removeEventListener("canplay", handleCanPlay);
    };
  }, [stream]);

  const takeAndSubmitSnapshot = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < video.HAVE_CURRENT_DATA) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    onSnapshot(imageData);

    const userId = Number(localStorage.getItem("userId"));
    if (!userId || !activityId) return;

    try {
      await submitPicture({ image: imageData, userId, activityId });
    } catch (err) {
      console.error("❌ Failed to submit picture:", err);
    }
  }, [onSnapshot, activityId]);

  useEffect(() => {
    let captureInterval: NodeJS.Timeout | null = null;
    let countdownInterval: NodeJS.Timeout | null = null;

    if (isCapturing && stream) {
      setTimeUntilNextCapture(30);

      captureInterval = setInterval(takeAndSubmitSnapshot, 30_000);
      countdownInterval = setInterval(() => {
        setTimeUntilNextCapture((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isCapturing, stream, takeAndSubmitSnapshot, videoReady]);

  useEffect(() => {
  const videoEl = videoRef.current;

      if ((readonly || isEnded) && videoEl?.srcObject) {
        const tracks = (videoEl.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoEl.srcObject = null;
        console.log("Camera stopped because readonly or isEnded.");
      }

      return () => {
        if (videoEl?.srcObject) {
          const tracks = (videoEl.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoEl.srcObject = null;
          console.log("Camera stopped on unmount.");
        }
      };
    }, [readonly, isEnded]);

  const handleEditorWillMount = (monaco: typeof monacoEditor) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "FF69B4" },
        { token: "string", foreground: "D69D85" },
        { token: "identifier", foreground: "9CDCFE" },
        { token: "type", foreground: "569CD6" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
      },
    });
  };

  const handleEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editorRef.current = editor;

    if (setEditorRef) setEditorRef(editor);

    if (readonly) {
      editor.updateOptions({ readOnly: true });
    }

    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: handleRunCode,
    });
  };

 const handleRunCode = async () => {
  await takeAndSubmitSnapshot();

  setIsRunning(true);
  setError(null);
  setOutput("");
  let isSuccessful = false;

  const code = editorRef.current?.getValue() || "";
  const apiKeys = [
    "18926c8cc2msh7decf0045ef743fp1d08e2jsn95f5b7baf376", // first
    "6c225602e2mshe9187704f031b97p15a07ajsn8563c11970b7", // second
    "4b83f5c711mshda2b31f350832c8p1029a5jsn45667a1b2f9f", // third
    "04bbcf18ecmsh2ef5d6c16bb95bdp180920jsn4bfff42108cb", // fallback
  ];

  try {
    let result = null;
    let succeeded = false;

    for (const apiKey of apiKeys) {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            language_id: 51,
            source_code: btoa(code),
            stdin: "",
            base64_encoded: true,
          }),
        }
      );

      if (response.status === 429) {
        console.warn(`API key ${apiKey} hit rate limit, trying next key...`);
        continue; // try next key
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      console.log(`✅ API key [${apiKey}] succeeded!`);

      result = await response.json();
      succeeded = true;
      break; // exit loop
    }

    if (!succeeded) {
      throw new Error("All API keys failed or rate limited.");
    }

      if (result.stdout) {
        isSuccessful = true;
        setOutput(atob(result.stdout));
      } else if (result.stderr) {
        isSuccessful = false;
        setError(atob(result.stderr));
      } else if (result.compile_output) {
        isSuccessful = false;
        setError(atob(result.compile_output));
      } else {
        isSuccessful = false;
        setError(result.status?.description || "Unknown error occurred.");
      }

    const userId = Number(localStorage.getItem("userId"));
    if (!userId || !activityId) return;

    await submitBuild({ userId, activityId, isSuccessful });

  } catch (err: any) {
    console.error(err);
    setError(err.message || "An error occurred");
  } finally {
    setIsRunning(false);
  }
};

  const handleSubmitFinalCode = async () => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId || !activityId) return;

    const codeToSubmit = editorRef.current?.getValue();
    if (!codeToSubmit) return;

    try {
      await submitStudentCode({ userId, activityId, code: codeToSubmit });
      setShowSubmitModal(false);
      window.location.href = "/student-dashboard";
    } catch (err) {
      console.error("❌ Failed to submit code:", err);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <span>Main.cs</span>
        <div className="flex items-center space-x-4">
          {isCapturing && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Recording</span>
              <span className="text-sm text-gray-400">
                Next capture in: {timeUntilNextCapture}s
              </span>
            </div>
          )}

          
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`px-4 py-2 rounded flex items-center space-x-2 ${
                isRunning
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isRunning ? "Running..." : "Run"}
            </button>
          

          {!readonly && !viewMode && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
            >
              Submit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[2fr,1fr] h-[calc(100vh-64px-48px)]">
        <div className="h-full border-r border-[#2d2d2d]">
          <Editor
            height="100%"
            defaultLanguage="csharp"
            theme="custom-dark"
            value={code}
            onChange={(value) => {
              if (!readonly) setCode(value || "");
            }}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
          />
        </div>

        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#2d2d2d]">
            <h2 className="text-white text-lg font-semibold mb-2">Instructions</h2>
            <p className="text-gray-300">{instruction}</p>
          </div>

          <div className="p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Output</h2>
            <div className="bg-black rounded p-3 min-h-[100px] font-mono">
              {isRunning ? (
                <div className="text-yellow-400">Executing code...</div>
              ) : error ? (
                <div className="text-red-400 whitespace-pre-wrap">{error}</div>
              ) : output ? (
                <div className="text-green-400 whitespace-pre-wrap">{output}</div>
              ) : (
                <div className="text-gray-500">Program output will appear here…</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Are you sure you want to submit?</h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                No
              </button>
              <button
                onClick={handleSubmitFinalCode}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
