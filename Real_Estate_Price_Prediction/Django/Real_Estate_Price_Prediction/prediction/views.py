import pandas as pd
import json
import pickle
from django.shortcuts import render
from django.http import JsonResponse
from sklearn.preprocessing import StandardScaler

with open('real_estate_model.pickle', 'rb') as f:
    ridge_model = pickle.load(f)

with open("columns.json", "r") as f:
    columns = json.load(f)['data_columns']

with open('scaler.pickle', 'rb') as f:
    scaler = pickle.load(f)

def predict_price(location, total_sqft, bhk, bath, number_of_floors):
    adjusted_total_sqft = total_sqft * number_of_floors
    input_data = pd.DataFrame([[location, adjusted_total_sqft, bhk, bath]], columns=['location', 'total_sqft', 'bhk', 'bath'])
    location_dummies = pd.get_dummies(input_data['location'], dtype=int)
    input_data = input_data.join(location_dummies).drop('location', axis='columns', errors='ignore')
    input_data[['total_sqft', 'bhk', 'bath']] = scaler.transform(input_data[['total_sqft', 'bhk', 'bath']])
    input_data = input_data.reindex(columns=columns, fill_value=0).dropna()
    predicted_price = ridge_model.predict(input_data)
    return predicted_price[0]

def get_location_names(request):
    locations = [col for col in columns[3:]]
    return JsonResponse({'locations': locations})

def predict_view(request):
    if request.method == 'POST':
        body_data = json.loads(request.body)
        location = body_data.get('location')
        total_sqft = body_data.get('total_sqft')
        bhk = body_data.get('bhk')
        bath = body_data.get('bath')
        number_of_floors = body_data.get('number_of_floors')

        # Validating fields
        if not all([location, total_sqft, bhk, bath, number_of_floors]):
            return JsonResponse({'error': 'Please complete all fields.'}, status=400)

        # Converting and validating values
        try:
            total_sqft = float(total_sqft)
            bhk = int(bhk)
            bath = int(bath)
            number_of_floors = int(number_of_floors)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Invalid input values.'}, status=400)

        estimated_price = predict_price(location, total_sqft, bhk, bath, number_of_floors)
        return JsonResponse({'estimated_price': round(estimated_price, 2)})

    return JsonResponse({'error': 'Invalid request method.'}, status=400)

def index(request):
    return render(request, 'prediction/app.html')  # Replace with your actual template
