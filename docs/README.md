# AXIOM FORGE · GitHub Pages 업로드 폴더

빌드가 끝난 게임입니다. Node.js나 npm을 GitHub에서 실행할 필요가 없습니다.

1. ZIP으로 받았다면 먼저 압축을 푸세요. 이 **docs 폴더 전체**를 GitHub 저장소의 **Add file → Upload files** 화면으로 드래그하고 변경 사항을 커밋하세요.
2. 저장소 루트에 **docs/index.html**과 **docs/assets/**가 보이는지 확인하세요.
3. **Settings → Pages → Source → Deploy from a branch**를 선택하세요.
4. 업로드한 브랜치(보통 main)와 **/docs**를 선택하고 Save를 누르세요.
5. GitHub가 표시한 Pages 주소를 여세요. 첫 배포는 잠시 걸릴 수 있습니다.

소스용 AXIOM FORGE Actions 배포를 이미 설정했다면 중복 배포를 피하도록 해당 Pages 워크플로를 비활성화하고 위 branch 방식을 사용하세요. 파일을 수정하면 소스 폴더에서 **npm run package:pages**를 실행하여 이 폴더를 새로 만드세요.

로컬 확인은 이 폴더를 HTTP 정적 서버로 열어야 합니다. index.html을 더블클릭하는 file:// 방식은 지원하지 않습니다. 게임은 외부 CDN·API 키·계정 없이 실행되며 설계 저장은 브라우저에 보관됩니다. 중요한 설계는 게임의 파일 내보내기로 백업하세요.

공식 안내: [폴더 업로드](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [Pages 게시 폴더 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
