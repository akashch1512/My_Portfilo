import os
from flask import Flask, render_template, send_from_directory, request, redirect, url_for
from database.schema import add_notification_email

app = Flask(__name__)

# --- Routes ---

@app.route('/', methods=['GET', 'POST'])
def home():
    """
    Renders the main single-page portfolio.
    You can pass dynamic data here later (e.g., fetching real stats).
    """
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        if email:
            add_notification_email(email)
        return redirect(url_for('home'))
    return render_template('index.html')

# --- SEO: sitemap + robots ---
@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('templates', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('templates', 'robots.txt', mimetype='text/plain')

# FUTURE EXPANSION EXAMPLE:
# @app.route('/projects')
# def projects():
#     return render_template('projects.html')

if __name__ == '__main__':
    port = int(os.getenv('PORT', '8000'))
    debug = os.getenv('FLASK_DEBUG') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
