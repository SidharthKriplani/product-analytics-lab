#!/usr/bin/env python3
"""
Curated, realistic company tagging for SQL Lab (deterministic, no-LLM).

Replaces the blanket same-datamart alsoAskedAt tags with a CURATED, India+global
roster per datamart. Big/generalist companies carry higher weights so they surface
on many problems and appear earlier in each list (the UI shows the first 3 as logos).
Tag counts scale with difficulty (fundamental problems are "asked at" more companies
than rare/forensic ones), with a small deterministic per-id jitter.

Sampling is Efraimidis-Spirakis weighted-sampling-without-replacement, seeded by the
problem id — so the same problem always yields the same set, weighted toward big
companies both in selection and in order.

Also emits src/data/companyDirectory.js (name -> domain) from the SAME ROSTER, so
names/domains never drift and logos render.

Run from product-analytics-lab/:  python3 scripts/tag_companies_curated.py [--dry-run]
"""
import json, re, subprocess, sys, os, tempfile, random

JS_PATH = 'src/data/sqlLabProblems.js'
DIR_PATH = 'src/data/companyDirectory.js'
DRY_RUN = '--dry-run' in sys.argv

# datamartId -> list of (name, domain, weight). Big/generalist companies have higher weight.
ROSTER = {
    'ecomm': [
        ('Amazon', 'amazon.com', 5), ('Flipkart', 'flipkart.com', 5), ('Meesho', 'meesho.com', 4),
        ('Myntra', 'myntra.com', 4), ('Nykaa', 'nykaa.com', 3), ('Ajio', 'ajio.com', 2),
        ('Walmart', 'walmart.com', 4), ('Shopify', 'shopify.com', 4), ('eBay', 'ebay.com', 3),
        ('Etsy', 'etsy.com', 3), ('Best Buy', 'bestbuy.com', 2), ('ASOS', 'asos.com', 2),
        ('Nordstrom', 'nordstrom.com', 2), ('Wayfair', 'wayfair.com', 2), ('Zalando', 'zalando.com', 2),
        ('Instacart', 'instacart.com', 2), ('BigBasket', 'bigbasket.com', 3), ('Snapdeal', 'snapdeal.com', 1),
        ('Tata CLiQ', 'tatacliq.com', 1),
    ],
    'saas': [
        ('Salesforce', 'salesforce.com', 5), ('Zoho', 'zoho.com', 5), ('Freshworks', 'freshworks.com', 4),
        ('HubSpot', 'hubspot.com', 4), ('Atlassian', 'atlassian.com', 4), ('Postman', 'postman.com', 3),
        ('Notion', 'notion.so', 3), ('Datadog', 'datadoghq.com', 3), ('Amplitude', 'amplitude.com', 3),
        ('Mixpanel', 'mixpanel.com', 2), ('Zendesk', 'zendesk.com', 2), ('Intercom', 'intercom.com', 2),
        ('Slack', 'slack.com', 3), ('Chargebee', 'chargebee.com', 2), ('Gainsight', 'gainsight.com', 1),
        ('Baremetrics', 'baremetrics.com', 1), ('ChartMogul', 'chartmogul.com', 1), ('BrowserStack', 'browserstack.com', 2),
    ],
    'health': [
        ('Practo', 'practo.com', 4), ('Tata 1mg', '1mg.com', 4), ('PharmEasy', 'pharmeasy.in', 3),
        ('Cult.fit', 'cult.fit', 3), ('Optum', 'optum.com', 3), ('UnitedHealth', 'unitedhealthgroup.com', 3),
        ('CVS Health', 'cvshealth.com', 3), ('Humana', 'humana.com', 2), ('Teladoc', 'teladoc.com', 2),
        ('Oscar Health', 'hioscar.com', 2), ('Zocdoc', 'zocdoc.com', 2), ('One Medical', 'onemedical.com', 1),
        ('Athenahealth', 'athenahealth.com', 1), ('Epic Systems', 'epic.com', 1), ('Kaiser Permanente', 'kaiserpermanente.org', 1),
        ('Carbon Health', 'carbonhealth.com', 1), ('Doximity', 'doximity.com', 1), ('Innovaccer', 'innovaccer.com', 2),
    ],
    'consumer': [
        ('Google', 'google.com', 5), ('Meta', 'meta.com', 5), ('YouTube', 'youtube.com', 4),
        ('Netflix', 'netflix.com', 4), ('Spotify', 'spotify.com', 4), ('TikTok', 'tiktok.com', 4),
        ('Hotstar', 'hotstar.com', 4), ('ShareChat', 'sharechat.com', 3), ('Dream11', 'dream11.com', 3),
        ('Pinterest', 'pinterest.com', 2), ('LinkedIn', 'linkedin.com', 3), ('Duolingo', 'duolingo.com', 2),
        ('Dropbox', 'dropbox.com', 2), ('Coursera', 'coursera.org', 2), ('Calm', 'calm.com', 1),
        ('Patreon', 'patreon.com', 1), ('Cash App', 'cash.app', 2), ('Josh', 'myjosh.in', 2),
    ],
    'fintech': [
        ('Razorpay', 'razorpay.com', 5), ('PhonePe', 'phonepe.com', 5), ('Paytm', 'paytm.com', 4),
        ('CRED', 'cred.club', 4), ('Groww', 'groww.in', 3), ('Zerodha', 'zerodha.com', 3),
        ('Stripe', 'stripe.com', 4), ('PayPal', 'paypal.com', 3), ('Plaid', 'plaid.com', 2),
        ('Robinhood', 'robinhood.com', 2), ('Pine Labs', 'pinelabs.com', 2), ('Jupiter', 'jupiter.money', 2),
        ('Slice', 'sliceit.com', 2), ('BharatPe', 'bharatpe.com', 2), ('Navi', 'navi.com', 2),
        ('Chime', 'chime.com', 2), ('Brex', 'brex.com', 1), ('Revolut', 'revolut.com', 2),
        ('Mastercard', 'mastercard.com', 2), ('JPMorgan Chase', 'jpmorganchase.com', 2),
    ],
    'marketplace': [
        ('Swiggy', 'swiggy.com', 5), ('Zomato', 'zomato.com', 5), ('Urban Company', 'urbancompany.com', 4),
        ('OYO', 'oyorooms.com', 3), ('Uber', 'uber.com', 4), ('Airbnb', 'airbnb.com', 3),
        ('DoorDash', 'doordash.com', 3), ('Meesho', 'meesho.com', 4), ('Ola', 'olacabs.com', 3),
        ('Etsy', 'etsy.com', 2), ('eBay', 'ebay.com', 2), ('OLX', 'olx.in', 2),
        ('Quikr', 'quikr.com', 1), ('Reverb', 'reverb.com', 1),
    ],
    'gaming': [
        ('Dream11', 'dream11.com', 5), ('MPL', 'mpl.live', 4), ('Games24x7', 'games24x7.com', 3),
        ('Nazara', 'nazara.com', 3), ('WinZO', 'winzogames.com', 2), ('Zynga', 'zynga.com', 3),
        ('King', 'king.com', 2), ('Supercell', 'supercell.com', 2), ('Riot Games', 'riotgames.com', 2),
    ],
    'food_delivery': [
        ('Swiggy', 'swiggy.com', 5), ('Zomato', 'zomato.com', 5), ('Zepto', 'zeptonow.com', 4),
        ('Blinkit', 'blinkit.com', 4), ('Dunzo', 'dunzo.com', 2), ('DoorDash', 'doordash.com', 3),
        ('Uber Eats', 'ubereats.com', 3),
    ],
    'logistics': [
        ('Delhivery', 'delhivery.com', 5), ('Ecom Express', 'ecomexpress.in', 3), ('Shadowfax', 'shadowfax.in', 3),
        ('Porter', 'porter.in', 3), ('BlueDart', 'bluedart.com', 3), ('Shiprocket', 'shiprocket.in', 3),
        ('FedEx', 'fedex.com', 3), ('DHL', 'dhl.com', 3), ('Xpressbees', 'xpressbees.com', 2),
    ],
    'social_network': [
        ('ShareChat', 'sharechat.com', 4), ('Koo', 'kooapp.com', 2), ('Meta', 'meta.com', 4),
        ('LinkedIn', 'linkedin.com', 4), ('Reddit', 'reddit.com', 3), ('X', 'x.com', 3),
        ('Moj', 'mojapp.in', 2),
    ],
    'hr_analytics': [
        ('Darwinbox', 'darwinbox.com', 4), ('Keka', 'keka.com', 3), ('greytHR', 'greythr.com', 3),
        ('Workday', 'workday.com', 4), ('BambooHR', 'bamboohr.com', 2), ('Gusto', 'gusto.com', 2),
        ('Zoho People', 'zoho.com', 3),
    ],
    'swiggy': [
        ('Swiggy', 'swiggy.com', 5), ('Zomato', 'zomato.com', 4), ('Zepto', 'zeptonow.com', 3),
        ('Blinkit', 'blinkit.com', 3), ('Dunzo', 'dunzo.com', 2), ('BigBasket', 'bigbasket.com', 3),
        ('Uber Eats', 'ubereats.com', 2),
    ],
}

