"""
Usman Afzal Portfolio â€” Flask + SQLite Backend
Run: python app.py
Admin Panel: http://localhost:5000/admin.html
Portfolio:   http://localhost:5000/
"""

from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import sqlite3, json, os, hashlib, secrets, functools
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, supports_credentials=True)

DB_PATH   = os.path.join(os.path.dirname(__file__), 'site_data.db')
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# â”€â”€ Default credentials (change via admin Settings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DEFAULT_EMAIL = 'admin@usmanafzal.com'
DEFAULT_PWD   = 'admin123'

# â”€â”€ Active sessions (in-memory; resets on server restart) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SESSIONS: dict[str, str] = {}   # token â†’ email


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  DATABASE SETUP
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    return con


def init_db():
    with get_db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sections (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            section   TEXT NOT NULL UNIQUE,
            data      TEXT NOT NULL,
            updated   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS blog_posts (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            title    TEXT,
            excerpt  TEXT,
            date     TEXT,
            link     TEXT,
            img      TEXT,
            sort_order INTEGER DEFAULT 0,
            created  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS events (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT,
            date       TEXT,
            location   TEXT,
            description TEXT,
            link       TEXT,
            sort_order INTEGER DEFAULT 0,
            created    TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS uploads (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            mimetype TEXT,
            created  TEXT NOT NULL
        );
        """)

        # Seed default credentials if not set
        existing = con.execute(
            "SELECT value FROM settings WHERE key='admin_email'"
        ).fetchone()
        if not existing:
            con.execute("INSERT INTO settings VALUES ('admin_email', ?)", (DEFAULT_EMAIL,))
            con.execute("INSERT INTO settings VALUES ('admin_pwd_hash', ?)",
                        (hash_pwd(DEFAULT_PWD),))
            con.execute("INSERT INTO settings VALUES ('contact_email', '')")
            con.commit()


def hash_pwd(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  AUTH HELPERS
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

def require_auth(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('X-Admin-Token', '')
        if token not in SESSIONS:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return wrapper


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  AUTH ROUTES
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/auth/login', methods=['POST'])
def login():
    body  = request.get_json(force=True)
    email = (body.get('email') or '').strip()
    pwd   = body.get('password', '')

    with get_db() as con:
        row_email = con.execute(
            "SELECT value FROM settings WHERE key='admin_email'"
        ).fetchone()
        row_hash  = con.execute(
            "SELECT value FROM settings WHERE key='admin_pwd_hash'"
        ).fetchone()

    stored_email = row_email['value'] if row_email else DEFAULT_EMAIL
    stored_hash  = row_hash['value']  if row_hash  else hash_pwd(DEFAULT_PWD)

    if email != stored_email:
        return jsonify({'error': 'Unknown email or username'}), 401
    if hash_pwd(pwd) != stored_hash:
        return jsonify({'error': 'Incorrect password'}), 401

    token = secrets.token_hex(32)
    SESSIONS[token] = email
    return jsonify({'token': token, 'email': email})


@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    token = request.headers.get('X-Admin-Token', '')
    SESSIONS.pop(token, None)
    return jsonify({'ok': True})


@app.route('/api/auth/check', methods=['GET'])
def auth_check():
    token = request.headers.get('X-Admin-Token', '')
    if token in SESSIONS:
        return jsonify({'ok': True, 'email': SESSIONS[token]})
    return jsonify({'ok': False}), 401


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  SECTIONS (hero, about, stats, problems, experience, approach,
#            testimonials, services, why, faq, nav, cta, settings)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/section/<name>', methods=['GET'])
def get_section(name):
    with get_db() as con:
        row = con.execute(
            "SELECT data FROM sections WHERE section=?", (name,)
        ).fetchone()
    if row:
        return jsonify(json.loads(row['data']))
    return jsonify({}), 404


@app.route('/api/section/<name>', methods=['POST'])
@require_auth
def save_section(name):
    data = request.get_json(force=True)
    now  = datetime.utcnow().isoformat()
    with get_db() as con:
        con.execute("""
            INSERT INTO sections (section, data, updated)
            VALUES (?, ?, ?)
            ON CONFLICT(section) DO UPDATE SET data=excluded.data, updated=excluded.updated
        """, (name, json.dumps(data), now))
        con.commit()
    return jsonify({'ok': True, 'updated': now})


@app.route('/api/sections/all', methods=['GET'])
def get_all_sections():
    with get_db() as con:
        rows = con.execute("SELECT section, data FROM sections").fetchall()
    return jsonify({r['section']: json.loads(r['data']) for r in rows})


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  BLOG POSTS
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/blog', methods=['GET'])
def get_blog():
    with get_db() as con:
        rows = con.execute(
            "SELECT * FROM blog_posts ORDER BY sort_order, id DESC"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/blog', methods=['POST'])
@require_auth
def save_blog():
    """Replace all blog posts at once (admin sends full array)."""
    posts = request.get_json(force=True)
    now   = datetime.utcnow().isoformat()
    with get_db() as con:
        con.execute("DELETE FROM blog_posts")
        for i, p in enumerate(posts):
            con.execute("""
                INSERT INTO blog_posts (title, excerpt, date, link, img, sort_order, created)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (p.get('title',''), p.get('excerpt',''), p.get('date',''),
                  p.get('link',''), p.get('img',''), i, now))
        con.commit()
    return jsonify({'ok': True})


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  EVENTS
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/events', methods=['GET'])
def get_events():
    with get_db() as con:
        rows = con.execute(
            "SELECT * FROM events ORDER BY sort_order, id"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/events', methods=['POST'])
@require_auth
def save_events():
    evts = request.get_json(force=True)
    now  = datetime.utcnow().isoformat()
    with get_db() as con:
        con.execute("DELETE FROM events")
        for i, e in enumerate(evts):
            con.execute("""
                INSERT INTO events (title, date, location, description, link, sort_order, created)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (e.get('title',''), e.get('date',''), e.get('location',''),
                  e.get('desc',''), e.get('link',''), i, now))
        con.commit()
    return jsonify({'ok': True})


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  CREDENTIALS (update email / password)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/credentials', methods=['POST'])
@require_auth
def update_credentials():
    body         = request.get_json(force=True)
    new_email    = (body.get('email') or '').strip()
    new_pwd      = body.get('password', '').strip()
    contact_email = body.get('contactEmail', '').strip()

    if not new_email:
        return jsonify({'error': 'Email cannot be empty'}), 400
    if new_pwd and len(new_pwd) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    with get_db() as con:
        con.execute("INSERT INTO settings VALUES ('admin_email', ?) "
                    "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                    (new_email,))
        if new_pwd:
            con.execute("INSERT INTO settings VALUES ('admin_pwd_hash', ?) "
                        "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                        (hash_pwd(new_pwd),))
        con.execute("INSERT INTO settings VALUES ('contact_email', ?) "
                    "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                    (contact_email,))
        con.commit()

    # Update current session email
    token = request.headers.get('X-Admin-Token', '')
    if token in SESSIONS:
        SESSIONS[token] = new_email

    return jsonify({'ok': True})


@app.route('/api/credentials', methods=['GET'])
@require_auth
def get_credentials():
    with get_db() as con:
        email = con.execute(
            "SELECT value FROM settings WHERE key='admin_email'"
        ).fetchone()
        contact = con.execute(
            "SELECT value FROM settings WHERE key='contact_email'"
        ).fetchone()
    return jsonify({
        'email':        email['value']   if email   else DEFAULT_EMAIL,
        'contactEmail': contact['value'] if contact else ''
    })


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  FILE UPLOAD  (images â†’ /uploads/)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/api/upload', methods=['POST'])
@require_auth
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400
    f = request.files['file']
    if not f.mimetype.startswith('image/'):
        return jsonify({'error': 'Only images allowed'}), 400

    ext      = os.path.splitext(f.filename)[1] or '.png'
    fname    = secrets.token_hex(12) + ext
    fpath    = os.path.join(UPLOAD_DIR, fname)
    f.save(fpath)

    with get_db() as con:
        con.execute(
            "INSERT INTO uploads (filename, mimetype, created) VALUES (?, ?, ?)",
            (fname, f.mimetype, datetime.utcnow().isoformat())
        )
        con.commit()

    return jsonify({'url': f'/uploads/{fname}', 'filename': fname})


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  STATIC FILES (serve the portfolio)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  MAIN
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import sys
sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

if __name__ == "__main__":
    init_db()
    print("\n" + "â•"*55)
    print("  Usman Afzal Portfolio â€” Admin Server")
    print("â•"*55)
    print(f"  Portfolio:    http://localhost:5000/")
    print(f"  Admin Panel:  http://localhost:5000/admin.html")
    print(f"  Database:     {DB_PATH}")
    print(f"  Uploads:      {UPLOAD_DIR}")
    print("â”€"*55)
    print(f"  Default login: {DEFAULT_EMAIL} / {DEFAULT_PWD}")
    print("  (Change in Admin â†’ Settings â†’ Login Credentials)")
    print("â•"*55 + "\n")
    app.run(debug=True, port=5000, host='0.0.0.0')
