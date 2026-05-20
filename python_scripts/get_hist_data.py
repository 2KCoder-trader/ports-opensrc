import requests
import pandas as pd
from KeyUpdater import headers
from datetime import datetime, timedelta


# Step 1:

# url = "https://api.tradestation.com/v3/marketdata/barcharts/NVDA"

# params = {
#     "barsback": 57600,
#     "unit": "Minute",
#     "sessiontemplate": "USEQPre",
#     "lastdate": "2023-03-08T18:03:00Z"
# }

# response = requests.request("GET", url, headers=headers(), params=params)

# df = pd.DataFrame(response.json()["Bars"])

# df.to_csv(f"NVDA_hist_data6.csv")

# Step 2: convert the timestamp from utc to eastern time

# for i in range(1, 7):
#     df = pd.read_csv(f"NVDA_hist_data{i}.csv")
#     df["TimeStamp"] = pd.to_datetime(df["TimeStamp"])
#     df['TimeStamp'] = df['TimeStamp'].dt.tz_convert('America/New_York')  # Convert to ET
#     df.to_csv(f"NVDA_hist_data{i}.csv", index=False) 
    
# Step 3: combine the data

# main_df = pd.DataFrame()
# for i in range(1, 7):
#     df = pd.read_csv(f"NVDA_hist_data{i}.csv")
#     main_df = pd.concat([main_df, df])
# main_df.to_csv("NVDA_hist_data.csv", index=False)

# Step 4: remove duplicates

# main_df = pd.read_csv("NVDA_hist_data.csv")
# main_df.drop_duplicates(subset=["TimeStamp"], inplace=True)
# main_df.to_csv("NVDA_hist_data.csv", index=False)

# Step 5: get unique day column starting from 0
import numpy as np


def get_indicators(df):
    for day in df['Day'].unique():
        day_df = df[df['Day'] == day].copy()  # Filter data for the day
        day_df.sort_values('Day', ascending=True, inplace=True)
        day_df['Price_Change'] = day_df['Close'].diff().fillna(0)
        ema_cols = []
        sma_cols = []
        gain_cols = []
        day_df['Gain'] = np.where(day_df['Price_Change'] > 0, day_df['Price_Change'], 0)
        loss_cols = []
        day_df['Loss'] = np.where(day_df['Price_Change'] < 0, -day_df['Price_Change'], 0)
        emal_cols = []
        mom_cols = []
        std_cols = []
        ema_cols.append(ema_col)
        sma_cols.append(sma_col)
        std_cols.append(std_col)
        day_df['EMA'] = day_df['Close'].rolling(window = 10).mean()
        day_df['SMA'] = day_df['Close'].ewm(span = 10).mean()
        day_df['STD'] = day_df['Close'].rolling(window = 10).std()
        mom_cols.append(mom_col)
        day_df['Momentum'] = ((day_df['Close'] - day_df['Close'].shift(10)) / day_df['Close'].shift(10)) * 100
        gain_cols.append(gain_col)
        day_df['Avg_Gain'] = day_df['Gain'].rolling(window=14).mean()
        loss_cols.append(loss_col)
        day_df['Avg_Loss'] = day_df['Loss'].rolling(window=14).mean()
        emal_cols.append(emal_col)
        day_df['EMAL'] = day_df['Close'].ewm(span = 20).mean()
        day_df['SMA'] = day_df[sma_cols].bfill(axis=1).iloc[:, 0]
        day_df['EMA'] = day_df[ema_cols].bfill(axis=1).iloc[:, 0]
        day_df['EMAL'] = day_df[emal_cols].bfill(axis=1).iloc[:, 0]
        day_df['Avg_Gain'] = day_df[gain_cols].bfill(axis=1).iloc[:, 0]
        day_df['Avg_Loss'] = day_df[loss_cols].bfill(axis=1).iloc[:, 0]
        day_df['Momentum'] = day_df[mom_cols].bfill(axis=1).iloc[:, 0]
        day_df['STD'] = day_df[std_cols].bfill(axis=1).iloc[:, 0]
        day_df['SMA_Close_Diff'] = day_df['Close'] - day_df['SMA']
        day_df = day_df.copy()
        day_df['MACD'] = day_df['EMA'] - day_df['EMAL']
        day_df['RSI'] = 100 - (100/ (1+(day_df['Avg_Gain'] / day_df['Avg_Loss'])))
        day_df['Upper_Band'] = day_df['SMA'] + (2 * day_df['STD'])
        day_df['Lower_Band'] = day_df['SMA'] - (2 * day_df['STD'])
        day_df = day_df.fillna(0)
        day_df['RSI'] = day_df['RSI'].replace(0, 45)
        for col in ['EMA','SMA','SMA_Close_Diff','Momentum','MACD','RSI','STD','Upper_Band','Lower_Band']:
            df.loc[day_df.index, col] = day_df[col]
    return df

main_df = pd.read_csv("NVDA_hist_data.csv")

# Convert TimeStamp to datetime
main_df["TimeStamp"] = pd.to_datetime(main_df["TimeStamp"], utc = False)

main_df = main_df.sort_values(by="TimeStamp").reset_index(drop=True)

main_df["Day"] = main_df["TimeStamp"].apply(lambda x: x.date())
# Remove rows before June 7th
cutoff_date = pd.to_datetime("2023-06-07").date()  # Change the year if needed
main_df = main_df[main_df["Day"] >= cutoff_date]

# Assign unique integer IDs to each unique date
main_df["Day"] = pd.factorize(main_df["Day"])[0]

# Save back to CSV
main_df = main_df[["Close","Day","TimeStamp"]]
main_df = get_indicators(main_df)

main_df = main_df[main_df["Day"] > 231]

def extract_time(timestamp):
    # Check if the timestamp is valid
    if pd.notna(timestamp):
        return timestamp.strftime('%H:%M')
    return None


# Extract time as a string in HH:MM format
main_df["Time"] = main_df["TimeStamp"].apply(extract_time)

# Filter out rows where the time is earlier than 9:31 AM
main_df = main_df[main_df["Time"] >= "09:31"]

# Save the filtered data back to CSV
main_df.to_csv("NVDA.csv", index=False)

# Filter out rows where the time is earlier than 9:31 AM
main_df = main_df[main_df["Time"] >= "09:31"]

main_df.to_csv("NVDA.csv", index=False)
