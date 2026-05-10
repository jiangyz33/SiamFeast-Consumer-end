with open('D:/project/SiamFeast/pages/coupons/index.vue', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 196-221 (0-indexed 195-220) - the loadData method
new_lines = [
    '\t\tasync loadData() {\n',
    '\t\t\tthis.loading = true\n',
    '\t\t\ttry {\n',
    '\t\t\t\tconst [myRes, claimRes] = await Promise.allSettled([\n',
    "\t\t\t\t\tgetMyCoupons({ status: 'all' }),\n",
    '\t\t\t\t\tgetReceivableCoupons()\n',
    '\t\t\t\t])\n',
    '\n',
    "\t\t\t\tconsole.log('[coupons] myRes status:', myRes.status, myRes.status === 'fulfilled' ? myRes.value : myRes.reason)\n",
    "\t\t\t\tconsole.log('[coupons] claimRes status:', claimRes.status, claimRes.status === 'fulfilled' ? claimRes.value : claimRes.reason)\n",
    '\n',
    '\t\t\t\t// 我的优惠券\n',
    "\t\t\t\tif (myRes.status === 'fulfilled' && myRes.value && myRes.value.code === 0 && myRes.value.data) {\n",
    '\t\t\t\t\tconst raw = myRes.value.data\n',
    '\t\t\t\t\tconst items = raw.items || raw.list || raw || []\n',
    '\t\t\t\t\tconsole.log(\'[coupons] my items count:\', Array.isArray(items) ? items.length : 0, \'raw keys:\', Object.keys(raw))\n',
    '\t\t\t\t\tthis.coupons = (Array.isArray(items) ? items : []).map(c => this.normalizeMyCoupon(c))\n',
    '\t\t\t\t} else {\n',
    "\t\t\t\t\tconsole.warn('[coupons] getMyCoupons failed:', myRes.status === 'rejected' ? myRes.reason : myRes.value)\n",
    '\t\t\t\t\tthis.coupons = []\n',
    '\t\t\t\t}\n',
    '\n',
    '\t\t\t\t// 可领取优惠券\n',
    "\t\t\t\tif (claimRes.status === 'fulfilled' && claimRes.value && claimRes.value.code === 0 && claimRes.value.data) {\n",
    '\t\t\t\t\tconst raw = claimRes.value.data\n',
    '\t\t\t\t\tconst items = raw.items || raw.list || raw || []\n',
    '\t\t\t\t\tconsole.log(\'[coupons] claimable items count:\', Array.isArray(items) ? items.length : 0)\n',
    '\t\t\t\t\tconst myTemplateIds = new Set(this.coupons.map(c => c.templateId))\n',
    '\t\t\t\t\tthis.claimableCoupons = (Array.isArray(items) ? items : []).map(c => this.normalizeClaimable(c, myTemplateIds))\n',
    '\t\t\t\t} else {\n',
    "\t\t\t\t\tconsole.warn('[coupons] getReceivableCoupons failed:', claimRes.status === 'rejected' ? claimRes.reason : claimRes.value)\n",
    '\t\t\t\t\tthis.claimableCoupons = []\n',
    '\t\t\t\t}\n',
    '\t\t\t} catch (e) {\n',
    "\t\t\t\tconsole.error('loadData error:', e)\n",
    '\t\t\t} finally {\n',
    '\t\t\t\tthis.loading = false\n',
    '\t\t\t}\n',
    '\t\t},\n',
    '\n',
]

lines[195:221] = new_lines

with open('D:/project/SiamFeast/pages/coupons/index.vue', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('OK')
