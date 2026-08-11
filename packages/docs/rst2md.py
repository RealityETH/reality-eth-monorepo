#!/usr/bin/env python3
"""Convert the reality.eth RST docs to Markdown.

Usage: python3 rst2md.py                  # converts all *.rst in same dir
       python3 rst2md.py file.rst         # single file to stdout
"""

import re
import sys
import os
import textwrap

# Heading underline chars in precedence order (RST uses first-seen)
HEADING_CHARS = '=-~^"'

def rst_to_md(text, filename=''):
    lines = text.split('\n')
    # Pass 1: collect named link targets  { name_lower: url }
    targets = {}
    for i, line in enumerate(lines):
        m = re.match(r'\.\. _`([^`]+)`:\s*(.+)', line)
        if m:
            targets[m.group(1).lower()] = m.group(2).strip()
            continue
        m = re.match(r'\.\. _([^:]+):\s*(.+)', line)
        if m:
            targets[m.group(1).lower()] = m.group(2).strip()

    # Pass 2: figure out heading levels (first-seen underline char wins)
    level_map = {}
    for i in range(len(lines) - 1):
        ch = lines[i+1][:1]
        if ch in HEADING_CHARS and lines[i+1].strip() and \
                all(c == ch for c in lines[i+1].strip()) and lines[i].strip():
            if ch not in level_map:
                level_map[ch] = len(level_map) + 1

    # Pass 3: convert
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        next_line = lines[i+1] if i+1 < len(lines) else ''

        # --- Heading ---
        if next_line.strip() and all(c == next_line[0] for c in next_line.strip()) \
                and next_line[0] in HEADING_CHARS and line.strip():
            level = level_map.get(next_line[0], 1)
            out.append('#' * level + ' ' + inline(line.strip(), targets))
            i += 2
            continue

        # --- toctree / toctree options (skip entire block) ---
        if re.match(r'\.\. toctree::', line):
            i += 1
            while i < len(lines) and (not lines[i].strip() or lines[i].startswith(' ')):
                i += 1
            continue

        # --- Anchor-only target (no URL) — drop ---
        if re.match(r'\.\. _[^:]+:\s*$', line) or re.match(r'\.\. _`[^`]+`:\s*$', line):
            i += 1
            continue

        # --- Named link target (has URL) — drop the definition line ---
        if re.match(r'\.\. _', line) and ':' in line:
            i += 1
            continue

        # --- code-block directive ---
        if re.match(r'\.\. code-block::', line):
            lang = re.sub(r'\.\. code-block::\s*', '', line).strip()
            out.append(f'```{lang}')
            i += 1
            # skip optional directive options (:linenos: etc.)
            while i < len(lines) and re.match(r'\s+:[a-z]+:', lines[i]):
                i += 1
            # skip blank line after directive
            if i < len(lines) and not lines[i].strip():
                i += 1
            # collect indented body
            body = []
            while i < len(lines) and (lines[i].startswith('   ') or not lines[i].strip()):
                body.append(lines[i][3:] if lines[i].startswith('   ') else '')
                i += 1
            # strip trailing blank lines
            while body and not body[-1].strip():
                body.pop()
            out.extend(body)
            out.append('```')
            out.append('')
            continue

        # --- note directive ---
        if re.match(r'\.\. note::', line):
            inline_text = line[len('.. note::'):].strip()
            # collect continuation lines (indented)
            note_lines = [inline_text] if inline_text else []
            i += 1
            while i < len(lines) and (lines[i].startswith('   ') or (not lines[i].strip() and i+1 < len(lines) and lines[i+1].startswith('   '))):
                note_lines.append(lines[i].strip())
                i += 1
            # strip trailing blanks
            while note_lines and not note_lines[-1]:
                note_lines.pop()
            note_text = ' '.join(l for l in note_lines if l)
            out.append('')
            out.append('> **Note:** ' + inline(note_text, targets))
            out.append('')
            continue

        # --- image directive — keep as Markdown image ---
        if re.match(r'\.\. image::', line):
            src = re.sub(r'\.\. image::\s*', '', line).strip()
            out.append(f'![]({src})')
            i += 1
            # skip options
            while i < len(lines) and lines[i].startswith('   '):
                i += 1
            continue

        # --- other directives — drop ---
        if re.match(r'\.\. \w', line):
            i += 1
            while i < len(lines) and (lines[i].startswith('   ') or (not lines[i].strip() and i+1 < len(lines) and lines[i+1].startswith('   '))):
                i += 1
            continue

        # --- RST simple table (line of === === ===) ---
        if re.match(r'^=+( +=+)+\s*$', line):
            # Parse column positions from the separator line
            cols = []
            start = None
            for j, ch in enumerate(line.rstrip()):
                if ch == '=' and start is None:
                    start = j
                elif ch == ' ' and start is not None:
                    cols.append((start, j))
                    start = None
            if start is not None:
                cols.append((start, len(line.rstrip())))
            i += 1

            def extract_cells(l):
                cells = []
                for (s, e) in cols:
                    cells.append(l[s:e].strip() if len(l) > s else '')
                return cells

            rows = []
            header_done = False
            while i < len(lines):
                l = lines[i]
                if re.match(r'^=+( +=+)+\s*$', l):
                    if not header_done:
                        header_done = True  # end of header separator
                    else:
                        i += 1
                        break  # end of table
                else:
                    rows.append(extract_cells(l))
                i += 1

            if rows:
                out.append('')
                header = rows[0]
                data = rows[1:] if header_done else rows
                out.append('| ' + ' | '.join(header) + ' |')
                out.append('| ' + ' | '.join('---' for _ in header) + ' |')
                for row in data:
                    out.append('| ' + ' | '.join(row) + ' |')
                out.append('')
            continue

        # --- regular line ---
        out.append(inline(line, targets))
        i += 1

    return '\n'.join(out).strip() + '\n'


