import cv2
import numpy as np
import base64
import json
import mediapipe as mp
from fastapi import FastAPI, WebSocket

app = FastAPI()

# model = load_model("gesture_model.h5")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)

gesture_mapping = {0: "A", 1: "B", 2: "C", 3: "D", 4: "E"}

def extract_hand_keypoints(frame_data):
    """ Extracts hand keypoints using MediaPipe and returns them as a NumPy array. """
    img_bytes = base64.b64decode(frame_data["image"])
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        keypoints = [coord for lm in hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
        return np.array(keypoints).reshape(1, -1)  

    return None 

'''
def predict_gesture(keypoints):
    """ Predict the gesture index using the trained H5 model. """
    if keypoints is not None:
        prediction = model.predict(keypoints)
        return np.argmax(prediction) 
    return None
'''
def predict_gesture_mock(keypoints):
    """ Mock function: returns 1 if a hand is detected, else 0. """
    return 1 if keypoints is not None else 0

def generate_sentence_with_llm(buffer):
    """ Simulates sentence generation using an LLM. """
    words = [gesture_mapping.get(b, "Unknown") for b in buffer]
    return " ".join(words)  

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """ WebSocket server for real-time gesture recognition & sentence generation. """
    await websocket.accept()
    print("Client connected")

    while True:
        try:
            data = await websocket.receive_text()
            frame_data = json.loads(data)

            if "buffer" in frame_data:
                sentence = generate_sentence_with_llm(frame_data["buffer"])
                await websocket.send_text(json.dumps({"sentence": sentence}))
                continue

            keypoints = extract_hand_keypoints(frame_data)
            predicted_index = predict_gesture_mock(keypoints)

            await websocket.send_text(json.dumps({"index": predicted_index}))

        except Exception as e:
            print("Error:", e)
            await websocket.send_text(json.dumps({"error": str(e)}))
