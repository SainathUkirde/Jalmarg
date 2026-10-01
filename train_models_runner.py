import sys
sys.path.insert(0, 'backend')
from backend.models.prediction import train_all_models
results = train_all_models()
print('[PASS] Models trained')
for k, v in results.items():
    print(f"  {k}: MAPE={v['mape']}%, R2={v['r2']}")
