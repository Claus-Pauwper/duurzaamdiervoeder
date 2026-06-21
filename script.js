// Basic client-side logic: validation, summary, JSON download, mailto prefill.
// Configure your contact email here:
const CONTACT_EMAIL = "info@duurzaamdiervoeder.example"; // <-- PAS AAN naar jouw e-mail

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("yearSpan").textContent = new Date().getFullYear();

  const form = document.getElementById("farmForm");
  const previewBtn = document.getElementById("previewBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const summarySection = document.getElementById("summarySection");
  const summaryPre = document.getElementById("summaryPre");
  const closeSummary = document.getElementById("closeSummary");
  const formMessage = document.getElementById("formMessage");

  function gatherData() {
    const data = {
      submittedAt: new Date().toISOString(),
      farmName: document.getElementById("farmName").value.trim(),
      contactName: document.getElementById("contactName").value.trim(),
      contactEmail: document.getElementById("contactEmail").value.trim(),
      contactPhone: document.getElementById("contactPhone").value.trim(),
      crop: document.getElementById("crop").value,
      area_ha: parseFloat(document.getElementById("area").value || 0),
      yield_t_per_ha: parseFloat(document.getElementById("yield").value || 0),
      year: parseInt(document.getElementById("year").value || new Date().getFullYear(), 10),
      inputs: {
        fertN_kg: parseFloat(document.getElementById("fertN").value || 0),
        fertP_kg: parseFloat(document.getElementById("fertP").value || 0),
        fertK_kg: parseFloat(document.getElementById("fertK").value || 0),
        seed_kg: parseFloat(document.getElementById("seed").value || 0),
        pesticide: parseFloat(document.getElementById("pesticide").value || 0),
        diesel_l: parseFloat(document.getElementById("diesel").value || 0),
        electricity_kwh: parseFloat(document.getElementById("electricity").value || 0),
        transport_km: parseFloat(document.getElementById("transport").value || 0),
        storage_energy_kwh: parseFloat(document.getElementById("storageEnergy").value || 0),
        manure_t: parseFloat(document.getElementById("manure").value || 0)
      },
      notes: document.getElementById("notes").value.trim()
    };
    return data;
  }

  function validate(data) {
    const errors = [];
    if (!data.farmName) errors.push("Vul de naam van de boer of coöperatie in.");
    if (!data.contactName) errors.push("Vul de contactpersoon in.");
    if (!data.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) errors.push("Vul een geldig e-mailadres in.");
    if (!data.crop) errors.push("Kies een gewas.");
    if (!data.area_ha || data.area_ha <= 0) errors.push("Vul een geldige oppervlakte (ha) in.");
    if (!data.yield_t_per_ha || data.yield_t_per_ha <= 0) errors.push("Vul een geldige opbrengst (ton/ha) in.");
    return errors;
  }

  function prettyJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  previewBtn.addEventListener("click", () => {
    const data = gatherData();
    const errors = validate(data);
    if (errors.length) {
      formMessage.textContent = errors.join(" ");
      formMessage.style.color = "var(--danger)";
      return;
    }
    formMessage.textContent = "Samenvatting geladen.";
    formMessage.style.color = "var(--muted)";
    summaryPre.textContent = prettyJSON(data);
    summarySection.hidden = false;
    window.scrollTo({ top: summarySection.offsetTop - 20, behavior: "smooth" });
  });

  closeSummary.addEventListener("click", () => {
    summarySection.hidden = true;
  });

  downloadBtn.addEventListener("click", () => {
    const data = gatherData();
    const errors = validate(data);
    if (errors.length) {
      formMessage.textContent = errors.join(" ");
      formMessage.style.color = "var(--danger)";
      return;
    }
    const blob = new Blob([prettyJSON(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (data.farmName || "aanmelding").replace(/\s+/g, "_").toLowerCase();
    a.href = url;
    a.download = `${safeName}_${data.crop || "crop"}_${data.year}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    formMessage.textContent = "JSON gedownload. U kunt dit bestand e-mailen naar ons of bewaren voor uw administratie.";
    formMessage.style.color = "var(--muted)";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = gatherData();
    const errors = validate(data);
    if (errors.length) {
      formMessage.textContent = errors.join(" ");
      formMessage.style.color = "var(--danger)";
      return;
    }

    // Compose a compact summary for email. Keep lines short to avoid mailto length issues.
    const lines = [
      `Aanmelding Duurzaam Diervoeder`,
      `Boer/Coöperatie: ${data.farmName}`,
      `Contact: ${data.contactName} | ${data.contactEmail} | ${data.contactPhone || "-"}`,
      `Gewas: ${data.crop}`,
      `Oppervlakte (ha): ${data.area_ha}`,
      `Opbrengst (t/ha): ${data.yield_t_per_ha}`,
      `Jaar: ${data.year}`,
      `Inputs: N ${data.inputs.fertN_kg} kg; P ${data.inputs.fertP_kg} kg; K ${data.inputs.fertK_kg} kg; Zaad ${data.inputs.seed_kg} kg; Pesticide ${data.inputs.pesticide}; Diesel ${data.inputs.diesel_l} L; Elek ${data.inputs.electricity_kwh} kWh; Transport ${data.inputs.transport_km} km; Opslag ${data.inputs.storage_energy_kwh} kWh; Manure ${data.inputs.manure_t} t`,
      `Opmerkingen: ${data.notes || "-"}`,
      `JSON: zie bijlage of download via de site.`
    ];

    const subject = encodeURIComponent(`Aanmelding lage CO2 - ${data.farmName} - ${data.crop}`);
    const body = encodeURIComponent(lines.join("\n"));

    // Use mailto as fallback; user can also download JSON and attach manually.
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailto;

    formMessage.textContent = "Uw e-mailclient wordt geopend. Als dat niet lukt, download de JSON en stuur deze naar " + CONTACT_EMAIL + ".";
    formMessage.style.color = "var(--muted)";
  });
});
