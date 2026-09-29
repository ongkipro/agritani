from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb, io

f = TTFont('PlusJakartaSans.ttf')
inst = instantiateVariableFont(f, {'wght': 800})
buf = io.BytesIO(); inst.save(buf); data = buf.getvalue()
face = hb.Face(data); font = hb.Font(face)
upem = inst['head'].unitsPerEm
gs = inst.getGlyphSet(); order = inst.getGlyphOrder()

def text_path(text, size, x0, baseline, tracking=-0.02):
    b = hb.Buffer(); b.add_str(text); b.guess_segment_properties(); hb.shape(font, b)
    s = size / upem; pen = SVGPathPen(gs); x = 0
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        name = order[info.codepoint]
        tp = TransformPen(pen, (s, 0, 0, -s, x0 + (x + pos.x_offset) * s, baseline - pos.y_offset * s))
        gs[name].draw(tp)
        x += pos.x_advance + tracking * upem
    return pen.getCommands(), (x - tracking*upem) * s

MARK = '''<path d="M10 57 L29 8" stroke="{stem}" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M30 7 C49 15 58 37 54 58 C39 50 31 31 30 7 Z" fill="{leaf}"/>
<path d="M17 41 H44" stroke="{stem}" stroke-width="8" stroke-linecap="round"/>'''

d, w = text_path('Agritani', 40, 78, 55)
W = round(78 + w + 4); H = 64
def svg(vb, body, title): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}"><title>{title}</title>\n{body}\n</svg>\n'
files = {
 'agritani-logo.svg': svg(f'0 0 {W} {H}', MARK.format(stem='#1A6335', leaf='#1A6335') + f'\n<path d="{d}" fill="#16211A"/>', 'Agritani'),
 'agritani-logo-reverse.svg': svg(f'0 0 {W} {H}', MARK.format(stem='#FFFFFF', leaf='#F2B632') + f'\n<path d="{d}" fill="#FFFFFF"/>', 'Agritani'),
 'agritani-logo-mono.svg': svg(f'0 0 {W} {H}', MARK.format(stem='currentColor', leaf='currentColor') + f'\n<path d="{d}" fill="currentColor"/>', 'Agritani'),
 'agritani-mark.svg': svg('0 0 64 64', MARK.format(stem='#1A6335', leaf='#1A6335'), 'Agritani'),
 'favicon.svg': svg('0 0 64 64', '<rect width="64" height="64" rx="4" fill="#1A6335"/>\n<g transform="translate(6 5) scale(.82)">' + MARK.format(stem='#FFFFFF', leaf='#F2B632') + '</g>', 'Agritani'),
}
import os; os.makedirs('final', exist_ok=True)
for n, c in files.items(): open('final/'+n, 'w').write(c)
print(W, H, {n: len(c) for n, c in files.items()})
