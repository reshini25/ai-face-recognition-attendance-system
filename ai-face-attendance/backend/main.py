from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.attendance_core import AttendanceSystem
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



bucket_name = "ai-attendance-bucket-reshini"
collection_id = "attendance-collection"
table_name = "AttendanceRecords"

system = AttendanceSystem(bucket_name, collection_id, table_name)

UPLOAD_FOLDER = "temp_uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.get("/")
def home():
    return {"message": "AI Face Attendance API Running 🚀"}


@app.post("/register/{student_id}")
async def register_student(student_id: str, file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    system.upload_image(file_path, file.filename)
    system.register_student(file.filename, student_id)

    return {"status": "Student registered successfully"}


@app.post("/attendance")
async def mark_attendance(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    system.upload_image(file_path, file.filename)
    student_id = system.mark_attendance(file.filename)

    if student_id:
        return {"status": "Attendance marked", "student_id": student_id}
    else:
        return {"status": "No match found"}
