import React, { useState, useEffect, useCallback, useRef } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../CameraContext';
import { startStudentSession } from '../../../../api/classroomApi';

interface CameraAccessProps {
  activityId: number;
}

const CameraAccess: React.FC<CameraAccessProps> = ({ activityId }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamRef } = useCamera();
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream; // save globally
      setHasCameraPermission(true);
    } catch (err) {
      setHasCameraPermission(false);
      console.error('Camera access error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [streamRef]);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleStart = async () => {
  if (!streamRef.current) {
    console.error("No stream available");
    return;
  }

  const userId = Number(localStorage.getItem("userId"));
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  const sessionStarted = await startStudentSession(userId, activityId);

  if (sessionStarted) {
    console.log("Session started!", sessionStarted);
  } else {
    console.warn("Session already exists or failed.");
  }

  navigate("/editor", {
    state: {
      activityId,
    },
  });
};

  return (
    <div className="rounded-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Open Camera</h2>

      <div className="relative">
        <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden relative">
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`
            absolute top-4 right-4 p-3 rounded-full
            ${hasCameraPermission ? 'bg-green-500' : 'bg-gray-400'}
            transition-colors duration-300
          `}
        >
          <VideocamIcon className="text-white" />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!hasCameraPermission || isInitializing}
          className={`
            px-8 py-3 rounded-full font-medium
            transition-all duration-200
            ${(hasCameraPermission && !isInitializing)
              ? 'bg-yellow-400 hover:bg-yellow-500 hover:shadow-lg text-black'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }
          `}
        >
          {isInitializing ? 'Initializing...' : 'Start Now'}
        </button>
      </div>

      {!hasCameraPermission && !isInitializing && (
        <p className="text-center mt-4 text-red-500">
          Camera access is required to continue.
          <button
            onClick={startCamera}
            className="text-blue-500 underline ml-2 hover:text-blue-600"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  );
};

export default CameraAccess;
