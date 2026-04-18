import requests
import json

BASE = 'http://106.12.91.224:8000/api/v1'

# Login via dev-login
login_res = requests.post(f'{BASE}/auth/dev-login', json={'phone': '+66812345001'})
login_data = login_res.json()
token = login_data.get('data', {}).get('access_token', '')
print(f"Login OK, token: {token[:20]}...")

headers = {'Authorization': f'Bearer {token}'}

# Get order list
orders_res = requests.get(f'{BASE}/user-orders/my-orders', headers=headers, params={'limit': 3})
orders_data = orders_res.json()
data = orders_data.get('data', {})
if isinstance(data, dict):
    items = data.get('items', [])
elif isinstance(data, list):
    items = data
else:
    items = []

if not items:
    print(f"No orders found")
    print(f"Response: {json.dumps(orders_data, ensure_ascii=False)[:400]}")
    exit(0)

print(f"Orders found: {len(items)}")

# LIST ITEM FIELDS
print("\n========== ORDER LIST ITEM FIELDS ==========")
first = items[0]
for key in sorted(first.keys()):
    val = first[key]
    if isinstance(val, (dict, list)):
        val_str = json.dumps(val, ensure_ascii=False)
    else:
        val_str = str(val)
    if len(val_str) > 150:
        val_str = val_str[:150] + '...'
    print(f"  {key}: {val_str}")

# ORDER DETAIL
order_id = first.get('id')
detail_res = requests.get(f'{BASE}/user-orders/{order_id}', headers=headers)
detail_data = detail_res.json()
print(f"\n========== ORDER DETAIL (id={order_id}) ==========")
d = detail_data.get('data', {})
if not d:
    print(f"No detail: {json.dumps(detail_data, ensure_ascii=False)[:400]}")
else:
    for key in sorted(d.keys()):
        val = d[key]
        if isinstance(val, (dict, list)):
            val_str = json.dumps(val, ensure_ascii=False)
        else:
            val_str = str(val)
        if len(val_str) > 200:
            val_str = val_str[:200] + '...'
        print(f"  {key}: {val_str}")

    if 'items' in d and d['items']:
        print(f"\n---------- ORDER ITEM FIELDS ----------")
        fi = d['items'][0]
        for key in sorted(fi.keys()):
            val = fi[key]
            if isinstance(val, (dict, list)):
                val_str = json.dumps(val, ensure_ascii=False)
            else:
                val_str = str(val)
            if len(val_str) > 200:
                val_str = val_str[:200] + '...'
            print(f"  {key}: {val_str}")
