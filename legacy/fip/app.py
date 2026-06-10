
import os
import re
import json
import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path
from datetime import datetime

APP_TITLE = "Loudoun County Fire Marshal's Office - Fire Investigation Platform"
APP_ROOT = Path(__file__).resolve().parent.parent
APP_DATA_ROOT = APP_ROOT / "data" / "cases"
EXPORT_ROOT = Path(r"C:\Users\christopher.mount\OneDrive - Loudoun County Government\Cases")

STATE_VALUES = ["VA", "MD", "DC", "WV", "PA", "NC", "DE", "NJ", "NY", "TN", "KY", "OH", "Other"]
YES_NO_UNK = ["", "Yes", "No", "Unable to Determine"]
CAUSE_VALUES = ["", "Accidental", "Undetermined", "Incendiary", "Natural"]
INCIDENT_TYPES = ["Structure Fire", "Outside Fire", "Vehicle Fire", "Machinery / Equipment", "Marine Fire", "Explosion", "Other"]
PANEL_MANUFACTURERS = ["", "Square D", "Siemens", "Eaton", "Cutler-Hammer", "GE", "Murray", "Federal Pacific", "Zinsco", "Challenger", "Bryant", "Westinghouse", "ITE", "Other"]
BREAKER_STATUS = ["", "Tripped", "On", "Off", "Melted", "Blank"]
ELECTRIC_PROVIDERS = ["", "Dominion Power", "NOVEC", "Virginia Power", "Other"]
SERVICE_TYPES = ["", "Overhead Service", "Service Lateral"]

