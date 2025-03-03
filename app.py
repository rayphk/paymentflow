from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
@app.route('/')
def index():
    lang = request.args.get('lang', 'en')  # Default to English if no language is specified
    if lang == 'zh':
        return render_template('index_zh.html')
    else:
        return render_template('index.html')
CORS(app)  # Enable CORS for all routes

def optimize_payments(users):
    payments = []
    if len(users) == 0:
        return {'payments': payments}
    net = np.array([-user["expected"]+ user["paid"] for user in users],dtype = float)
    nett = np.sum(net)
    nett = round(nett,6)

    if nett > 0:
        return {'lack':nett}
    if nett < 0:
       return {'overflow':-nett}
    sort =  np.argsort(net)

    i = 0
    j = -1

    while round(net[sort[j]], 6) > 0 :
        net[sort[j]] += net[sort[i]]
        payments.append({
            "from": users[sort[i]]['name'],
            "to": users[sort[j]]['name'],
            "amount": round(-float(net[sort[i]]), 4)})
        i+=1
        while round(net[sort[j]], 6) < 0 :
            net[sort[j-1]] += net[sort[j]]
            payments.append({
                "from": users[sort[j]]['name'],
                "to": users[sort[j-1]]['name'],
                "amount": round(-float(net[sort[j]]), 4)})
            j-=1
        if net[sort[j]] == 0:
           j-=1
    return {'payments': payments}

@app.route("/calculate", methods=["POST"])
def calculate():
    try:
 
       # Get JSON data from the request
        data = request.get_json()
        if not data or "users" not in data:
            return jsonify({"error": "Invalid input: 'users' key is required"}), 400

        users = data["users"]
        result = optimize_payments(users)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e), "details":  traceback.format_exc()}), 500
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)


