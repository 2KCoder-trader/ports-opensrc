import psycopg2
import pandas as pd
from sqlalchemy import create_engine
import json
import subprocess
conn = psycopg2.connect(database="zephyr_capital",
                            host=os.environ.get("DB_HOST", "localhost"),
                            user="postgres",
                            password=os.environ.get("DB_PASSWORD", ""),
                            port="5432") 

cursor = conn.cursor()
# script = """
# DROP TABLE IF EXISTS ports.stocks;

# CREATE TABLE ports.stocks (
#     symbol VARCHAR(10),
#     change DECIMAL(10, 2),
#     price DECIMAL(10, 2),
#     volume INT
# );
# """


cursor.execute("DELETE FROM ports.portfolios")
conn.commit()



alter_script =  """
ALTER TABLE ports.portfolios
ALTER COLUMN date_hist TYPE BIGINT[];
"""
cursor.execute(alter_script)
conn.commit()



# name = "test"
# author = "k_admin"
# stocksArray = ["AAPL", "TSLA"]
# init_percentages = [50, 50]
# percentages = [50, 50]
# description = "test"
# position_typesArray = ["long", "short"]
# money_input = 100
# user = 'market'
# stocksArray = json.dumps(stocksArray)
# init_percentages = json.dumps(init_percentages)
# percentages = json.dumps(percentages)
# position_typesArray = json.dumps(position_typesArray)
# statement = """
#         INSERT INTO ports.portfolios (name, author, stock, init_percentages, cur_percentages, creation_date, published, description, position_types, owner)
#             VALUES (%s, %s, %s::jsonb, %s::jsonb, %s::jsonb, NOW()::VARCHAR, false, %s, %s::jsonb, %s)
#         """
# cursor.execute(statement, (name, author, stocksArray, init_percentages, percentages, description, position_typesArray, user))
# conn.commit()
# subprocess.run(["wsl.exe","python3", "port_setup.py", name, author, user, str(money_input)],shell=False)
# money_input = 200
# user = 'k_admin'
# statement = """
#         INSERT INTO ports.portfolios (name, author, stock, init_percentages, cur_percentages, creation_date, published, description, position_types, owner)
#             VALUES (%s, %s, %s::jsonb, %s::jsonb, %s::jsonb, NOW()::VARCHAR, false, %s, %s::jsonb, %s)
#         """
# cursor.execute(statement, (name, author, stocksArray, init_percentages, percentages, description, position_typesArray, user))
# conn.commit()
# subprocess.run(["wsl.exe","python3", "port_setup.py", name, author, user, str(money_input)],shell=False)




# TODO I would like to drop clicks,total_pnl,total_price because we can just grab this from pnl_hist and clicks is a later thing
# ALSO init_price I would like for it to just become a parameter instead of applying it to the table at the start


cursor.execute(f"SELECT * FROM ports.investments")
d = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
print(columns)
df = pd.DataFrame(d, columns=columns)
df.to_csv("test.csv")
# schema_df.to_csv('ports_stocks_schema.csv', index=False)

conn.commit()