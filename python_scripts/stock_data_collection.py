from KeyUpdater import headers
import requests
import pandas as pd


url = "https://api.tradestation.com/v3/marketdata/barcharts/TSLA"
params = {
    "barsback": 500,
}
response = requests.request("GET", url, headers=headers(), params=params)
print(response.text)
df = pd.DataFrame(response.json()['Bars'])
df['TimeStamp'] = pd.to_datetime(df['TimeStamp'])
print(df[['TimeStamp', 'Close']])
df.to_csv('TSLA.csv', index=False)