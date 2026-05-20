import os
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
import pytz
from datetime import datetime
conn = psycopg2.connect(database="zephyr_capital",
                            host=os.environ.get("DB_HOST", "localhost"),
                            user="postgres",
                            password=os.environ.get("DB_PASSWORD", ""),
                            port="5432") 
engine = create_engine(os.environ.get('DB_URL', 'postgresql+psycopg2://postgres:@localhost:5432/zephyr_capital'))

# pd.set_option('display.max_rows', None)
# pd.set_option('display.max_columns', None)

cursor = conn.cursor()
# statement = """







# Update the 'username' column to 'k_admin' for all rows
# cursor.execute("""
# UPDATE ports.user_port_activity
# SET username = ''
# WHERE type != 2;
# """)
# conn.commit()
# put("Communication", "XLC");
# put("Consumer Discretionary", "XLY");
# put("Consumer Staples", "XLP");
# put("Energy", "XLE");
# put("Financials", "XLF");
# put("Health Care", "XLV");
# put("Industrials", "XLI");
# put("Materials", "XLB");
# put("Real Estate", "XLRE");
# put("Technology", "XLK");
# put("Utilities", "XLU");
# put("General", "SPY");

# cursor.execute("""
# DELETE FROM ports.investments WHERE user_id = 16 AND (
# id = 19 OR id = 22 OR id = 11 OR id = 21 OR id = 12
# );                
# """)
# conn.commit()



# cursor.execute("""
# UPDATE ports.port_stocks
# SET stock_id_ticker = s.ticker
# FROM ports.stocks s
# WHERE port_stocks.stock_id = s.stock_id;
# """)
# conn.commit()

# cursor.execute("""
# ALTER TABLE ports.stock_data
# ADD COLUMN stock_id_ticker VARCHAR(10);
# """)
# cursor.execute("""
# ALTER TABLE ports.stock_data
# ADD CONSTRAINT fk_stock_id_ticker
# FOREIGN KEY (stock_id_ticker) REFERENCES ports.stocks(ticker)
# ON DELETE CASCADE ON UPDATE CASCADE;
# """)
# cursor.execute("""
# ALTER TABLE ports.stock_data
# DROP COlUMN ticker;
# """)
# cursor.execute("""
# ALTER TABLE ports.stock_data
# DROP CONSTRAINT fk_stock_id_ticker;
# """)
# cursor.execute("""
# ALTER TABLE ports.stocks ADD PRIMARY KEY (ticker);
# """)


# cursor.execute("""
# CREATE TABLE ports.card_agg_all(
# port_id BIGINT,
# timestamp TIMESTAMPTZ,
# value FLOAT
# );
# """)
# cursor.execute("""
# CREATE TABLE ports.card_agg_day(
# port_id BIGINT,
# timestamp TIMESTAMPTZ,
# value FLOAT
# );
# """)


# conn.commit()
# conn.commit()
# cursor.execute("""
# ALTER TABLE ports.user_tags
# ADD COLUMN id BIGINT;
# """)
# cursor.execute("""
# DELETE FROM ports.users WHERE id = 112;
# """)
# conn.commit()
# cursor.execute("""
# UPDATE ports.portfolios
# SET author_name = 'k_admin',
# author_id = 16
# WHERE author = 16;
# """) 
# cursor.execute("""
# UPDATE ports.portfolios
# SET author_name = 'admin1',
# author_id = 15
# WHERE author = 15;
# """) 
# conn.commit()
# cursor.execute("""
# ALTER TABLE ports.portfolios
# ALTER COLUMN favorite_status SET DEFAULT false,
# ALTER COLUMN like_status SET DEFAULT false;
# """)

# cursor.execute("""
# UPDATE ports.portfolios
# SET favorite_status = false,
#     like_status = false;
# """)
# conn.commit()
p_id = 46
cursor.execute(f"""
DELETE FROM ports.port_stocks WHERE port_id = {p_id};
""")
conn.commit()
cursor.execute(f"""
DELETE FROM ports.port_data WHERE port_id = {p_id};
""")
conn.commit()
cursor.execute(f"""
DELETE FROM ports.portfolios WHERE id = {p_id};
""")
conn.commit()
cursor.execute(f"""
SELECT * FROM ports.portfolios WHERE id = {p_id};
""")

# cursor.execute(f"SELECT * FROM ports.user_port_activity;")
# cursor.execute(f"SELECT * FROM ports.n_investments;")
# cursor.execute(f"SELECT * FROM ports.card_agg_day;")
d = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
print(columns)
df = pd.DataFrame(d, columns=columns)
print(df)
# print(len(df['ticker'].unique()))
# df.drop(columns=['date_hist','value_hist'], inplace=True)
df.to_csv("test.csv")
# schema_df.to_csv('ports_stocks_schema.csv', index=False)
cursor.close()
conn.close()