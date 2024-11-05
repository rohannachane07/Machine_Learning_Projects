from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home_price_prediction'),  # This route serves the main form
    path('api/predict_home_price/', views.predict_view, name='predict_price'),  # This handles the price prediction
    path('api/get_location_names/', views.get_location_names, name='get_location_names'),  # This fetches location names
]
