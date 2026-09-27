# 共通パーツ：色・デフォルメの子ども・ステッカー
P = dict(
    cream="#F7EBD8", paper="#FFF8EC", sky="#C0DEE6", sky2="#9FCBDD",
    navy="#22384F", orange="#E8762E", yellow="#F2B63C", blue="#3A78B8",
    lblue="#8FC3E8", green="#38925D", lgreen="#8CC98A", teal="#3C797A",
    coral="#D9614F", pink="#F58BB8", lpink="#FBD3E4", white="#FFFFFF",
    skin="#F6D2B3", skin2="#E8B48E", hairB="#3A2A22", hairO="#8A4A2A",
)

def kid(x, y, s=1.0, shirt=None, hair=None, pants=None, skin=None, pose="stand", hairstyle="bob", face="smile", flip=False):
    shirt = shirt or P["orange"]; hair = hair or P["hairB"]; pants = pants or P["navy"]; skin = skin or P["skin"]
    N = P["navy"]
    arms = {
        "stand": [(-24, -84, -34, -48), (24, -84, 34, -48)],
        "up":    [(-22, -86, -48, -150), (22, -86, 48, -150)],
        "wave":  [(-24, -84, -34, -48), (22, -86, 50, -140)],
        "hold":  [(-22, -84, -18, -58), (22, -84, 20, -58)],
        "point": [(-24, -84, -34, -48), (22, -86, 70, -104)],
        "reach": [(-22, -84, -46, -110), (22, -84, 34, -50)],
    }[pose]
    g = [f'<g transform="translate({x} {y}) scale({-s if flip else s} {s})">']
    # 影
    g.append(f'<ellipse cx="0" cy="2" rx="34" ry="7" fill="{N}" opacity=".15"/>')
    # 足
    for lx in (-12, 12):
        g.append(f'<rect x="{lx-8}" y="-44" width="16" height="44" rx="8" fill="{pants}" stroke="{N}" stroke-width="4"/>')
        g.append(f'<ellipse cx="{lx}" cy="-2" rx="11" ry="6" fill="{N}"/>')
    # 腕（体の後ろ側）
    for (x1, y1, x2, y2) in arms:
        g.append(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{N}" stroke-width="17" stroke-linecap="round"/>')
        g.append(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{shirt}" stroke-width="9" stroke-linecap="round"/>')
        g.append(f'<circle cx="{x2}" cy="{y2}" r="8" fill="{skin}" stroke="{N}" stroke-width="3.5"/>')
    # 体
    g.append(f'<path d="M-26 -40 Q-28 -96 0 -98 Q28 -96 26 -40 Z" fill="{shirt}" stroke="{N}" stroke-width="4" stroke-linejoin="round"/>')
    # 頭
    g.append(f'<circle cx="0" cy="-138" r="40" fill="{skin}" stroke="{N}" stroke-width="4"/>')
    hs = {
        "bob":   f'M-42 -128 Q-46 -186 0 -182 Q46 -186 42 -128 Q40 -148 22 -156 Q6 -144 -14 -152 Q-34 -150 -42 -128 Z',
        "short": f'M-40 -140 Q-40 -184 0 -182 Q40 -184 40 -140 Q30 -160 10 -158 Q-8 -168 -26 -156 Q-36 -152 -40 -140 Z',
        "spiky": f'M-40 -140 L-44 -170 L-26 -164 L-22 -188 L-4 -170 L6 -192 L16 -170 L34 -184 L32 -160 L44 -150 L40 -140 Q24 -158 0 -156 Q-24 -158 -40 -140 Z',
        "pony":  f'M-42 -130 Q-46 -186 0 -182 Q46 -186 42 -130 Q36 -152 16 -158 Q-6 -148 -24 -156 Q-38 -150 -42 -130 Z',
        "bun":   f'M-42 -132 Q-46 -184 0 -182 Q46 -184 42 -132 Q34 -154 12 -156 Q-12 -150 -30 -154 Q-40 -148 -42 -132 Z',
        "long":  f'M-44 -96 Q-52 -186 0 -182 Q52 -186 44 -96 L36 -96 Q38 -146 20 -156 Q2 -146 -18 -154 Q-38 -146 -36 -96 Z',
    }[hairstyle]
    if hairstyle == "pony":
        g.append(f'<path d="M36 -160 Q72 -150 60 -104 Q54 -130 34 -140 Z" fill="{hair}" stroke="{N}" stroke-width="4" stroke-linejoin="round"/>')
    if hairstyle == "bun":
        g.append(f'<circle cx="0" cy="-186" r="16" fill="{hair}" stroke="{N}" stroke-width="4"/>')
    g.append(f'<path d="{hs}" fill="{hair}" stroke="{N}" stroke-width="4" stroke-linejoin="round"/>')
    # 顔
    if face == "wow":
        g.append(f'<circle cx="-13" cy="-132" r="5" fill="{N}"/><circle cx="13" cy="-132" r="5" fill="{N}"/>')
        g.append(f'<ellipse cx="0" cy="-112" rx="6" ry="7" fill="{N}"/>')
    elif face == "focus":
        g.append(f'<path d="M-19 -132 h12 M7 -132 h12" stroke="{N}" stroke-width="4" stroke-linecap="round"/>')
        g.append(f'<path d="M-6 -114 q6 3 12 0" stroke="{N}" stroke-width="3.5" fill="none" stroke-linecap="round"/>')
    else:
        g.append(f'<ellipse cx="-13" cy="-132" rx="4.5" ry="6" fill="{N}"/><ellipse cx="13" cy="-132" rx="4.5" ry="6" fill="{N}"/>')
        g.append(f'<circle cx="-11.5" cy="-134" r="1.6" fill="#fff"/><circle cx="14.5" cy="-134" r="1.6" fill="#fff"/>')
        g.append(f'<path d="M-8 -117 q8 9 16 0" stroke="{N}" stroke-width="3.5" fill="none" stroke-linecap="round"/>')
    g.append(f'<ellipse cx="-24" cy="-120" rx="7" ry="4.5" fill="{P["coral"]}" opacity=".45"/><ellipse cx="24" cy="-120" rx="7" ry="4.5" fill="{P["coral"]}" opacity=".45"/>')
    g.append('</g>')
    return "\n".join(g)

def star(x, y, r, fill, stroke=None, rot=0):
    import math
    pts = []
    for i in range(10):
        a = math.pi / 5 * i - math.pi / 2 + math.radians(rot)
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f"{x + rr*math.cos(a):.1f},{y + rr*math.sin(a):.1f}")
    st = f' stroke="{stroke}" stroke-width="3" stroke-linejoin="round"' if stroke else ""
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"{st}/>'

def sparkle(x, y, r, fill):
    return (f'<path d="M{x} {y-r} Q{x+r*0.18} {y-r*0.18} {x+r} {y} Q{x+r*0.18} {y+r*0.18} {x} {y+r} '
            f'Q{x-r*0.18} {y+r*0.18} {x-r} {y} Q{x-r*0.18} {y-r*0.18} {x} {y-r} Z" fill="{fill}"/>')

def heart(x, y, s, fill, stroke=None):
    st = f' stroke="{stroke}" stroke-width="{3/s:.1f}"' if stroke else ""
    return (f'<path transform="translate({x} {y}) scale({s})" d="M0 6 C-14 -8 -26 4 -14 16 L0 28 L14 16 C26 4 14 -8 0 6 Z" fill="{fill}"{st}/>')

def svg(w, h, body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<defs>{defs}</defs>{body}</svg>')
