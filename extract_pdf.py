import sys

try:
    from pypdf import PdfReader
    print("Found pypdf")
    reader = PdfReader("KUMAR GYANAMChief AI Architect.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print("---EXTRACTED TEXT---")
    print(text)
    sys.exit(0)
except ImportError:
    pass

try:
    import PyPDF2
    print("Found PyPDF2")
    reader = PyPDF2.PdfReader("Kumar-Gyanam-Resume.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print("---EXTRACTED TEXT---")
    print(text)
    sys.exit(0)
except ImportError:
    pass

print("No suitable PDF library found (tried pypdf, PyPDF2).")
