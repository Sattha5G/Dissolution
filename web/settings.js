const APPEARANCE_CONFIG = 'APPEARANCE';
const DICTIONARY_CONFIG = 'DICTIONARYCONFIG';
const OCR_CONFIG = 'OCRCONFIG';
const TRANSLATION_CONFIG = 'TRANSLATIONCONFIG';
const LOG_CONFIG = 'LOGCONFIG';
const TEXTHOOKER_CONFIG = 'TEXTHOOKERCONFIG';
const HOTKEY_CONFIG = '$OS_HOTKEYS';

const OEM_CONFIG = {
    'Tesseract Default': '3',
    'Tesseract LSTM': '1',
    'Tesseract Legacy': '0',
}
let currentConfig = {}
let logImageType = 'jpg';
let logImageQuality = 1.0;

const outputToClipboardSwitch = document.getElementById("output-to-clipboard-mode-switch");
const clipboardModeSwitch = document.getElementById("clipboard-mode-switch");

// OCR Control Elements
const OCREngineSelect = document.getElementById("ocr_engine_select");
const OCRLanguageSelect = document.getElementById("ocr_language_select");
const textOrientationSwitch = document.getElementById("text-orientation-switch");

// Translation Control Elements
const translationSelect = document.getElementById("translation_select");
const sourceLanguageInput = document.getElementById('source_language_input');
const targetLanguageInput = document.getElementById('target_language_input');

// Picture Control Elements
const imageTypeInput = document.getElementById('image_type_input');

// Dictionary Control Elements
const dictionarySelect = document.getElementById('dictionarySelect');
const screenshotMaxWidthInput = document.getElementById('screenshotMaxWidthInput');
const screenshotMaxHeightInput = document.getElementById('screenshotMaxHeightInput');
const resizeScreenshotSwitch = document.getElementById('resizeScreenshotSwitch');

// Texthooker Settings Elements
const removeRepeatSentencesSwitch = document.getElementById('removeRepeatSentencesSwitch');
const textractorPathInput = document.getElementById('textractorPathInput');
const removeRepeatSelect = document.getElementById('removeRepeatSelect');

// Hotkeys
const refreshHotkeyInput = document.getElementById('refreshHotkeyInput');

// Wait for window load so MDL components (sliders, switches, selects) are
// upgraded before initConfig touches them — otherwise a fast eel response
// kills the whole init chain (no dark theme, no engine/language setup).
if (document.readyState === 'complete') {
    initConfig();
} else {
    window.addEventListener('load', initConfig);
}

function initConfig() {
    (async () => {
        const config = await eel.read_config_all()();
        if (config) {
            currentConfig = Object.assign(config);
            // Appearance
            const appearanceConfig = config[APPEARANCE_CONFIG];
            initFontSize(appearanceConfig['fontsize']);
            selectionColor = appearanceConfig['selection_color']
            selectionLineWidth = appearanceConfig['selection_line_width'];
            // OCR
            const ocrConfig = config[OCR_CONFIG];
            initOCREngine(ocrConfig['engine']);
            initOCRLanguage(ocrConfig['tesseract_language']);
            // Translation
            const translationConfig = config[TRANSLATION_CONFIG];
            initTranslation(translationConfig['translation_service'])
            initSetTranslationLanguages({ sourceLang: translationConfig['source_lang'], targetLang: translationConfig['target_lang'] });
            // Logs
            const logConfig = config[LOG_CONFIG];
            initLaunchLogWindow(logConfig['launchlogwindow']);
            initIsLogImages(logConfig['logimages']);
            initImageType(logConfig['logimagetype']);
            initSetImageResize({ isResizeScreenshot: logConfig['resize_screenshot'], screenshotMaxWidth: logConfig['resize_screenshot_max_width'], screenshotMaxHeight: logConfig['resize_screenshot_max_height'] });
            logImageQuality = logConfig['logimagequality'];
            logSessionMaxLogSize = logConfig['lastsessionmaxlogsize'];
            // Dictionary
            const dictionaryConfig = config[DICTIONARY_CONFIG];
            initSetDictionaries(dictionaryConfig['default_dictionary']);
            // Texthooker
            const texthookerConfig = config[TEXTHOOKER_CONFIG];
            // initSetRemoveRepeatedSentencesSwitch(texthookerConfig['remove_repeat_mode']);
            initSetRemoveRepeatedMode(texthookerConfig['remove_repeat_mode']);
            initSetRemoveDuplicateCharactersSwitch(texthookerConfig['remove_duplicates']);
            initSetRemoveWhiteSpacesSwitch(texthookerConfig['remove_spaces']);
            initSetTextractorPath();
            // Hotkeys
            const hotkeyConfig = config[HOTKEY_CONFIG];
            initHotkeys({
                refreshHotkey: hotkeyConfig['refresh_ocr'],
            });
        }
    })()
}

