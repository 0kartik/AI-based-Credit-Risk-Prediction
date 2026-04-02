import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from backend.services.ml_service import train_models

try:
    train_models('backend/dummy_dataset.csv')
    print("Training succeeded")
except Exception as e:
    import traceback
    traceback.print_exc()
