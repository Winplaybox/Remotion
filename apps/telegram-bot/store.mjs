// Persistence for the bot: Supabase (schema videobot via public.videobot_* RPCs, service-role key) or an
// in-memory store with the same behaviour (tests, and a fallback when SUPABASE_* is not configured).
// Same contract as supabase/migrations/20261108000100_videobot_foundation.sql.

export function createStore(env = process.env) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return supabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  return memoryStore();
}

export function supabaseStore(url, key) {
  const rpc = async (fn, args) => {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify(args)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${fn}: ${res.status} ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : null;
  };
  return {
    kind: "supabase",
    claimUpdate: (id) => rpc("videobot_claim_update", { p_update_id: id }),
    touchUser: (u, admin) => rpc("videobot_touch_user", { p_tg_id: u.id, p_name: u.name, p_username: u.username, p_admin: admin }),
    setRole: (tgId, role) => rpc("videobot_set_role", { p_tg_id: tgId, p_role: role }),
    setPrefs: (tgId, p) => rpc("videobot_set_prefs", { p_tg_id: tgId, p }),
    addIdea: (tgId, i) => rpc("videobot_add_idea", { p_tg_id: tgId, p_title: i.title, p_description: i.description ?? "", p_category: i.category ?? "", p_tags: i.tags ?? [], p_link: i.link ?? "", p_media: i.media ?? "" }),
    updateIdea: (code, by, p) => rpc("videobot_update_idea", { p_code: code, p_by: by, p }),
    getIdea: (code) => rpc("videobot_get_idea", { p_code: code }),
    listIdeas: (status, tgId, limit) => rpc("videobot_list_ideas", { p_status: status ?? null, p_tg_id: tgId ?? null, p_limit: limit ?? 10 }),
    createJob: (tgId, chatId, kind, input, idem, limit) => rpc("videobot_create_job", { p_tg_id: tgId, p_chat_id: chatId, p_kind: kind, p_input: input, p_idem: idem, p_daily_limit: limit }),
    updateJob: (code, p) => rpc("videobot_update_job", { p_code: code, p }),
    getJob: (code) => rpc("videobot_get_job", { p_code: code }),
    listJobs: (tgId, status, limit) => rpc("videobot_list_jobs", { p_tg_id: tgId ?? null, p_status: status ?? null, p_limit: limit ?? 10 }),
    stats: () => rpc("videobot_stats", {}),
    submitPublication: (jobCode, by, isAdmin) => rpc("videobot_submit_publication", { p_job_code: jobCode, p_by: by, p_is_admin: isAdmin }),
    reviewPublication: (code, by, p) => rpc("videobot_review_publication", { p_code: code, p_by: by, p }),
    listPublications: (status, limit) => rpc("videobot_list_publications", { p_status: status ?? null, p_limit: limit ?? 10 }),
    getPublication: (code) => rpc("videobot_get_publication", { p_code: code }),
    jobsLast24h: () => rpc("videobot_jobs_last_24h", {}),
    adminList: (entity, status, q, limit, offset) => rpc("videobot_admin_list", { p_entity: entity, p_status: status ?? null, p_q: q ?? null, p_limit: limit, p_offset: offset }),
    adminJob: (code) => rpc("videobot_admin_job", { p_code: code }),
    adminIdea: (code) => rpc("videobot_admin_idea", { p_code: code }),
    adminOverview: () => rpc("videobot_admin_overview", {}),
    /** Short-lived link to a private file in the videobot bucket (dashboard previews). */
    async signedUrl(path, seconds = 600) {
      const base = url.replace(/\/$/, "");
      const res = await fetch(`${base}/storage/v1/object/sign/videobot/${path.split("/").map(encodeURIComponent).join("/")}`, {
        method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ expiresIn: seconds })
      });
      if (!res.ok) return null;
      const j = await res.json();
      return j.signedURL ? `${base}/storage/v1${j.signedURL}` : null;
    }
  };
}

