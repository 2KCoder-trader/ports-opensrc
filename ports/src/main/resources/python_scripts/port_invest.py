import sys
# import psycopg2
import pandas as pd
# from sqlalchemy import create_engine
from KeyUpdater import headers
import requests
from datetime import datetime
import json
from risk_num_calc import cunt
import subprocess
import sys
import numpy as np

# conn = psycopg2.connect(database="zephyr_capital",
#                             host=os.environ.get("DB_HOST", "localhost"),
#                             user="postgres",
#                             password=os.environ.get("DB_PASSWORD", ""),
#                             port="5432") 

# cursor = conn.cursor()
token = sys.argv[4]


h = {
    "Authorization": f"Bearer ${token}"
}


def create_port(name, author, stocks, percentages, description, position_types, money_input, owner, port_id):
    from port_setup import port_set
    python_data = port_set(name, author, owner, money_input, stocks, percentages, position_types)
    # Construct the URL with query parameters
    # try:
    #     url = f"https://localhost:3002/python?name={name}&author={author}&owner={owner}&init_price={money_input}&stocks={stocks}&percentages={percentages}&position_types={position_types}"
    # # print("URLLLLLLL: ",url)
    
    # # # Make the GET request to the Python service
    #     requests.get(url)
    # except Exception:
    #     pass

    # payload = port_set(name, author, owner, money_input, stocks, percentages, position_types)
    # breakpoint()
    print("ppp")
    print(name)
    print(author)
    print(owner)
    # python_response = requests.get(f'https://localhost:8080/ports/portfolios/getName?name={name}&author={author}&owner=market')
    
    # Raise an exception if the request was unsuccessful
    # python_response.raise_for_status()    
    # Parse the JSON response
    # python_data = python_response.json()
    # print(python_data)
    # print(python_data)
    # print(python_data['pnl_hist'])
    # print(python_data['shares'])
    
    # Create the portfolio dictionary
    portfolio = {
        "name": name,
        "author": author,
        "stock": stocks.split(' '),
        "initPercentages": percentages.split(' '),
        "description": description,
        "positionTypes": position_types.split(' '),
        "money_input": money_input,
        "owner": owner,
        "pnlHist": python_data['pnl_hist'],
        "creationDate": "2024-08-09",
        "published": False,
        "expenseRatio": python_data['expense_ratio'],
        "sector": "Technology",
        "dateHist": python_data['date_hist'],
        "shares": python_data['shares'],
        "curRisk": python_data['risk'],
        "initRisk": python_data['risk'],
        "related": port_id,
        "curPercentages": percentages.split(' '),
        "avgPrices": python_data['avg_prices']
    }
    
# #     # Pretty-print the portfolio JSON
#     print(json.dumps(portfolio, indent=2))
    
#     # Make the POST request to save the portfolio
    save_url = 'https://api.example.com/ports/portfolios/savePortfolios'
    headers = {
        'Content-Type': 'application/json',
        "Authorization": f"Bearer ${token}"
        }
    response = requests.post(save_url, headers=headers, data=json.dumps(portfolio),verify=False)

    
# #     # Raise an exception if the request was unsuccessful
#     response.raise_for_status()
    
# #     # Print the response text
#     print(response.text)

# # Example usage

print("heelo")
port_id = float(sys.argv[1])
user = sys.argv[2]
money_input = float(sys.argv[3])





hi = requests.get(f"https://api.example.com/ports/portfolios/getId?portfolioId={port_id}",headers=h,verify=False)
# print(hi.json())
# columns = [desc[0] for desc in cursor.description]
df = pd.json_normalize(hi.json())
# print(df)
# print(df.columns)
# breakpoint()


# cursor.execute(f"SELECT * FROM ports.portfolios WHERE portfolio_id = '{port_id}'")
# d = cursor.fetchall()
# columns = [desc[0] for desc in cursor.description]
# df = pd.DataFrame(d, columns=columns)
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
    hi = requests.get(f"https://api.example.com/ports/portfolios/getName?name={name}&author={author}&owner={user}",headers=h, verify=False)
    print(hi.json())
    df = pd.json_normalize(hi.json())
    print(df)
    # columns = [desc[0] for desc in cursor.description]
    # if hi.status_code == 404:
    if df.empty:
        create_port(
            name=name,
            author=author,
            stocks=stocksArray,
            percentages=percentages,
            description=description,
            position_types=position_typesArray,
            money_input=str(money_input),
            owner=user
        )
        sys.exit()
        # hi = requests.get(f"https://localhost:8080/ports/portfolios/getRelated?related={port_id}&owner={user}")
        # df = pd.json_normalize(hi.json())
        # print("created port")
        # print(df.columns)
        # print(df)
        # sys.exit()
        # statement = f"""
        # INSERT INTO ports.portfolios (name, author, stock, init_percentages, cur_percentages, creation_date, published, description, position_types, owner)
        #     VALUES ({name}, {author}, {stocksArray}::jsonb, {init_percentages}::jsonb, {percentages}::jsonb, NOW()::VARCHAR, false, {description}, {position_typesArray}::jsonb,  {user})
        # """
        # cursor.execute(statement)
        # conn.commit()
        # subprocess.run(["wsl.exe","python3", "src/server/port_setup.py", name, author, user, money_input],shell=False)
        # sys.exit()


bal = requests.get(f"https://api.example.com/ports/user/getMoney?Username={user}",headers=h,verify=False)
balance = float(bal.text)
print(balance)
balance = balance - float(money_input)
update_url = f'https://api.example.com/ports/user/update/balance'
data = {
    "money": balance,
    "username": user
}
headerss = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer ${token}"
}

response = requests.post(update_url, json=data, headers=headerss,verify=False)
print(response.text)

bal = requests.get(f"https://api.example.com/ports/user/getMoney?Username={user}",headers=h,verify=False)
balance = float(bal.text)
print(balance)




percentages = df.iloc[0]['curPercentages']
percentages = [float(i) for i in percentages]
pnl_hist = df.iloc[0]['pnlHist']
shares = df.iloc[0]['shares']
shares = [float(i) for i in shares]
portfolio_id = df.iloc[0]['portfolioId']
pnl_hist = [float(i)+float(money_input) for i in pnl_hist]
old_avg_prices = df.iloc[0]['avgPrices']
old_avg_prices = [float(i) for i in old_avg_prices]
avg_prices = []
url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(stocksArray)}"
new_shares = []
response = requests.request("GET", url, headers=headers())
print("hi")
print(percentages)
for i, percentage in enumerate(percentages):
    stock_price = float(response.json()["Quotes"][i]["Ask"])
    new_share = ((float(percentage)/100)*float(money_input))/stock_price
    avg_prices.append((new_share*stock_price+ shares[i]*old_avg_prices[i])/(new_share+shares[i]))
    new_shares.append(new_share+shares[i])

update_url = 'https://api.example.com/ports/portfolios/update/pnl-shares-prices'

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
    "Authorization": f"Bearer ${token}"
}
response = requests.post(update_url, json=data, headers=headerss,verify=False)


# 
# print(shares)
# print(new_shares)
# pnl_hist = json.dumps(pnl_hist)
# new_shares = json.dumps(new_shares)
# avg_prices = json.dumps(avg_prices)
# statement = """
# UPDATE ports.portfolios
# SET pnl_hist = %s,
# shares = %s,
# avg_prices = %s
# WHERE portfolio_id = %s AND owner = %s
# """
# cursor.execute(statement, (pnl_hist, new_shares, avg_prices, str(portfolio_id), user))
# conn.commit()


# I dont know if using f"" or %s have too much of a difference but im more use to f""
