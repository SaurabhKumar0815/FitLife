from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# ===============================
# Database initialization
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
# Routes
# ===============================
@app.route('/')
def home():
    # Ye line tumhara HTML dashboard page load karega
    return render_template('index.html')


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


@app.route('/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('fitlife.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users')
    rows = c.fetchall()
    conn.close()
    return jsonify(rows)


@app.route('/dashboard-data')
def dashboard_data():
    conn = sqlite3.connect('fitlife.db')
    c = conn.cursor()
    c.execute('SELECT SUM(calories), COUNT(*) FROM users')
    data = c.fetchone()
    conn.close()

    total_calories = data[0] if data[0] else 0
    total_workouts = data[1]

    response = {
        "total_workouts": total_workouts,
        "calories_burned": total_calories,
        "current_streak": 3,
        "weekly_workouts": [2, 3, 1, 4, 2, 5, 3]
    }
    return jsonify(response)


# ===============================
# Main Run
# ===============================
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
