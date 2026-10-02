#!/usr/bin/env python3
"""
optimize_assets.py — 长安云阙 美术资源优化小工具

把仓库根 assets/ 下的高清母版，压缩为小程序包内运行时副本（JPG）。
用法:
    python3 scripts/optimize_assets.py <src> <dst> [maxWidth] [quality]

默认 maxWidth=1400, quality=82。
约定见 docs/frontend-art-spec.md。
"""
import sys
from pathlib import Path
from PIL import Image

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def optimize(src: Path, dst: Path, max_width: int = 1400, quality: int = 82) -> int:
    if src.suffix.lower() not in ALLOWED_EXT:
        raise ValueError(f"不支持的图片类型: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)

    im = Image.open(src)
    # 处理 EXIF 旋转
    try:
        from PIL import ImageOps

        im = ImageOps.exif_transpose(im)
    except Exception:
        pass

    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (244, 236, 221))  # ivory
        rgba = im.convert("RGBA")
        bg.paste(rgba, mask=rgba.split()[-1])
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")

    w, h = im.size
    if w > max_width:
        nh = round(h * max_width / w)
        im = im.resize((max_width, nh), Image.LANCZOS)

    out = dst.with_suffix(".jpg")
    im.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.stat().st_size


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    max_width = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
    quality = int(sys.argv[4]) if len(sys.argv) > 4 else 82
    size = optimize(src, dst, max_width, quality)
    print(f"OK {dst.with_suffix('.jpg')}  {size/1024:.1f} KB")


if __name__ == "__main__":
    main()
