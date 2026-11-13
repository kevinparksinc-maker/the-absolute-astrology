import os
import zipfile
import sys

def create_zip(source_dir, output_zip_path):
    exclude_dirs = {"node_modules", "dist", ".git", ".manus-logs", "__pycache__"}
    exclude_files = {".DS_Store", "the-absolute-astrology.zip"}

    print(f"Creating zip archive at: {output_zip_path}")
    file_count = 0

    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".cache")]

            for file in files:
                if file in exclude_files or file.endswith(".zip"):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                zipf.write(full_path, rel_path)
                file_count += 1

    size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    print(f"Successfully zipped {file_count} files ({size_mb:.2f} MB)")

if __name__ == "__main__":
    app_root = "/app/applet"
    public_target = os.path.join(app_root, "client", "public", "the-absolute-astrology.zip")
    root_target = os.path.join(app_root, "the-absolute-astrology.zip")

    os.makedirs(os.path.dirname(public_target), exist_ok=True)
    create_zip(app_root, public_target)

    # Copy to root as well
    import shutil
    shutil.copy2(public_target, root_target)
    print(f"Copied zip to root target: {root_target}")
