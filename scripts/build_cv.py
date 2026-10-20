"""Generate the one-page public CV from src/data/profile.json."""
import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "src/data/profile.json").read_text())
out = ROOT / "public/ilian-aigner-cv.pdf"
ink = colors.HexColor("#20242A")
blue = colors.HexColor("#185C72")
grey = colors.HexColor("#5C626A")

base = ParagraphStyle("base", fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=ink)
small = ParagraphStyle("small", parent=base, fontSize=10, leading=14.7)
muted = ParagraphStyle("muted", parent=small, textColor=grey)
heading = ParagraphStyle("heading", parent=base, fontName="Helvetica-Bold", fontSize=10.5, leading=15, spaceBefore=17, spaceAfter=5)
name = ParagraphStyle("name", parent=base, fontName="Helvetica-Bold", fontSize=24, leading=27, spaceAfter=7)

story = []
story.append(Paragraph(data["name"], name))
story.append(Paragraph(
    f'<link href="mailto:{data["email"]}" color="#185C72">{data["email"]}</link>  |  '
    f'<link href="{data["linkedin"]}" color="#185C72">LinkedIn</link>  |  '
    f'<link href="{data["strk"]}" color="#185C72">STRK</link>', small))
story.append(Spacer(1, 8))
story.append(HRFlowable(width="100%", thickness=1.2, color=blue))
story.append(Spacer(1, 8))
story.append(Paragraph(data["cv"]["summary"], base))


def section(title):
    story.append(Paragraph(title.upper(), heading))
    story.append(HRFlowable(width="100%", thickness=.45, color=colors.HexColor("#B6BDC2")))
    story.append(Spacer(1, 4))


def role(title, dates, location, bullets):
    row = Table([[Paragraph(f"<b>{title}</b>", small), Paragraph(dates, muted)]], colWidths=[355, 135])
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    block = [row, Paragraph(location, muted)]
    for bullet in bullets:
        block.append(Paragraph("-  " + bullet, small))
    block.append(Spacer(1, 10))
    story.append(KeepTogether(block))


section("Education")
role(data["university"] + " — " + data["degree"], data["graduation"],
     "Minors: " + data["minors"], [])
section("Relevant experience")
for item in data["cv"]["experience"]:
    role(item["role"] + ", " + item["organization"], item["dates"], item["location"], item["bullets"])
section("Selected achievements")
for item in data["cv"]["achievements"]:
    story.append(Paragraph("-  " + item, small))
section("Tools and languages")
story.append(Paragraph("<b>Tools &amp; methods:</b> " + data["cv"]["tools"], small))
story.append(Paragraph("<b>Languages:</b> " + data["cv"]["languages"], small))

doc = SimpleDocTemplate(str(out), pagesize=letter, leftMargin=59, rightMargin=59,
                        topMargin=45, bottomMargin=43, title="Ilian Aigner — CV",
                        author="Ilian Aigner", subject="B2B sales internship résumé")
def white_page(canvas, _doc):
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, letter[0], letter[1], stroke=0, fill=1)
    canvas.restoreState()


doc.build(story, onFirstPage=white_page, onLaterPages=white_page)
print(out)