SCHEMA = """
CREATE TABLE IF NOT EXISTS case_data (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

def clean_case(case_number):
    return re.sub(r"[^A-Za-z0-9_-]", "", (case_number or "").strip().upper())

def year_from_case(case_number):
    m = re.match(r"FM(\d{2})", case_number.upper())
    return "20" + m.group(1) if m else str(datetime.now().year)

def safe_export_root():
    if os.name == "nt":
        return EXPORT_ROOT
    return Path.home() / "FIP_Cases_Exports"

def safe_data_root():
    return APP_DATA_ROOT

def time_parts_now():
    now = datetime.now()
    hour = now.strftime("%I")
    minute = now.strftime("%M")
    ampm = now.strftime("%p")
    return hour, minute, ampm

def today_str():
    return datetime.now().strftime("%m/%d/%Y")

class ScrollFrame(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        canvas = tk.Canvas(self, highlightthickness=0)
        vsb = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.inner = ttk.Frame(canvas)
        self.inner.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        win = canvas.create_window((0, 0), window=self.inner, anchor="nw")
        canvas.bind("<Configure>", lambda e: canvas.itemconfigure(win, width=e.width))
        canvas.configure(yscrollcommand=vsb.set)
        canvas.pack(side="left", fill="both", expand=True)
        vsb.pack(side="right", fill="y")

class FIPApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("1360x880")
        self.vars = {}
        self.texts = {}
        self.conn = None
        self.case_number = ""
        self.db_path = None
        self.export_folder = None
        self.dynamic_tabs = {}
        self.people_count = 0
        self.evidence_count = 0
        self.interested_count = 0
        self.ignition_count = 0
        self.panel_count = 0
        self.item_counts = {"Vehicle":0, "Machinery / Equipment":0, "Appliance":0, "Battery / Energy Storage":0, "Injury / Fatality":0, "Other Item":0}
        self._style()
        self._build()

    def _style(self):
        style = ttk.Style()
        try:
            style.theme_use("clam")
        except Exception:
            pass
        style.configure("Header.TFrame", background="#f2f2f2")
        style.configure("HeaderTitle.TLabel", font=("Segoe UI", 16, "bold"), background="#f2f2f2")
        style.configure("HeaderSub.TLabel", font=("Segoe UI", 11), background="#f2f2f2")
        style.configure("Section.TLabelframe.Label", font=("Segoe UI", 10, "bold"))
        style.configure("Small.TButton", padding=(8, 3))

    def sv(self, key, default=""):
        if key not in self.vars:
            self.vars[key] = tk.StringVar(value=default)
        return self.vars[key]

    def get(self, key):
        if key in self.texts:
            return self.texts[key].get("1.0", "end-1c")
        return self.vars.get(key, tk.StringVar()).get()

    def setv(self, key, value):
        if key in self.texts:
            self.texts[key].delete("1.0", "end")
            self.texts[key].insert("1.0", value or "")
        else:
            self.sv(key).set(value or "")

    def collect_data(self):
        data = {}
        for k, v in self.vars.items():
            data[k] = v.get()
        for k, t in self.texts.items():
            data[k] = t.get("1.0", "end-1c")
        data["case_number"] = self.case_number
        return data

    def load_data(self, data):
        for k, v in data.items():
            self.setv(k, v)

    def section(self, parent, title):
        lf = ttk.LabelFrame(parent, text=title, padding=10, style="Section.TLabelframe")
        lf.pack(fill="x", padx=10, pady=7)
        return lf

    def row_entry(self, parent, label, key, row, col=0, width=24):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=3)
        e = ttk.Entry(parent, textvariable=self.sv(key), width=width)
        e.grid(row=row, column=col+1, sticky="w", padx=4, pady=3)
        return e

    def row_combo(self, parent, label, key, values, row, col=0, width=24):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=3)
        cb = ttk.Combobox(parent, textvariable=self.sv(key), values=values, width=width)
        cb.grid(row=row, column=col+1, sticky="w", padx=4, pady=3)
        return cb

    def check(self, parent, label, key, row, col=0):
        ttk.Checkbutton(parent, text=label, variable=self.sv(key, "0"), onvalue="1", offvalue="0").grid(row=row, column=col, sticky="w", padx=4, pady=3)

    def text_box(self, parent, label, key, height=6):
        # Tkinter cannot mix pack() and grid() in the same parent.
        # Use grid when the section already uses grid; otherwise use pack.
        managers = {child.winfo_manager() for child in parent.winfo_children() if child.winfo_manager()}
        txt = tk.Text(parent, height=height, wrap="word", undo=True)
        self.texts[key] = txt

        if "grid" in managers:
            rows = []
            for child in parent.winfo_children():
                try:
                    rows.append(int(child.grid_info().get("row", 0)))
                except Exception:
                    pass
            row = (max(rows) + 1) if rows else 0
            ttk.Label(parent, text=label).grid(row=row, column=0, sticky="nw", padx=4, pady=(6, 2))
            txt.grid(row=row, column=1, columnspan=9, sticky="ew", padx=4, pady=(6, 2))
            parent.columnconfigure(1, weight=1)
        else:
            ttk.Label(parent, text=label).pack(anchor="w", padx=4, pady=(3,0))
            txt.pack(fill="both", expand=True, padx=4, pady=3)

        return txt

    def date_control(self, parent, label, key, row, col=0, default_today=False):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=3)
        if default_today and not self.sv(key).get():
            self.sv(key).set(today_str())
        frame = ttk.Frame(parent)
        frame.grid(row=row, column=col+1, sticky="w", padx=4, pady=3)
        ttk.Entry(frame, textvariable=self.sv(key), width=12).pack(side="left")
        ttk.Button(frame, text="Today", style="Small.TButton", command=lambda: self.sv(key).set(today_str())).pack(side="left", padx=3)

    def time_control(self, parent, label, prefix, row, col=0, default_now=False):
        ttk.Label(parent, text=label).grid(row=row, column=col, sticky="w", padx=4, pady=3)
        frame = ttk.Frame(parent)
        frame.grid(row=row, column=col+1, sticky="w", padx=4, pady=3)
        hours = [f"{i:02d}" for i in range(1,13)]
        mins = [f"{i:02d}" for i in range(60)]
        if default_now and not self.sv(prefix+"_hour").get():
            h,m,a = time_parts_now()
            self.sv(prefix+"_hour").set(h)
            self.sv(prefix+"_minute").set(m)
            self.sv(prefix+"_ampm").set(a)
        ttk.Combobox(frame, textvariable=self.sv(prefix+"_hour"), values=hours, width=4).pack(side="left")
        ttk.Label(frame, text=":").pack(side="left")
        ttk.Combobox(frame, textvariable=self.sv(prefix+"_minute"), values=mins, width=4).pack(side="left")
        ttk.Combobox(frame, textvariable=self.sv(prefix+"_ampm"), values=["AM","PM"], width=5).pack(side="left", padx=4)

    def fmt_time(self, prefix):
        h = self.get(prefix+"_hour")
        m = self.get(prefix+"_minute")
        a = self.get(prefix+"_ampm")
        return f"{h}:{m} {a}".strip() if h or m or a else ""

    def _build(self):
        header = ttk.Frame(self, padding=8, style="Header.TFrame")
        header.pack(fill="x")
        # Text badge placeholder. Actual image badge can be added next build if included as asset.
        badge = ttk.Label(header, text="LCFMO", font=("Segoe UI", 12, "bold"), background="#d9d9d9", padding=10)
        badge.pack(side="left", padx=(0,10))
        titlebox = ttk.Frame(header, style="Header.TFrame")
        titlebox.pack(side="left")
        ttk.Label(titlebox, text="Loudoun County Fire Marshal's Office", style="HeaderTitle.TLabel").pack(anchor="w")
        ttk.Label(titlebox, text="Fire Investigation Platform", style="HeaderSub.TLabel").pack(anchor="w")

        toolbar = ttk.Frame(self, padding=(8,4))
        toolbar.pack(fill="x")
        ttk.Button(toolbar, text="New Case", command=self.new_case).pack(side="left", padx=3)
        ttk.Button(toolbar, text="Open Case", command=self.open_case).pack(side="left", padx=3)
        ttk.Button(toolbar, text="Save", command=self.save).pack(side="left", padx=3)
        ttk.Button(toolbar, text="+ Add Investigation Item", command=self.add_investigation_item_dialog).pack(side="left", padx=15)
        self.status = ttk.Label(toolbar, text="No case open")
        self.status.pack(side="left", padx=10)

        self.nb = ttk.Notebook(self)
        self.nb.pack(fill="both", expand=True)

        self.build_initial_incident()
        self.build_property_building()
        self.build_weather()
        self.build_utilities()
        self.build_electrical()
        self.build_initial_scene()
        self.build_exterior()
        self.build_interior()
        self.build_people()
        self.build_interested_parties()
        self.build_evidence()
        self.build_area_origin()
        self.build_ignition_eval()
        self.build_origin_cause()
        self.build_report_center()

    def add_tab(self, title):
        sf = ScrollFrame(self.nb)
        self.nb.add(sf, text=title)
        return sf.inner

    def build_initial_incident(self):
        p = self.add_tab("1 Initial Incident")
        s = self.section(p, "Case Information")
        self.row_entry(s, "FM Report Number", "case_number_display", 0, width=18)
        self.row_combo(s, "Incident Type", "incident_type", INCIDENT_TYPES, 0, 2, width=24)
        self.row_entry(s, "Incident Address / Location", "incident_address", 1, width=70)
        self.row_combo(s, "Authority", "authority", ["", "Exigency", "Search Warrant", "Consent"], 2, width=24)
        self.row_entry(s, "Consent Name", "consent_name", 2, 2, width=30)

        t = self.section(p, "Incident Timeline")
        self.date_control(t, "Reported Date", "reported_date", 0, default_today=True)
        self.time_control(t, "Reported Time", "reported", 0, 2, default_now=True)
        self.date_control(t, "Dispatch Date", "dispatch_date", 1)
        self.time_control(t, "Dispatch Time", "dispatch", 1, 2)
        self.check(t, "Dispatch same as reported", "dispatch_same", 2, 0)
        self.date_control(t, "Arrival Date", "arrival_date", 3)
        self.time_control(t, "Arrival Time", "arrival", 3, 2)

        c = self.section(p, "911 Caller / Reporting Party")
        self.row_entry(c, "Name", "caller_name", 0, width=28)
        self.row_entry(c, "Phone Number", "caller_phone", 0, 2, width=16)
        self.row_entry(c, "Address", "caller_address", 1, width=70)
        self.time_control(c, "Time Fire Discovered", "caller_discovered", 2)
        self.row_entry(c, "What made caller notice the fire", "caller_how_noticed", 3, width=70)
        self.row_entry(c, "Smoke / Flame Color", "caller_smoke_flame_color", 4, width=24)
        self.row_combo(c, "Caller took photos/video", "caller_photos_video", ["", "Yes", "No", "Unknown"], 4, 2, width=12)
        self.text_box(c, "What was seen, heard, or smelled", "caller_observations", 4)
        self.text_box(c, "Caller Notes", "caller_notes", 4)

        f = self.section(p, "Fire Suppression Information")
        self.row_entry(f, "Incident Commander", "incident_commander", 0, width=26)
        self.row_entry(f, "IC Unit ID", "ic_unit", 0, 2, width=14)
        self.row_entry(f, "Command Post Location", "cp_location", 1, width=40)
        self.row_entry(f, "# of Alarms", "alarms", 1, 2, width=8)
        self.row_entry(f, "1st Arriving Engine", "first_engine", 2, width=20)
        self.row_entry(f, "Engine Officer", "engine_officer", 2, 2, width=24)
        self.text_box(f, "Engine Activity on Arrival", "engine_activity", 3)
        self.row_entry(f, "1st Arriving Truck/Specialty", "first_truck", 3, width=20)
        self.row_entry(f, "Officer", "truck_officer", 3, 2, width=24)
        self.text_box(f, "Truck/Specialty Activity on Arrival", "truck_activity", 3)

        leo = self.section(p, "Law Enforcement On Scene")
        for i, (lab,key) in enumerate([("LCSO","leo_lcso"),("Leesburg PD","leo_leesburg"),("Purcellville PD","leo_purcellville"),("Middleburg PD","leo_middleburg"),("Other LEO","leo_other")]):
            self.check(leo, lab, key, 0, i)
        self.row_entry(leo, "Other Agency", "leo_other_agency", 1, width=30)
        self.text_box(leo, "LEO Notes", "leo_notes", 3)

    def build_property_building(self):
        p = self.add_tab("2 Property / Building")
        b = self.section(p, "Building Information")
        ttk.Label(b, text="Year Built").grid(row=0, column=0, padx=4, pady=3)
        ttk.Entry(b, textvariable=self.sv("year_built"), width=8).grid(row=0, column=1, padx=4)
        ttk.Label(b, text="Stories").grid(row=0, column=2, padx=4)
        ttk.Entry(b, textvariable=self.sv("stories"), width=5).grid(row=0, column=3, padx=4)
        ttk.Label(b, text="Length").grid(row=0, column=4, padx=4)
        ttk.Entry(b, textvariable=self.sv("building_length"), width=8).grid(row=0, column=5, padx=4)
        ttk.Label(b, text="ft").grid(row=0, column=6, padx=(0,8))
        ttk.Label(b, text="Width").grid(row=0, column=7, padx=4)
        ttk.Entry(b, textvariable=self.sv("building_width"), width=8).grid(row=0, column=8, padx=4)
        ttk.Label(b, text="ft").grid(row=0, column=9, padx=0)
        self.row_entry(b, "Assessed Value", "assessed_value", 1, width=18)
        self.row_entry(b, "% Involved", "percent_involved", 1, 2, width=8)
        self.row_combo(b, "Property Status", "property_status", ["", "Owner Occupied", "Rented", "Vacant", "For Sale"], 2, width=22)
        self.row_combo(b, "Under Construction / Remodel", "under_construction", YES_NO_UNK, 2, 2, width=18)
        self.text_box(b, "Open Permits Associated with Building", "open_permits", 3)
        self.text_box(b, "Prior Insurance Claims on Building/Property", "prior_claims", 3)

        c = self.section(p, "Construction")
        self.row_combo(c, "Construction Type", "construction_type", ["", "Fire Resistive", "Non-Combustible", "Ordinary", "Heavy Timber", "Wood Frame"], 0, width=24)
        self.row_combo(c, "Foundation Type", "foundation_type", ["", "Basement", "Slab", "Crawlspace", "Other"], 0, 2, width=18)
        self.row_combo(c, "Foundation Material", "foundation_material", ["", "Masonry", "Concrete", "Stone", "Other"], 1, width=18)
        self.row_combo(c, "Exterior Covering", "exterior_covering", ["", "Vinyl", "Aluminum", "Hardie Board", "Brick/Stone", "Stucco", "Wood", "Other"], 1, 2, width=20)
        self.row_combo(c, "Roof", "roof", ["", "Asphalt Shingles", "Wood", "Metal", "Tile", "Other"], 2, width=20)

        smoke = self.section(p, "Smoke Alarms")
        self.row_combo(smoke, "Present", "smoke_present", YES_NO_UNK, 0, width=18)
        self.row_entry(smoke, "Number", "smoke_count", 0, 2, width=8)
        for i, (lab,key) in enumerate([("Hardwired","smoke_hardwired"),("Battery Operated","smoke_battery"),("Batteries in Place","smoke_batteries")]):
            self.check(smoke, lab, key, 1, i)
        self.row_entry(smoke, "Manufacturer(s)", "smoke_mfg", 2, width=28)
        self.row_entry(smoke, "Age / Manufacture Date", "smoke_age", 2, 2, width=20)
        ttk.Label(smoke, text="Evidence of Operation", font=("Segoe UI", 9, "bold")).grid(row=3, column=0, sticky="w", pady=(8,2))
        ev = [("Acoustic soot agglomeration observed","smoke_asa"),("Soot deposition around sounder opening","smoke_soot_sounder"),("Witness reported alarm sounding","smoke_witness"),("Occupants alerted","smoke_alerted"),("Fire personnel reported alarm sounding","smoke_fd"),("No evidence observed","smoke_no_evidence"),("Unable to evaluate","smoke_unable")]
        for i,(lab,key) in enumerate(ev):
            self.check(smoke, lab, key, 4+i//2, i%2)
        self.text_box(smoke, "Smoke Alarm Notes", "smoke_notes", 4)

        life = self.section(p, "Life Safety / Security")
        self.row_combo(life, "CO Detectors", "co_detectors", YES_NO_UNK, 0, width=18)
        self.row_combo(life, "CO Alerted Occupants", "co_alerted", YES_NO_UNK, 0, 2, width=18)
        self.row_combo(life, "Fire Alarm System", "fire_alarm", YES_NO_UNK, 1, width=18)
        self.row_combo(life, "Did It Alarm", "fire_alarm_did", YES_NO_UNK, 1, 2, width=18)
        self.row_combo(life, "Sprinklers", "sprinklers", YES_NO_UNK, 2, width=18)
        self.row_combo(life, "Did They Function", "sprinkler_function", YES_NO_UNK, 2, 2, width=18)
        self.row_combo(life, "Control Valves at FF Arrival", "sprinkler_valves", ["", "On", "Off", "Unable to Determine"], 3, width=20)
        self.row_combo(life, "Standpipes", "standpipes", YES_NO_UNK, 3, 2, width=18)
        self.row_combo(life, "Security Cameras", "security_cameras", YES_NO_UNK, 4, width=18)
        self.row_combo(life, "Hidden Keys / Lockbox", "lockbox", YES_NO_UNK, 4, 2, width=18)
        self.row_entry(life, "Lockbox Location", "lockbox_location", 5, width=30)
        self.row_combo(life, "Security Bars / Grills", "security_bars", YES_NO_UNK, 5, 2, width=18)
        self.text_box(life, "Life Safety / Security Notes", "life_safety_notes", 4)

    def build_weather(self):
        p = self.add_tab("3 Weather")
        w = self.section(p, "Environmental Conditions")
        self.row_entry(w, "Weather at Time Of", "weather_time_of", 0, width=18)
        self.row_entry(w, "Temperature °F", "temperature", 0, 2, width=8)
        self.row_entry(w, "Humidity %", "humidity", 0, 4, width=8)
        self.row_entry(w, "Wind Direction", "wind_direction", 1, width=14)
        self.row_entry(w, "Wind Speed MPH", "wind_speed", 1, 2, width=8)
        for i, (lab,key) in enumerate([("Day","weather_day"),("Night","weather_night"),("Clear","weather_clear"),("Overcast","weather_overcast"),("Cloudy","weather_cloudy"),("Snow","weather_snow"),("Lightning","weather_lightning"),("Rain","weather_rain")]):
            self.check(w, lab, key, 2+i//4, i%4)
        self.row_entry(w, "Weather Source", "weather_source", 4, width=40)
        ttk.Button(w, text="Import Historical Weather (future API)", state="disabled").grid(row=4, column=2, sticky="w", padx=4)
        self.text_box(w, "Weather Notes", "weather_notes", 4)

    def build_utilities(self):
        p = self.add_tab("4 Utilities")
        e = self.section(p, "Electric Service")
        self.row_combo(e, "Electricity", "electric_status", ["", "On", "Off", "None", "Unable to Determine"], 0, width=18)
        self.row_combo(e, "Provider", "electric_provider", ELECTRIC_PROVIDERS, 0, 2, width=20)
        self.row_entry(e, "Other Provider", "electric_provider_other", 1, width=24)
        self.row_combo(e, "Service Type", "electric_service_type", SERVICE_TYPES, 1, 2, width=20)
        self.row_entry(e, "Meter #", "electric_meter_number", 2, width=18)
        self.row_entry(e, "Meter Location", "electric_meter_location", 2, 2, width=32)
        self.row_combo(e, "Fire Damage at Meter", "electric_meter_damage", YES_NO_UNK, 3, width=18)

        g = self.section(p, "Natural Gas")
        self.row_combo(g, "Natural Gas Present", "natural_gas_present", YES_NO_UNK, 0, width=18)
        self.row_entry(g, "Provider", "natural_gas_provider", 0, 2, width=24)
        self.sv("natural_gas_provider").set("Washington Gas")
        self.row_entry(g, "Meter #", "gas_meter_number", 1, width=18)
        self.row_entry(g, "Meter Location", "gas_meter_location", 1, 2, width=32)
        self.row_entry(g, "Riser Location", "gas_riser_location", 2, width=32)
        self.row_combo(g, "Damage at Meter", "gas_meter_damage", YES_NO_UNK, 2, 2, width=18)
        self.row_combo(g, "Damage to Riser", "gas_riser_damage", YES_NO_UNK, 3, width=18)

        lp = self.section(p, "Propane / LP Gas")
        self.row_combo(lp, "LP Present", "lp_present", YES_NO_UNK, 0, width=18)
        self.row_entry(lp, "Supplier", "lp_supplier", 0, 2, width=24)
        self.row_entry(lp, "Tank Size", "lp_tank_size", 1, width=12)
        self.row_combo(lp, "Tank Orientation", "lp_orientation", ["", "Above Ground", "Below Ground", "Vertical", "Horizontal"], 1, 2, width=18)
        self.row_entry(lp, "Serial #", "lp_serial", 2, width=20)
        self.row_entry(lp, "% Product", "lp_percent", 2, 2, width=10)
        self.row_entry(lp, "# Regulators", "lp_regulators", 3, width=8)
        self.row_entry(lp, "Tank Location", "lp_location", 3, 2, width=32)
        self.row_combo(lp, "Tank Fire Damage", "lp_damage", YES_NO_UNK, 4, width=18)
        self.text_box(lp, "LP Notes", "lp_notes", 3)

        add = self.section(p, "Additional Energy Systems")
        self.row_combo(add, "Solar Panels", "solar", YES_NO_UNK, 0, width=18)
        self.row_combo(add, "Generator", "generator", YES_NO_UNK, 0, 2, width=18)
        self.row_combo(add, "Battery Storage", "battery_storage", YES_NO_UNK, 1, width=18)
        self.text_box(add, "Energy System Notes", "energy_notes", 4)
        self.text_box(add, "Other Noteworthy Utilities", "other_utilities", 4)

    def build_electrical(self):
        p = self.add_tab("5 Electrical")
        control = self.section(p, "Electrical Panels")
        ttk.Button(control, text="+ Add Panel", command=self.add_panel).pack(anchor="w")
        self.panel_holder = ttk.Frame(control)
        self.panel_holder.pack(fill="x")
        self.add_panel()

    def add_panel(self):
        self.panel_count += 1
        idx = self.panel_count
        lf = ttk.LabelFrame(self.panel_holder, text=f"Electrical Panel #{idx}", padding=10)
        lf.pack(fill="x", pady=8)
        prefix = f"panel_{idx}"
        self.row_entry(lf, "Panel Location", f"{prefix}_location", 0, width=28)
        self.row_combo(lf, "Panel Manufacturer", f"{prefix}_manufacturer", PANEL_MANUFACTURERS, 0, 2, width=22)
        self.row_combo(lf, "Type", f"{prefix}_type", ["", "Fuses", "Circuit Breakers"], 1, width=20)
        self.row_entry(lf, "Main Breaker Size", f"{prefix}_main_size", 1, 2, width=10)
        self.row_combo(lf, "Fire Impingement", f"{prefix}_fire_impingement", YES_NO_UNK, 2, width=18)
        self.row_combo(lf, "Heat Impingement", f"{prefix}_heat_impingement", YES_NO_UNK, 2, 2, width=18)
        self.row_combo(lf, "Arc Flash", f"{prefix}_arc_flash", YES_NO_UNK, 2, 4, width=18)
        self.text_box(lf, "Notes", f"{prefix}_notes", 3)

        grid = ttk.Frame(lf)
        grid.grid(row=4, column=0, columnspan=6, sticky="w", pady=8)
        ttk.Label(grid, text="Left Bank", font=("Segoe UI", 10, "bold")).grid(row=0, column=0, columnspan=4, sticky="w")
        ttk.Label(grid, text="Right Bank", font=("Segoe UI", 10, "bold")).grid(row=0, column=5, columnspan=4, sticky="w")
        heads = ["#", "Amps", "Status", "Labeled Circuit", "", "#", "Amps", "Status", "Labeled Circuit"]
        for c,h in enumerate(heads):
            ttk.Label(grid, text=h, font=("Segoe UI", 9, "bold")).grid(row=1, column=c, padx=2)
        for r in range(20):
            odd = r*2 + 1
            even = r*2 + 2
            ttk.Label(grid, text=str(odd)).grid(row=r+2, column=0, padx=2, pady=1)
            ttk.Entry(grid, textvariable=self.sv(f"{prefix}_c{odd}_amps"), width=6).grid(row=r+2, column=1, padx=2)
            ttk.Combobox(grid, textvariable=self.sv(f"{prefix}_c{odd}_status"), values=BREAKER_STATUS, width=10).grid(row=r+2, column=2, padx=2)
            ttk.Entry(grid, textvariable=self.sv(f"{prefix}_c{odd}_label"), width=24).grid(row=r+2, column=3, padx=2)
            ttk.Label(grid, text="   ").grid(row=r+2, column=4)
            ttk.Label(grid, text=str(even)).grid(row=r+2, column=5, padx=2)
            ttk.Entry(grid, textvariable=self.sv(f"{prefix}_c{even}_amps"), width=6).grid(row=r+2, column=6, padx=2)
            ttk.Combobox(grid, textvariable=self.sv(f"{prefix}_c{even}_status"), values=BREAKER_STATUS, width=10).grid(row=r+2, column=7, padx=2)
            ttk.Entry(grid, textvariable=self.sv(f"{prefix}_c{even}_label"), width=24).grid(row=r+2, column=8, padx=2)

    def build_initial_scene(self):
        p = self.add_tab("6 Initial Scene Assessment")
        s = self.section(p, "Orientation and Initial Conditions")
        self.row_entry(s, "Front Direction", "front_direction", 0, width=12)
        self.row_combo(s, "Front Faces Toward", "front_faces", ["", "Street", "Pipe Stem Driveway", "Main Driveway", "Parking Lot", "Woods", "Open Field", "Rear Yard", "Water", "Adjacent Structure", "Other"], 0, 2, width=24)
        self.text_box(s, "Initial Scene Assessment Narrative", "initial_scene_assessment", 8)
        l = self.section(p, "Scene Illumination")
        lights = [("Daylight","light_daylight"),("Supplemental Lighting","light_supplemental"),("Commercial Electrical Power","light_commercial"),("Fire Apparatus Scene Lighting","light_apparatus"),("Battery-Powered Portable Lighting","light_battery"),("Generator-Powered Lighting","light_generator"),("Flashlights Only","light_flashlights"),("Other","light_other")]
        for i,(lab,key) in enumerate(lights):
            self.check(l, lab, key, i//2, i%2)
        self.text_box(l, "Illumination Notes", "illumination_notes", 3)

    def build_exterior(self):
        p = self.add_tab("7 Exterior Examination")
        for side in ["Front", "Left", "Rear", "Right"]:
            self.text_box(self.section(p, f"{side} Exterior"), f"{side} Exterior Observations", f"exterior_{side.lower()}", 10)

    def build_interior(self):
        p = self.add_tab("8 Interior Examination")
        for area in ["First Floor", "Second Floor", "Basement", "Attic", "Garage", "Other Areas"]:
            self.text_box(self.section(p, area), f"{area} Observations", f"interior_{area.lower().replace(' ','_')}", 10)

    def build_people(self):
        p = self.add_tab("9 People")
        sec = self.section(p, "People Roster")
        ttk.Button(sec, text="+ Add Person", command=self.add_person).pack(anchor="w")
        self.people_holder = ttk.Frame(sec)
        self.people_holder.pack(fill="x")
        header = ttk.Frame(self.people_holder)
        header.pack(fill="x", pady=(5,0))
        for txt,w in [("Name",22),("Address",34),("Phone",14),("OLN",14),("State",7),("Social",12),("Roles",48),("Notes",24)]:
            ttk.Label(header, text=txt, width=w, font=("Segoe UI", 9, "bold")).pack(side="left", padx=1)
        self.add_person()

    def add_person(self):
        self.people_count += 1
        idx = self.people_count
        row = ttk.Frame(self.people_holder)
        row.pack(fill="x", pady=2)
        prefix = f"person_{idx}"
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_name"), width=22).pack(side="left", padx=1)
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_address"), width=34).pack(side="left", padx=1)
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_phone"), width=14).pack(side="left", padx=1)
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_oln"), width=14).pack(side="left", padx=1)
        cb = ttk.Combobox(row, textvariable=self.sv(f"{prefix}_oln_state", "VA"), values=STATE_VALUES, width=6)
        cb.pack(side="left", padx=1)
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_social"), width=12).pack(side="left", padx=1)
        roles = ttk.Frame(row)
        roles.pack(side="left", padx=1)
        for lab,key in [("Owner","owner"),("Occupant","occupant"),("Renter","renter"),("Visitor","visitor"),("Witness","witness"),("Victim","victim"),("FD","fd"),("Other","other")]:
            ttk.Checkbutton(roles, text=lab, variable=self.sv(f"{prefix}_role_{key}", "0"), onvalue="1", offvalue="0").pack(side="left")
        ttk.Entry(row, textvariable=self.sv(f"{prefix}_notes"), width=24).pack(side="left", padx=1)

    def build_interested_parties(self):
        p = self.add_tab("10 Interviews / Statements")
        sec = self.section(p, "Interested Party Statements")
        ttk.Button(sec, text="+ Add Statement", command=self.add_interested_statement).pack(anchor="w")
        self.interested_holder = ttk.Frame(sec)
        self.interested_holder.pack(fill="x")
        self.add_interested_statement()

    def add_interested_statement(self):
        self.interested_count += 1
        idx = self.interested_count
        lf = ttk.LabelFrame(self.interested_holder, text=f"Statement #{idx}", padding=8)
        lf.pack(fill="x", pady=6)
        prefix = f"statement_{idx}"
        self.row_entry(lf, "Person", f"{prefix}_person", 0, width=28)
        self.row_combo(lf, "Statement Type", f"{prefix}_type", ["", "Witness", "Owner", "Occupant", "Renter", "Visitor", "Fire Personnel", "Other"], 0, 2, width=18)
        self.date_control(lf, "Date", f"{prefix}_date", 1)
        self.time_control(lf, "Time", f"{prefix}_time", 1, 2)
        self.row_entry(lf, "Location", f"{prefix}_location", 2, width=48)
        self.text_box(lf, "Statement / Interview Notes", f"{prefix}_notes", 8)

    def build_evidence(self):
        p = self.add_tab("11 Evidence")
        sec = self.section(p, "Evidence")
        ttk.Button(sec, text="+ Add Evidence Item", command=self.add_evidence).pack(anchor="w")
        self.evidence_holder = ttk.Frame(sec)
        self.evidence_holder.pack(fill="x")
        self.add_evidence()

    def add_evidence(self):
        self.evidence_count += 1
        idx = self.evidence_count
        lf = ttk.LabelFrame(self.evidence_holder, text=f"Evidence Item #{idx}", padding=8)
        lf.pack(fill="x", pady=6)
        prefix = f"evidence_{idx}"
        self.row_entry(lf, "Item #", f"{prefix}_number", 0, width=10)
        self.row_entry(lf, "Description", f"{prefix}_description", 0, 2, width=60)
        self.row_entry(lf, "Location Found", f"{prefix}_location", 1, width=60)
        self.row_entry(lf, "Collected By", f"{prefix}_collected_by", 1, 2, width=24)
        self.date_control(lf, "Date Collected", f"{prefix}_date", 2)
        self.time_control(lf, "Time Collected", f"{prefix}_time", 2, 2)
        self.text_box(lf, "Notes", f"{prefix}_notes", 4)

    def build_area_origin(self):
        p = self.add_tab("12 Area of Origin")
        a = self.section(p, "Area of Origin")
        self.row_entry(a, "General Area of Origin", "general_area_origin", 0, width=70)
        self.row_entry(a, "Specific Area of Origin", "specific_area_origin", 1, width=70)
        self.text_box(a, "Area of Origin Comments", "area_origin_comments", 6)
        self.text_box(a, "How Area of Origin Was Determined", "area_origin_determination", 8)
        fs = self.section(p, "Fire Spread")
        self.row_entry(fs, "Materials", "fire_spread_materials", 0, width=70)
        self.row_entry(fs, "Avenues", "fire_spread_avenues", 1, width=70)
        self.text_box(fs, "Comments", "fire_spread_comments", 4)
        ss = self.section(p, "Smoke Spread")
        self.row_entry(ss, "Materials", "smoke_spread_materials", 0, width=70)
        self.row_entry(ss, "Avenues", "smoke_spread_avenues", 1, width=70)
        self.text_box(ss, "Comments", "smoke_spread_comments", 4)

    def build_ignition_eval(self):
        p = self.add_tab("13 Ignition Source Evaluation")
        sec = self.section(p, "Potential Ignition Source Assessment")
        ttk.Button(sec, text="+ Add Ignition Source", command=self.add_ignition_source).pack(anchor="w")
        self.ignition_holder = ttk.Frame(sec)
        self.ignition_holder.pack(fill="x")
        self.add_ignition_source()

    def add_ignition_source(self):
        self.ignition_count += 1
        idx = self.ignition_count
        lf = ttk.LabelFrame(self.ignition_holder, text=f"Ignition Source #{idx}", padding=8)
        lf.pack(fill="x", pady=6)
        prefix = f"ignition_{idx}"
        self.row_entry(lf, "Potential Ignition Source", f"{prefix}_source", 0, width=60)
        self.row_combo(lf, "Considered", f"{prefix}_considered", YES_NO_UNK, 0, 2, width=18)
        self.row_combo(lf, "Eliminated", f"{prefix}_eliminated", YES_NO_UNK, 1, width=18)
        self.text_box(lf, "Why Considered", f"{prefix}_why_considered", 4)
        self.text_box(lf, "How / Why Eliminated", f"{prefix}_why_eliminated", 4)

    def build_origin_cause(self):
        p = self.add_tab("14 Origin & Cause Analysis")
        seq = self.section(p, "Identified Ignition Sequence")
        self.row_entry(seq, "Heat Source", "heat_source", 0, width=60)
        self.row_entry(seq, "Material Ignited", "material_ignited", 1, width=60)
        self.row_entry(seq, "Ignition Factor", "ignition_factor", 2, width=60)
        self.row_combo(seq, "Equipment Involved", "equipment_involved", YES_NO_UNK, 3, width=18)
        self.row_entry(seq, "Make", "equipment_make", 4, width=28)
        self.row_entry(seq, "Model", "equipment_model", 4, 2, width=28)
        self.row_entry(seq, "Serial No.", "equipment_serial", 5, width=28)
        oc = self.section(p, "Origin and Cause Analysis")
        self.row_combo(oc, "Cause Classification", "cause_classification", CAUSE_VALUES, 0, width=20)
        self.row_entry(oc, "First Fuel Ignited", "first_fuel_ignited", 1, width=60)
        self.row_entry(oc, "Oxidizing Agent", "oxidizing_agent", 2, width=40)
        self.sv("oxidizing_agent").set("Normal atmospheric oxygen")
        self.text_box(oc, "Analysis Narrative", "oc_analysis", 8)
        self.text_box(oc, "Final Conclusion", "oc_conclusion", 6)

    def build_report_center(self):
        p = self.add_tab("15 Report Center")
        r = self.section(p, "Exports")
        ttk.Button(r, text="Export Initial Report", command=self.export_initial_report).pack(anchor="w", pady=3)
        ttk.Button(r, text="Export Summary Report", command=self.export_summary_report).pack(anchor="w", pady=3)
        ttk.Button(r, text="Export Crisp Investigator Notes", command=self.export_notes).pack(anchor="w", pady=3)
        self.report_preview = tk.Text(r, height=22, wrap="word")
        self.report_preview.pack(fill="both", expand=True, pady=8)

    def add_investigation_item_dialog(self):
        win = tk.Toplevel(self)
        win.title("Add Investigation Item")
        win.geometry("360x280")
        ttk.Label(win, text="Select item to add:").pack(anchor="w", padx=12, pady=10)
        choice = tk.StringVar(value="Vehicle")
        for item in ["Vehicle", "Machinery / Equipment", "Appliance", "Battery / Energy Storage", "Injury / Fatality", "Other Item"]:
            ttk.Radiobutton(win, text=item, variable=choice, value=item).pack(anchor="w", padx=20)
        def add():
            self.add_item_tab(choice.get())
            win.destroy()
        ttk.Button(win, text="Add", command=add).pack(pady=12)
        win.transient(self)
        win.grab_set()

    def add_item_tab(self, item_type):
        self.item_counts[item_type] += 1
        n = self.item_counts[item_type]
        title = f"{item_type} {n}"
        p = self.add_tab(title)
        s = self.section(p, title)
        prefix = f"item_{item_type.lower().replace(' ','_').replace('/','_')}_{n}"
        if item_type == "Vehicle":
            self.row_entry(s, "Year", f"{prefix}_year", 0, width=8)
            self.row_entry(s, "Make", f"{prefix}_make", 0, 2, width=20)
            self.row_entry(s, "Model", f"{prefix}_model", 0, 4, width=20)
            self.row_entry(s, "Color", f"{prefix}_color", 1, width=14)
            self.row_entry(s, "VIN", f"{prefix}_vin", 1, 2, width=28)
            self.row_entry(s, "Plate", f"{prefix}_plate", 2, width=14)
            self.row_combo(s, "State", f"{prefix}_plate_state", STATE_VALUES, 2, 2, width=8)
            self.row_combo(s, "Fuel Source", f"{prefix}_fuel", ["", "Gasoline", "Diesel", "Hybrid", "Electric", "Other"], 3, width=18)
            self.text_box(s, "Vehicle Notes", f"{prefix}_notes", 8)
        elif item_type == "Battery / Energy Storage":
            self.row_entry(s, "Device / Battery", f"{prefix}_device", 0, width=40)
            self.row_entry(s, "Brand", f"{prefix}_brand", 1, width=24)
            self.row_entry(s, "Model", f"{prefix}_model", 1, 2, width=24)
            self.row_combo(s, "Battery Type", f"{prefix}_battery_type", ["", "Lithium-ion", "Alkaline", "NiCad", "NiMH", "Other"], 2, width=18)
            self.text_box(s, "Battery / Charging / Usage Notes", f"{prefix}_notes", 10)
        elif item_type == "Injury / Fatality":
            self.row_combo(s, "Type", f"{prefix}_type", ["", "Injury", "Fatality"], 0, width=18)
            self.row_entry(s, "Name", f"{prefix}_name", 1, width=30)
            self.row_entry(s, "DOB", f"{prefix}_dob", 1, 2, width=12)
            self.row_entry(s, "Age", f"{prefix}_age", 1, 4, width=6)
            self.row_entry(s, "Transported To", f"{prefix}_transported_to", 2, width=40)
            self.row_entry(s, "Transported By", f"{prefix}_transported_by", 2, 2, width=24)
            self.text_box(s, "Recovery / Medical Examiner Notes", f"{prefix}_notes", 10)
        else:
            self.row_entry(s, "Description", f"{prefix}_description", 0, width=60)
            self.row_entry(s, "Make", f"{prefix}_make", 1, width=24)
            self.row_entry(s, "Model", f"{prefix}_model", 1, 2, width=24)
            self.row_entry(s, "Serial", f"{prefix}_serial", 2, width=24)
            self.text_box(s, "Notes", f"{prefix}_notes", 10)
        self.nb.select(self.nb.index("end")-1)

    def new_case(self):
        self.case_dialog("New Case")

    def open_case(self):
        self.case_dialog("Open Case")

    def case_dialog(self, title):
        win = tk.Toplevel(self)
        win.title(title)
        win.geometry("420x210")
        ttk.Label(win, text="Case Number").pack(anchor="w", padx=12, pady=(12,3))
        case_var = tk.StringVar()
        ttk.Entry(win, textvariable=case_var, width=30).pack(anchor="w", padx=12)
        ttk.Label(win, text="Primary Incident Type").pack(anchor="w", padx=12, pady=(10,3))
        type_var = tk.StringVar(value="Structure Fire")
        ttk.Combobox(win, textvariable=type_var, values=INCIDENT_TYPES, width=28).pack(anchor="w", padx=12)
        def ok():
            cn = clean_case(case_var.get())
            if not cn:
                return
            self.case_number = cn
            self.sv("case_number_display").set(cn)
            self.sv("incident_type").set(type_var.get())
            year = year_from_case(cn)
            data_folder = safe_data_root() / year / cn
            data_folder.mkdir(parents=True, exist_ok=True)
            self.export_folder = safe_export_root() / year / cn
            self.export_folder.mkdir(parents=True, exist_ok=True)
            self.db_path = data_folder / f"{cn}.sqlite"
            self.conn = sqlite3.connect(self.db_path)
            self.conn.executescript(SCHEMA)
            if title == "Open Case":
                cur = self.conn.cursor()
                vals = dict(cur.execute("SELECT key,value FROM case_data").fetchall())
                self.load_data(vals)
            self.status.config(text=f"{cn}  |  {type_var.get()}")
            win.destroy()
        ttk.Button(win, text=title.replace(" Case",""), command=ok).pack(pady=14)
        win.transient(self)
        win.grab_set()

    def save(self):
        if not self.conn:
            messagebox.showwarning("No Case", "Create or open a case first.")
            return
        data = self.collect_data()
        cur = self.conn.cursor()
        cur.execute("DELETE FROM case_data")
        cur.executemany("INSERT INTO case_data(key,value) VALUES (?,?)", sorted(data.items()))
        self.conn.commit()
        messagebox.showinfo("Saved", "Case saved.")

    def ensure_export(self):
        if not self.export_folder:
            if self.case_number:
                self.export_folder = safe_export_root() / year_from_case(self.case_number) / self.case_number
                self.export_folder.mkdir(parents=True, exist_ok=True)
            else:
                messagebox.showwarning("No Case", "Create or open a case first.")
                return None
        return self.export_folder

    def write_export(self, name, content):
        folder = self.ensure_export()
        if not folder:
            return
        path = folder / name
        path.write_text(content, encoding="utf-8")
        if hasattr(self, "report_preview"):
            self.report_preview.delete("1.0", "end")
            self.report_preview.insert("1.0", content)
        messagebox.showinfo("Exported", f"Exported:\n{path}")

    def report_header(self, title):
        cn = self.case_number or self.get("case_number_display")
        return (
            f"Case#: {cn} - {title}\n"
            f"Type: {self.get('incident_type')} - {self.get('incident_address')}\n"
            f"Reported: {self.get('reported_date')}, {self.fmt_time('reported')}\n"
            f"Investigator: C. Mount, #5572\n\n"
        )

    def export_initial_report(self):
        text = self.report_header("Initial Report")
        text += "NARRATIVE:\n"
        itype = (self.get("incident_type") or "fire").lower()
        text += f"On the above-listed date and time, I responded to the above-listed location to conduct an origin and cause investigation of a {itype}. A more detailed report is forthcoming.\n"
        self.write_export(f"{self.case_number}_Initial_Report.txt", text)

    def export_summary_report(self):
        text = self.report_header("Summary Investigative Report")
        text += "NARRATIVE:\n"
        text += "This summary investigative report was completed in compliance with SOP 07.02.10 Fire Marshal Reporting.\n\n"
        text += f"On {self.get('dispatch_date') or self.get('reported_date')}, at {self.fmt_time('dispatch') or self.fmt_time('reported')}, I was dispatched to the above-listed address to conduct an investigation of a {(self.get('incident_type') or 'fire').lower()}.\n\n"
        if self.get("specific_area_origin") or self.get("general_area_origin"):
            text += f"The origin of the fire was identified as {self.get('specific_area_origin') or self.get('general_area_origin')}.\n\n"
        if self.get("cause_classification"):
            text += f"The cause classification was determined to be {self.get('cause_classification').lower()}.\n\n"
        text += f"ORIGIN: {self.get('specific_area_origin') or self.get('general_area_origin')}\n"
        text += f"CAUSE CLASSIFICATION: {self.get('cause_classification')}\n"
        text += "STATUS: \n"
        self.write_export(f"{self.case_number}_Summary_Report.txt", text)

    def export_notes(self):
        data = self.collect_data()
        sections = []
        def add_section(title, pairs):
            lines = [title, "="*len(title)]
            for label, key in pairs:
                val = data.get(key, "")
                if val and val != "0":
                    lines.append(f"{label}: {val}")
            sections.append("\n".join(lines))
        add_section("CASE", [("Case Number","case_number"),("Incident Type","incident_type"),("Address","incident_address"),("Reported Date","reported_date")])
        sections.append(f"Reported Time: {self.fmt_time('reported')}\nDispatch Time: {self.fmt_time('dispatch')}\nArrival Time: {self.fmt_time('arrival')}")
        add_section("BUILDING", [("Year Built","year_built"),("Stories","stories"),("Length","building_length"),("Width","building_width"),("Construction","construction_type"),("Roof","roof")])
        add_section("SMOKE ALARMS", [("Present","smoke_present"),("Count","smoke_count"),("Manufacturer","smoke_mfg"),("Age","smoke_age"),("Notes","smoke_notes")])
        add_section("UTILITIES", [("Electric Provider","electric_provider"),("Electric Service Type","electric_service_type"),("Natural Gas Provider","natural_gas_provider"),("LP Supplier","lp_supplier")])
        add_section("AREA OF ORIGIN", [("General","general_area_origin"),("Specific","specific_area_origin"),("Determination","area_origin_determination")])
        add_section("ORIGIN AND CAUSE", [("Heat Source","heat_source"),("Material Ignited","material_ignited"),("Ignition Factor","ignition_factor"),("Cause Classification","cause_classification"),("Conclusion","oc_conclusion")])
        notes = "\n\n".join(sections)
        self.write_export(f"{self.case_number}_Crisp_Investigator_Notes.txt", notes)

def main():
    app = FIPApp()
    app.mainloop()

if __name__ == "__main__":
    main()
