from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os, base64, uuid

app = Flask(__name__)
CORS(app)

DB = 'civicfix.db'
UPLOADS = 'uploads'
os.makedirs(UPLOADS, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        category TEXT,
        description TEXT,
        latitude REAL,
        longitude REAL,
        photo TEXT,
        status TEXT DEFAULT 'Reported',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

@app.route('/issues', methods=['GET'])
def get_issues():
    conn = get_db()
    issues = conn.execute('SELECT * FROM issues ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(i) for i in issues])

@app.route('/issues', methods=['POST'])
def create_issue():
    data = request.json
    issue_id = str(uuid.uuid4())[:8]
    photo_path = None

    if data.get('photo'):
        img_data = base64.b64decode(data['photo'])
        photo_path = f"{UPLOADS}/{issue_id}.jpg"
        with open(photo_path, 'wb') as f:
            f.write(img_data)

    conn = get_db()
    conn.execute('INSERT INTO issues VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)',
        (issue_id, data['category'], data['description'],
         data.get('latitude'), data.get('longitude'), photo_path, 'Reported'))
    conn.commit()
    conn.close()
    return jsonify({'id': issue_id, 'status': 'created'}), 201

init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)