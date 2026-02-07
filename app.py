import os
import time
import razorpay
from dotenv import load_dotenv
from flask import Flask, render_template, send_from_directory, request, redirect, url_for, jsonify, make_response
from database.schema import add_notification_email

app = Flask(__name__)
load_dotenv()

# Configuration
APPOINTMENT_CURRENCY = "INR"

def get_razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        return None, "Razorpay keys are missing. Check your .env file."
    return razorpay.Client(auth=(key_id, key_secret)), None

# --- Routes ---

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        wants_json = (
            request.headers.get('X-Requested-With') == 'XMLHttpRequest'
            or request.accept_mimetypes.best == 'application/json'
        )

        if not email:
            if wants_json:
                return jsonify({"ok": False, "message": "Please enter a valid email."}), 400
            return redirect(url_for('home'))

        try:
            add_notification_email(email)
        except Exception as e:
            # Log error in production
            print(f"DB Error: {e}")
            if wants_json:
                return jsonify({"ok": False, "message": "Could not save email. Try again."}), 500
            return redirect(url_for('home'))

        if wants_json:
            return jsonify({"ok": True, "message": "Thanks! You are on the list."})
        return redirect(url_for('home'))
    
    # Render template with cache control for production
    response = make_response(render_template('index.html', razorpay_key_id=os.getenv("RAZORPAY_KEY_ID", "")))
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response

@app.route('/api/razorpay/order', methods=['POST'])
def create_razorpay_order():
    client, error = get_razorpay_client()
    if error:
        return jsonify({"ok": False, "message": error}), 500

    data = request.get_json(silent=True) or {}
    
    # 1. Get user amount (Default to 100 INR if missing/invalid)
    try:
        user_amount = float(data.get('amount', 100))
        if user_amount < 1: 
            return jsonify({"ok": False, "message": "Minimum amount is ₹1"}), 400
    except (ValueError, TypeError):
        return jsonify({"ok": False, "message": "Invalid amount format"}), 400

    # 2. Convert to Paise (Razorpay expects smallest currency unit)
    amount_paise = int(user_amount * 100)

    receipt_id = f"coffee_{int(time.time())}"
    payload = {
        "amount": amount_paise,
        "currency": APPOINTMENT_CURRENCY,
        "receipt": receipt_id,
        "payment_capture": 1,
        "notes": {
            "type": "coffee_donation"
        }
    }

    try:
        order = client.order.create(payload)
    except Exception as e:
        print(f"Razorpay Error: {e}")
        return jsonify({"ok": False, "message": "Could not create Razorpay order."}), 500

    return jsonify({
        "ok": True,
        "orderId": order.get("id"),
        "amount": order.get("amount"),
        "currency": order.get("currency"),
        "keyId": os.getenv("RAZORPAY_KEY_ID", ""),
        "name": "Akash Chaudhari",
        "description": "Buy me a Coffee",
        "prefill": {
            "name": "Supporter",
            "email": "supporter@example.com" 
        }
    })

@app.route('/api/razorpay/verify', methods=['POST'])
def verify_razorpay_payment():
    client, error = get_razorpay_client()
    if error:
        return jsonify({"ok": False, "message": error}), 500

    data = request.get_json(silent=True) or {}
    required_fields = ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
    
    if not all(data.get(field) for field in required_fields):
        return jsonify({"ok": False, "message": "Missing payment verification fields."}), 400

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"]
        })
    except Exception:
        return jsonify({"ok": False, "message": "Payment verification failed."}), 400

    return jsonify({"ok": True})

# --- SEO Routes ---
@app.route('/sitemap.xml')
def sitemap():
    # Ensure you have a sitemap.xml in your templates folder, or generate string here
    try:
        return send_from_directory('templates', 'sitemap.xml', mimetype='application/xml')
    except:
        return "Sitemap not found", 404

@app.route('/robots.txt')
def robots():
    # Basic robots.txt content if file doesn't exist
    content = "User-agent: *\nAllow: /\nSitemap: https://akashchaudhari.in/sitemap.xml"
    return content, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', '8000'))
    debug = os.getenv('FLASK_DEBUG') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)