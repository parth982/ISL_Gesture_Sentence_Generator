# ISL_Gesture_Sentence_Generator

## **🔹 Overview**

A real-time system that recognizes **Indian Sign Language (ISL) gestures**, classifies them using an **ANN model**, and generates meaningful sentences using an **LLM**.

## **🛠️ Tech Stack**

- **Frontend:** React.js, TailwindCSS, WebSockets
    
- **Backend:** FastAPI, Python (OpenCV, MediaPipe, TensorFlow), WebSockets
    

## **🚀 Setup & Run**

### **Frontend**

```bash
cd FE 
npm install 
npm run dev
```

### **Backend**

```bash
cd BE 
python3.10 -m venv venv 
source venv/bin/activate  # macOS 
venv\Scripts\activate      # Windows 
pip install -r requirements.txt 
uvicorn main:app --reload
```
