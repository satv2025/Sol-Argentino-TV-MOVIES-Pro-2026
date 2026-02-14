import { renderNav, renderAuthButtons, toast, $, escapeHtml } from "./ui.js";
import { requireAuthOrRedirect } from "./auth.js";
import { fetchProfile } from "./api.js";

async function init(){
  renderNav({ active:"profile" });
  await renderAuthButtons();

  const session = await requireAuthOrRedirect();
  if (!session) return;

  try{
    const p = await fetchProfile(session.user.id);
    $("#p-email").textContent = p.email || session.user.email || "";
    $("#p-name").textContent = p.full_name || "-";
    $("#p-user").textContent = p.username || "-";
    $("#p-phone").textContent = p.phone || "-";
    $("#p-created").textContent = new Date(p.created_at).toLocaleString();
  }catch(e){
    console.error(e);
    toast("No se pudo cargar tu perfil. Revisá RLS de profiles.", "error");
  }
}

document.addEventListener("DOMContentLoaded", init);
