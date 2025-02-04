#!/bin/bash

# 모델들이 있는 디렉토리 경로 설정
model_dir="/Users/hyungyulee/chp_react/frontend/public/static/models"

# 모델 디렉토리에서 'animation'으로 시작하는 모든 GLB 파일에 대해 작업 실행
for file in "$model_dir"/*.glb
do
    if [ -f "$file" ]; then
        echo "Processing $file..."

        # 출력 파일 경로 설정 (텍스처가 WebP로 변환된 GLB 파일)
        output_file="${file%.glb}_optimized.glb"

        # Draco 압축 해제 및 텍스처를 WebP로 변환
        gltf-transform optimize "$file" "$output_file" --compress draco --texture-compress webp

        echo "Textures converted to WebP for $file. Output saved to $output_file."
    else
        echo "No 'animation' GLB models found in $model_dir"
    fi
done
