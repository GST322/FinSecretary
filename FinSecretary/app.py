import os
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(BASE_DIR, 'templates')
static_dir = os.path.join(BASE_DIR, 'static')
upload_dir = os.path.join(BASE_DIR, 'uploads')

os.makedirs(template_dir, exist_ok=True)
os.makedirs(static_dir, exist_ok=True)
os.makedirs(upload_dir, exist_ok=True)

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

ai_available = False
try:
    from tools.ai import ask as ai_ask, load as ai_load
    ai_load()  # предзагрузка модели при старте, чтобы первый запрос не тупил 2 секунды
    ai_available = True
    print("correct: AI-модуль подхвачен")
except Exception as e:
    print(f"warning:  AI-модуль не загрузился: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        return render_template('upload_form.html')
    if 'report' not in request.files:
        return redirect(url_for('home'))
    file = request.files['report']
    if file.filename == '':
        return redirect(url_for('home'))
    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)
    return render_template('upload_success.html', filename=file.filename)

@app.route('/reports')
def reports():
    files = [f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))]
    return render_template('reports.html', files=files)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(upload_dir, filename)

@app.route('/ask', methods=['POST'])
def ask_ai():
    if not ai_available:
        return jsonify({'error': 'AI unavailable'}), 503
    data = request.get_json(silent=True) or {}
    question = (data.get('question') or '').strip()
    if not question:
        return jsonify({'error': 'empty question'}), 400
    try:
        answer = ai_ask(question)
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)