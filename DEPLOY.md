# 풍향대동제, 틈: OTIUM — Vercel 배포 메모

## Vercel 환경변수
프로젝트 설정 → Environment Variables에 다음 두 값을 등록합니다.

- `SOLAPI_API_KEY`
- `SOLAPI_API_SECRET`

SOLAPI 비밀키는 프런트엔드 HTML이나 Firebase Realtime Database에 저장하지 않는 구조입니다.

## 배포 구조
- `index.html`: 기존 테이블 대여 관리 화면 + Liquid Glass 디자인
- `api/send-alimtalk.js`: Vercel Serverless Function. SOLAPI HMAC 인증 및 알림톡 발송 담당
- `.env.example`: 환경변수 이름 참고용

Firebase 설정값은 기존 프로젝트 값을 유지합니다. 실제 운영 권한은 Firebase Realtime Database Rules에서 반드시 확인해야 합니다.

## 단축키
`Ctrl + Alt + D` → 사용자 전광판 새 창 열기
