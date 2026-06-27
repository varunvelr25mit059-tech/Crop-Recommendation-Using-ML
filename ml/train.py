# ml/train.py
import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def train_model(dataset_path=None, model_dir=None):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if dataset_path is None:
        dataset_path = os.path.join(current_dir, 'crop_recommendation.csv')
        
    if model_dir is None:
        model_dir = current_dir

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_dataset.py first.")

    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # Features and labels
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training Random Forest Classifier...")
    # Using 100 trees
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=15)
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Training Complete! Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save model
    model_path = os.path.join(model_dir, 'model.pkl')
    os.makedirs(model_dir, exist_ok=True)
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved trained model to {model_path}")
    
    return accuracy

if __name__ == '__main__':
    train_model()
