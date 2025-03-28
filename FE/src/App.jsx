import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const [buffer, setBuffer] = useState([]);
  const [sentence, setSentence] = useState(null);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8000/ws");

    socket.current.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.index !== undefined) {
        updateBuffer(parsedData.index);
      } else if (parsedData.sentence) {
        setSentence(parsedData.sentence);
        setBuffer([]);
        setShowGenerateButton(false);
      }
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const updateBuffer = (newPrediction) => {
    setBuffer((prevBuffer) => {
      const updatedBuffer = [...prevBuffer, newPrediction];

      if (updatedBuffer.length === 4) {
        setShowGenerateButton(true);
      }

      return updatedBuffer.length > 4 ? prevBuffer : updatedBuffer;
    });
  };

  const captureImage = () => {
    if (webcamRef.current) {
      if (buffer.length === 4) {
        alert("Buffer full! Click 'Generate Sentence' first.");
        return;
      }

      if (buffer.length === 0) {
        setSentence(null);
      }

      const imageSrc = webcamRef.current.getScreenshot();
      socket.current.send(JSON.stringify({ image: imageSrc.split(",")[1] }));
    }
  };

  const generateSentence = () => {
    setSentence(null);
    socket.current.send(JSON.stringify({ buffer }));
    setBuffer([]);
    setShowGenerateButton(false);
  };

  return (
    <>
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center">
        <h1 className="text-6xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 
        text-transparent bg-clip-text drop-shadow-2xl text-center mt-11">
          ✨Sign Language Gesture-Based Sentence Generator✨
        </h1>

        <div className="flex flex-1 items-center justify-center w-full max-w-6xl">
          <div className="flex justify-center">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg shadow-xl border-4 border-blue-500" />
          </div>

          <div className="flex flex-col items-center justify-center h-full w-[550px] space-y-7 ml-10">
            {!showGenerateButton ? (
              <button
                onClick={captureImage}
                className="px-8 py-4 text-xl font-semibold bg-blue-500 hover:bg-blue-600 transition-all 
      duration-300 rounded-lg shadow-md hover:shadow-blue-500/50 transform hover:scale-105"
              >
                📸 Capture Gesture
              </button>
            ) : (
              <button
                onClick={generateSentence}
                className="px-8 py-4 text-xl font-semibold bg-green-500 hover:bg-green-600 transition-all 
      duration-300 rounded-lg shadow-lg hover:shadow-green-500/50 animate-bounce"
              >
                ✨ Generate Sentence
              </button>
            )}

            {/* Animated Buffer */}
            <div className="flex space-x-3 mb-9">
              {buffer.length > 0 ? (
                buffer.map((word, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 
          text-white rounded-full shadow-md animate-fadeIn transform transition-all duration-500 scale-100 hover:scale-110"
                  >
                    {word}
                  </span>
                ))
              ) : (
                <span className="text-2xl text-gray-400 italic animate-pulse">Waiting for gestures...</span>
              )}
            </div>

            {/* Display LLM-Generated Sentence */}
            <p className="text-4xl font-extrabold tracking-wide p-4 rounded-lg drop-shadow-lg text-center">
              {sentence !== null ? (
                <span
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent 
        bg-clip-text animate-glow drop-shadow-2xl shadow-orange-500/50 px-6 py-2 
        rounded-md tracking-widest"
                >
                  ✨ {sentence} ✨
                </span>
              ) : (
                <span className="text-gray-400 italic animate-pulse">
                  ⚡ Decoding gestures..!
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
