import sqlite3
import os

class Database:
    def __init__(self):
        self.db_name = "heritage.db"
        
        if not os.path.exists(self.db_name):
            self.create_tables()
        else:
            print("✓ SQLite Database Connected")

    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row 
        return conn

    def create_tables(self):
        print("⚙️ Initializing Database Tables...")
        conn = self.get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        lookups = ["artifact_types", "materials", "historical_periods", 
                   "preservation_states", "restoration_methods", "storage_locations"]
        
        for table in lookups:
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {table} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                )
            """)

        # ✅ تم إضافة card_editor و editing_date
        cur.execute("""
            CREATE TABLE IF NOT EXISTS artifacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artifact_code TEXT UNIQUE NOT NULL,
                inventory_number TEXT,
                name TEXT NOT NULL,
                source TEXT,
                artifact_type_id INTEGER,
                quantity INTEGER DEFAULT 1,
                material_id INTEGER,
                historical_period_id INTEGER,
                preservation_state_id INTEGER,
                restoration_date TEXT,
                restoration_method_id INTEGER,
                storage_location_id INTEGER,
                storage_row TEXT,
                storage_col TEXT,
                dim_length REAL DEFAULT 0,
                dim_width REAL DEFAULT 0,
                dim_diameter REAL DEFAULT 0,
                dim_thickness REAL DEFAULT 0,
                weight REAL DEFAULT 0,
                weight_unit TEXT DEFAULT 'g',
                description TEXT,
                notes TEXT,
                card_editor TEXT,
                editing_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(artifact_type_id) REFERENCES artifact_types(id),
                FOREIGN KEY(material_id) REFERENCES materials(id),
                FOREIGN KEY(historical_period_id) REFERENCES historical_periods(id),
                FOREIGN KEY(preservation_state_id) REFERENCES preservation_states(id),
                FOREIGN KEY(storage_location_id) REFERENCES storage_locations(id)
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS artifact_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artifact_id INTEGER,
                image_path TEXT NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS sequences (
                name TEXT PRIMARY KEY,
                current_value INTEGER DEFAULT 0
            )
        """)
        cur.execute("INSERT OR IGNORE INTO sequences (name, current_value) VALUES ('artifact_code_seq', 0)")

        conn.commit()
        conn.close()
        print("✓ Tables Created Successfully")

    # =========================================================
    #  Helper Methods
    # =========================================================

    def fetch_one(self, query, params=()):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(query, params)
            return cur.fetchone()
        except Exception as e:
            print(f"Fetch One Error: {e}")
            return None
        finally:
            conn.close()

    def fetch_all(self, query, params=()):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(query, params)
            return cur.fetchall()
        finally:
            conn.close()

    def execute(self, query, params=()):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(query, params)
            conn.commit()
            return True
        except Exception as e:
            print(f"Execute Error: {e}")
            return False
        finally:
            conn.close()

    def count(self, table_name):
        valid_tables = ["artifacts", "storage_locations", "users", "historical_periods", "materials"]
        if table_name not in valid_tables: return 0
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            return cur.fetchone()[0]
        except: return 0
        finally:
            conn.close()

    # =========================================================
    #  Artifact Management
    # =========================================================

    def get_next_sequence(self):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("UPDATE sequences SET current_value = current_value + 1 WHERE name = 'artifact_code_seq'")
            cur.execute("SELECT current_value FROM sequences WHERE name = 'artifact_code_seq'")
            val = cur.fetchone()[0]
            conn.commit()
            return val
        finally:
            conn.close()

    def insert_artifact(self, data):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            
            seq_num = self.get_next_sequence()
            sys_code = str(seq_num).zfill(9)

            # ✅ تمت إضافة card_editor و editing_date
            sql = """
                INSERT INTO artifacts (
                    artifact_code, inventory_number, name, source,
                    artifact_type_id, quantity, material_id, 
                    historical_period_id, preservation_state_id, 
                    restoration_date, 
                    storage_location_id, storage_row, storage_col,
                    dim_length, dim_width, dim_diameter, dim_thickness,
                    weight, weight_unit,
                    description, notes, card_editor, editing_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            cur.execute(sql, (
                sys_code, 
                data.get('inventory_number', ''), 
                data['name'], 
                data.get('source', ''),
                data['type_id'], 
                data['quantity'], 
                data['material_id'],
                data['period_id'], 
                data['condition_id'], 
                data['date'], 
                data['storage_id'], 
                data.get('storage_row', ''), 
                data.get('storage_col', ''),
                data.get('dim_length', 0),
                data.get('dim_width', 0),
                data.get('dim_diameter', 0),
                data.get('dim_thickness', 0),
                data.get('weight', 0),
                data.get('weight_unit', 'g'),
                data['description'], 
                data.get('notes', ''),
                data.get('card_editor', ''),
                data.get('editing_date', '')
            ))
            
            new_id = cur.lastrowid
            conn.commit()
            print(f"✓ Added: {sys_code}")
            return new_id

        except Exception as e:
            print(f"❌ Insert Error: {e}")
            return None
        finally:
            conn.close()

    def update_artifact(self, data):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            # ✅ تمت إضافة card_editor و editing_date للتحديث
            sql = """
                UPDATE artifacts SET
                    inventory_number = ?, name = ?, source = ?,
                    artifact_type_id = ?, quantity = ?, material_id = ?, 
                    historical_period_id = ?, preservation_state_id = ?, 
                    restoration_date = ?, 
                    storage_location_id = ?, storage_row = ?, storage_col = ?,
                    dim_length = ?, dim_width = ?, dim_diameter = ?, dim_thickness = ?,
                    weight = ?, weight_unit = ?,
                    description = ?, notes = ?,
                    card_editor = ?, editing_date = ?
                WHERE id = ?
            """
            r_date = data["date"] if data["date"] else None
            
            cur.execute(sql, (
                data.get('inventory_number', ''),
                data["name"], 
                data.get('source', ''),
                data["type_id"], data["quantity"], data["material_id"], 
                data["period_id"], data["condition_id"], r_date, 
                data["storage_id"], 
                data.get('storage_row', ''), data.get('storage_col', ''),
                data.get('dim_length', 0), data.get('dim_width', 0), 
                data.get('dim_diameter', 0), data.get('dim_thickness', 0),
                data.get('weight', 0), data.get('weight_unit', 'g'),
                data["description"], data["notes"],
                data.get("card_editor", ""), data.get("editing_date", ""),
                data["id"]
            ))
            conn.commit()
            return True
        except Exception as e:
            print(f"Update Error: {e}")
            return False
        finally:
            conn.close()

    def get_artifact(self, artifact_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            # ✅ تمت إضافة card_editor و editing_date للعرض
            query = """
                SELECT a.name, t.name as type, a.quantity, m.name as material, 
                       p.name as period, a.description, s.name as condition, 
                       a.restoration_date, sl.name as storage, a.artifact_code, a.notes,
                       a.inventory_number, a.source, 
                       a.storage_row, a.storage_col,
                       a.dim_length, a.dim_width, a.dim_diameter, a.dim_thickness,
                       a.weight, a.weight_unit,
                       a.card_editor, a.editing_date
                FROM artifacts a
                LEFT JOIN artifact_types t ON a.artifact_type_id = t.id
                LEFT JOIN materials m ON a.material_id = m.id
                LEFT JOIN historical_periods p ON a.historical_period_id = p.id
                LEFT JOIN preservation_states s ON a.preservation_state_id = s.id
                LEFT JOIN storage_locations sl ON a.storage_location_id = sl.id
                WHERE a.id = ?
            """
            cur.execute(query, (artifact_id,))
            r = cur.fetchone()
            if r:
                return {
                    "name": r['name'], "type": r['type'] or "-", "quantity": r['quantity'], 
                    "material": r['material'] or "-", "period": r['period'] or "-", 
                    "description": r['description'] or "", "condition": r['condition'] or "-", 
                    "restoration_date": str(r['restoration_date']) if r['restoration_date'] else "-", 
                    "storage": r['storage'] or "-", "code": r['artifact_code'], "notes": r['notes'] or "",
                    "inventory_number": r['inventory_number'] or "---",
                    "source": r['source'] or "---",
                    "storage_row": r['storage_row'] or "",
                    "storage_col": r['storage_col'] or "",
                    "dims": f"L:{r['dim_length']} W:{r['dim_width']} D:{r['dim_diameter']} Th:{r['dim_thickness']} (cm)",
                    "weight": f"{r['weight']} {r['weight_unit']}" if r['weight'] else "---",
                    "card_editor": r['card_editor'] or "---",
                    "editing_date": r['editing_date'] or "---"
                }
            return None
        finally:
            conn.close()

    def get_artifact_for_edit(self, artifact_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            query = "SELECT * FROM artifacts WHERE id = ?"
            cur.execute(query, (artifact_id,))
            r = cur.fetchone()
            if r:
                return dict(r) 
            return None
        finally:
            conn.close()

    def search_artifacts(self, query_text=""):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            sql = """
                SELECT a.artifact_code, a.name, t.name as type_name, p.name as period_name, 
                       m.name as mat_name, a.id, a.inventory_number, sl.name as store_name
                FROM artifacts a
                LEFT JOIN artifact_types t ON a.artifact_type_id = t.id
                LEFT JOIN historical_periods p ON a.historical_period_id = p.id
                LEFT JOIN materials m ON a.material_id = m.id
                LEFT JOIN storage_locations sl ON a.storage_location_id = sl.id
                WHERE a.name LIKE ? OR a.artifact_code LIKE ? OR a.inventory_number LIKE ?
                ORDER BY a.id DESC
            """
            search_param = f"%{query_text}%"
            cur.execute(sql, (search_param, search_param, search_param))
            
            results = []
            for row in cur.fetchall():
                results.append({
                    "id": row['artifact_code'],
                    "inv_num": row['inventory_number'] or "---",
                    "name": row['name'],
                    "type": row['type_name'] or "-",
                    "material": row['mat_name'] or "-",
                    "storage": row['store_name'] or "-",
                    "real_id": row['id']
                })
            return results
        finally:
            conn.close()

    # =========================================================
    #  Users & Lookups & Images
    # =========================================================
    def get_all_users(self):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, username, role, created_at FROM users ORDER BY id")
            return cur.fetchall()
        finally:
            conn.close()

    def add_user(self, username, password, role="user"):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", (username, password, role))
            conn.commit()
            return True
        except: return False
        finally:
            conn.close()

    def delete_user(self, user_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            return True
        except: return False
        finally:
            conn.close()

    def get_list(self, table_name):
        valid = ["artifact_types", "materials", "historical_periods", "preservation_states", "storage_locations", "restoration_methods"]
        if table_name not in valid: return []
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(f"SELECT id, name FROM {table_name} ORDER BY name")
            return [{"id": r[0], "name": r[1]} for r in cur.fetchall()]
        finally:
            conn.close()

    def insert_lookup(self, table_name, value_name):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(f"INSERT INTO {table_name} (name) VALUES (?)", (value_name,))
            conn.commit()
            return True
        except: return False
        finally:
            conn.close()

    def delete_lookup(self, table_name, item_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {table_name} WHERE id = ?", (item_id,))
            conn.commit()
            return True
        except: return False
        finally:
            conn.close()

    def insert_image(self, artifact_id, filename):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO artifact_images (artifact_id, image_path) VALUES (?, ?)", (artifact_id, filename))
            conn.commit()
        finally:
            conn.close()

    def get_artifact_images(self, artifact_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, image_path FROM artifact_images WHERE artifact_id = ?", (artifact_id,))
            return [{"id": r[0], "image_path": r[1]} for r in cur.fetchall()]
        finally:
            conn.close()

    def delete_image(self, image_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM artifact_images WHERE id = ?", (image_id,))
            conn.commit()
        finally:
            conn.close()
    
    def delete_artifact(self, artifact_id):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("PRAGMA foreign_keys = ON")
            cur.execute("DELETE FROM artifacts WHERE id = ?", (artifact_id,))
            conn.commit()
            return True
        except: return False
        finally:
            conn.close()

    def get_artifacts_by_type(self):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT t.name, COUNT(a.id) FROM artifacts a JOIN artifact_types t ON a.artifact_type_id = t.id GROUP BY t.name")
            return cur.fetchall()
        finally:
            conn.close()

    def get_artifacts_by_condition(self):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT s.name, COUNT(a.id) FROM artifacts a JOIN preservation_states s ON a.preservation_state_id = s.id GROUP BY s.name")
            return cur.fetchall()
        finally:
            conn.close()
            
    def get_recent_artifacts(self, limit=5):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT artifact_code, name FROM artifacts ORDER BY id DESC LIMIT ?", (limit,))
            return cur.fetchall()
        finally:
            conn.close()
            
    def get_maintenance_alerts_count(self):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            sql = """
                SELECT COUNT(a.id) 
                FROM artifacts a
                JOIN preservation_states s ON a.preservation_state_id = s.id
                WHERE s.name LIKE '%ترميم%' OR s.name LIKE '%تالف%' OR s.name LIKE '%سيئ%'
            """
            cur.execute(sql)
            result = cur.fetchone()
            return result[0] if result else 0
        except: return 0
        finally:
            conn.close()

# Instance
db = Database()
