import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ code: 405, message: "Método no permitido" });

  const { url } = req.body;
  if (!url) return res.status(400).json({ code: 400, message: "Falta la URL" });

  try {
    const WORKER = "https://youtub-lake-6929.juniscottmatagalpa.workers.dev";

    const r = await fetch(WORKER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const text = await r.text();

    // Intentar parsear JSON
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (err) {
      // En caso de recibir HTML u otro contenido, devolver mensaje claro
      return res.status(500).json({
        code: 500,
        message: "El Worker devolvió contenido no-JSON (HTML u otro)",
        raw: text.substring(0, 1000)
      });
    }

  } catch (e) {
    return res.status(500).json({ code: 500, message: "Error interno", error: e.message });
  }
}
