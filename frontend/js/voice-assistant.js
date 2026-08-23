/**
 * Smart Agriculture Assistant
 * Voice Assistant - Google Cloud Speech Integration
 */

// ============================================
// Voice Assistant State
// ============================================

let isListening = false;
let recognition = null;
let synthesis = window.speechSynthesis;

// ============================================
// Initialize Speech Recognition
// ============================================

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported in this browser');
        return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = window.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
        isListening = true;
        updateVoiceUI('listening');
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        document.getElementById('voiceTranscript').textContent = transcript;

        if (event.results[0].isFinal) {
            processVoiceCommand(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        updateVoiceUI('error');
        setTimeout(() => {
            toggleVoiceAssistant();
        }, 1500);
    };

    recognition.onend = () => {
        isListening = false;
        updateVoiceUI('idle');
    };

    return true;
}

// ============================================
// Toggle Voice Assistant
// ============================================

function toggleVoiceAssistant() {
    const overlay = document.getElementById('voiceOverlay');
    const fab = document.getElementById('voiceFab');

    if (overlay.classList.contains('active')) {
        // Close voice assistant
        overlay.classList.remove('active');
        fab.classList.remove('active');
        if (recognition && isListening) {
            recognition.stop();
        }
    } else {
        // Open voice assistant
        overlay.classList.add('active');
        fab.classList.add('active');

        if (!recognition) {
            const initialized = initSpeechRecognition();
            if (!initialized) {
                document.getElementById('voiceText').textContent =
                    window.currentLanguage === 'hi'
                        ? 'आपका ब्राउज़र वॉइस असिस्टेंट को सपोर्ट नहीं करता'
                        : 'Voice assistant not supported in your browser';
                return;
            }
        }

        // Start listening
        setTimeout(() => {
            if (recognition) {
                recognition.lang = window.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
                recognition.start();
            }
        }, 500);
    }
}

// ============================================
// Update Voice UI
// ============================================

function updateVoiceUI(state) {
    const voiceIcon = document.getElementById('voiceIcon');
    const voiceText = document.getElementById('voiceText');
    const voiceTranscript = document.getElementById('voiceTranscript');

    switch (state) {
        case 'listening':
            voiceIcon.classList.add('listening');
            voiceText.textContent = window.currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
            voiceTranscript.textContent = '';
            break;

        case 'processing':
            voiceIcon.classList.remove('listening');
            voiceIcon.classList.add('processing');
            voiceText.textContent = window.currentLanguage === 'hi' ? 'प्रोसेसिंग...' : 'Processing...';
            break;

        case 'idle':
            voiceIcon.classList.remove('listening', 'processing');
            voiceText.textContent = window.currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
            break;

        case 'error':
            voiceIcon.classList.remove('listening', 'processing');
            voiceText.textContent = window.currentLanguage === 'hi' ? 'त्रुटि हुई' : 'Error occurred';
            break;
    }
}

// ============================================
// Process Voice Command
// ============================================

