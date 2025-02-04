#!/bin/bash

# 변환 품질 설정 (0~100)
QUALITY=100

# 현재 디렉토리 내 모든 png 파일을 webp로 변환
for file in .png; do
    # 파일명에서 확장자 제거
    filename="${file%.png}"
    # 고품질 webp로 변환
    cwebp -q $QUALITY "$file" -o "$filename.webp"
done

echo "모든 PNG 파일이 고품질 WEBP로 변환되었습니다."
