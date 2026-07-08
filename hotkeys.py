import eel
from config import r_config, HOTKEYS_CONFIG

def refresh_ocr_hotkey():
    eel.refreshOCR()

hotkey_map = {
    r_config(HOTKEYS_CONFIG, "refresh_ocr"): refresh_ocr_hotkey
}