function processVoiceCommand(command) {
    updateVoiceUI('processing');

    const lowerCommand = command.toLowerCase();

    // Command patterns based on React implementation + existing commands
    const commands = {
        // Navigation commands - English aliases
        'crop calendar': () => navigateTo('crop-calendar.html', 'Opening Crop Calendar'),
        'crop calendar kholo': () => navigateTo('crop-calendar.html', 'क्रॉप कैलेंडर खुल रहा है'),
        'क्रॉप कैलेंडर': () => navigateTo('crop-calendar.html', 'क्रॉप कैलेंडर खुल रहा है'),
        'calendar': () => navigateTo('crop-calendar.html', 'Opening Crop Calendar'),

        'soil test': () => navigateTo('soil-testing.html', 'Opening Soil Testing'),
        'soil testing': () => navigateTo('soil-testing.html', 'Opening Soil Testing'),
        'soil': () => navigateTo('soil-testing.html', 'Opening Soil Testing'),
        'soil testing kholo': () => navigateTo('soil-testing.html', 'सॉइल टेस्टिंग खुल रहा है'),
        'मिट्टी जांच': () => navigateTo('soil-testing.html', 'मिट्टी जांच खुल रहा है'),
        'मिट्टी': () => navigateTo('soil-testing.html', 'सॉइल टेस्टिंग खुल रहा है'),

        'crop recommendation': () => navigateTo('crop-recommendation.html', 'Opening Crop Recommendation'),
        'recommend crop': () => navigateTo('crop-recommendation.html', 'Opening Crop Recommendation'),
        'suitable crop': () => navigateTo('crop-recommendation.html', 'Opening Crop Recommendation'),
        'crop': () => navigateTo('crop-recommendation.html', 'Opening Crop Recommendation'),
        'mere liye suitable crop': () => navigateTo('crop-recommendation.html', 'क्रॉप रिकमेंडेशन खुल रहा है'),
        'फसल': () => navigateTo('crop-recommendation.html', 'क्रॉप रिकमेंडेशन खुल रहा है'),

        'weather': () => navigateTo('weather.html', 'Opening Weather'),
        'weather kholo': () => navigateTo('weather.html', 'मौसम खुल रहा है'),
        'मौसम': () => navigateTo('weather.html', 'मौसम खुल रहा है'),

        'disease detection': () => navigateTo('disease-detection.html', 'Opening Disease Detection'),
        'disease check': () => navigateTo('disease-detection.html', 'Opening Disease Detection'),
        'detect disease': () => navigateTo('disease-detection.html', 'Opening Disease Detection'),
        'disease': () => navigateTo('disease-detection.html', 'Opening Disease Detection'),
        'mere crop ki disease check karo': () => navigateTo('disease-detection.html', 'डिजीज डिटेक्शन खुल रहा है'),
        'रोग': () => navigateTo('disease-detection.html', 'डिजीज डिटेक्शन खुल रहा है'),

        'market': () => navigateTo('market-profit.html', 'Opening Market & Profit'),
        'market profit': () => navigateTo('market-profit.html', 'Opening Market & Profit'),
        'market kholo': () => navigateTo('market-profit.html', 'मार्केट खुल रहा है'),
        'बाजार': () => navigateTo('market-profit.html', 'मार्केट खुल रहा है'),

        'ai advisor': () => navigateTo('ai.html', 'Opening AI Advisor'),
        'ai assistant': () => navigateTo('ai.html', 'Opening AI Advisor'),
        'ai': () => navigateTo('ai.html', 'Opening AI Advisor'),
        'ai advisor kholo': () => navigateTo('ai.html', 'AI सलाहकार खुल रहा है'),
        'एआई सलाहकार': () => navigateTo('ai.html', 'AI सलाहकार खुल रहा है'),
        'एआई': () => navigateTo('ai.html', 'AI सलाहकार खुल रहा है'),

        'home': () => navigateTo('index.html', 'Going Home'),
        'go home': () => navigateTo('index.html', 'Going Home'),
        'dashboard': () => navigateTo('index.html', 'Going Home'),
        'ghar': () => navigateTo('index.html', 'होम पेज खुल रहा है'),
        'होम': () => navigateTo('index.html', 'होम पेज खुल रहा है'),

        // Theme commands
        'dark mode': () => { setTheme('dark'); speak(window.currentLanguage === 'hi' ? 'डार्क मोड चालू है' : 'Dark mode enabled'); },
        'light mode': () => { setTheme('light'); speak(window.currentLanguage === 'hi' ? 'लाइट मोड चालू है' : 'Light mode enabled'); },
        'system theme': () => { setTheme('system'); speak(window.currentLanguage === 'hi' ? 'सिस्टम थीम चालू है' : 'System theme enabled'); },

        // Language commands
        'switch to hindi': () => { switchLanguage('hi'); speak('हिंदी में बदल दिया'); },
        'हिंदी में बदलो': () => { switchLanguage('hi'); speak('हिंदी में बदल दिया'); },
        'switch to english': () => { switchLanguage('en'); speak('Switched to English'); },
        'इंग्लिश में बदलो': () => { switchLanguage('en'); speak('Switched to English'); },

        // System commands
        'refresh': () => { window.location.reload(); },
        'reload': () => { window.location.reload(); },
        'रिफ्रेश': () => { window.location.reload(); },

        // Task commands
        "aaj kya karna hai": () => speak('आज आपको सिंचाई करनी है और कीट निरीक्षण करना है'),
        'what to do today': () => speak('Today you need to irrigate the field and inspect for pests'),

        // Help commands
        'help': () => speakHelp(),
        'madad': () => speakHelp(),
        'क्या': () => speakHelp()
    };

    // Find matching command
    let matched = false;
    for (const [pattern, action] of Object.entries(commands)) {
        if (lowerCommand.includes(pattern)) {
            action();
            matched = true;
            break;
        }
    }

    if (!matched) {
        const notUnderstood = window.currentLanguage === 'hi'
            ? 'माफ़ कीजिये, मैं समझ नहीं पाया। कृपया दोबारा कहें।'
            : 'Sorry, I did not understand. Please try again.';
        speak(notUnderstood);
    }
}

// ============================================
// Navigation Helper
// ============================================

function navigateTo(page, message) {
    speak(message, () => {
        setTimeout(() => {
            window.location.href = page;
        }, 500);
    });
}

// ============================================
// Text to Speech
// ============================================

function speak(text, callback) {
    if (!synthesis) {
        console.warn('Speech synthesis not supported');
        if (callback) callback();
        return;
    }

    synthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = window.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
        if (callback) callback();
    };

    synthesis.speak(utterance);
}

// ============================================
// Help Response
// ============================================

function speakHelp() {
    const helpText = window.currentLanguage === 'hi'
        ? 'आप कह सकते हैं: क्रॉप कैलेंडर खोलो, मौसम दिखाओ, सॉइल टेस्टिंग खोलो, डिजीज डिटेक्शन खोलो, या मार्केट खोलो।'
        : 'You can say: Open crop calendar, Show weather, Open soil testing, Detect disease, or Open market.';

    speak(helpText);
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize speech recognition on first interaction
    document.addEventListener('click', () => {
        if (!recognition) {
            initSpeechRecognition();
        }
    }, { once: true });
});

// ============================================
// Export for global access
// ============================================

window.toggleVoiceAssistant = toggleVoiceAssistant;
window.speak = speak;
