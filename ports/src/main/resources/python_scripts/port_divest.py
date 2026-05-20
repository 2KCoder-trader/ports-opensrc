import sys
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
from KeyUpdater import headers
import requests
from datetime import datetime
import json
from risk_num_calc import cunt
from er import mfer
import subprocess
import sys

# conn = psycopg2.connect(database="zephyr_capital",
#                             host=os.environ.get("DB_HOST", "localhost"),
#                             user="postgres",
#                             password=os.environ.get("DB_PASSWORD", ""),
#                             port="5432") 

# cursor = conn.cursor()


port_id = float(sys.argv[1])
user = sys.argv[2]
money_input = float(sys.argv[3])
token = sys.argv[4]


h = {
     'Authorization': f'Bearer ${token}'
}


hi = requests.get(f"https://localhost:8080/ports/portfolios/getId?portfolioId={port_id}",headers=h,verify=False)
df = pd.json_normalize(hi.json())

owner = df.iloc[0]['owner']
name = df.iloc[0]['name']
author = df.iloc[0]['author']
description = df.iloc[0]['description']
stocksArray = df.iloc[0]['stock']
init_percentages = df.iloc[0]['initPercentages']
percentages = df.iloc[0]['curPercentages']
position_typesArray = df.iloc[0]['positionTypes']


if owner == 'market':
    print(name)
    print(author)
    print(user)
    hi = requests.get(f"https://localhost:8080/ports/portfolios/getName?name={name}&author={author}&owner={user}",headers=h,verify=False)
    print(hi.json())
    df = pd.json_normalize(hi.json())
    print(df)
    # columns = [desc[0] for desc in cursor.description]
    # if hi.status_code == 404:
    if df.empty:
        sys.exit()
        
bal = requests.get(f"https://localhost:8080/ports/user/getMoney?Username={user}",headers=h,verify=False)
balance = float(bal.text)
print(balance)
balance = balance + float(money_input)
update_url = f'https://localhost:8080/ports/user/update/balance'
data = {
    "money": balance,
    "username": user
}
headerss = {
    "Content-Type": "application/json"
}

response = requests.post(update_url, json=data, headers=headerss)
print(response.text)

bal = requests.get(f"https://localhost:8080/ports/user/getMoney?Username={user}",headers=h,verify=False)
balance = float(bal.text)
print(balance)

port_id = df.iloc[0]['portfolioId']
pnl_hist = df.iloc[0]['pnlHist']
shares = df.iloc[0]['shares']
shares = [float(i) for i in shares]
avg_prices = df.iloc[0]['avgPrices']
avg_prices = [float(i) for i in avg_prices]
portfolio_id = df.iloc[0]['portfolioId']
pnl_hist = [float(i)-float(money_input) for i in pnl_hist]

url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(stocksArray)}"
new_shares = []
response = requests.request("GET", url, headers=headers())
for i, percentage in enumerate(percentages):
    stock_price = float(response.json()["Quotes"][i]["Ask"])
    if position_typesArray[i] == 'long':
        new_shares.append(((float(percentage)/100)*float(money_input))/stock_price*-1 +shares[i])
    else:
        avg_price = avg_prices[i]
        stock_price = ( avg_price - stock_price + avg_price)
        new_shares.append(((float(percentage)/100)*float(money_input))/stock_price*-1 +shares[i])
print(shares)
print(new_shares)
print(pnl_hist)
print(port_id)
print(user)
update_url = 'https://localhost:8080/ports/portfolios/update/pnl-shares-prices'

pnl_hist = [str(pnl) for pnl in pnl_hist]
new_shares = [str(share) for share in new_shares]
avg_prices = [str(price) for price in avg_prices]
print(type(portfolio_id))
print(user)
data = {
    "pnlHist": pnl_hist ,
    "shares":new_shares,
    "avgPrices": avg_prices,
    "portfolioId": int(portfolio_id),
    "owner": user
}
print(data)
headerss = {
    "Content-Type": "application/json",
    'Authorization': f'Bearer ${token}'
}
response = requests.post(update_url, json=data, headers=headerss,verify=False)

# I dont know if using f"" or %s have too much of a difference but im more use to f""
