/**
 * Masaram Gondi Transliterator Engine
 * Based on Keyman keyboard by Rajesh Kumar Dhuriya
 * Converts ITRANS/Roman to Masaram Gondi script (U+11D00–U+11D5F)
 * 
 * @author Rajesh Kumar Dhuriya
 * @version 2.0.0
 * @license MIT
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // UNICODE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════

    const MARKS = {
        halanta: '𑵄',        // U+11D44 - Final consonant marker
        virama: '𑵅',         // U+11D45 - Conjunct marker
        anusvara: '𑵀',       // U+11D40 - Nasalization
        visarga: '𑵁',        // U+11D41 - Aspiration
        sukun: '𑵂',          // U+11D42 - Nukta variant
        chandrabindu: '𑵃',   // U+11D43 - Chandrabindu
        repha: '𑵆',          // U+11D46 - R before consonant
        rakar: '𑵇',          // U+11D47 - R after consonant
    };

    // Independent Vowels (U+11D00–U+11D0B)
    const INDEPENDENT_VOWELS = {
        'a': '𑴀',
        'aa': '𑴁', 'A': '𑴁', 'ā': '𑴁',
        'i': '𑴂',
        'ii': '𑴃', 'I': '𑴃', 'ī': '𑴃', 'ee': '𑴃',
        'u': '𑴄',
        'uu': '𑴅', 'U': '𑴅', 'ū': '𑴅', 'oo': '𑴅',
        'e': '𑴆', 'E': '𑴆', 'ē': '𑴆',
        'ai': '𑴈', 'aI': '𑴈',
        'o': '𑴉', 'O': '𑴉', 'ō': '𑴉',
        'au': '𑴋', 'aU': '𑴋',
    };

    // Vowel Signs/Matras (U+11D31–U+11D3F)
    const VOWEL_SIGNS = {
        'aa': '𑴱', 'A': '𑴱', 'ā': '𑴱',
        'i': '𑴲',
        'ii': '𑴳', 'I': '𑴳', 'ī': '𑴳', 'ee': '𑴳',
        'u': '𑴴',
        'uu': '𑴵', 'U': '𑴵', 'ū': '𑴵', 'oo': '𑴵',
        'e': '𑴺', 'ē': '𑴺',
        'ai': '𑴼', 'aI': '𑴼', 'ei': '𑴼',
        'o': '𑴽', 'ō': '𑴽',
        'au': '𑴿', 'aU': '𑴿', 'ou': '𑴿',
        'R': '𑴶', 'ṛ': '𑴶', 'ri': '𑴶',
    };

    // Consonants (U+11D0C–U+11D2E)
    const CONSONANTS = {
        // Velars
        'k': '𑴌', 'K': '𑴍', 'kh': '𑴍',
        'g': '𑴎', 'G': '𑴏', 'gh': '𑴏',
        'F': '𑴐', 'ng': '𑴐', 'ṅ': '𑴐',

        // Palatals
        'c': '𑴑', 'ch': '𑴑',
        'C': '𑴒', 'chh': '𑴒', 'Ch': '𑴒',
        'j': '𑴓', 'J': '𑴔', 'jh': '𑴔',
        'Y': '𑴕', 'ny': '𑴕', 'ñ': '𑴕',

        // Retroflexes
        'T': '𑴖', 'ṭ': '𑴖',
        'Th': '𑴗', 'ṭh': '𑴗',
        'D': '𑴘', 'ḍ': '𑴘',
        'Dh': '𑴙', 'ḍh': '𑴙',
        'N': '𑴚', 'ṇ': '𑴚',

        // Dentals
        't': '𑴛', 'th': '𑴜',
        'd': '𑴝', 'dh': '𑴞',
        'n': '𑴟',

        // Labials
        'p': '𑴠', 'P': '𑴡', 'ph': '𑴡',
        'b': '𑴢', 'B': '𑴣', 'bh': '𑴣',
        'm': '𑴤',

        // Semivowels
        'y': '𑴥',
        'r': '𑴦',
        'l': '𑴧', 'L': '𑴭',
        'v': '𑴨', 'w': '𑴨', 'W': '𑴨',

        // Sibilants
        'sh': '𑴩', 'ś': '𑴩',
        'S': '𑴪', 'ss': '𑴪', 'ṣ': '𑴪', 'Sh': '𑴪',
        's': '𑴫',
        'h': '𑴬',

        // Special ligatures
        'x': '𑴮',  // ksha
        'X': '𑴯',  // gya
        'Z': '𑴰',  // tra
    };

    // Nukta Consonants
    const NUKTA_CONSONANTS = {
        'q': '𑴌' + MARKS.sukun,
        'z': '𑴓' + MARKS.sukun,
        'f': '𑴡' + MARKS.sukun,
    };

    // Numbers (U+11D50–U+11D59)
    const NUMBERS = {
        '0': '𑵐', '1': '𑵑', '2': '𑵒', '3': '𑵓', '4': '𑵔',
        '5': '𑵕', '6': '𑵖', '7': '𑵗', '8': '𑵘', '9': '𑵙',
    };

    const VOWEL_CHARS = 'aāiīuūeēoōAIUEO';

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    function isVowel(c) {
        return VOWEL_CHARS.includes(c);
    }

    function isConsonantStart(word, pos) {
        if (pos >= word.length) return false;

        for (let len = 3; len >= 1; len--) {
            if (pos + len <= word.length) {
                const substr = word.substring(pos, pos + len);
                if (CONSONANTS[substr] || NUKTA_CONSONANTS[substr]) {
                    return true;
                }
            }
        }
        return false;
    }

    function isRepha(word, pos) {
        if (pos >= word.length || word[pos] !== 'r') return false;
        const nextPos = pos + 1;
        return nextPos < word.length && isConsonantStart(word, nextPos);
    }

    function matchConsonant(word, start) {
        // Try nukta consonants first
        for (let len = 2; len >= 1; len--) {
            if (start + len <= word.length) {
                const substr = word.substring(start, start + len);
                if (NUKTA_CONSONANTS[substr]) {
                    return [NUKTA_CONSONANTS[substr], len];
                }
            }
        }

        // Try regular consonants
        for (let len = 3; len >= 1; len--) {
            if (start + len <= word.length) {
                const substr = word.substring(start, start + len);
                if (CONSONANTS[substr]) {
                    return [CONSONANTS[substr], len];
                }
            }
        }
        return [null, 0];
    }

    function matchVowelSign(word, start) {
        for (let len = 3; len >= 1; len--) {
            if (start + len <= word.length) {
                const substr = word.substring(start, start + len);
                if (VOWEL_SIGNS[substr]) {
                    return [VOWEL_SIGNS[substr], len];
                }
            }
        }
        return [null, 0];
    }

    function matchIndependentVowel(word, start) {
        for (let len = 3; len >= 1; len--) {
            if (start + len <= word.length) {
                const substr = word.substring(start, start + len);
                if (INDEPENDENT_VOWELS[substr]) {
                    return [INDEPENDENT_VOWELS[substr], len];
                }
            }
        }
        return [null, 0];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN TRANSLITERATION ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    function transliterateWord(word) {
        if (!word) return '';

        let buffer = '';
        let i = 0;
        let hasConsonant = false;
        let hasVowel = false;

        while (i < word.length) {
            const char = word[i];

            // ─────────────────────────────────────────────────────────────────────
            // NUMBERS
            // ─────────────────────────────────────────────────────────────────────
            if (NUMBERS[char]) {
                if (hasConsonant && !hasVowel) {
                    buffer += MARKS.halanta;
                }
                buffer += NUMBERS[char];
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // PUNCTUATION
            // ─────────────────────────────────────────────────────────────────────
            if (char === '.') {
                if (hasConsonant && !hasVowel) {
                    buffer += MARKS.halanta;
                }

                let dotCount = 1;
                while (i + dotCount < word.length && word[i + dotCount] === '.') {
                    dotCount++;
                }

                if (dotCount >= 3) {
                    buffer += '॥';
                    i += 3;
                } else if (dotCount >= 2) {
                    buffer += '।';
                    i += 2;
                } else {
                    buffer += '।';
                    i++;
                }

                hasConsonant = false;
                hasVowel = false;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // ANUSVARA
            // ─────────────────────────────────────────────────────────────────────
            if (char === 'M' && hasVowel) {
                buffer += MARKS.anusvara;
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            if (char === 'ṃ' || char === 'ṁ') {
                buffer += MARKS.anusvara;
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // VISARGA
            // ─────────────────────────────────────────────────────────────────────
            if (char === 'H' && hasVowel) {
                buffer += MARKS.visarga;
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            if (char === 'ḥ') {
                buffer += MARKS.visarga;
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // REPHA: 'r' after vowel, before consonant
            // ─────────────────────────────────────────────────────────────────────
            if (char === 'r' && hasVowel && isRepha(word, i)) {
                buffer += MARKS.repha;
                hasConsonant = false;
                hasVowel = false;
                i++;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // RAKAR: 'r' after consonant, before vowel
            // ─────────────────────────────────────────────────────────────────────
            if (char === 'r' && hasConsonant && !hasVowel) {
                const nextPos = i + 1;

                if (nextPos < word.length) {
                    const next = word[nextPos];

                    // Handle 'ra' and its variants
                    if (next === 'a') {
                        const afterA = nextPos + 1;
                        if (afterA < word.length) {
                            const afterAChar = word[afterA];
                            if (afterAChar === 'a' || afterAChar === 'A') {
                                buffer += MARKS.rakar + '𑴱';
                                i = afterA + 1;
                                hasVowel = true;
                                continue;
                            } else if (afterAChar === 'i' || afterAChar === 'I') {
                                buffer += MARKS.rakar + '𑴼';
                                i = afterA + 1;
                                hasVowel = true;
                                continue;
                            } else if (afterAChar === 'u' || afterAChar === 'U') {
                                buffer += MARKS.rakar + '𑴿';
                                i = afterA + 1;
                                hasVowel = true;
                                continue;
                            }
                        }
                        buffer += MARKS.rakar;
                        i = nextPos + 1;
                        hasVowel = true;
                        continue;
                    }

                    // Try matching vowel sign
                    const [vowelSign, vowelLen] = matchVowelSign(word, nextPos);
                    if (vowelSign) {
                        buffer += MARKS.rakar + vowelSign;
                        i = nextPos + vowelLen;
                        hasVowel = true;
                        continue;
                    }

                    // If followed by consonant, it's a conjunct
                    if (isConsonantStart(word, nextPos)) {
                        buffer += MARKS.virama + '𑴦';
                        hasConsonant = true;
                        hasVowel = false;
                        i++;
                        continue;
                    }
                }

                // 'r' at end
                buffer += MARKS.rakar;
                hasVowel = true;
                i++;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // CONSONANTS
            // ─────────────────────────────────────────────────────────────────────
            const [consonant, consonantLen] = matchConsonant(word, i);
            if (consonant) {
                if (hasConsonant && !hasVowel) {
                    buffer += MARKS.virama;
                }

                buffer += consonant;
                i += consonantLen;
                hasConsonant = true;
                hasVowel = false;

                // Check for following vowel
                if (i < word.length) {
                    if (word[i] === 'a') {
                        const nextPos = i + 1;
                        if (nextPos < word.length) {
                            const next = word[nextPos];
                            if (next === 'a' || next === 'A') {
                                buffer += '𑴱';
                                i = nextPos + 1;
                                hasVowel = true;
                                continue;
                            } else if (next === 'i' || next === 'I') {
                                buffer += '𑴼';
                                i = nextPos + 1;
                                hasVowel = true;
                                continue;
                            } else if (next === 'u' || next === 'U') {
                                buffer += '𑴿';
                                i = nextPos + 1;
                                hasVowel = true;
                                continue;
                            } else if (next === 'e') {
                                buffer += '𑵃';
                                i = nextPos + 1;
                                hasVowel = true;
                                continue;
                            }
                        }
                        i++;
                        hasVowel = true;
                        continue;
                    }

                    const [vowelSign, vowelLen] = matchVowelSign(word, i);
                    if (vowelSign) {
                        buffer += vowelSign;
                        i += vowelLen;
                        hasVowel = true;
                        continue;
                    }
                }
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // INDEPENDENT VOWELS
            // ─────────────────────────────────────────────────────────────────────
            if (!hasConsonant || hasVowel) {
                const [vowel, vowelLen] = matchIndependentVowel(word, i);
                if (vowel) {
                    if (hasConsonant && !hasVowel) {
                        buffer += MARKS.halanta;
                    }
                    buffer += vowel;
                    i += vowelLen;
                    hasConsonant = false;
                    hasVowel = true;
                    continue;
                }
            }

            // ─────────────────────────────────────────────────────────────────────
            // CHANDRABINDU
            // ─────────────────────────────────────────────────────────────────────
            if (i + 1 < word.length && word.substring(i, i + 2) === 'MM') {
                buffer += MARKS.chandrabindu;
                i += 2;
                continue;
            }

            // ─────────────────────────────────────────────────────────────────────
            // UNMATCHED
            // ─────────────────────────────────────────────────────────────────────
            if (hasConsonant && !hasVowel) {
                buffer += MARKS.halanta;
            }
            buffer += char;
            hasConsonant = false;
            hasVowel = false;
            i++;
        }

        // Handle final state
        if (hasConsonant && !hasVowel) {
            buffer += MARKS.halanta;
        }

        return buffer;
    }

    /**
     * Main transliteration function
     * @param {string} input - ITRANS/Roman text
     * @returns {string} - Gondi script output
     */
    function transliterate(input) {
        if (!input) return '';

        // Split by whitespace but preserve spaces
        const parts = input.split(/(\s+)/);
        return parts.map(part => {
            if (part.trim() === '') return part;
            return transliterateWord(part);
        }).join('');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UI FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize the transliterator
     */
    function init() {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');

        if (inputText && outputText) {
            inputText.addEventListener('input', function () {
                outputText.value = transliterate(this.value);
            });

            // Auto-focus input on page load
            inputText.focus();
        }
    }

    /**
     * Insert text at cursor position
     */
    window.insertChar = function (char) {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');

        const start = inputText.selectionStart;
        const end = inputText.selectionEnd;
        const text = inputText.value;

        inputText.value = text.substring(0, start) + char + text.substring(end);
        inputText.selectionStart = inputText.selectionEnd = start + char.length;
        inputText.focus();

        outputText.value = transliterate(inputText.value);
    };

    /**
     * Insert sample text
     */
    window.insertSample = function (sample) {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');

        inputText.value = sample;
        outputText.value = transliterate(sample);
        inputText.focus();
    };

    /**
     * Backspace function
     */
    window.backspace = function () {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');

        const start = inputText.selectionStart;
        const text = inputText.value;

        if (start > 0) {
            inputText.value = text.substring(0, start - 1) + text.substring(start);
            inputText.selectionStart = inputText.selectionEnd = start - 1;
        }
        inputText.focus();

        outputText.value = transliterate(inputText.value);
    };

    /**
     * Copy output to clipboard
     */
    window.copyOutput = function () {
        const outputText = document.getElementById('outputText');

        if (!outputText.value) {
            alert('Nothing to copy! Please type something first.');
            return;
        }

        outputText.select();
        document.execCommand('copy');

        // Show toast notification
        const toastEl = document.getElementById('copyToast');
        if (toastEl) {
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }

        // Visual feedback on button
        const btn = document.querySelector('.copy-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Copied!';
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 2000);
        }
    };

    /**
     * Clear all text
     */
    window.clearAll = function () {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');

        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    };

    /**
     * Download text as file
     */
    window.downloadText = function () {
        const outputText = document.getElementById('outputText');
        const text = outputText.value;

        if (!text) {
            alert('Nothing to download! Please type something first.');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gondi-text-' + Date.now() + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT & INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    // Export for use in other modules
    window.GondiTransliterator = {
        transliterate: transliterate,
        version: '2.0.0'
    };

    // Expose transliterate function globally for backward compatibility
    window.transliterate = transliterate;

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();