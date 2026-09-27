"""科学ページの挿絵3点を作る： python3 tools/illust/make_science.py"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from common import P, kid, star, sparkle, heart, svg
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "img")
N = P["navy"]

# ------------------------------------------------------------
# ① 枠の外にあるものは、測られない
# ------------------------------------------------------------
def frame_scene():
    b = [f'<rect width="1200" height="900" fill="{P["cream"]}"/>']
    for i in range(0, 1200, 60):
        for j in range(0, 900, 60):
            b.append(f'<circle cx="{i+30}" cy="{j+30}" r="2.2" fill="{P["navy"]}" opacity=".07"/>')
    # 枠（測られる場所）
    fx, fy, fw, fh = 350, 200, 500, 460
    b.append(f'<rect x="{fx+10}" y="{fy+12}" width="{fw}" height="{fh}" rx="22" fill="{N}"/>')
    b.append(f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="22" fill="#EAF4F7" stroke="{N}" stroke-width="7"/>')
    for gx in range(fx+40, fx+fw, 40):
        b.append(f'<line x1="{gx}" y1="{fy+6}" x2="{gx}" y2="{fy+fh-6}" stroke="{P["sky2"]}" stroke-width="2" opacity=".7"/>')
    for gy in range(fy+40, fy+fh, 40):
        b.append(f'<line x1="{fx+6}" y1="{gy}" x2="{fx+fw-6}" y2="{gy}" stroke="{P["sky2"]}" stroke-width="2" opacity=".7"/>')
    # 定規（上と左）
    b.append(f'<rect x="{fx}" y="{fy-58}" width="{fw}" height="42" rx="8" fill="{P["yellow"]}" stroke="{N}" stroke-width="5"/>')
    for k, tx in enumerate(range(fx+20, fx+fw-10, 20)):
        h = 18 if k % 5 == 0 else 10
        b.append(f'<line x1="{tx}" y1="{fy-58}" x2="{tx}" y2="{fy-58+h}" stroke="{N}" stroke-width="3"/>')
    b.append(f'<rect x="{fx-58}" y="{fy}" width="42" height="{fh}" rx="8" fill="{P["yellow"]}" stroke="{N}" stroke-width="5"/>')
    for k, ty in enumerate(range(fy+20, fy+fh-10, 20)):
        w = 18 if k % 5 == 0 else 10
        b.append(f'<line x1="{fx-58}" y1="{ty}" x2="{fx-58+w}" y2="{ty}" stroke="{N}" stroke-width="3"/>')
    # 枠の中：机でテスト／通知表を掲げる子
    b.append(kid(500, 640, 0.95, shirt=P["blue"], hairstyle="short", pose="hold", face="focus"))
    b.append(f'<rect x="400" y="560" width="200" height="30" rx="10" fill="{P["orange"]}" stroke="{N}" stroke-width="5"/>')
    b.append(f'<rect x="420" y="590" width="14" height="52" fill="{N}"/><rect x="566" y="590" width="14" height="52" fill="{N}"/>')
    b.append(f'<g transform="rotate(-6 470 545)"><rect x="440" y="532" width="72" height="30" rx="4" fill="#fff" stroke="{N}" stroke-width="4"/>'
             f'<path d="M450 542 h36 M450 551 h46" stroke="{P["sky2"]}" stroke-width="3"/></g>')
    b.append(kid(720, 640, 0.95, shirt=P["green"], hairstyle="pony", hair=P["hairO"], pose="up"))
    b.append(f'<g transform="rotate(5 720 470)"><rect x="662" y="430" width="116" height="74" rx="10" fill="#fff" stroke="{N}" stroke-width="5"/>'
             f'<text x="720" y="484" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="{P["coral"]}">A+</text></g>')
    # 点数のシール
    for (x, y, t, c) in [(430, 300, "100", P["coral"]), (620, 270, "★5", P["orange"]), (780, 330, "95", P["blue"])]:
        b.append(f'<circle cx="{x}" cy="{y}" r="40" fill="#fff" stroke="{c}" stroke-width="7"/>')
        b.append(f'<text x="{x}" y="{y+12}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="32" fill="{c}">{t}</text>')
    b.append(f'<path d="M548 370 l26 30 l52 -64" fill="none" stroke="{P["coral"]}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>')

    def q(x, y):  # 「？」の吹き出し（測られない）
        return (f'<g><circle cx="{x}" cy="{y}" r="26" fill="#fff" stroke="{N}" stroke-width="4" stroke-dasharray="7 6"/>'
                f'<text x="{x}" y="{y+11}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="32" fill="{P["teal"]}">?</text></g>')
    # 枠の外：虫取り
    b.append(f'<path d="M120 290 L70 180" stroke="{P["hairO"]}" stroke-width="7" stroke-linecap="round"/>')
    b.append(f'<ellipse cx="62" cy="160" rx="34" ry="26" fill="#fff" fill-opacity=".6" stroke="{N}" stroke-width="4"/>')
    b.append(kid(150, 420, 0.9, shirt=P["yellow"], hairstyle="bob", pose="reach"))
    b.append(f'<g transform="translate(200 150) rotate(-15)"><ellipse cx="-12" cy="0" rx="16" ry="12" fill="{P["orange"]}" stroke="{N}" stroke-width="3"/>'
             f'<ellipse cx="12" cy="0" rx="16" ry="12" fill="{P["orange"]}" stroke="{N}" stroke-width="3"/><rect x="-3" y="-12" width="6" height="24" rx="3" fill="{N}"/></g>')
    b.append(q(250, 250))
    # 枠の外：ロボットづくり
    b.append(kid(150, 850, 0.9, shirt=P["coral"], hairstyle="spiky", pose="hold", face="wow"))
    b.append(f'<g transform="translate(250 790)"><rect x="-26" y="-10" width="52" height="52" rx="10" fill="{P["lblue"]}" stroke="{N}" stroke-width="4"/>'
             f'<rect x="-22" y="-58" width="44" height="40" rx="10" fill="{P["lblue"]}" stroke="{N}" stroke-width="4"/>'
             f'<circle cx="-9" cy="-38" r="5" fill="{N}"/><circle cx="9" cy="-38" r="5" fill="{N}"/>'
             f'<path d="M0 -58 v-16" stroke="{N}" stroke-width="4"/><circle cx="0" cy="-78" r="6" fill="{P["coral"]}" stroke="{N}" stroke-width="3"/></g>')
    b.append(f'<g transform="translate(90 700)"><circle r="18" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/><circle r="6" fill="{N}"/></g>')
    b.append(q(280, 700))
    # 枠の外：天体観測
    b.append(f'<g transform="translate(1110 330)"><path d="M0 0 L-30 70 M0 0 L30 70 M0 0 L0 74" stroke="{N}" stroke-width="5"/>'
             f'<g transform="rotate(-35)"><rect x="-70" y="-16" width="110" height="32" rx="10" fill="{P["blue"]}" stroke="{N}" stroke-width="4"/>'
             f'<rect x="40" y="-20" width="22" height="40" rx="6" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/></g></g>')
    b.append(kid(1020, 420, 0.9, shirt=P["teal"], hairstyle="bun", pose="point", flip=True))
    for (x, y, r) in [(1000, 110, 22), (1120, 150, 16), (930, 170, 12)]:
        b.append(star(x, y, r, P["yellow"], N))
    b.append(q(930, 250))
    # 枠の外：お絵かき
    b.append(f'<g transform="translate(1110 700)"><path d="M-40 150 L0 0 L40 150 M0 0 V150" fill="none" stroke="{P["hairO"]}" stroke-width="7"/>'
             f'<rect x="-58" y="-10" width="116" height="90" rx="6" fill="#fff" stroke="{N}" stroke-width="5"/>'
             f'<circle cx="-22" cy="22" r="16" fill="{P["yellow"]}"/><path d="M-44 64 Q-10 20 20 52 T52 40" stroke="{P["blue"]}" stroke-width="8" fill="none" stroke-linecap="round"/></g>')
    b.append(kid(1010, 850, 0.9, shirt=P["orange"], hairstyle="long", pose="reach", flip=True))
    b.append(q(950, 690))
    # 花・葉っぱ
    for (x, y, c) in [(310, 860, P["coral"]), (880, 870, P["yellow"]), (60, 540, P["orange"])]:
        for a in range(0, 360, 72):
            dx, dy = 12*math.cos(math.radians(a)), 12*math.sin(math.radians(a))
            b.append(f'<circle cx="{x+dx:.1f}" cy="{y+dy:.1f}" r="10" fill="{c}" stroke="{N}" stroke-width="2.5"/>')
        b.append(f'<circle cx="{x}" cy="{y}" r="7" fill="{P["yellow"]}" stroke="{N}" stroke-width="2.5"/>')
    return svg(1200, 900, "\n".join(b))

# ------------------------------------------------------------
# ② どの熱中にも、スポットライトを
# ------------------------------------------------------------
def spotlight_scene():
    defs = (f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{N}"/><stop offset="1" stop-color="#2F5872"/></linearGradient>'
            f'<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".85"/><stop offset="1" stop-color="{P["yellow"]}" stop-opacity=".28"/></linearGradient>'
            f'<radialGradient id="pool"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".95"/><stop offset="1" stop-color="{P["yellow"]}" stop-opacity="0"/></radialGradient>')
    b = ['<rect width="1200" height="900" fill="url(#bg)"/>']
    for (x, y) in [(80, 120), (300, 70), (560, 140), (840, 80), (1100, 150), (700, 40), (200, 220), (1000, 250)]:
        b.append(sparkle(x, y, 10, "#FFF3C4"))
    xs = [110, 305, 500, 700, 895, 1090]
    # 舞台
    b.append(f'<path d="M0 690 L1200 690 L1200 900 L0 900 Z" fill="{P["orange"]}"/>')
    b.append(f'<path d="M0 690 L1200 690 L1200 712 L0 712 Z" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/>')
    for x in range(0, 1200, 80):
        b.append(f'<line x1="{x}" y1="712" x2="{x-30}" y2="900" stroke="{N}" stroke-width="2" opacity=".25"/>')
    # ライトと光
    for x in xs:
        b.append(f'<path d="M{x-22} 70 L{x-95} 700 L{x+95} 700 L{x+22} 70 Z" fill="url(#beam)"/>')
        b.append(f'<ellipse cx="{x}" cy="700" rx="110" ry="26" fill="url(#pool)"/>')
    b.append(f'<rect x="0" y="0" width="1200" height="46" fill="{P["navy"]}"/><rect x="0" y="40" width="1200" height="10" fill="{P["teal"]}"/>')
    for x in xs:
        b.append(f'<g transform="translate({x} 58)"><rect x="-26" y="-24" width="52" height="34" rx="8" fill="{P["lblue"]}" stroke="#0F1E2C" stroke-width="4"/>'
                 f'<ellipse cx="0" cy="12" rx="22" ry="7" fill="#FFF3C4"/></g>')
    # 子どもたち（スポーツ3人＋勉強3人）
    b.append(kid(xs[0], 690, 1.0, shirt=P["coral"], hairstyle="spiky", pose="up", face="wow"))
    b.append(f'<g transform="translate({xs[0]+46} 668)"><circle r="22" fill="#fff" stroke="{N}" stroke-width="4"/>'
             f'<polygon points="0,-9 8,-3 5,7 -5,7 -8,-3" fill="{N}"/></g>')
    b.append(kid(xs[1], 690, 1.0, shirt=P["orange"], hairstyle="pony", hair=P["hairO"], pose="up"))
    b.append(f'<g transform="translate({xs[1]} 478)"><circle r="26" fill="{P["orange"]}" stroke="{N}" stroke-width="4"/>'
             f'<path d="M-26 0 H26 M0 -26 V26 M-18 -18 Q0 0 -18 18 M18 -18 Q0 0 18 18" stroke="{N}" stroke-width="3" fill="none"/></g>')
    b.append(kid(xs[2], 690, 1.0, shirt=P["blue"], hairstyle="short", pose="wave"))
    b.append(f'<path d="M{xs[2]-14} 596 L{xs[2]} 620 L{xs[2]+14} 596" stroke="{P["coral"]}" stroke-width="5" fill="none"/>'
             f'<circle cx="{xs[2]}" cy="630" r="13" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/>')
    # 顕微鏡
    b.append(kid(xs[3], 690, 1.0, shirt=P["green"], hairstyle="bob", pose="hold", face="focus"))
    b.append(f'<g transform="translate({xs[3]+62} 690)"><rect x="-26" y="-12" width="52" height="12" rx="4" fill="{N}"/>'
             f'<path d="M-6 -12 V-70 Q-6 -84 8 -84" stroke="{N}" stroke-width="10" fill="none" stroke-linecap="round"/>'
             f'<rect x="-2" y="-110" width="18" height="50" rx="5" fill="{P["lblue"]}" stroke="{N}" stroke-width="4" transform="rotate(-20 7 -85)"/></g>')
    # 黒板（数学）
    b.append(f'<g transform="translate({xs[4]-92} 462)"><rect x="-58" y="-40" width="116" height="80" rx="8" fill="{P["teal"]}" stroke="{N}" stroke-width="5"/>'
             f'<text x="0" y="-4" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#fff">π r²</text>'
             f'<text x="0" y="28" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#fff">∑ x = ?</text></g>')
    b.append(kid(xs[4], 690, 1.0, shirt=P["yellow"], hairstyle="long", pose="wave", flip=True))
    # パソコン（プログラミング）
    b.append(kid(xs[5], 690, 1.0, shirt=P["teal"], hairstyle="bun", pose="hold", face="wow"))
    b.append(f'<g transform="translate({xs[5]} 640)"><rect x="-40" y="-40" width="80" height="54" rx="6" fill="{P["lblue"]}" stroke="{N}" stroke-width="4"/>'
             f'<text x="0" y="-5" text-anchor="middle" font-family="Consolas, monospace" font-weight="700" font-size="22" fill="{N}">&lt;/&gt;</text>'
             f'<rect x="-50" y="14" width="100" height="10" rx="4" fill="{N}"/></g>')
    # 観客（拍手）
    for i, x in enumerate(range(40, 1200, 95)):
        y = 870 + (i % 2) * 12
        c = [P["teal"], P["blue"], "#2F5872"][i % 3]
        b.append(f'<path d="M{x-40} 900 Q{x-40} {y-40} {x} {y-44} Q{x+40} {y-40} {x+40} 900 Z" fill="{c}"/>')
        b.append(f'<circle cx="{x}" cy="{y-70}" r="26" fill="{c}"/>')
        if i % 3 == 1:
            b.append(f'<path d="M{x-30} {y-40} L{x-44} {y-100}" stroke="{c}" stroke-width="14" stroke-linecap="round"/>')
    # ハート・紙吹雪
    for (x, y, c, s) in [(210, 380, P["pink"], 1.3), (600, 330, P["coral"], 1.5), (990, 390, P["pink"], 1.2), (400, 250, P["coral"], .9), (810, 230, P["pink"], 1)]:
        b.append(heart(x, y, s, c, "#fff"))
    for k, (x, y) in enumerate([(160, 300), (260, 180), (450, 400), (640, 200), (760, 420), (930, 300), (1050, 210), (360, 520), (840, 540)]):
        c = [P["yellow"], P["coral"], P["lblue"], P["lgreen"], P["pink"]][k % 5]
        b.append(f'<rect x="{x}" y="{y}" width="16" height="9" rx="2" fill="{c}" transform="rotate({k*37} {x} {y})"/>')
    return svg(1200, 900, "\n".join(b), defs)

# ------------------------------------------------------------
# ③ 世の中は、いろんなガリ勉でできている（ステッカー）
# ------------------------------------------------------------
ICONS = {
 "phone": lambda: f'<rect x="-24" y="-40" width="48" height="80" rx="10" fill="{N}"/><rect x="-18" y="-32" width="36" height="58" rx="4" fill="{P["lblue"]}"/><circle cy="33" r="3.5" fill="#fff"/>{heart(0,-16,.8,P["pink"])}',
 "train": lambda: f'<path d="M-44 20 Q-44 -20 -10 -24 L40 -24 Q48 -24 48 -14 L48 20 Z" fill="#fff" stroke="{N}" stroke-width="4"/><path d="M-44 8 H48" stroke="{P["blue"]}" stroke-width="7"/><rect x="-6" y="-16" width="16" height="12" rx="3" fill="{P["lblue"]}"/><rect x="18" y="-16" width="16" height="12" rx="3" fill="{P["lblue"]}"/><circle cx="-24" cy="26" r="7" fill="{N}"/><circle cx="30" cy="26" r="7" fill="{N}"/>',
 "bridge": lambda: f'<path d="M-48 10 H48" stroke="{N}" stroke-width="7"/><path d="M-48 10 Q0 -60 48 10" fill="none" stroke="{P["coral"]}" stroke-width="7"/><path d="M-24 10 V-18 M0 10 V-26 M24 10 V-18" stroke="{P["coral"]}" stroke-width="4"/><path d="M-50 26 q12 -8 25 0 t25 0 t25 0 t25 0" stroke="{P["blue"]}" stroke-width="5" fill="none"/>',
 "satellite": lambda: f'<rect x="-12" y="-12" width="24" height="24" rx="4" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/><rect x="-48" y="-10" width="30" height="20" fill="{P["blue"]}" stroke="{N}" stroke-width="3"/><rect x="18" y="-10" width="30" height="20" fill="{P["blue"]}" stroke="{N}" stroke-width="3"/><path d="M0 -12 V-26" stroke="{N}" stroke-width="4"/><circle cy="-30" r="5" fill="{P["coral"]}"/>',
 "rocket": lambda: f'<path d="M0 -44 Q22 -20 18 20 H-18 Q-22 -20 0 -44 Z" fill="#fff" stroke="{N}" stroke-width="4"/><circle cy="-10" r="9" fill="{P["lblue"]}" stroke="{N}" stroke-width="3"/><path d="M-18 8 L-30 30 L-16 24 Z M18 8 L30 30 L16 24 Z" fill="{P["coral"]}" stroke="{N}" stroke-width="3"/><path d="M-10 24 Q0 50 10 24 Z" fill="{P["orange"]}"/>',
 "capsule": lambda: f'<g transform="rotate(-35)"><rect x="-40" y="-16" width="80" height="32" rx="16" fill="#fff" stroke="{N}" stroke-width="4"/><path d="M0 -16 H24 A16 16 0 0 1 24 16 H0 Z" fill="{P["pink"]}"/></g><path d="M20 -34 h14 M27 -41 v14" stroke="{P["coral"]}" stroke-width="5" stroke-linecap="round"/>',
 "bulb": lambda: f'<path d="M0 -42 A28 28 0 0 1 16 10 V22 H-16 V10 A28 28 0 0 1 0 -42 Z" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/><rect x="-14" y="22" width="28" height="14" rx="4" fill="{N}"/><path d="M-8 -6 Q0 -18 8 -6" stroke="#fff" stroke-width="4" fill="none"/>',
 "onigiri": lambda: f'<path d="M0 -38 Q40 20 32 30 Q0 40 -32 30 Q-40 20 0 -38 Z" fill="#fff" stroke="{N}" stroke-width="4"/><rect x="-18" y="10" width="36" height="24" rx="3" fill="{N}"/><ellipse cx="-10" cy="-2" rx="3" ry="4" fill="{N}"/><ellipse cx="10" cy="-2" rx="3" ry="4" fill="{N}"/><ellipse cx="-17" cy="6" rx="5" ry="3" fill="{P["pink"]}"/><ellipse cx="17" cy="6" rx="5" ry="3" fill="{P["pink"]}"/>',
 "headphones": lambda: f'<path d="M-32 12 V0 A32 32 0 0 1 32 0 V12" fill="none" stroke="{N}" stroke-width="8"/><rect x="-44" y="4" width="20" height="32" rx="8" fill="{P["pink"]}" stroke="{N}" stroke-width="4"/><rect x="24" y="4" width="20" height="32" rx="8" fill="{P["pink"]}" stroke="{N}" stroke-width="4"/><path d="M-4 -22 v16 a6 6 0 1 1 -4 -5" stroke="{P["blue"]}" stroke-width="4" fill="none"/>',
 "lipstick": lambda: f'<rect x="-14" y="0" width="28" height="40" rx="4" fill="{P["yellow"]}" stroke="{N}" stroke-width="4"/><rect x="-10" y="-14" width="20" height="16" fill="#E7E2EA" stroke="{N}" stroke-width="3"/><path d="M-10 -14 L-10 -34 Q0 -48 10 -40 L10 -14 Z" fill="{P["coral"]}" stroke="{N}" stroke-width="4"/>',
 "camera": lambda: f'<rect x="-42" y="-22" width="84" height="54" rx="12" fill="{P["lpink"]}" stroke="{N}" stroke-width="4"/><rect x="-18" y="-32" width="26" height="12" rx="4" fill="{N}"/><circle cy="5" r="18" fill="#fff" stroke="{N}" stroke-width="4"/><circle cy="5" r="9" fill="{P["blue"]}"/><circle cx="30" cy="-10" r="4" fill="{P["coral"]}"/>',
 "book": lambda: f'<path d="M-44 -26 Q-20 -36 0 -24 Q20 -36 44 -26 V30 Q20 20 0 32 Q-20 20 -44 30 Z" fill="#fff" stroke="{N}" stroke-width="4"/><path d="M0 -24 V32" stroke="{N}" stroke-width="3"/><path d="M-34 -10 h24 M-34 2 h24 M10 -10 h24 M10 2 h18" stroke="{P["lblue"]}" stroke-width="3"/>',
 "weather": lambda: f'<circle cx="-12" cy="-12" r="18" fill="{P["yellow"]}" stroke="{N}" stroke-width="3.5"/><path d="M-30 20 A16 16 0 0 1 -12 0 A20 20 0 0 1 26 2 A14 14 0 0 1 30 26 H-26 A10 10 0 0 1 -30 20 Z" fill="#fff" stroke="{N}" stroke-width="4"/><path d="M-10 34 l-4 10 M6 34 l-4 10 M22 34 l-4 10" stroke="{P["blue"]}" stroke-width="4" stroke-linecap="round"/>',
 "pin": lambda: f'<path d="M-34 -10 L-12 -20 L12 -10 L34 -20 V30 L12 40 L-12 30 L-34 40 Z" fill="{P["lgreen"]}" stroke="{N}" stroke-width="3.5"/><path d="M0 -40 A18 18 0 0 1 18 -22 Q18 -8 0 14 Q-18 -8 -18 -22 A18 18 0 0 1 0 -40 Z" fill="{P["coral"]}" stroke="{N}" stroke-width="4"/><circle cy="-22" r="6" fill="#fff"/>',
 "wifi": lambda: f'<path d="M-40 -6 A56 56 0 0 1 40 -6" fill="none" stroke="{P["blue"]}" stroke-width="8" stroke-linecap="round"/><path d="M-26 8 A36 36 0 0 1 26 8" fill="none" stroke="{P["teal"]}" stroke-width="8" stroke-linecap="round"/><path d="M-12 22 A16 16 0 0 1 12 22" fill="none" stroke="{P["green"]}" stroke-width="8" stroke-linecap="round"/><circle cy="34" r="6" fill="{N}"/>',
 "nail": lambda: f'<rect x="-20" y="-6" width="40" height="44" rx="12" fill="{P["pink"]}" stroke="{N}" stroke-width="4"/><rect x="-10" y="-40" width="20" height="36" rx="5" fill="{N}"/><path d="M-10 6 Q-4 20 -10 30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>{sparkle(24,-26,10,P["yellow"])}',
 "sprout": lambda: f'<path d="M-30 20 H30 L22 44 H-22 Z" fill="{P["orange"]}" stroke="{N}" stroke-width="4"/><path d="M0 20 V-10" stroke="{P["green"]}" stroke-width="6"/><path d="M0 -8 Q-34 -12 -30 -36 Q-4 -34 0 -8 Z M0 -14 Q30 -24 32 -44 Q4 -46 0 -14 Z" fill="{P["lgreen"]}" stroke="{N}" stroke-width="4"/>',
 "turbine": lambda: f'<path d="M-4 -6 L-8 44 H8 L4 -6 Z" fill="#fff" stroke="{N}" stroke-width="3.5"/><g stroke="{N}" stroke-width="3" fill="#fff"><path d="M0 -8 L-6 -48 Q0 -52 4 -48 Z"/><path d="M0 -8 L36 8 Q36 16 30 16 Z"/><path d="M0 -8 L-34 14 Q-38 8 -34 4 Z"/></g><circle cy="-8" r="6" fill="{P["yellow"]}" stroke="{N}" stroke-width="3"/>',
 "microscope": lambda: f'<rect x="-30" y="30" width="60" height="10" rx="4" fill="{N}"/><path d="M-10 30 V0 Q-10 -14 6 -14" stroke="{N}" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="0" y="-46" width="18" height="44" rx="5" fill="{P["lblue"]}" stroke="{N}" stroke-width="4" transform="rotate(-22 9 -24)"/><rect x="-16" y="8" width="36" height="7" rx="3" fill="{P["yellow"]}" stroke="{N}" stroke-width="2.5"/>',
 "gamepad": lambda: f'<path d="M-40 -8 Q-40 -24 -24 -24 H24 Q40 -24 40 -8 L46 20 Q48 34 34 32 L20 16 H-20 L-34 32 Q-48 34 -46 20 Z" fill="{P["blue"]}" stroke="{N}" stroke-width="4"/><path d="M-26 -6 v14 M-33 1 h14" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="-4" r="5" fill="{P["yellow"]}"/><circle cx="32" cy="6" r="5" fill="{P["pink"]}"/>',
}
BACKS = [P["white"], P["lpink"], "#DDF0F7", "#FFF1C8", "#DFF2DC"]

def sticker(x, y, rot, name, k):
    back = BACKS[k % len(BACKS)]
    return (f'<g transform="translate({x} {y}) rotate({rot})">'
            f'<circle cx="5" cy="7" r="66" fill="{N}" opacity=".18"/>'
            f'<circle r="66" fill="#fff" stroke="{N}" stroke-width="3"/>'
            f'<circle r="56" fill="{back}"/>{ICONS[name]()}</g>')

def world_scene():
    defs = (f'<linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{P["lpink"]}"/><stop offset=".55" stop-color="#FFF4E4"/><stop offset="1" stop-color="{P["sky"]}"/></linearGradient>'
            f'<clipPath id="earth"><circle r="150"/></clipPath>')
    b = ['<rect width="1200" height="900" fill="url(#bg3)"/>']
    for i in range(0, 1200, 48):
        for j in range(0, 900, 48):
            if (i // 48 + j // 48) % 2 == 0:
                b.append(f'<circle cx="{i+24}" cy="{j+24}" r="4" fill="#fff" opacity=".7"/>')
    # 地球（真ん中）
    b.append('<g transform="translate(600 450)">')
    b.append(f'<circle cx="8" cy="10" r="164" fill="{N}" opacity=".2"/><circle r="164" fill="#fff" stroke="{N}" stroke-width="4"/>')
    b.append(f'<g clip-path="url(#earth)"><circle r="150" fill="{P["blue"]}"/>'
             f'<path d="M-120 -60 Q-80 -110 -30 -90 Q10 -70 -20 -30 Q-60 -10 -90 20 Q-130 0 -120 -60 Z" fill="{P["green"]}"/>'
             f'<path d="M30 -120 Q100 -110 120 -60 Q110 -20 70 -30 Q40 -50 30 -120 Z" fill="{P["green"]}"/>'
             f'<path d="M10 40 Q60 20 110 60 Q90 130 30 120 Q-10 90 10 40 Z" fill="{P["lgreen"]}"/>'
             f'<path d="M-130 70 Q-90 60 -70 100 Q-90 140 -130 120 Z" fill="{P["lgreen"]}"/></g>')
    b.append(f'<ellipse cx="-40" cy="-4" rx="11" ry="15" fill="{N}"/><ellipse cx="40" cy="-4" rx="11" ry="15" fill="{N}"/>'
             f'<circle cx="-36" cy="-9" r="4" fill="#fff"/><circle cx="44" cy="-9" r="4" fill="#fff"/>'
             f'<ellipse cx="-72" cy="28" rx="18" ry="10" fill="{P["pink"]}" opacity=".85"/><ellipse cx="72" cy="28" rx="18" ry="10" fill="{P["pink"]}" opacity=".85"/>'
             f'<path d="M-20 30 Q0 54 20 30" stroke="{N}" stroke-width="6" fill="none" stroke-linecap="round"/>')
    b.append('</g>')
    # ステッカーを、地球のまわりにちりばめる（重ならない配置）
    names = list(ICONS.keys())
    spots = [(110, 95), (290, 105), (470, 90), (730, 100), (910, 90), (1090, 105),
             (295, 265), (905, 262),
             (115, 450), (285, 455), (915, 445), (1085, 452),
             (292, 640), (908, 645),
             (110, 805), (290, 795), (470, 810), (730, 800), (910, 808), (1090, 795)]
    for k, (x, y) in enumerate(spots):
        b.append(sticker(x, y, (k * 23) % 40 - 20, names[k % len(names)], k))
    # キラキラ・ハート・星（ギャル感）
    for (x, y, r, c) in [(170, 120, 16, "#fff"), (1030, 110, 18, "#fff"), (470, 90, 12, P["yellow"]), (740, 820, 14, "#fff"),
                         (120, 540, 12, P["yellow"]), (1080, 560, 14, "#fff"), (470, 800, 10, P["pink"]), (760, 90, 10, P["pink"])]:
        b.append(sparkle(x, y, r, c))
    for (x, y, s, c) in [(455, 330, .9, P["pink"]), (750, 590, 1.0, P["coral"]), (455, 570, .7, P["pink"]), (760, 320, .8, P["pink"])]:
        b.append(heart(x, y, s, c, "#fff"))
    for (x, y, r, c) in [(1150, 40, 20, P["yellow"]), (50, 860, 22, P["yellow"]), (1150, 860, 18, P["pink"]), (50, 50, 16, P["pink"])]:
        b.append(star(x, y, r, c, "#fff"))
    return svg(1200, 900, "\n".join(b), defs)

if __name__ == "__main__":
    for name, fn in [("science-frame", frame_scene), ("science-spotlight", spotlight_scene), ("science-world", world_scene)]:
        open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8").write(fn())
        print("wrote", name)
