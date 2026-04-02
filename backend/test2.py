import sys, pandas as pd
sys.path.append('c:/Users/HP/Desktop/Mini Project/Mini Project/backend')
from services.ml_service import predict_risk
df = pd.read_csv('c:/Users/HP/Desktop/Mini Project/Mini Project/backend/uploads/dataset.csv')
row_0 = df[df['loan_status'] == 0].iloc[0].to_dict()
del row_0['loan_status']
res_0 = predict_risk(row_0)
row_1 = df[df['loan_status'] == 1].iloc[0].to_dict()
del row_1['loan_status']
res_1 = predict_risk(row_1)
print('Prob 0:', res_0['probability'])
print('Prob 1:', res_1['probability'])
