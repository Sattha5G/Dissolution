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

### GitHub Actions (recommended for Mac builds)

The macOS app is built in CI instead of locally, via [.github/workflows/build-macos.yml](.github/workflows/build-macos.yml):

- Go to the repo's **Actions** tab → **Build macOS App** → **Run workflow**, or push a tag matching `v*` (e.g. `v1.2.0`).
- The workflow runs on an Intel (`macos-15-intel`) runner, since the bundled binaries in `resources/bin/mac` are x86_64.
- Once the run finishes, download the built app from the **Artifacts** section of the run (`dissolution-macos.zip`).

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