# Base target tag count by difficulty (fundamentals are asked at more companies).
DIFF_BASE = {'Easy': 7, 'Medium': 5, 'Hard': 3, 'Master': 2, 'Forensic': 2}


def load_problems():
    src = ("import { sqlLabProblems } from '" + os.path.abspath(JS_PATH) + "';\n"
           "process.stdout.write(JSON.stringify(sqlLabProblems));\n")
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(src); tmp = f.name
    try:
        r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            print('node extract failed:\n' + r.stderr); sys.exit(1)
        return json.loads(r.stdout)
    finally:
        os.unlink(tmp)


def patch(content, pid, companies):
    """Insert/replace alsoAskedAt after the companyDomain line within this problem's scope."""
    m = re.search(r"id:\s*'" + re.escape(pid) + r"'", content)
    if not m:
        raise ValueError(f'{pid} not found')
    nxt = re.search(r"\n    id:\s*'sql-", content[m.end():])
    end = m.end() + nxt.start() if nxt else len(content)
    scope = content[m.start():end]
    scope = re.sub(r'    alsoAskedAt:.*?\n', '', scope)  # remove existing
    esc = [c.replace('\\', '\\\\').replace("'", "\\'") for c in companies]
    joined = ', '.join("'" + c + "'" for c in esc)
    field = '    alsoAskedAt: [' + joined + '],\n'
    anchor = re.search(r'    companyDomain:.*?\n', scope) or re.search(r'    company:.*?\n', scope)
    if not anchor:
        raise ValueError(f'no company anchor in {pid}')
    scope = scope[:anchor.end()] + field + scope[anchor.end():]
    return content[:m.start()] + scope + content[end:]


