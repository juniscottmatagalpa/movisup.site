// 📦 VARIABLES
const input = document.getElementById('videoUrl');
const icon = document.getElementById('inputIcon');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const title = document.getElementById('title');
const hashtags = document.getElementById('hashtags');
const thumb = document.getElementById('thumb');

// ⚠️ Reemplaza por el dominio exacto de tu Render
const apiBase = "https://yt-downloader-api-1-ad1k.onrender.com";

// 🟠 Cambia el ícono del input
input.addEventListener('input', () => {
  icon.src = input.value.trim() !== "" ? "img/borrar.png" : "img/pegar.png";
});

// 🧩 Botón de pegar/borrar
async function handleIconClick() {
  if (input.value.trim() !== "") {
    // Si hay texto, limpiar el campo
    input.value = "";
    icon.src = "img/pegar.png";
  } else {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        input.value = text;
        icon.src = "img/borrar.png";
        // 🟢 Ejecutar automáticamente la descarga al pegar
        descargar();
      } else {
        alert("No hay texto copiado.");
      }
    } catch {
      alert("Tu navegador no permite pegar automáticamente.");
    }
  }
}

// 🟢 OBTENER INFO DEL VIDEO
async function descargar() {
  const url = input.value.trim();

  // 🧠 Validación: solo enlaces válidos de TikTok
  const tiktokRegex = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i;
  if (!tiktokRegex.test(url)) {
    alert("Por favor, pega un enlace válido de TikTok.");
    return;
  }

  result.style.display = "none";
  loader.style.display = "block";

  console.log("🔗 Enviando a API:", `${apiBase}/info`);

  try {
    const res = await fetch(`${apiBase}/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    console.log("📩 Respuesta:", data);

    loader.style.display = "none";

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    title.textContent = data.title || "Video sin título";
    thumb.src = data.thumbnail || "https://via.placeholder.com/300x200?text=Sin+miniatura";
    hashtags.textContent = (data.hashtags && data.hashtags.length)
      ? data.hashtags.join(" ")
      : "#video";

    result.style.display = "block";

  } catch (err) {
    loader.style.display = "none";
    alert("⚠️ No se pudo conectar con el servidor.");
    console.error(err);
  }
}

// 🔵 DESCARGAR VIDEO
async function descargarCalidad(calidad) {
  const url = input.value.trim();
  if (!url) return alert("Pega primero un enlace válido.");

  try {
    const res = await fetch(`${apiBase}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, quality: calidad })
    });

    if (!res.ok) throw new Error("Error en la descarga");

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = calidad === "low" ? "video_baja.mp4" : "video_alta.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    alert("Error al descargar el video.");
    console.error(err);
  }
}
