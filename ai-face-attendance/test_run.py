from backend.attendance_core import AttendanceSystem

bucket_name = "ai-attendance-bucket-reshini"
collection_id = "attendance-collection"
table_name = "AttendanceRecords"

system = AttendanceSystem(bucket_name, collection_id, table_name)

image_path = "images/sundarpichai.jpg"
image_name = "sundarpichai.jpg"

system.upload_image(image_path, image_name)
system.register_student(image_name, "student1")
system.mark_attendance(image_name)