def target_count(pid, difficulty):
    base = DIFF_BASE.get(difficulty, 3)
    # deterministic jitter in {-1, 0, +1} from a stable hash of the id
    jitter = (sum(ord(ch) for ch in pid) % 3) - 1
    return max(1, base + jitter)


def weighted_sample(pid, pool, n):
    """Efraimidis-Spirakis weighted sampling without replacement, seeded by pid.
    Higher weight => more likely to be chosen AND to sort earlier (logo slots)."""
    rng = random.Random(pid)
    keyed = []
    for (name, domain, w) in pool:
        w = max(w, 1)
        k = rng.random() ** (1.0 / w)
        keyed.append((k, name))
    keyed.sort(key=lambda t: t[0], reverse=True)
    return [name for (_, name) in keyed[:n]]


def write_directory():
    seen = {}
    for dm in ROSTER.values():
        for (name, domain, _w) in dm:
            seen.setdefault(name, domain)  # first wins; domains are consistent across datamarts
    lines = ['// Product Analytics Lab — Company logo directory (name -> domain).',
             '// Auto-generated by scripts/tag_companies_curated.py from the ROSTER. Do not hand-edit.',
             '// Single quotes only. No backticks.', '',
             'export const COMPANY_DOMAINS = {']
    for name in sorted(seen.keys(), key=str.lower):
        esc_name = name.replace('\\', '\\\\').replace("'", "\\'")
        esc_dom = seen[name].replace('\\', '\\\\').replace("'", "\\'")
        lines.append("  '" + esc_name + "': '" + esc_dom + "',")
    lines.append('};')
    lines.append('')
    text = '\n'.join(lines)
    if not DRY_RUN:
        open(DIR_PATH, 'w').write(text)
    return len(seen)


def main():
    problems = load_problems()
    content = open(JS_PATH).read()

    counts = {}
    freq = {}   # company name -> # problems it appears on (primary OR alsoAskedAt)
    samples = []
    skipped = 0

    for p in problems:
        pid = p['id']
        comp = p.get('company')
        dm = p.get('datamartId')
        diff = p.get('difficulty', '')
        if comp:
            freq[comp] = freq.get(comp, 0) + 1
        roster = ROSTER.get(dm)
        if not roster:
            skipped += 1
            continue
        # pool excludes the primary company (case-insensitive)
        cl = (comp or '').strip().lower()
        pool = [t for t in roster if t[0].strip().lower() != cl]
        n = target_count(pid, diff)
        n = min(n, len(pool))
        n = max(n, 1) if pool else 0
        chosen = weighted_sample(pid, pool, n) if n else []
        for c in chosen:
            freq[c] = freq.get(c, 0) + 1
        counts[len(chosen)] = counts.get(len(chosen), 0) + 1
        if not DRY_RUN:
            content = patch(content, pid, chosen)
        if pid in ('sql-e01', 'sql-h01', 'sql-f01') or (len(samples) < 3 and pid.endswith(('01',))):
            samples.append((pid, diff, comp, chosen))

    n_dir = write_directory()

    print('=== alsoAskedAt count distribution ===')
    for k in sorted(counts):
        print(f'  {k} tags: {counts[k]} problems')
    if skipped:
        print(f'  (skipped {skipped} problems with no roster for their datamartId)')

    print('\n=== top 15 companies by # problems (primary OR alsoAskedAt) ===')
    for name, c in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0].lower()))[:15]:
        print(f'  {c:4d}  {name}')

    print('\n=== 3 sample problems ===')
    for (pid, diff, comp, chosen) in samples[:3]:
        print(f'  {pid} [{diff}] company={comp} alsoAskedAt={chosen}')

    print(f'\n=== companyDirectory.js: {n_dir} unique companies ===')

    if DRY_RUN:
        print('\nDRY RUN — no write'); return

    o, c = content.count('{'), content.count('}')
    if o != c:
        print(f'ABORT: brace mismatch {o} vs {c}'); sys.exit(1)
    open(JS_PATH, 'w').write(content)
    print(f'\nWrote {JS_PATH} and {DIR_PATH}')


if __name__ == '__main__':
    main()
