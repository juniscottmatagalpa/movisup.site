export default async function handler(req, res) {
  // 🔹 Headers CORS: permite llamadas desde cualquier dominio
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔹 Responder OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔹 Solo POST permitido
  if (req.method !== "POST") {
    return res.status(405).json({ code: 405, message: "Método no permitido" });
  }

  try {
    const { url } = req.body || {};

    if (!url) {
      return res.status(400).json({ code: 400, message: "Falta la URL" });
    }

    // 🔹 Worker de Cloudflare
    const WORKER = "https://youtub-lake-6929.juniscottmatagalpa.workers.dev";

    const r = await fetch(WORKER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await r.json();

    if (data.code !== 200) {
      return res.status(400).json({
        code: data.code,
        message: data.message || "Error al procesar el video"
      });
    }

    const v = data.data;

    // 🔹 Devuelve solo lo que necesitamos
    return res.status(200).json({
      code: 200,
      data: {
        thumbnail: v.thumbnail,
        prompt: v.prompt,
        video_url: v.video_url,
        no_watermark_url: v.no_watermark_url,
        width: v.width,
        height: v.height
      }
    });

  } catch (err) {
    return res.status(500).json({
      code: 500,
      message: "Error interno",
      error: err.message
    });
  }
}
