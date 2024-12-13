import os
from typing import List 

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate if a file has an allowed extension.
    """
    return filename.split('.')[-1].lower() in allowed_extensions

def delete_file_if_exists(file_path: str):
    """
    Delete a file from the filesystem if it exists.
    """
    if os.path.exists(file_path):
        os.remove(file_path)
