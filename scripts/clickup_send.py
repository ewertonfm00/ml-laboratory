import urllib.request, json, sys, os
from datetime import date

TOKEN = os.environ.get("CLICKUP_TOKEN")
if not TOKEN:
    sys.exit("CLICKUP_TOKEN env var not set")
LIST_ID = os.environ.get("CLICKUP_LIST_ID", "901326912257")
PROJETO = "Machine Learning"

hoje = date.today().strftime('%Y-%m-%d')

with open('docs/onboarding.md', 'r', encoding='utf-8') as f:
    content = f.read()

payload = json.dumps({
    "name": f"Onboarding - {PROJETO} ({hoje})",
    "description": content,
    "status": "to do"
}, ensure_ascii=True).encode('utf-8')

req = urllib.request.Request(
    f"https://api.clickup.com/api/v2/list/{LIST_ID}/task",
    data=payload,
    headers={"Authorization": TOKEN, "Content-Type": "application/json; charset=utf-8"},
    method="POST"
)

with urllib.request.urlopen(req) as resp:
    data = json.load(resp)
    print(f"ClickUp atualizado: {data.get('url','')}")
