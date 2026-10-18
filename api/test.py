import joblib
import pandas as pd
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl") 

print(model.predict(vectorizer.transform(["https://www.google.com/search?q=google&rlz=1C1CHBF_enIN1067IN1067&oq=&gs_lcrp=EgZjaHJvbWUqCQgAEEUYOxjCAzIJCAAQRRg7GMIDMgkIARBFGDsYwgMyCQgCEEUYOxjCAzIJCAMQRRg7GMIDMgkIBBBFGDsYwgMyCQgFEEUYOxjCAzIJCAYQRRg7GMIDMgkIBxBFGDsYwgPSAQsyMzQ5NTcxajBqN6gCCLACAfEFj12_M7yNN0g&sourceid=chrome&ie=UTF-8"])))

df=pd.read_csv("df_1.csv")

print(df.head())