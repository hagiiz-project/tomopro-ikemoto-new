"""
ふい字を、このサイトで使う文字だけに絞って軽くします（約3MB → 数百KB）。

使い方
  1. ふい字の配布ファイル（.ttf）を assets/fonts/src/ に置く
     例：assets/fonts/src/HuiFontP29.ttf
  2. pip install fonttools brotli
  3. python tools/subset_font.py
  → assets/fonts/HuiFont.woff2 ができます。

文章を書き換えたら、もう一度実行してください（新しく使った文字が入ります）。
"""
import glob
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = sorted(glob.glob(str(ROOT / "assets/fonts/src/*.[tT][tT][fF]")) + glob.glob(str(ROOT / "assets/fonts/src/*.[oO][tT][fF]")))
OUT = ROOT / "assets/fonts/HuiFont.woff2"

if not SRC:
    sys.exit("assets/fonts/src/ にふい字の .ttf を置いてください")

# サイトで使っている文字を集める
chars = set()
for pattern in ["*.html", "content/*.js", "assets/js/*.js"]:
    for f in ROOT.glob(pattern):
        chars.update(f.read_text(encoding="utf-8"))

# どのページでも使いそうな文字も入れておく（ひらがな・カタカナ・英数字・記号）
base = "".join(chr(c) for c in range(0x20, 0x7F))
base += "".join(chr(c) for c in range(0x3040, 0x30FF + 1))
base += "".join(chr(c) for c in range(0xFF01, 0xFF5F))
base += "、。・「」『』（）【】〔〕…―ー〜！？：；％＆＠＃＊＋－＝／※→←↑↓○●◎◇◆□■△▲▽▼☆★♪"
chars.update(base)
text = "".join(sorted(c for c in chars if not c.isspace() or c == " "))

opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
opts.name_IDs = ["*"]
opts.notdef_outline = True

font = subset.load_font(SRC[0], opts)
sub = subset.Subsetter(opts)
sub.populate(text=text)
sub.subset(font)
subset.save_font(font, str(OUT), opts)
print(f"{Path(SRC[0]).name} → {OUT.relative_to(ROOT)}（{OUT.stat().st_size // 1024} KB、{len(text)}文字）")
