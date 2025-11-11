// 📦 VARIABLES
const input = document.getElementById('videoUrl');
const icon = document.getElementById('inputIcon');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const title = document.getElementById('title');
const hashtags = document.getElementById('hashtags');
const thumb = document.getElementById('thumb');

// 🌐 Dominio del backend PythonAnywhere
const apiBase = "https://jsinfo.pythonanywhere.com";

// 🟠 Cambiar icono del input
input.addEventListener('input', () => {
  icon.src = input.value.trim() !== "" ? "img/borrar.png" : "img/pegar.png";
});

// 🧩 Botón de pegar/borrar
async function handleIconClick() {
  if (input.value.trim() !== "") {
    input.value = "";
    icon.src = "img/pegar.png";
  } else {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        input.value = text;
        icon.src = "img/borrar.png";
        descargar();
      } else {
        alert("No hay texto copiado.");
      }
    } catch {
      alert("Tu navegador no permite pegar automáticamente.");
    }
  }
}

// 🟢 Obtener información del video (ahora acepta cualquier URL)
async function descargar() {
  const url = input.value.trim();
  if (!url) return alert("Por favor, ingresa un enlace válido.");

  result.style.display = "none";
  loader.style.display = "block";

  try {
    const res = await fetch(`${apiBase}/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
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

// 🔵 Descargar video (compatible con Safari/iPhone)
async function descargarCalidad(calidad) {
  const url = input.value.trim();
  if (!url) return alert("Pega primero un enlace válido.");

  try {
    const res = await fetch(`${apiBase}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, quality: calidad })
    });

    if (!res.ok || !res.body) {
      alert("❌ No se pudo iniciar la descarga (respuesta inválida del servidor).");
      return;
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Detectar Safari/iOS
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      // Safari no soporta descarga directa de blobs: abre en nueva pestaña
      window.open(blobUrl, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = calidad === "low" ? "video_baja.mp4" : "video_hd.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert("Error al descargar el video.");
    console.error(err);
  }
}

