# Dissolution

Dissolution is an all-in-one application that helps you learn languages from the games you play.

## Platforms
- Windows 10
- Mac OSX Mojave, Catalina

## Text Extraction Modes
- Classic OCR with Tesseract, Tesseract Legacy, or OCR Space.
- OCR-assisted game script matching using scripts placed in the *gamescripts* folder.
- Text hooking for Visual Novels
- Clipboard to Dissolution

## Features
- Dictionary lookup with browser dictionaries like Yomichan and Rikaichan
- Translation tools including DeepL and Google Translate.

## Language Support

- **OCR**: Japanese and English trained data are bundled. Switch languages in **Settings → OCR Language**. To add more languages, drop extra Tesseract `.traineddata` files (e.g. `tha.traineddata` from [tessdata_best](https://github.com/tesseract-ocr/tessdata_best)) into the tessdata folder (`resources/bin/mac/tesseract/4.1.1/share/tessdata` on Mac, `resources/bin/win/tesseract/tessdata` on Windows) — they will appear in the dropdown automatically.
- **Translation**: pick source and target languages in **Settings → Translation** from a searchable dropdown (e.g. source `English`, target `Thai`). Google Translate supports the widest range of languages including Thai; DeepL supports a more limited set.
- Defaults are Japanese → English.

## Development

Install Python 3.11 (recommended via [pyenv](https://github.com/pyenv/pyenv)), create a venv, and activate it.

```bash
pyenv install 3.11.9
~/.pyenv/versions/3.11.9/bin/python3.11 -m venv venv
source venv/bin/activate
```

Install requirements:

```bash
pip install -r requirements.txt
python dissolution.py
```

## Extra Packages for macOS Development

`tkinter` (used for file pickers) requires Tcl/Tk 8.6. Homebrew's default `tcl-tk` formula is 9.0, which Python 3.11 cannot build against, so install the 8.x formula **before** installing Python with pyenv:

```bash
brew install tcl-tk@8
pyenv install 3.11.9
```

`python-build` automatically prefers `tcl-tk@8` over `tcl-tk` when both are present. If Python was already installed before `tcl-tk@8`, reinstall it: `pyenv uninstall 3.11.9 && pyenv install 3.11.9`.

## Extra Packages for Windows Development

Install [C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

## Extra Packages for Linux Development

Install Tesseract by following the installation instructions [here](https://tesseract-ocr.github.io/tessdoc/Home.html).

## Run tests

```
python -m unittest
```

## Distribution

Releases are built and published entirely in CI via [.github/workflows/release.yml](.github/workflows/release.yml) — no local build needed.

```sh
sh release.sh
```

This reads the version from [VERSION](VERSION), asks for confirmation, then triggers `release.yml`, which:

1. **create-release** — creates a draft GitHub Release tagged `v<VERSION>` (skipped if it already exists).
2. **build-mac** (Intel `macos-15-intel` runner, since `resources/bin/mac` binaries are x86_64) — builds the app with `build.sh`, packages it into a **DMG** (`Dissolution_<VERSION>_x86_64.dmg`) containing `Dissolution.app`, a shortcut to `/Applications`, and a **"(Important) Read This First.txt"** notice — then uploads it to the release.
3. **build-windows** — builds the app with `build.bat`, then packages it into an installer with [Inno Setup](https://jrsoftware.org/isinfo.php) using [scripts/windows-installer.iss](scripts/windows-installer.iss) (`Dissolution_<VERSION>_x64_setup.exe` — installs to Program Files, adds Start Menu/Desktop shortcuts, registers an uninstaller, publisher listed as **Sattha5G**) — then uploads it to the release.
4. **publish-release** — flips the release from draft to public once both builds succeed.

Neither build is code-signed (no Apple Developer / Windows code-signing certificate), so first launch shows a security warning on both platforms — macOS: follow the notice inside the DMG (one-time `xattr -cr` fix); Windows: SmartScreen → **More info → Run anyway**.

To bump the version before releasing:

```sh
bash bump-version.sh 1.1.0
```

### Local build

Windows: 

```build.bat```

Mac:

```sh build.sh```

Temporary fix for all read/write operations using *os.path* on Mac builds with pyinstaller: create a wrapper file that runs the Dissolution executable inside the package

## Acknowledgement

#### Tools

|                            Tool                             |           Description            | Version |
| :---------------------------------------------------------: | :------------------------------: | :-----: |
|       [Python Eel](https://github.com/ChrisKnott/Eel)       | Electron-like Library for Python | 0.14.0  |
|   [Tesseract](https://github.com/tesseract-ocr/tesseract)   |             OCR Tool             |  4.1.1  |
| [SudachiPy](https://github.com/WorksApplications/SudachiPy) | Japanese Morphological Analyzer  |  0.5.2  |
|    [Textractor](https://github.com/Artikash/Textractor)     |            Texthooker            | 4.16.1  |
|              [FFmpeg](https://www.ffmpeg.org/)              |         Audio Converter          |   4.4   |



#### Resources

Jun Mako (Game Scripts)

Unboxious (Game Scripts)

