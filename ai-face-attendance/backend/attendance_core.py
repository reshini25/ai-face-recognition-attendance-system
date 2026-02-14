import boto3
from botocore.exceptions import ClientError
from datetime import datetime

class AttendanceSystem:

    def __init__(self, bucket_name, collection_id, table_name, region="us-east-1"):
        self.bucket_name = bucket_name
        self.collection_id = collection_id
        self.table_name = table_name
        self.region = region

        self.rekognition = boto3.client("rekognition", region_name=region)
        self.s3 = boto3.client("s3", region_name=region)
        self.dynamodb = boto3.resource("dynamodb", region_name=region)
        self.table = self.dynamodb.Table(table_name)

    def upload_image(self, image_path, image_name):
        try:
            self.s3.upload_file(image_path, self.bucket_name, image_name)
            print("✅ Image uploaded to S3")
        except ClientError as e:
            print("❌ Upload failed:", e)

    def register_student(self, image_name, student_id):
        try:
            response = self.rekognition.index_faces(
                CollectionId=self.collection_id,
                Image={
                    "S3Object": {
                        "Bucket": self.bucket_name,
                        "Name": image_name
                    }
                },
                ExternalImageId=student_id
            )

            if response["FaceRecords"]:
                print(f"✅ Student {student_id} registered successfully.")
            else:
                print("❌ No face detected.")

        except ClientError as e:
            print("❌ Error indexing face:", e)

    def mark_attendance(self, image_name, threshold=90):
        try:
            response = self.rekognition.search_faces_by_image(
                CollectionId=self.collection_id,
                Image={
                    "S3Object": {
                        "Bucket": self.bucket_name,
                        "Name": image_name
                    }
                },
                FaceMatchThreshold=threshold
            )

            matches = response.get("FaceMatches", [])

            if matches:
                student_id = matches[0]["Face"]["ExternalImageId"]
                similarity = matches[0]["Similarity"]

                print(f"🎯 Attendance Marked for {student_id}")
                print(f"Similarity: {similarity:.2f}%")

                # Save attendance record
                self.save_attendance(student_id)

                return student_id
            else:
                print("❌ No match found.")
                return None

        except ClientError as e:
            print("❌ Error searching face:", e)

    def save_attendance(self, student_id):
        timestamp = datetime.utcnow().isoformat()

        try:
            self.table.put_item(
                Item={
                    "student_id": student_id,
                    "timestamp": timestamp
                }
            )
            print("📝 Attendance saved to DynamoDB.")
        except ClientError as e:
            print("❌ Failed to save attendance:", e)
