// Dibuja el área recortada (que calcula react-easy-crop) en un canvas y lo
// exporta como Blob. Es el patrón estándar recomendado por la librería:
// react-easy-crop solo calcula las coordenadas del recorte, no genera la imagen.
export function getCroppedImageBlob(imageSrc, croppedAreaPixels) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageSrc;

        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("No se pudo generar la imagen recortada"));
                    resolve(blob);
                },
                "image/jpeg",
                0.9
            );
        };

        image.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    });
}