function initFontSize(fontSize) {
    updateFontSize(fontSize);
    const fontSizeSlider = document.getElementById("font-size-slider");
    fontSizeSlider.value = fontSize;
}

function initOCREngine(engine) {
    if (engine) {
        OCREngine = engine;
        const validOption = Array.from(OCREngineSelect.options).find(option => option.value === engine);
        OCREngineSelect.value = validOption ? engine : "Tesseract Default";
    }
}

async function initOCRLanguage(currentLanguage) {
    try {
        const languages = await eel.get_ocr_languages()();
        OCRLanguageSelect.innerHTML = '';
        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.innerText = language.name;
            if (language.code === currentLanguage) {
                option.selected = true;
            }
            OCRLanguageSelect.append(option);
        });
    } catch (error) {
        console.error('Failed to load OCR languages', error);
    }
}

function updateOCRLanguageAndPersist() {
    const selectedCode = OCRLanguageSelect.value;
    if (selectedCode && currentConfig[OCR_CONFIG]['tesseract_language'] !== selectedCode) {
        currentConfig[OCR_CONFIG]['tesseract_language'] = selectedCode;
        eel.update_config(OCR_CONFIG, { 'tesseract_language': selectedCode, 'ocr_space_language': selectedCode })();
        refreshOCR();
    }
}

/*
 *
 Translation Settings 
 *
*/

function initTranslation(service) {
    if (service) {
        translationService = service;
        const validOption = Array.from(translationSelect.options).find(option => option.value === service);
        translationSelect.value = validOption ? service : "DeepL Translate";
    }
}

// Language catalog for translation (Google Translate codes)
const TRANSLATION_LANGUAGES = [
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'tl', name: 'Filipino' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'iw', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'km', name: 'Khmer' },
    { code: 'ko', name: 'Korean' },
    { code: 'lo', name: 'Lao' },
    { code: 'ms', name: 'Malay' },
    { code: 'my', name: 'Myanmar (Burmese)' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'vi', name: 'Vietnamese' },
];

function populateLanguageDatalists() {
    const sourceOptions = document.getElementById('source_language_options');
    const targetOptions = document.getElementById('target_language_options');
    const addOption = (list, name, code) => {
        const option = document.createElement('option');
        option.value = name;
        option.label = code;
        list.append(option);
    };
    addOption(sourceOptions, 'Auto Detect', 'auto');
    TRANSLATION_LANGUAGES.forEach(language => {
        addOption(sourceOptions, language.name, language.code);
        addOption(targetOptions, language.name, language.code);
    });
}
populateLanguageDatalists();

// Accepts a language name ("Thai") or code ("th"); returns the code or null
function languageCodeFromInput(value, allowAuto) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
        return null;
    }
    if (allowAuto && (trimmed === 'auto' || trimmed === 'auto detect')) {
        return 'auto';
    }
    const match = TRANSLATION_LANGUAGES.find(language =>
        language.name.toLowerCase() === trimmed || language.code.toLowerCase() === trimmed);
    return match ? match.code : null;
}

function languageNameFromCode(code) {
    if (!code) {
        return '';
    }
    if (code === 'auto') {
        return 'Auto Detect';
    }
    const match = TRANSLATION_LANGUAGES.find(language => language.code.toLowerCase() === code.toLowerCase());
    return match ? match.name : code;
}

function initSetTranslationLanguages({ sourceLang, targetLang }) {
    sourceLanguage = sourceLang;
    sourceLanguageInput.value = languageNameFromCode(sourceLang);

    targetLanguage = targetLang;
    targetLanguageInput.value = languageNameFromCode(targetLang);
}

function updateTranslationServiceAndPersist() {
    translationService = translationSelect.value;
    if (currentConfig[TRANSLATION_CONFIG]['translation_service'] !== translationService) {
        eel.update_config(TRANSLATION_CONFIG, { 'translation_service': translationService })();
    }
}

function changeSourceLanguage() {
    const translationConfig = currentConfig[TRANSLATION_CONFIG] || {};
    const code = languageCodeFromInput(sourceLanguageInput.value, true);
    if (code) {
        sourceLanguage = code;
        translationConfig['source_lang'] = code;
        eel.update_config(TRANSLATION_CONFIG, { 'source_lang': code })();
    }
    // Normalize the display (or revert it if the input wasn't a known language)
    sourceLanguageInput.value = languageNameFromCode(translationConfig['source_lang']);
}

