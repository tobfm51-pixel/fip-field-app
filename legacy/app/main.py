
import json, os, re, sqlite3, tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from datetime import datetime

APP_ROOT = Path(__file__).resolve().parent.parent
PROJECTS_ROOT = APP_ROOT / "projects"
PROJECTS_ROOT.mkdir(exist_ok=True)
DEFAULT_INVESTIGATOR = "C. Mount, #5572"

WORKFLOW = [
    ("Initial Incident", "initial_incident"),
    ("Property / Building", "property_building"),
    ("Weather", "weather"),
    ("Utilities", "utilities"),
    ("Electrical", "electrical"),
    ("Initial Scene Assessment", "scene_assessment"),
    ("People", "people"),
    ("Exterior Examination", "exterior"),
    ("Interior Examination", "interior"),
    ("Area of Origin", "origin"),
    ("Evidence", "evidence"),
    ("Interviews", "interviews"),
    ("Report Center", "reports"),
]

def clean_name(value):
    value = (value or "").strip()
    value = re.sub(r'[<>:"/\\|?*]+', "_", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ._") or "Unnamed"

def case_year_folder(case_number):
    m = re.match(r"^(FM\d{2})", (case_number or "").upper().strip())
    return m.group(1) if m else "UnknownYear"

class CaseEngine:
    def __init__(self):
        self.projects_root = PROJECTS_ROOT

    def create_case(self, data):
        case_no = data["case_number"].upper().strip()
        folder = self.projects_root / case_year_folder(case_no) / clean_name(case_no)
        folder.mkdir(parents=True, exist_ok=True)
        for sub in ["Reports", "Exports", "Attachments", "Photos", "Evidence", "Weather", "Documents"]:
            (folder / sub).mkdir(exist_ok=True)
        db = folder / f"{clean_name(case_no)}.fip.sqlite"
        self.init_db(db)
        self.save_case(db, data)
        return db

    def init_db(self, db):
        with sqlite3.connect(db) as conn:
            conn.execute("""CREATE TABLE IF NOT EXISTS case_info (
                id INTEGER PRIMARY KEY CHECK (id=1),
                case_number TEXT, incident_type TEXT, incident_address TEXT, city TEXT, state TEXT,
                reported_date TEXT, reported_time TEXT, investigator TEXT, created_at TEXT, updated_at TEXT)""")
            conn.execute("""CREATE TABLE IF NOT EXISTS workspace_data (
                workspace TEXT PRIMARY KEY, data_json TEXT NOT NULL, updated_at TEXT NOT NULL)""")
            conn.execute("""CREATE TABLE IF NOT EXISTS reports (
                report_type TEXT PRIMARY KEY, report_text TEXT NOT NULL, updated_at TEXT NOT NULL)""")
            conn.commit()

    def save_case(self, db, data):
        now = datetime.now().isoformat(timespec="seconds")
        with sqlite3.connect(db) as conn:
            conn.execute("""INSERT INTO case_info (
                id, case_number, incident_type, incident_address, city, state, reported_date, reported_time, investigator, created_at, updated_at)
                VALUES (1,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(id) DO UPDATE SET
                case_number=excluded.case_number, incident_type=excluded.incident_type,
                incident_address=excluded.incident_address, city=excluded.city, state=excluded.state,
                reported_date=excluded.reported_date, reported_time=excluded.reported_time,
                investigator=excluded.investigator, updated_at=excluded.updated_at""",
                (data.get("case_number",""), data.get("incident_type",""), data.get("incident_address",""),
                 data.get("city",""), data.get("state",""), data.get("reported_date",""),
                 data.get("reported_time",""), data.get("investigator",""), now, now))
            conn.commit()

    def load_case(self, db):
        with sqlite3.connect(db) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM case_info WHERE id=1").fetchone()
            return dict(row) if row else {}

    def save_workspace(self, db, workspace, data):
        now = datetime.now().isoformat(timespec="seconds")
        with sqlite3.connect(db) as conn:
            conn.execute("""INSERT INTO workspace_data (workspace, data_json, updated_at)
                VALUES (?,?,?)
                ON CONFLICT(workspace) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at""",
                (workspace, json.dumps(data, indent=2), now))
            conn.commit()

    def load_workspace(self, db, workspace):
        with sqlite3.connect(db) as conn:
            row = conn.execute("SELECT data_json FROM workspace_data WHERE workspace=?", (workspace,)).fetchone()
            return json.loads(row[0]) if row else {}

    def save_report(self, db, report_type, text):
        now = datetime.now().isoformat(timespec="seconds")
        with sqlite3.connect(db) as conn:
            conn.execute("""INSERT INTO reports (report_type, report_text, updated_at)
                VALUES (?,?,?)
                ON CONFLICT(report_type) DO UPDATE SET report_text=excluded.report_text, updated_at=excluded.updated_at""",
                (report_type, text, now))
            conn.commit()

    def load_report(self, db, report_type):
        with sqlite3.connect(db) as conn:
            row = conn.execute("SELECT report_text FROM reports WHERE report_type=?", (report_type,)).fetchone()
            return row[0] if row else ""

class ScrollFrame(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        canvas = tk.Canvas(self, bg="#f3f3f3", highlightthickness=0)
        bar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.frame = ttk.Frame(canvas)
        self.frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0,0), window=self.frame, anchor="nw")
        canvas.configure(yscrollcommand=bar.set)
        canvas.pack(side="left", fill="both", expand=True)
        bar.pack(side="right", fill="y")

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Fire Investigation Platform - Alpha 1.0 Starter")
        self.geometry("1320x840")
        self.minsize(1100, 700)
        self.engine = CaseEngine()
        self.current_db = None
        self.current_case = {}
        self.current_workspace = None
        self.current_fields = {}
        self.autosave_id = None
        self.show_home()

    def clear(self):
        for w in self.winfo_children():
            w.destroy()

    def show_home(self):
        self.clear()
        f = ttk.Frame(self, padding=30)
        f.pack(fill="both", expand=True)
        ttk.Label(f, text="Fire Investigation Platform", font=("Arial", 26, "bold")).pack(pady=(20,5))
        ttk.Label(f, text="Alpha 1.0 Starter", font=("Arial", 12)).pack(pady=(0,25))
        ttk.Button(f, text="New Case", command=self.new_case, width=35).pack(pady=6)
        ttk.Button(f, text="Open Case Database", command=self.open_case_file, width=35).pack(pady=6)
        ttk.Button(f, text="Exit", command=self.destroy, width=35).pack(pady=6)

    def new_case(self):
        win = tk.Toplevel(self)
        win.title("New Case")
        win.geometry("520x540")
        win.grab_set()
        f = ttk.Frame(win, padding=18)
        f.pack(fill="both", expand=True)
        ttk.Label(f, text="Create New Case", font=("Arial", 16, "bold")).pack(anchor="w", pady=(0,12))
        entries = {}
        def field(label, key, default=""):
            ttk.Label(f, text=label).pack(anchor="w")
            e = ttk.Entry(f)
            e.insert(0, default)
            e.pack(fill="x", pady=(0,7))
            entries[key] = e
        field("Case Number", "case_number")
        field("Incident Type", "incident_type", "Structure Fire")
        field("Incident Address", "incident_address")
        field("City", "city")
        field("State", "state", "VA")
        field("Reported Date (YYYY-MM-DD)", "reported_date")
        field("Reported Time (HH:MM)", "reported_time")
        field("Investigator", "investigator", DEFAULT_INVESTIGATOR)
        def create():
            data = {k:v.get().strip() for k,v in entries.items()}
            if not data["case_number"]:
                messagebox.showerror("Missing Case Number", "Enter a case number.")
                return
            db = self.engine.create_case(data)
            win.destroy()
            self.open_case(db)
        ttk.Button(f, text="Create Case", command=create).pack(pady=12)

    def open_case_file(self):
        p = filedialog.askopenfilename(title="Open FIP Case Database", initialdir=str(PROJECTS_ROOT),
                                       filetypes=[("FIP SQLite Case", "*.sqlite"), ("All Files", "*.*")])
        if p:
            self.open_case(Path(p))

    def open_case(self, db):
        self.current_db = db
        self.current_case = self.engine.load_case(db)
        self.show_case()

    def show_case(self):
        self.clear()
        root = ttk.Frame(self)
        root.pack(fill="both", expand=True)
        side = ttk.Frame(root, width=260, padding=10)
        side.pack(side="left", fill="y")
        side.pack_propagate(False)
        self.main = ttk.Frame(root, padding=10)
        self.main.pack(side="right", fill="both", expand=True)
        ttk.Label(side, text=self.current_case.get("case_number",""), font=("Arial", 15, "bold")).pack(anchor="w")
        ttk.Label(side, text=self.current_case.get("incident_type",""), font=("Arial", 10)).pack(anchor="w", pady=(0,10))
        for label, key in WORKFLOW:
            ttk.Button(side, text=label, command=lambda k=key, l=label: self.open_workspace(k, l)).pack(fill="x", pady=2)
        ttk.Separator(side).pack(fill="x", pady=8)
        ttk.Button(side, text="Open Case Folder", command=self.open_case_folder).pack(fill="x", pady=2)
        ttk.Button(side, text="Home", command=self.show_home).pack(fill="x", pady=2)
        self.open_workspace("initial_incident", "Initial Incident")

    def open_case_folder(self):
        os.startfile(self.current_db.parent)

    def clear_main(self):
        if self.autosave_id:
            self.after_cancel(self.autosave_id)
            self.autosave_id = None
        for w in self.main.winfo_children():
            w.destroy()

    def header(self, title):
        t = ttk.Frame(self.main, padding=(8,5))
        t.pack(fill="x")
        ttk.Label(t, text="LOUDOUN COUNTY FIRE MARSHAL'S OFFICE", font=("Arial", 10, "bold")).pack(anchor="w")
        ttk.Label(t, text=title, font=("Arial", 18, "bold")).pack(anchor="w")
        ttk.Label(t, text=f"{self.current_case.get('case_number','')} | {self.current_case.get('incident_address','')} | {self.current_case.get('reported_date','')} {self.current_case.get('reported_time','')}", font=("Arial", 10)).pack(anchor="w")
        ttk.Separator(self.main).pack(fill="x", pady=5)

    def start_workspace(self, key, title):
        self.clear_main()
        self.current_workspace = key
        self.current_fields = {}
        self.header(title)
        data = self.engine.load_workspace(self.current_db, key)
        scroll = ScrollFrame(self.main)
        scroll.pack(fill="both", expand=True)
        return scroll.frame, data

    def bind_change(self, widget):
        widget.bind("<KeyRelease>", lambda e: self.schedule_save())
        widget.bind("<<ComboboxSelected>>", lambda e: self.schedule_save())

    def schedule_save(self):
        if self.autosave_id:
            self.after_cancel(self.autosave_id)
        self.autosave_id = self.after(700, self.save_workspace)

    def save_workspace(self):
        if not self.current_workspace:
            return
        data = {}
        for k, obj in self.current_fields.items():
            if isinstance(obj, tk.Text):
                data[k] = obj.get("1.0", "end-1c")
            elif isinstance(obj, tk.Variable):
                data[k] = obj.get()
        self.engine.save_workspace(self.current_db, self.current_workspace, data)
        self.autosave_id = None

    def entry(self, parent, label, key, data, row, col, width=24):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=(5,0))
        val = data.get(key, self.current_case.get(key, ""))
        var = tk.StringVar(value=val)
        e = ttk.Entry(parent, textvariable=var, width=width)
        e.grid(row=row+1, column=col, sticky="ew", padx=4, pady=(0,5))
        self.bind_change(e)
        self.current_fields[key] = var

    def combo(self, parent, label, key, data, values, row, col, width=24):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=(5,0))
        var = tk.StringVar(value=data.get(key, ""))
        e = ttk.Combobox(parent, textvariable=var, values=values, width=width)
        e.grid(row=row+1, column=col, sticky="ew", padx=4, pady=(0,5))
        self.bind_change(e)
        self.current_fields[key] = var

    def text(self, parent, label, key, data, height=5):
        ttk.Label(parent, text=label).pack(anchor="w", padx=8, pady=(8,0))
        t = tk.Text(parent, height=height, wrap="word")
        t.insert("1.0", data.get(key, ""))
        t.pack(fill="x", padx=8, pady=(0,5))
        self.bind_change(t)
        self.current_fields[key] = t

    def grid(self, frame, fields, data, cols=4):
        g = ttk.Frame(frame, padding=10)
        g.pack(fill="x")
        for i in range(cols):
            g.columnconfigure(i, weight=1)
        r=c=0
        for item in fields:
            if len(item) == 2:
                self.entry(g, item[0], item[1], data, r, c)
            else:
                self.combo(g, item[0], item[1], data, item[2], r, c)
            c += 1
            if c == cols:
                c = 0
                r += 2

    def open_workspace(self, key, label):
        if key == "reports":
            self.report_center()
            return
        frame, data = self.start_workspace(key, label)
        if key == "initial_incident":
            self.grid(frame, [
                ("Case Number", "case_number"), ("CAD Number", "cad_number"),
                ("Incident Number", "incident_number"), ("Incident Type", "incident_type"),
                ("Incident Address", "incident_address"), ("City", "city"), ("State", "state"),
                ("Reported Date", "reported_date"), ("Reported Time", "reported_time"),
                ("Dispatch Time", "dispatch_time"), ("Arrival Time", "arrival_time"), ("Investigator", "investigator")], data)
            self.text(frame, "Initial Incident Notes / Scratch Narrative", "initial_notes", data, 8)
        elif key == "property_building":
            self.grid(frame, [("Property Type","property_type"), ("Building Type","building_type"), ("Year Built","year_built"), ("Square Feet","sqft"),
                              ("Stories","stories"), ("Construction","construction"), ("Occupancy Status","occupancy_status"), ("Fire Protection Systems","fire_protection")], data)
            self.text(frame, "Building / Property Description", "property_description", data, 8)
        elif key == "weather":
            if not data.get("search_window"):
                data["search_window"] = "Up to 90 minutes prior to reported fire time"
            self.grid(frame, [("Location / ZIP / GPS","weather_location"), ("Source","source"), ("Station Used","station_used"), ("Observation Time Used","observation_time"),
                              ("Conditions","conditions"), ("Temperature","temperature"), ("Wind Speed","wind_speed"), ("Wind Direction","wind_direction"),
                              ("Humidity","humidity"), ("Dew Point","dew_point"), ("Pressure","pressure"), ("Search Window","search_window")], data)
            self.text(frame, "Weather Notes", "weather_notes", data, 6)
        elif key == "utilities":
            self.grid(frame, [("Electric Provider","electric_provider"), ("Electric Service Type","electric_service_type"), ("Electric Meter Location","electric_meter_location"),
                              ("Gas Provider","gas_provider"), ("Gas Meter Location","gas_meter_location"), ("LP Gas Present","lp_gas"),
                              ("Solar / Battery / Generator","other_power"), ("Water Utility","water_utility")], data)
            self.text(frame, "Utility Notes", "utility_notes", data, 8)
        elif key == "electrical":
            self.grid(frame, [("Panel Location","panel_location"), ("Manufacturer","manufacturer"), ("Main Breaker Size","main_breaker_size"), ("Subpanels Present","subpanels_present")], data)
            self.text(frame, "Electrical Panel / Breaker Notes", "electrical_notes", data, 12)
        elif key == "scene_assessment":
            self.grid(frame, [
                ("Front Direction", "front_direction", ["", "North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest", "Unknown"]),
                ("Front Faces Toward", "front_faces_toward", ["", "Street", "Pipe stem driveway", "Main driveway", "Parking lot", "Woods", "Open field", "Rear yard", "Water", "Adjacent structure", "Other"]),
                ("FD Status", "fd_status"), ("Incident Commander", "incident_commander"),
                ("Scene Security", "scene_security"), ("Utilities Secured", "utilities_secured"),
                ("Scene Illumination", "scene_illumination", ["", "Daylight", "Natural daylight with supplemental lighting", "Commercial electrical power", "Fire apparatus scene lighting", "Battery-powered portable lighting", "Generator-powered lighting", "Flashlights only", "Other"]),
                ("360 Completed", "walkaround_completed", ["", "Yes", "No", "Partial"])], data)
            self.text(frame, "Initial Scene Assessment Narrative", "scene_assessment_narrative", data, 10)
            self.text(frame, "Scene Illumination Notes", "illumination_notes", data, 5)
        elif key == "people":
            self.people_workspace(frame, data)
        elif key == "exterior":
            for title, k in [("Front Exterior Observations","front_observations"), ("Left Exterior Observations","left_observations"), ("Rear Exterior Observations","rear_observations"), ("Right Exterior Observations","right_observations"), ("Roof / Foundation / Exposure Observations","roof_foundation_exposures")]:
                self.text(frame, title, k, data, 8)
        elif key == "interior":
            self.text(frame, "Interior Examination by Floor / Area", "interior_observations", data, 18)
        elif key == "origin":
            self.grid(frame, [("General Area of Origin","general_origin"), ("Specific Area of Origin","specific_origin"),
                              ("Cause Classification","cause_classification", ["", "Accidental", "Incendiary", "Undetermined", "Natural"]),
                              ("First Fuel Ignited","first_fuel_ignited"), ("Ignition Source","ignition_source"), ("Oxidizing Agent","oxidizing_agent")], data, cols=3)
            self.text(frame, "Area of Origin Examination", "origin_examination", data, 10)
            self.text(frame, "Ignition Source Evaluation / Matrix Notes", "ignition_matrix_notes", data, 10)
            self.text(frame, "Origin and Cause Analysis", "origin_cause_analysis", data, 10)
        elif key == "evidence":
            self.text(frame, "Evidence Documentation", "evidence_notes", data, 16)
        elif key == "interviews":
            self.text(frame, "Interview Notes", "interview_notes", data, 18)
        ttk.Button(frame, text="Save Now", command=self.save_workspace).pack(anchor="w", padx=8, pady=10)

    def people_workspace(self, frame, data):
        g = ttk.Frame(frame, padding=10)
        g.pack(fill="x")
        headers = ["Name", "Role", "Phone", "Email", "Notes"]
        for c,h in enumerate(headers):
            ttk.Label(g, text=h, font=("Arial", 9, "bold")).grid(row=0, column=c, sticky="w", padx=4)
        roles = ["", "Owner", "Occupant", "911 Caller", "Reporting Party", "Witness", "Neighbor", "Firefighter", "Company Officer", "Incident Commander", "Law Enforcement", "Utility", "Insurance", "Other"]
        for i in range(1, 16):
            for c,k in enumerate(["name","role","phone","email","notes"]):
                key = f"person_{i}_{k}"
                var = tk.StringVar(value=data.get(key, ""))
                e = ttk.Combobox(g, textvariable=var, values=roles, width=20) if k == "role" else ttk.Entry(g, textvariable=var, width=24 if k != "notes" else 38)
                e.grid(row=i, column=c, padx=4, pady=3, sticky="ew")
                self.bind_change(e)
                self.current_fields[key] = var

    def build_initial_report(self):
        case = self.engine.load_case(self.current_db)
        inc = self.engine.load_workspace(self.current_db, "initial_incident")
        return f"""Case#: {inc.get('case_number') or case.get('case_number')} - Initial Report
Type: {inc.get('incident_type') or case.get('incident_type')} – {inc.get('incident_address') or case.get('incident_address')}
Reported: {inc.get('reported_date') or case.get('reported_date')}, {inc.get('reported_time') or case.get('reported_time')}
Investigator: {inc.get('investigator') or case.get('investigator')}

NARRATIVE:
On the above-listed date and time, I was dispatched to the above-listed location to conduct an origin and cause investigation of a {inc.get('incident_type') or case.get('incident_type')}. A more detailed report is forthcoming.
"""

    def build_summary_report(self):
        case = self.engine.load_case(self.current_db)
        inc = self.engine.load_workspace(self.current_db, "initial_incident")
        origin = self.engine.load_workspace(self.current_db, "origin")
        prop = self.engine.load_workspace(self.current_db, "property_building")
        return f"""Case#: {inc.get('case_number') or case.get('case_number')} - Summary Investigative Report
Type: {inc.get('incident_type') or case.get('incident_type')} – {inc.get('incident_address') or case.get('incident_address')}
Reported: {inc.get('reported_date') or case.get('reported_date')}, {inc.get('reported_time') or case.get('reported_time')}
Investigator: {inc.get('investigator') or case.get('investigator')}

NARRATIVE:
This summary investigative report was completed in compliance with SOP 07.02.10 Fire Marshal Reporting.

On {inc.get('reported_date') or case.get('reported_date')}, at {inc.get('reported_time') or case.get('reported_time')}, I was dispatched to the above-listed address to conduct an investigation of a {inc.get('incident_type') or case.get('incident_type')}.

A fire investigation was conducted.

{prop.get('property_description','')}

The origin of the fire was identified as {origin.get('general_origin','')}.

The cause classification was determined to be {origin.get('cause_classification','')} resulting from the ignition of {origin.get('first_fuel_ignited','')}, utilizing {origin.get('oxidizing_agent','normal atmospheric oxygen')} as the oxidizing agent.

ORIGIN: {origin.get('specific_origin') or origin.get('general_origin','')}
CAUSE CLASSIFICATION: {origin.get('cause_classification','')}
STATUS: Closed
"""

    def build_long_report(self):
        case = self.engine.load_case(self.current_db)
        sec = {k:self.engine.load_workspace(self.current_db,k) for _,k in WORKFLOW if k != "reports"}
        inc = sec["initial_incident"]
        return f"""Case#: {inc.get('case_number') or case.get('case_number')} - Origin & Cause Report
Type: {inc.get('incident_type') or case.get('incident_type')} – {inc.get('incident_address') or case.get('incident_address')}
Reported: {inc.get('reported_date') or case.get('reported_date')}, {inc.get('reported_time') or case.get('reported_time')}
Investigator: {inc.get('investigator') or case.get('investigator')}

ASSIGNMENT:
On {inc.get('reported_date') or case.get('reported_date')}, at {inc.get('reported_time') or case.get('reported_time')}, I was dispatched to the above-listed address to conduct an origin and cause investigation of a {inc.get('incident_type') or case.get('incident_type')}.

WEATHER:
{sec['weather'].get('weather_notes','')}

BUILDING:
{sec['property_building'].get('property_description','')}

UTILITIES:
{sec['utilities'].get('utility_notes','')}

INITIAL SCENE ASSESSMENT:
{sec['scene_assessment'].get('scene_assessment_narrative','')}

EXTERIOR EXAMINATION:
{sec['exterior'].get('front_observations','')}
{sec['exterior'].get('left_observations','')}
{sec['exterior'].get('rear_observations','')}
{sec['exterior'].get('right_observations','')}
{sec['exterior'].get('roof_foundation_exposures','')}

INTERIOR EXAMINATION:
{sec['interior'].get('interior_observations','')}

AREA OF ORIGIN EXAMINATION:
{sec['origin'].get('origin_examination','')}

EVIDENCE:
{sec['evidence'].get('evidence_notes','')}

INTERVIEWS:
{sec['interviews'].get('interview_notes','')}

ORIGIN AND CAUSE ANALYSIS AND CONCLUSIONS:
{sec['origin'].get('origin_cause_analysis','')}

ORIGIN: {sec['origin'].get('specific_origin') or sec['origin'].get('general_origin','')}
CAUSE CLASSIFICATION: {sec['origin'].get('cause_classification','')}
STATUS: Closed
"""

    def report_center(self):
        self.clear_main()
        self.current_workspace = None
        self.header("Report Center")
        f = ttk.Frame(self.main, padding=10)
        f.pack(fill="both", expand=True)
        btns = ttk.Frame(f)
        btns.pack(fill="x", pady=(0,8))
        ttk.Button(btns, text="Initial Report", command=lambda: self.load_report("initial", self.build_initial_report())).pack(side="left", padx=4)
        ttk.Button(btns, text="Summary Report", command=lambda: self.load_report("summary", self.build_summary_report())).pack(side="left", padx=4)
        ttk.Button(btns, text="Long O&C Report", command=lambda: self.load_report("long_oc", self.build_long_report())).pack(side="left", padx=4)
        ttk.Button(btns, text="Save Edits", command=self.save_report_edits).pack(side="left", padx=4)
        ttk.Button(btns, text="Export TXT", command=self.export_report_txt).pack(side="left", padx=4)
        self.current_report_type = "initial"
        self.report_text = tk.Text(f, wrap="word", font=("Arial", 11))
        self.report_text.pack(fill="both", expand=True)
        saved = self.engine.load_report(self.current_db, "initial")
        if saved:
            self.report_text.insert("1.0", saved)

    def load_report(self, kind, text):
        self.current_report_type = kind
        self.report_text.delete("1.0", "end")
        self.report_text.insert("1.0", text)
        self.engine.save_report(self.current_db, kind, text)

    def save_report_edits(self):
        text = self.report_text.get("1.0", "end-1c")
        self.engine.save_report(self.current_db, self.current_report_type, text)
        messagebox.showinfo("Saved", "Report edits saved.")

    def export_report_txt(self):
        text = self.report_text.get("1.0", "end-1c")
        if not text.strip():
            messagebox.showerror("No Report", "Generate or enter report text first.")
            return
        path = self.current_db.parent / "Reports" / f"{self.current_case.get('case_number','CASE')}_{self.current_report_type}_report.txt"
        path.write_text(text, encoding="utf-8")
        messagebox.showinfo("Export Complete", f"Exported:\n{path}")

if __name__ == "__main__":
    App().mainloop()
