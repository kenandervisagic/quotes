import textwrap


def adjust_text_for_image(text, max_width=20, font=None, draw=None):
    lines = []

    # Step 1: Split manually where \n is present
    paragraphs = text.split('\\n')  # Split at literal \n
    paragraphs = [paragraph for paragraph in paragraphs if paragraph]

    for paragraph in paragraphs:
        # Step 2: Now wrap each paragraph separately
        wrapped_lines = textwrap.wrap(paragraph, width=max_width)
        for line in wrapped_lines:
            original_line = line
            while True:
                bbox = draw.textbbox((0, 0), line, font=font)
                if bbox[2] - bbox[0] <= max_width:
                    break
                line = line[:-1]  # Shrink until it fits
            lines.append(original_line)
    return lines