function changeTargetLanguage() {
    const translationConfig = currentConfig[TRANSLATION_CONFIG] || {};
    const code = languageCodeFromInput(targetLanguageInput.value, false);
    if (code) {
        targetLanguage = code;
        translationConfig['target_lang'] = code;
        eel.update_config(TRANSLATION_CONFIG, { 'target_lang': code })();
    }
    targetLanguageInput.value = languageNameFromCode(translationConfig['target_lang']);
}

/*
 *
 Media Settings 
 *
*/

function initLaunchLogWindow(isLaunchLogWindow) {
    if (isLaunchLogWindow === 'true') {
        eel.open_new_window('logs.html');
    }
}

function initIsLogImages(isLogImages) {
    if (isLogImages === 'true') {
        toggleLogImages();
        document.getElementById("log-images-switch").checked = true;
    }
}

function initImageType(imageType) {
    logImageType = imageType;
    imageTypeInput.value = imageType;
}

function changeImageType() {
    if (imageTypeInput.value) {
        logImageType = imageTypeInput.value;
        eel.update_config(LOG_CONFIG, { 'logimagetype': imageTypeInput.value })();
    }
}


/*
 *
 Appearance Settings 
 *
*/
function updateFontSize(slideAmount) {
    results.style.fontSize = slideAmount + 'px';
    results.style.lineHeight = (slideAmount * 1.5) + 'px';
}
function updateFontSizeAndPersist(slideAmount) {
    updateFontSize(slideAmount);
    eel.update_config(APPEARANCE_CONFIG, { 'fontsize': slideAmount })();
}
/*
 *
 OCR Settings 
 *
*/
function updateOCREngine() {
    OCREngine = OCREngineSelect.value;
    if (OCREngine.includes('Tesseract')) {
        // Enable Tesseract Features
        textOrientationSwitch.disabled = false;
        textOrientationSwitch.parentNode.classList.remove("is-disabled");
    } else {
        // Incompatible Tesseract text recognition features
        textOrientationSwitch.disabled = true;
        textOrientationSwitch.parentNode.classList.add("is-disabled");
    }
    refreshOCR();
    return OCREngine;
}

function updateOCREngineAndPersist() {
    const OCREngine = updateOCREngine();
    if (currentConfig[OCR_CONFIG]['engine'] !== OCREngine) {
        eel.update_config(OCR_CONFIG, { 'engine': OCREngine })();
        if (OCREngine.includes('Tesseract')) {
            eel.update_config(OCR_CONFIG, { 'oem': OEM_CONFIG[OCREngine] })();
        }
    }
}

function toggleTextOrientation() {
    verticalText = !verticalText;
    refreshOCR();
}

/*
 *
 Clipboard Settings 
 *
*/
function toggleClipboardMode() {
    eel.monitor_clipboard();
    clipboardMode = !clipboardMode;
    if (clipboardMode) {
        // Incompatible modes
        outputToClipboardSwitch.disabled = true;
        outputToClipboardSwitch.parentNode.classList.add("is-disabled");
        // Disable OCR
        refreshButton.disabled = true;
        autoModeButton.disabled = true;
        ctx.clearRect(0, 0, cv1.width, cv1.height); // clear canvas
    } else {
        outputToClipboardSwitch.disabled = false;
        outputToClipboardSwitch.parentNode.classList.remove("is-disabled");
        refreshButton.disabled = false;
        autoModeButton.disabled = false;
    }
}

function toggleOutputToClipboard() {
    outputToClipboard = !outputToClipboard;
    // Incompatiable Modes
    if (outputToClipboard) {
        clipboardModeSwitch.disabled = true;
        clipboardModeSwitch.parentNode.classList.add("is-disabled");
    } else {
        clipboardModeSwitch.disabled = false;
        clipboardModeSwitch.parentNode.classList.remove("is-disabled");
    }
}

/*
 *
 Logs Settings 
 *
*/
function toggleLogImages() {
    logImages = !logImages;
    return logImages;
}
function toggleLogImagesAndPersist() {
    isLogImages = toggleLogImages();
    eel.update_config(LOG_CONFIG, { 'logimages': isLogImages ? 'true' : 'false' })();
}

