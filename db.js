const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "agent.sqlite"));
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS businesses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT, city TEXT, service_area TEXT, website TEXT, target_audience TEXT, priority_services TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, business_id INTEGER NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, rationale TEXT, status TEXT NOT NULL DEFAULT pending, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (business_id) REFERENCES businesses(id));");
const clean = (v) => String(v || "").trim();
function createBusiness(d) { const r=db.prepare("INSERT INTO businesses (name,category,city,service_area,website,target_audience,priority_services,notes) VALUES (?,?,?,?,?,?,?,?)").run(clean(d.name),clean(d.category),clean(d.city),clean(d.service_area),clean(d.website),clean(d.target_audience),clean(d.priority_services),clean(d.notes)); return getBusiness(r.lastInsertRowid); }
const getBusiness=(id)=>db.prepare("SELECT * FROM businesses WHERE id=?").get(id);
const listBusinesses=()=>db.prepare("SELECT * FROM businesses ORDER BY id DESC").all();
function createSuggestion(d){const r=db.prepare("INSERT INTO suggestions (business_id,type,title,content,rationale) VALUES (?,?,?,?,?)").run(d.business_id,d.type,d.title,d.content,d.rationale||"");return db.prepare("SELECT * FROM suggestions WHERE id=?").get(r.lastInsertRowid);}
const listSuggestions=(id)=>db.prepare("SELECT * FROM suggestions WHERE business_id=? ORDER BY id DESC").all(id);
function updateSuggestionStatus(id,status){db.prepare("UPDATE suggestions SET status=? WHERE id=?").run(status,id);return db.prepare("SELECT * FROM suggestions WHERE id=?").get(id);}
module.exports={db,createBusiness,getBusiness,listBusinesses,createSuggestion,listSuggestions,updateSuggestionStatus};
