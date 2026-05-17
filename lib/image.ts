/**
 * 画像ファイルをブラウザ側でリサイズ・圧縮し、軽量なJPEGファイルとして返します。
 * @param file 圧縮対象のファイルオブジェクト
 * @param maxWidth 最大横幅（デフォルト 1000px）
 * @param quality 圧縮品質（0.0 〜 1.0、デフォルト 0.75）
 */
export async function compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<File> {
  // 画像ファイル以外（PDFなど）は圧縮処理をスキップしてそのまま返す
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 最大横幅を超える場合はアスペクト比を維持して縮小
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        // 背景を白色に設定（PNGなどの透過部分が黒くなるのを防ぐため）
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);

        // Blob（バイナリデータ）に変換してFileオブジェクトを再構築
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 拡張子を.jpgに統一
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], newFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Image compression failed (blob is null)"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
