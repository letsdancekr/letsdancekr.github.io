from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import os

app = Flask(__name__)
base_dir = os.path.dirname(os.path.abspath(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(base_dir, 'fin.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Postcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    gif_name = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    comment = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    number = db.Column(db.String(50), nullable=True)

    def to_dict(self, new_id=None, dance_number_text=None):
        # 날짜 포맷: "2024년 05월 12일"
        formatted_dt = self.timestamp.strftime("%Y년 %m월 %d일")
        full_text = (
            f"{formatted_dt}에 함께한 {dance_number_text}"
            if dance_number_text
            else formatted_dt
        )

        return {
            "id":        new_id or self.id,
            "gif_name":  self.gif_name,
            "name":      self.name,
            "comment":   self.comment,
            "timestamp": full_text,
            "number":    self.number,
        }


def generate_json_file_with_sequential_ids():
    try:
        # timestamp 내림차순 정렬 (최신순)
        postcards = Postcard.query.order_by(Postcard.timestamp.desc()).all()
        total = len(postcards)

        data = {
            "postcards": [
                postcard.to_dict(
                    new_id=index + 1,
                    # 최신일수록 숫자가 커지도록 전체 개수에서 인덱스를 빼기
                    dance_number_text=f"{total - index}번째 춤"
                )
                for index, postcard in enumerate(postcards)
            ]
        }

        # JSON 파일로 저장
        output_path = os.path.join(base_dir, "allData.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print("✅ allData.json 생성 완료 (최신이 큰 숫자):", output_path)
    except Exception as e:
        print("❌ JSON 생성 중 오류:", e)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        generate_json_file_with_sequential_ids()
