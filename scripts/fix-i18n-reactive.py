"""
批量修复 i18n 响应式问题
- data 加 langVersion
- 监听 languageChanged
- methods 加 t() 包装
- 模板 {{ i18n.t(...) }} → {{ t(...) }}
"""
import re
import os
import sys

# A 类：完全没接响应式的页面
A_FILES = [
    'pages/address/index.vue',
    'pages/claim-coupons/index.vue',
    'pages/coupons/index.vue',
    'pages/dinein/index.vue',
    'pages/dinein-stores/index.vue',
    'pages/exchange-success/index.vue',
    'pages/group/index.vue',
    'pages/group-detail/index.vue',
    'pages/hostel/booking.vue',
    'pages/hostel/index.vue',
    'pages/hot-products/index.vue',
    'pages/mall/index.vue',
    'pages/member/index.vue',
    'pages/member-code/index.vue',
    'pages/message/index.vue',
    'pages/new-products/index.vue',
    'pages/payment-success/index.vue',
    'pages/points-mall/index.vue',
    'pages/products/index.vue',
    'pages/referral/index.vue',
    'pages/settings/index.vue',
    'pages/store-select/index.vue',
    'pages/vending-machine/index.vue',
    'pages/login/verify.vue',
]

# B 类：已接监听但模板里还有 i18n.t 直接调用
B_FILES = [
    'pages/checkout/index.vue',
    'pages/discount/index.vue',
    'pages/footprint/index.vue',
    'pages/order-detail/index.vue',
    'pages/product-detail/index.vue',
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def extract_template(content):
    m = re.search(r'<template>(.*?)</template>', content, re.DOTALL)
    if not m:
        return None, content, None
    start, end = m.span()
    return content[start+10:end-11], content[:start+10], content[end-11:]


def fix_file(filepath, add_listener=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 模板里 {{ i18n.t(...) → {{ t(...)
    # 2. 模板里 {{ i18n.getLanguage() → {{ langVersion !== undefined && i18n.getLanguage() （少见，先跳过）
    template_match = re.search(r'(<template>)(.*?)(</template>)', content, re.DOTALL)
    if template_match:
        prefix, template, suffix = template_match.group(1), template_match.group(2), template_match.group(3)
        new_template = re.sub(r'\{\{\s*i18n\.t\(', '{{ t(', template)
        content = content[:template_match.start()] + prefix + new_template + suffix + content[template_match.end():]

    # 解析 script
    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not script_match:
        print(f"  ! 跳过（无 <script>）: {filepath}")
        return False
    script = script_match.group(1)
    new_script = script

    # 2. 确保 import i18n 存在
    if 'import i18n' not in new_script and 'from \'@/i18n' not in new_script:
        # 在第一个 import 前加
        new_script = re.sub(
            r'^import ',
            "import i18n from '@/i18n/index.js'\nimport ",
            new_script,
            count=1,
            flags=re.MULTILINE
        )

    # 3. data() 里加 langVersion: 0
    # 匹配 data() { return { ... } }
    data_pattern = re.compile(r'(data\s*\(\s*\)\s*\{[\s\S]*?return\s*\{)', re.MULTILINE)
    m = data_pattern.search(new_script)
    if m and 'langVersion' not in new_script[:m.end()+200]:
        # 在 return { 后插入 langVersion: 0,
        return_pos = m.end()
        # 找到 return { 后第一个非空白
        after = new_script[return_pos:]
        # 插入
        new_script = new_script[:return_pos] + '\n\t\t\tlangVersion: 0,' + after

    # 4. 加 onLanguageChanged 监听（A 类才需要）
    if add_listener:
        # created() 存在？
        if 'created()' not in new_script and 'created (' not in new_script:
            # 在 methods: 之前加 created
            if 'methods:' in new_script:
                new_script = new_script.replace(
                    'methods:',
                    'created() {\n\t\tuni.$on(\'languageChanged\', this.onLanguageChanged)\n\t},\n\n\tmethods:',
                    1
                )
        else:
            # 已有 created，往里面塞
            created_pattern = re.compile(r'(created\s*\(\s*\)\s*\{)', re.MULTILINE)
            new_script = created_pattern.sub(
                r"\1\n\t\tuni.$on('languageChanged', this.onLanguageChanged)",
                new_script,
                count=1
            )

        # beforeDestroy
        if 'beforeDestroy' not in new_script and 'beforeUnmount' not in new_script:
            if 'methods:' in new_script:
                new_script = new_script.replace(
                    'methods:',
                    'beforeDestroy() {\n\t\tuni.$off(\'languageChanged\', this.onLanguageChanged)\n\t},\n\n\tmethods:',
                    1
                )
        else:
            # 已有，往里塞
            destroy_pattern = re.compile(r'(before(?:Destroy|Unmount)\s*\(\s*\)\s*\{)', re.MULTILINE)
            new_script = destroy_pattern.sub(
                r"\1\n\t\tuni.$off('languageChanged', this.onLanguageChanged)",
                new_script,
                count=1
            )

    # 5. methods 里加 t() + onLanguageChanged()（如果还没有）
    methods_pattern = re.compile(r'(methods\s*:\s*\{)', re.MULTILINE)
    m = methods_pattern.search(new_script)
    if m:
        methods_pos = m.end()
        inject = ''
        if 'onLanguageChanged()' not in new_script:
            inject += '\n\t\tonLanguageChanged() {\n\t\t\tthis.langVersion++\n\t\t},'
        if not re.search(r'\bt\s*\(\s*key', new_script):
            inject += '\n\t\tt(key, params) {\n\t\t\tvoid this.langVersion\n\t\t\treturn i18n.t(key, params)\n\t\t},'
        if inject:
            new_script = new_script[:methods_pos] + inject + new_script[methods_pos:]

    # 替换回 content
    content = content[:script_match.start()] + '<script>' + new_script + '</script>' + content[script_match.end():]

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    print("=== A class: pages without reactivity ===")
    for rel in A_FILES:
        filepath = os.path.join(ROOT, rel).replace('\\', '/')
        if not os.path.exists(filepath):
            print(f"  [skip] not found: {rel}")
            continue
        ok = fix_file(filepath, add_listener=True)
        print(f"  [{'OK' if ok else '--'}] {rel}")

    print("\n=== B class: listener exists but template has direct calls ===")
    for rel in B_FILES:
        filepath = os.path.join(ROOT, rel).replace('\\', '/')
        if not os.path.exists(filepath):
            print(f"  [skip] not found: {rel}")
            continue
        ok = fix_file(filepath, add_listener=False)
        print(f"  [{'OK' if ok else '--'}] {rel}")


if __name__ == '__main__':
    main()
