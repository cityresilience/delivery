// core/ojs/dataloader.js - Loads plot-ready CSVs straight from each task's
// tabular output (no clean-tabular, no processed/ folder).
// Usage: import {loadData} from "./core/ojs/dataloader.js"
//        d = await loadData(city)
//        Then: d.pg, d.pas, d.pv, etc.

export async function loadData(city, tdir = `./02-process-output/tabular/`) {
  const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");
  // tdir defaults to the local scan output; index_cog.qmd passes the delivery
  // bucket's tabular/ URL so the web report reads the delivered CSVs instead.
  // Most files are city-prefixed ({city}_name.csv). Fathom prob files are not
  // (multianalysis.R writes fu_prob.csv / pu_prob.csv / cu_prob.csv) — pass prefixed=false.
  async function load(name, prefixed = true) {
    const file = prefixed ? `${tdir}${city.toLowerCase()}_${name}.csv` : `${tdir}${name}.csv`;
    try {
      const r = await fetch(file);
      return r.ok ? d3.csvParse(await r.text(), d3.autoType) : null;
    } catch (e) { return null; }
  }

  var [pg, pas, rwi_area, uba, uba_area, lc, pug, pv, pv_area,
         aq_area, summer_area, ndvi_area, fu, pu, cu, comb,
         e, s, ls_area, l_area, fwi, uba_tracker, fe, fu_prob, pu_prob, cu_prob, comb_prob ] = await Promise.all([
    load("pg"),
    Promise.resolve(null),   // pas: not produced for this scan (skip fetch/404)
    load("rwi_area"),
    load("wsf_harmonized"),  // uba (plot_ubaa) — harmonized, not evolution
    load("uba_area"),
    load("lc"),
    Promise.resolve(null),   // pug: not produced for this scan (skip fetch/404)
    load("solar_monthly_stats"), // pv (plot_pv_alt)
    load("pv_area"),
    load("aq_area"),
    load("summer_area"),
    Promise.resolve(null),   // ndvi_area: NDVI not collected (crop-fed scan) — skip fetch/404
    load("fu"),
    load("pu"),
    load("cu"),
    load("comb"),
    load("elevation"),       // e
    load("slope"),           // s
    load("ls_area"),
    load("l_area"),
    Promise.resolve(null),   // fwi_weekly_95: FWI not run — skip fetch/404
    load("wsf_tracker"),     // uba_tracker
    Promise.resolve(null),   // flood_events: not generated — skip fetch/404
    load("fu_prob", false),
    load("pu_prob", false),
    Promise.resolve(null),   // cu_prob: coastal N/A (Chust is landlocked) — skip fetch/404
    load("comb_prob", false),
  ]);

  return {pg, pas, rwi_area, uba, uba_area, lc, pug, pv, pv_area, aq_area, summer_area, ndvi_area, fu, pu, cu, comb, e, s, ls_area, l_area, fwi, fe, uba_tracker, fu_prob, pu_prob, cu_prob, comb_prob};
}
