from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# ===============================
# 🔹 Step 1: Database Initialization
# ===============================
def init_db():
    conn = sqlite3.connect('fitlife.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    height REAL,
                    weight REAL,
                    bmi REAL,
                    calories REAL
                )''')
    conn.commit()
    conn.close()

# ===============================
# 🔹 Step 2: Routes (Pages)
# ===============================
@app.route('/')
def home():
    return render_template('index.html')

# ===============================
# 🔹 Step 3: Save Data from Frontend
# ===============================
@app.route('/save', methods=['POST'])
def save_data():
    data = request.get_json()
    name = data.get('name', 'Guest')
    height = data.get('height')
    weight = data.get('weight')
    bmi = data.get('bmi')
    calories = data.get('calories', 0)

    conn = sqlite3.connect('fitlife.db')
    c = conn.cursor()
    c.execute('INSERT INTO users (name, height, weight, bmi, calories) VALUES (?, ?, ?, ?, ?)',
              (name, height, weight, bmi, calories))
    conn.commit()
    conn.close()

    return jsonify({"message": "✅ Data saved successfully!"})

# ===============================
# 🔹 Step 4: Fetch Data (Show All Saved Users)
# ===============================
@app.route('/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('fitlife.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users')
    rows = c.fetchall()
    conn.close()
    return jsonify(rows) 

import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "FitLife App is running successfully!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
