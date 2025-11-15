const API_URL = "http://localhost:5000";

export async function analyseProduit(title) {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  return res.json();
}
