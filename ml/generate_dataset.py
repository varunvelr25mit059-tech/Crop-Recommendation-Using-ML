# ml/generate_dataset.py
import csv
import random
import os

# Define realistic ranges for each crop
# Format: 'crop_name': [N_range, P_range, K_range, Temp_range, Humid_range, pH_range, Rain_range]
CROP_PROFILES = {
    'rice': [(60, 100), (35, 60), (35, 45), (20.0, 27.0), (80.0, 85.0), (5.5, 7.0), (180.0, 250.0)],
    'maize': [(60, 100), (35, 60), (15, 25), (18.0, 27.0), (55.0, 70.0), (5.5, 7.0), (60.0, 110.0)],
    'chickpea': [(20, 60), (55, 80), (75, 85), (17.0, 21.0), (14.0, 20.0), (5.5, 9.0), (35.0, 95.0)],
    'kidneybeans': [(0, 40), (55, 80), (15, 25), (15.0, 25.0), (18.0, 25.0), (5.5, 6.0), (60.0, 150.0)],
    'pigeonpeas': [(0, 40), (55, 80), (15, 25), (18.0, 37.0), (30.0, 90.0), (4.5, 7.8), (90.0, 200.0)],
    'mothbeans': [(0, 40), (35, 60), (15, 25), (24.0, 32.0), (40.0, 65.0), (3.5, 9.0), (30.0, 75.0)],
    'mungbean': [(0, 40), (35, 60), (15, 25), (27.0, 30.0), (80.0, 90.0), (6.2, 7.2), (36.0, 60.0)],
    'blackgram': [(20, 60), (55, 80), (15, 25), (25.0, 35.0), (60.0, 70.0), (6.5, 7.5), (60.0, 75.0)],
    'lentil': [(0, 40), (35, 60), (15, 25), (16.0, 30.0), (60.0, 70.0), (5.9, 6.9), (35.0, 55.0)],
    'pomegranate': [(0, 40), (5, 30), (35, 45), (18.0, 25.0), (85.0, 95.0), (5.5, 7.5), (100.0, 110.0)],
    'banana': [(80, 120), (70, 95), (45, 55), (25.0, 30.0), (75.0, 85.0), (5.5, 6.5), (90.0, 115.0)],
    'mango': [(0, 40), (15, 40), (25, 35), (27.0, 36.0), (45.0, 55.0), (4.5, 7.0), (85.0, 100.0)],
    'grapes': [(0, 40), (120, 145), (195, 205), (8.0, 40.0), (80.0, 85.0), (5.5, 6.5), (65.0, 75.0)],
    'watermelon': [(80, 120), (5, 30), (45, 55), (24.0, 27.0), (80.0, 90.0), (6.0, 7.0), (40.0, 60.0)],
    'muskmelon': [(80, 120), (5, 30), (45, 55), (27.0, 30.0), (90.0, 95.0), (6.0, 6.8), (20.0, 30.0)],
    'apple': [(0, 40), (120, 145), (195, 205), (21.0, 24.0), (90.0, 95.0), (5.5, 6.5), (100.0, 125.0)],
    'orange': [(0, 40), (5, 30), (5, 15), (10.0, 35.0), (90.0, 95.0), (6.0, 8.0), (100.0, 120.0)],
    'papaya': [(30, 70), (45, 70), (45, 55), (23.0, 45.0), (90.0, 95.0), (6.5, 7.0), (100.0, 250.0)],
    'coconut': [(0, 40), (5, 30), (25, 35), (25.0, 30.0), (90.0, 95.0), (5.5, 6.5), (140.0, 230.0)],
    'cotton': [(100, 140), (35, 60), (15, 25), (22.0, 26.0), (75.0, 85.0), (5.8, 8.0), (60.0, 100.0)],
    'jute': [(60, 100), (35, 60), (35, 45), (23.0, 27.0), (70.0, 90.0), (6.0, 7.0), (150.0, 205.0)],
    'coffee': [(80, 120), (15, 40), (25, 35), (23.0, 28.0), (50.0, 70.0), (6.0, 7.0), (140.0, 200.0)]
}

def generate_dataset(output_path, samples_per_crop=100):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        # Headers matching the standard crop recommendation dataset
        writer.writerow(['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
        
        for crop, ranges in CROP_PROFILES.items():
            for _ in range(samples_per_crop):
                n = random.randint(ranges[0][0], ranges[0][1])
                p = random.randint(ranges[1][0], ranges[1][1])
                k = random.randint(ranges[2][0], ranges[2][1])
                
                # Floating values rounded to 4 decimals
                temp = round(random.uniform(ranges[3][0], ranges[3][1]), 4)
                humid = round(random.uniform(ranges[4][0], ranges[4][1]), 4)
                ph = round(random.uniform(ranges[5][0], ranges[5][1]), 4)
                rain = round(random.uniform(ranges[6][0], ranges[6][1]), 4)
                
                writer.writerow([n, p, k, temp, humid, ph, rain, crop])

if __name__ == '__main__':
    dest = os.path.join(os.path.dirname(__file__), 'crop_recommendation.csv')
    print(f"Generating dataset at: {dest}")
    generate_dataset(dest, samples_per_crop=100)
    print("Dataset generation complete!")
