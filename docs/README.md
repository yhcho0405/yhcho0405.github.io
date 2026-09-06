# AXIOM FORGE — GitHub 드래그 업로드용

이 docs 폴더에는 이미 빌드된 게임이 들어 있습니다. npm 설치나 로컬 빌드가 필요 없습니다.

## 올리는 방법

1. GitHub 저장소 루트에서 Add file → Upload files를 엽니다.
2. 이 **docs 폴더 자체**를 통째로 드래그합니다. 업로드 후 저장소에서 docs/index.html과 docs/assets/가 보여야 합니다.
3. Commit changes로 저장합니다.
4. Settings → Pages → Build and deployment에서 Source를 **Deploy from a branch**로 선택합니다.
5. 방금 업로드한 브랜치(보통 main)와 **/docs**를 선택하고 Save를 누릅니다.
6. 배포가 끝나면 같은 화면의 Visit site를 누릅니다. 첫 배포는 최대 약 10분 걸릴 수 있습니다.

주의: 상위 outputs 폴더를 올리지 마세요. 저장소 루트 바로 아래에 docs/index.html이 있어야 합니다. index.html만 올리면 실행되지 않으므로 assets 폴더도 함께 올리세요.

이미 이전 소스 ZIP의 'Verify and publish AXIOM FORGE' 워크플로를 사용 중인 저장소라면, 이 업로드 방식으로 전환할 때 해당 워크플로만 Actions → 워크플로 선택 → ⋯ → Disable workflow에서 비활성화하세요. 기존 자동 빌드 배포가 새 업로드 결과를 다시 덮지 않도록 하는 조치입니다. 새 저장소라면 이 단계는 필요 없습니다.

.nojekyll은 GitHub의 추가 사이트 변환을 생략하기 위한 파일입니다. 숨김 파일이라도 폴더에 포함되어 있습니다. 이 방식도 GitHub 자체의 Pages 배포 처리는 사용하지만, 직접 npm 명령이나 워크플로 파일을 작성할 필요는 없습니다.

## 폴더 구성

docs/
  index.html
  assets/
    index-Cy1ABxxr.js
    index-CuxOCa4x.css
  favicon.svg
  .nojekyll
  THIRD_PARTY_NOTICES.txt
  README.md

게임 파일은 검증된 최종 정적 빌드와 바이트 단위로 같습니다. 외부 API 키·로그인·서버 코드가 필요하지 않습니다. 기체 저장은 브라우저/사이트 주소별 로컬 저장이며 중요한 설계는 게임에서 내보내기로 백업할 수 있습니다.

공식 안내:
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