def inline(text, targets):
    """Apply inline RST → Markdown substitutions."""
    # ``inline code``
    text = re.sub(r'``(.+?)``', r'`\1`', text)
    # **bold**
    text = re.sub(r'\*\*(.+?)\*\*', r'**\1**', text)
    # *italic*
    text = re.sub(r'\*([^*]+)\*', r'*\1*', text)
    # :doc:`name` → [name](name.md)
    text = re.sub(r':doc:`([^`]+)`', lambda m: f'[{m.group(1)}]({m.group(1)}.md)', text)
    # :ref:`name` → [name](#name)
    text = re.sub(r':ref:`([^`]+)`', lambda m: f'[{m.group(1)}](#{m.group(1).lower().replace(" ", "-")})', text)
    # `Long Name <url>`_ → [Long Name](url)
    text = re.sub(r'`([^`<]+)\s+<([^>]+)>`_+', lambda m: f'[{m.group(1).strip()}]({m.group(2)})', text)
    # `Name`_ → look up in targets
    def resolve_named(m):
        key = m.group(1).lower()
        url = targets.get(key)
        return f'[{m.group(1)}]({url})' if url else m.group(1)
    text = re.sub(r'`([^`]+)`_', resolve_named, text)
    # Word_ → look up in targets
    def resolve_word(m):
        key = m.group(1).lower()
        url = targets.get(key)
        return f'[{m.group(1)}]({url})' if url else m.group(0)
    text = re.sub(r'\b([A-Z][A-Za-z0-9]+)_\b', resolve_word, text)
    return text


def convert_file(src_path, dst_path=None):
    with open(src_path) as f:
        rst = f.read()
    md = rst_to_md(rst, filename=os.path.basename(src_path))
    if dst_path:
        with open(dst_path, 'w') as f:
            f.write(md)
        print(f'  {src_path} → {dst_path}')
    else:
        print(md)


if __name__ == '__main__':
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    if len(sys.argv) > 1:
        convert_file(sys.argv[1])
    else:
        skip = {'index.rst', 'audit.rst', 'audit_v2.rst', 'audit_v2_ERC20.rst', 'audit_v3.rst'}
        for fname in sorted(os.listdir(docs_dir)):
            if fname.endswith('.rst') and fname not in skip:
                src = os.path.join(docs_dir, fname)
                dst = os.path.join(docs_dir, fname[:-4] + '.md')
                convert_file(src, dst)
