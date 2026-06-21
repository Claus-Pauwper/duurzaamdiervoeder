// Configure your contact email here:
const CONTACT_EMAIL = "info@duurzaamdiervoeder.nl";

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
      bedrijfCoop: document.getElementById("farmName").value.trim(),
      contactName: document.getElementById("contactName").value.trim(),
      contactEmail: document.getElementById("contactEmail").value.trim(),
      contactPhone: document.getElementById("contactPhone").value.trim(),
      soilType: document.getElementById("soilType").value,
      crop: document.getElementById("crop").value,
      area_ha: parseFloat(document.getElementById("area").value || 0),
      yield_t_per_ha: parseFloat(document.getElementById("yield").value || 0),
      year: parseInt(document.getElementById("year").value || new Date().getFullYear(), 10),
      inputs: {
        fertN_kg_per_ha: parseFloat(document.getElementById("fertN").value || 0),
        fertP_kg_per_ha: parseFloat(document.getElementById("fertP").value || 0),
        fertK_kg_per_ha: parseFloat(document.getElementById("fertK").value || 0),
        seed_kg_per_ha: parseFloat(document.getElementById("seed").value || 0),
        protection_per_ha: parseFloat(document.getElementById("protection").value || 0),
        diesel_l_per_ha: parseFloat(document.getElementById("diesel").value || 0),
        electricity_kwh_per_year: parseFloat(document.getElementById("electricity").value || 0),
        transport_km_per_year: parseFloat(document.getElementById("transport").value || 0),
        storage_energy_kwh_per_year: parseFloat(document.getElementById("storageEnergy").value || 0)
      },
      notes: document.getElementById("notes").value.trim()
    };
    return data;
  }

  function validate(data) {
    const errors = [];
    if (!data.bedrijfCoop) errors.push("Vul de naam van het bedrijf of de coöperatie in.");
    if (!data.contactName) errors.push("Vul de contactpersoon in.");
    if (!data.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) errors.push("Vul een geldig e-mailadres in.");
    if (!data.soilType) errors.push("Kies een grondsoort.");
    if (!data.crop) errors.push("Kies een gewas.");
    if (!data.area_ha || data.area_ha <= 0) errors.push("Vul een geldige oppervlakte (ha) in.");
    if (!data.yield_t_per_ha || data.yield_t_per_ha <= 0) errors.push("Vul een geldige opbrengst (ton per ha) in.");
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
    const safeName = (data.bedrijfCoop || "aanmelding").replace(/\s+/g, "_").toLowerCase();
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

    const lines = [
      `Aanmelding Duurzaam Diervoeder`,
      `Bedrijf/Coöperatie: ${data.bedrijfCoop}`,
      `Contact: ${data.contactName} | ${data.contactEmail} | ${data.contactPhone || "-"}`,
      `Grondsoort: ${data.soilType}`,
      `Gewas: ${data.crop}`,
      `Oppervlakte (ha): ${data.area_ha}`,
      `Opbrengst (t/ha): ${data.yield_t_per_ha}`,
      `Jaar: ${data.year}`,
      `Inputs per ha / per jaar: N ${data.inputs.fertN_kg_per_ha} kg/ha; P ${data.inputs.fertP_kg_per_ha} kg/ha; K ${data.inputs.fertK_kg_per_ha} kg/ha; Zaad ${data.inputs.seed_kg_per_ha} kg/ha; Bescherming ${data.inputs.protection_per_ha}; Diesel ${data.inputs.diesel_l_per_ha} L/ha; Elek ${data.inputs.electricity_kwh_per_year} kWh/jaar; Transport ${data.inputs.transport_km_per_year} km/jaar; Opslag ${data.inputs.storage_energy_kwh_per_year} kWh/jaar`,
      `Opmerkingen: ${data.notes || "-"}`,
      `JSON: zie bijlage of download via de site.`
    ];

    const subject = encodeURIComponent(`Aanmelding lage CO2 - ${data.bedrijfCoop} - ${data.crop}`);
    const body = encodeURIComponent(lines.join("\n"));

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    formMessage.textContent = "Uw e-mailclient wordt geopend. Als dat niet lukt, download de JSON en stuur deze naar " + CONTACT_EMAIL + ".";
    formMessage.style.color = "var(--muted)";
  });
});
