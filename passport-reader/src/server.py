import os
import json
from flask import Flask, request, make_response, jsonify
from werkzeug.utils import secure_filename
from passporteye import read_mrz

UPLOAD_FOLDER = '/uploads'
EDIT_FOLDER = '/edit'

with open('countries.json') as json_file:
    COUNTRIES = json.load(json_file)

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process():

    imagefile = request.files.get('imagefile', None)
    if not imagefile:
        return make_response("Missing file parameter", 400)

    filename = secure_filename(imagefile.filename)
    full_path = os.path.join(UPLOAD_FOLDER, filename)
    imagefile.save(full_path)
    mrz = read_mrz(full_path)
    if mrz is None:
        return make_response(jsonify({"error": "Can't read passport"}), 400)
    mrz_data = mrz.to_dict()
    if mrz_data['valid_score'] < 80:
        return make_response(jsonify({"error": "Can't read passport contact admin"}), 400)
    all_infos = {}
    all_infos['last_name'] = mrz_data['surname'].upper()
    all_infos['first_name'] = mrz_data['names'].upper()
    all_infos['country_code'] = mrz_data['country']
    all_infos['country'] = get_country_name(all_infos['country_code'])
    all_infos['nationality'] = get_country_name(mrz_data['nationality'])
    all_infos['number'] = mrz_data['number']
    all_infos['sex'] = mrz_data['sex']
    all_infos['age'] = mrz_data['date_of_birth']
    all_infos['score'] = mrz_data['valid_score']
    all_infos['raw'] = mrz_data['raw_text']
    all_infos['expiration'] = mrz_data['expiration_date']


    os.remove(full_path)
    return jsonify(all_infos)

def get_country_name(country_code):
    for country in COUNTRIES:
        if country['alpha-3'] == country_code:
            return country['name']
    return country_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