function toggleResizeScreenshotSwitch() {
    isResizeScreenshot = !isResizeScreenshot;
    screenshotMaxWidthInput.disabled = !isResizeScreenshot;
    screenshotMaxHeightInput.disabled = !isResizeScreenshot;
}
async function toggleResizeScreenshotSwitchAndPersist() {
    toggleResizeScreenshotSwitch();
    eel.update_config(LOG_CONFIG, { 'resize_screenshot': isResizeScreenshot ? 'true' : 'false' })();
}
function initSetImageResize({ isResizeScreenshot, screenshotMaxWidth, screenshotMaxHeight }) {
    if (isResizeScreenshot === 'true') {
        toggleResizeScreenshotSwitch();
        resizeScreenshotSwitch.checked = true;
    }
    resizeScreenshotMaxWidth = parseInt(screenshotMaxWidth, 10);
    resizeScreenshotMaxHeight = parseInt(screenshotMaxHeight, 10);
    screenshotMaxWidthInput.value = screenshotMaxWidth;
    screenshotMaxHeightInput.value = screenshotMaxHeight;
}
function changeScreenshotMaxWidth(input) {
    resizeScreenshotMaxWidth = parseInt(input.value, 10);
    eel.update_config(LOG_CONFIG, { 'resize_screenshot_max_width': input.value })();
}
function changeScreenshotMaxHeight(input) {
    resizeScreenshotMaxHeight = parseInt(input.value, 10);
    eel.update_config(LOG_CONFIG, { 'resize_screenshot_max_height': input.value })();
}
function openFolder(relative_path) {
    eel.open_folder_by_relative_path(relative_path);
}

/*
 *
 Dictionary Settings
 *
*/
async function initSetDictionaries(defaultDictionary) {
    const dictionaries = await eel.get_dictionaries()();
    dictionaries.forEach(dictionary => {
        const dictionaryOption = document.createElement('option');
        dictionaryOption.value = dictionary;
        dictionaryOption.innerHTML = dictionary;
        if (dictionary === defaultDictionary) {
            dictionaryOption.selected = true;
        }
        dictionarySelect.add(dictionaryOption);
    })
}

async function selectDictionary() {
    if (dictionarySelect.value) {
        eel.set_dictionary(dictionarySelect.value)();
        eel.update_config(DICTIONARY_CONFIG, { 'default_dictionary': dictionarySelect.value });
    }
}

/**
 * 
 * Texthooker
 */
function initSetRemoveRepeatedMode(removeRepeatedMode) {
    if (removeRepeatedMode) {
        const removeRepeatOptions = removeRepeatSelect.querySelectorAll("option");
        const removeRepeatOption = Array.from(removeRepeatOptions).find(child => child.innerText.toLowerCase() === removeRepeatedMode.toLowerCase());
        if (removeRepeatOption) {
            removeRepeatOption.setAttribute('selected', true);
        } else {
            // Fallback to quick
            const defaultOption = Array.from(removeRepeatOptions).find(child => child.innerText.toLowerCase() == "quick")
            defaultOption.setAttribute('selected', true);
        }
    }
}
function updateRemoveRepeatedModeAndPersist() {
    const removeRepeatedMode = removeRepeatSelect.value.toLowerCase();
    if (currentConfig[TEXTHOOKER_CONFIG]['remove_repeat_mode'] !== removeRepeatedMode) {
        eel.update_config(TEXTHOOKER_CONFIG, { 'remove_repeat_mode': removeRepeatedMode })();
    }
}
function toggleRemoveDuplicateCharacters() {
    isRemoveDuplicateCharacters = !isRemoveDuplicateCharacters;
}
function toggleRemoveDuplicateCharactersAndPersist() {
    toggleRemoveDuplicateCharacters();
    eel.update_config(TEXTHOOKER_CONFIG, { 'remove_duplicates': isRemoveDuplicateCharacters ? 'true' : 'false' })();

}
function initSetRemoveDuplicateCharactersSwitch(isRemoveDuplicateCharacters) {
    if (isRemoveDuplicateCharacters === 'true') {
        toggleRemoveDuplicateCharacters();
        document.getElementById("removeDuplicateCharactersSwitch").checked = true;
    }
}
function toggleRemoveWhiteSpaces() {
    isRemoveWhiteSpaces = !isRemoveWhiteSpaces;
}
async function toggleRemoveWhiteSpacesAndPersist() {
    toggleRemoveWhiteSpaces();
    eel.update_config(TEXTHOOKER_CONFIG, { 'remove_spaces': isRemoveWhiteSpaces ? 'true' : 'false' })();
}
function initSetRemoveWhiteSpacesSwitch(isRemoveWhiteSpaces) {
    if (isRemoveWhiteSpaces === 'true') {
        toggleRemoveWhiteSpaces();
        document.getElementById("removeWhiteSpacesSwitch").checked = true;
    }
}

async function initSetTextractorPath() {
    const textractorPath = await eel.get_path_to_textractor()();
    textractorPathInput.value = textractorPath;
}

async function changeTextractorExecutablePath() {
    const path = await eel.open_folder_for_textractor()();
    if (path) {
        textractorPathInput.value = path;
    }
}

/**
 * 
 * Hotkeys
 */
function initHotkeys({ refreshHotkey }) {
    refreshHotkeyInput.value = refreshHotkey;
}

function changeRefreshHotkey(input) {
    eel.update_config(HOTKEY_CONFIG, { 'refresh_ocr': input.value })();
}