const FINAL = new Set(["COMPLETED", "FAILED", "CANCELLED"]);
const norm = (t) => String(t ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
/** Trigram similarity like pg_trgm (good enough for the in-memory fallback). */
function similarity(a, b) {
  const grams = (s) => { const set = new Set(); for (const w of s.split(" ")) { const p = `  ${w} `; for (let i = 0; i < p.length - 2; i++) set.add(p.slice(i, i + 3)); } return set; };
  const A = grams(a), B = grams(b);
  let inter = 0; for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter || 1);
}

export function memoryStore() {
  const updates = new Set(), users = new Map(), prefs = new Map(), ideas = [], jobs = [], pubs = [];
  const OPEN = (p) => !["REJECTED", "CANCELLED", "FAILED"].includes(p.status);
  const pubJson = (p) => { const j = jobs.find((x) => x.id === p.job_id); return { ...p, job: j ? { code: j.code, kind: j.kind, tg_id: j.tg_id, chat_id: j.chat_id, output: j.output } : null }; };
  const now = () => new Date().toISOString();
  const ideaJson = (i) => ({ ...i, duplicate_of: i.duplicate_of ? ideas[i.duplicate_of - 1].code : null, user: { name: users.get(i.tg_id)?.name ?? "", username: users.get(i.tg_id)?.username ?? "" } });
  const findIdea = (code) => ideas.find((i) => i.code === code);
  const findJob = (code) => jobs.find((j) => j.code === code);
  return {
    kind: "memory",
    async claimUpdate(id) { if (updates.has(id)) return false; updates.add(id); return true; },
    async touchUser(u, admin) {
      const cur = users.get(u.id);
      const role = admin ? "admin" : cur?.role === "admin" ? "user" : cur?.role ?? "user";
      users.set(u.id, { tg_id: u.id, name: u.name || cur?.name || "", username: u.name ? u.username ?? "" : cur?.username ?? "", role, created_at: cur?.created_at ?? now(), last_seen: now() });
      if (!prefs.has(u.id)) prefs.set(u.id, { narrator: "dost", language: "hinglish", aspect: "9:16", seconds: 50 });
      return { tg_id: u.id, role, prefs: prefs.get(u.id) };
    },
    async setRole(tgId, role) { const u = users.get(tgId); if (u && u.role !== "admin") u.role = role; },
    async setPrefs(tgId, p) { const cur = prefs.get(tgId) ?? {}; const next = { ...cur, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v != null)) }; prefs.set(tgId, next); return next; },
    async addIdea(tgId, i) {
      const n = norm(`${i.title} ${i.description ?? ""}`);
      let dup = null, best = 0;
      if (n.length >= 12) for (const d of ideas) { const s = similarity(d.norm, n); if (d.status !== "REJECTED" && s >= 0.55 && s > best) { best = s; dup = d; } }
      const id = ideas.length + 1;
      const row = { id, code: `IDEA-${String(id).padStart(5, "0")}`, tg_id: tgId, title: (i.title || "(untitled)").slice(0, 200), description: (i.description ?? "").slice(0, 3500), category: i.category || "general", tags: i.tags ?? [], link: i.link ?? "", media_file_id: i.media ?? "", priority: 3, channel: "", status: "PENDING_REVIEW", admin_notes: "", duplicate_of: dup?.id ?? null, norm: n, created_at: now(), events: [{ status: "PENDING_REVIEW", by: tgId, note: "submitted" }] };
      ideas.push(row);
      return ideaJson(row);
    },
    async updateIdea(code, by, p) {
      const i = findIdea(code); if (!i) throw new Error(`unknown idea ${code}`);
      let target = null;
      if (p.merge_into) { target = findIdea(p.merge_into); if (!target) throw new Error(`unknown idea ${p.merge_into}`); }
      if (target) { i.status = "MERGED"; i.duplicate_of = target.id; } else if (p.status) i.status = p.status;
      if (p.priority != null) i.priority = Number(p.priority);
      for (const k of ["channel", "category", "title"]) if (p[k] != null) i[k] = p[k];
      if (p.note) i.admin_notes = `${i.admin_notes}\n${p.note}`.trim();
      i.events.push({ status: i.status, by, note: p.note ?? "" });
      return ideaJson(i);
    },
    async getIdea(code) { const i = findIdea(code); return i ? ideaJson(i) : null; },
    async listIdeas(status, tgId, limit = 10) {
      return ideas.filter((i) => (!status || i.status === status) && (!tgId || i.tg_id === tgId)).sort((a, b) => a.priority - b.priority || b.id - a.id).slice(0, Math.min(limit, 50)).map(ideaJson);
    },
    async createJob(tgId, chatId, kind, input, idem, limit) {
      const existing = jobs.find((j) => j.idem_key === idem);
      if (existing) return { ...existing, duplicate: true };
      const since = Date.now() - 86_400_000;
      const used = jobs.filter((j) => j.tg_id === tgId && Date.parse(j.created_at) > since && j.status !== "CANCELLED").length;
      if (limit > 0 && used >= limit) return { limited: true, used };
      const id = jobs.length + 1;
      const j = { id, code: `JOB-${String(id).padStart(5, "0")}`, tg_id: tgId, chat_id: chatId, kind, input: input ?? {}, status: "QUEUED", progress: 0, output: {}, error: "", retry_count: 0, status_message_id: null, idem_key: idem, created_at: now(), updated_at: now(), completed_at: null };
      jobs.push(j);
      return { ...j };
    },
    async updateJob(code, p) {
      const j = findJob(code); if (!j) return null;
      if (FINAL.has(j.status)) return { ...j, final: true };
      if (p.status) j.status = p.status;
      if (p.progress != null) j.progress = Number(p.progress);
      if (p.output) j.output = { ...j.output, ...p.output };
      if (p.error != null) j.error = p.error;
      if (p.retry) j.retry_count += Number(p.retry);
      if (p.status_message_id != null) j.status_message_id = Number(p.status_message_id);
      j.updated_at = now();
      if (FINAL.has(j.status)) j.completed_at = now();
      return { ...j };
    },
    async getJob(code) { const j = findJob(code); return j ? { ...j } : null; },
    async listJobs(tgId, status, limit = 10) {
      return jobs.filter((j) => (!tgId || j.tg_id === tgId) && (!status || j.status === status)).sort((a, b) => b.id - a.id).slice(0, Math.min(limit, 50)).map((j) => ({ ...j }));
    },
    async submitPublication(jobCode, by, isAdmin) {
      const j = findJob(jobCode);
      if (!j) return { error: "job not found" };
      if (j.tg_id !== by && !isAdmin) return { error: "not your job" };
      if (j.status !== "COMPLETED" || !j.output?.file) return { error: "video not stored" };
      const open = pubs.find((p) => p.job_id === j.id && OPEN(p));
      if (open) return { ...pubJson(open), existing: true };
      const id = pubs.length + 1;
      const p = { id, code: `PUB-${String(id).padStart(5, "0")}`, job_id: j.id, requested_by: by, status: "PENDING_APPROVAL", target: "", platforms: [], publish_at: null, title: (j.output.title ?? "").slice(0, 100), description: j.output.description ?? "", hashtags: j.output.hashtags ?? [], results: {}, attempts: 0, approved_by: null, created_at: now() };
      pubs.push(p);
      return pubJson(p);
    },
    async reviewPublication(code, by, q) {
      const p = pubs.find((x) => x.code === code);
      const retry = q.decision === "retry" && ["FAILED", "PARTIAL"].includes(p?.status);
      if (!p || (!["PENDING_APPROVAL", "SCHEDULED"].includes(p.status) && !retry)) return { error: "not found or already final" };
      p.status = { reject: "REJECTED", approve: "SCHEDULED", cancel: "CANCELLED", retry: retry ? "SCHEDULED" : p.status }[q.decision] ?? p.status;
      if (q.target) p.target = q.target;
      if (q.platforms) p.platforms = q.platforms;
      p.publish_at = q.publish_at ?? p.publish_at ?? now();
      if (q.title) p.title = q.title;
      if (q.decision === "approve") p.approved_by = by;
      return pubJson(p);
    },
    async listPublications(status, limit = 10) { return pubs.filter((p) => !status || p.status === status).slice(-Math.min(limit, 50)).reverse().map(pubJson); },
    async jobsLast24h() { const since = Date.now() - 86_400_000; return jobs.filter((j) => Date.parse(j.created_at) > since && j.status !== "CANCELLED").length; },
    async getPublication(code) { const p = pubs.find((x) => x.code === code); return p ? pubJson(p) : null; },
    async adminList(entity, status, q, limit = 25, offset = 0) {
      const lim = Math.min(Math.max(limit, 1), 100), off = Math.max(offset, 0);
      const needle = String(q ?? "").trim().toLowerCase();
      const has = (...xs) => !needle || xs.some((x) => String(x ?? "").toLowerCase().includes(needle));
      const page = (all, key) => {
        const counts = {}; for (const r of all) counts[r[key]] = (counts[r[key]] ?? 0) + 1;
        const filtered = all.filter((r) => !status || r[key] === (key === "role" ? String(status).toLowerCase() : status));
        return { rows: filtered.slice(off, off + lim), total: filtered.length, counts, limit: lim, offset: off };
      };
      if (entity === "ideas") return page(ideas.map(ideaJson).reverse().filter((i) => has(i.code, i.title, i.description, i.category, i.user.name, i.user.username, i.tg_id)), "status");
      if (entity === "jobs") return page(jobs.slice().reverse().filter((j) => has(j.code, j.kind, j.error, JSON.stringify(j.input), j.output?.title, users.get(j.tg_id)?.name, j.tg_id)).map((j) => ({ ...j, user: { name: users.get(j.tg_id)?.name ?? "", username: users.get(j.tg_id)?.username ?? "" } })), "status");
      if (entity === "publications") return page(pubs.slice().reverse().map(pubJson).filter((p) => has(p.code, p.title, p.target, p.job?.code)), "status");
      if (entity === "users") return page([...users.values()].filter((u) => has(u.name, u.username, u.tg_id)).map((u) => ({ ...u, jobs: jobs.filter((j) => j.tg_id === u.tg_id).length, jobs_completed: jobs.filter((j) => j.tg_id === u.tg_id && j.status === "COMPLETED").length, ideas: ideas.filter((i) => i.tg_id === u.tg_id).length })), "role");
      return { error: "unknown entity" };
    },
    async adminJob(code) { const j = findJob(code); if (!j) return null; const u = users.get(j.tg_id); return { ...j, user: u ? { tg_id: u.tg_id, name: u.name, username: u.username, role: u.role } : null, events: [], publications: pubs.filter((p) => p.job_id === j.id).map(pubJson) }; },
    async adminIdea(code) { const i = findIdea(code); return i ? { ...ideaJson(i), events: i.events, jobs: jobs.filter((j) => j.input?.ideaCode === code).map((j) => ({ code: j.code, status: j.status, created_at: j.created_at })) } : null; },
    async adminOverview() { return { ...(await this.stats()), jobs_24h: await this.jobsLast24h(), completed_24h: 0, pubs_pending: pubs.filter((p) => p.status === "PENDING_APPROVAL").length, pubs_scheduled: pubs.filter((p) => p.status === "SCHEDULED").length, pubs_published: pubs.filter((p) => p.status === "PUBLISHED").length, avg_minutes: null, daily: [], by_kind: {}, top_errors: [] }; },
    async signedUrl() { return null; },
    async stats() {
      const active = jobs.filter((j) => !FINAL.has(j.status)).length;
      return { users: users.size, active_users_7d: users.size, ideas: ideas.length, ideas_pending: ideas.filter((i) => i.status === "PENDING_REVIEW").length, ideas_approved: ideas.filter((i) => i.status === "APPROVED").length, jobs_active: active, jobs_completed: jobs.filter((j) => j.status === "COMPLETED").length, jobs_failed: jobs.filter((j) => j.status === "FAILED").length };
    }
  };
}
