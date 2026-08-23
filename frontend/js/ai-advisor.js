/**
 * Smart Agriculture Assistant
 * AI Farming Command Center
 */

const aiCategories = [
    { key: 'crop', icon: 'fa-seedling', labelKey: 'ai_cat_crop', prompt: 'Which crop is best for my farm this season?' },
    { key: 'pest', icon: 'fa-bug', labelKey: 'ai_cat_pest', prompt: 'How can I control pests in groundnut?' },
    { key: 'weather', icon: 'fa-cloud-sun', labelKey: 'ai_cat_weather', prompt: 'Should I irrigate before rain?' },
    { key: 'soil', icon: 'fa-flask', labelKey: 'ai_cat_soil', prompt: 'How can I improve soil fertility naturally?' },
    { key: 'market', icon: 'fa-indian-rupee-sign', labelKey: 'ai_cat_market', prompt: 'When should I sell my crop for best price?' },
    { key: 'irrigation', icon: 'fa-droplet', labelKey: 'ai_cat_irrigation', prompt: 'How much water does groundnut need now?' }
];

const quickQuestions = {
    en: [
        'What should I do for groundnut today?',
        'How to identify leaf spot disease?',
        'When should I apply fertilizer?',
        'Should I sell crop this week?'
    ],
    hi: [
        'आज मूंगफली के लिए क्या करना चाहिए?',
        'पत्ती धब्बा रोग कैसे पहचानें?',
        'उर्वरक कब डालना चाहिए?',
        'क्या इस सप्ताह फसल बेचनी चाहिए?'
    ]
};

const adviceLibrary = {
    irrigation: {
        keywords: ['water', 'irrigation', 'moisture', 'dry', 'rain', 'पानी', 'सिंचाई', 'नमी', 'बारिश'],
        en: 'For groundnut in the vegetative stage, keep soil evenly moist but avoid waterlogging. Irrigate lightly in the early morning if the top 5 cm soil is dry. If heavy rain is expected within 24 hours, delay irrigation and check field drainage.',
        hi: 'वानस्पतिक चरण में मूंगफली के लिए मिट्टी में समान नमी रखें लेकिन जलभराव से बचें। यदि ऊपर की 5 सेमी मिट्टी सूखी है तो सुबह हल्की सिंचाई करें। यदि 24 घंटे में भारी बारिश की संभावना है, तो सिंचाई रोकें और खेत की जल निकासी जांचें।'
    },
    pest: {
        keywords: ['pest', 'insect', 'aphid', 'thrips', 'bug', 'कीट', 'एफिड', 'थ्रिप्स'],
        en: 'Inspect the underside of leaves early morning. For aphids or thrips, start with neem oil spray (3-5 ml/litre water) and repeat after 7 days. Use chemical pesticides only if infestation is severe, and avoid spraying during high wind or afternoon heat.',
        hi: 'सुबह पत्तियों के नीचे की जांच करें। एफिड्स या थ्रिप्स के लिए नीम तेल स्प्रे (3-5 ml/लीटर पानी) से शुरू करें और 7 दिन बाद दोहराएं। संक्रमण अधिक होने पर ही रासायनिक कीटनाशक का उपयोग करें, तेज हवा या दोपहर की गर्मी में छिड़काव न करें।'
    },
    disease: {
        keywords: ['disease', 'spot', 'yellow', 'fungus', 'leaf', 'रोग', 'धब्बा', 'पीला', 'फफूंद', 'पत्ती'],
        en: 'Leaf spots usually appear as brown circular marks with yellow edges. Remove badly infected leaves, improve spacing for airflow, and avoid overhead irrigation. If spread continues, use a recommended fungicide like Mancozeb as per label instructions and consult a local agriculture officer.',
        hi: 'पत्ती धब्बा आमतौर पर पीले किनारों वाले भूरे गोल निशान के रूप में दिखता है। अधिक संक्रमित पत्तियां हटाएं, हवा के लिए दूरी सुधारें और ऊपर से सिंचाई से बचें। यदि रोग फैलता रहे, तो लेबल निर्देशों के अनुसार Mancozeb जैसे अनुशंसित फफूंदनाशक का उपयोग करें और स्थानीय कृषि अधिकारी से सलाह लें।'
    },
    fertilizer: {
        keywords: ['fertilizer', 'npk', 'nutrient', 'compost', 'urea', 'उर्वरक', 'खाद', 'पोषक'],
        en: 'Apply fertilizer based on soil test results. For groundnut, avoid excess nitrogen because it can reduce pod formation. Use well-decomposed compost, maintain phosphorus and potash levels, and apply gypsum around flowering for better pod development.',
        hi: 'मिट्टी परीक्षण के आधार पर उर्वरक डालें। मूंगफली में अधिक नाइट्रोजन से बचें क्योंकि इससे फली बनना कम हो सकता है। अच्छी तरह सड़ी खाद का उपयोग करें, फास्फोरस और पोटाश स्तर बनाए रखें, और फूल आने के समय बेहतर फली विकास के लिए जिप्सम डालें।'
    },
    market: {
        keywords: ['sell', 'market', 'price', 'profit', 'mandi', 'बेचना', 'बाजार', 'भाव', 'मुनाफा', 'मंडी'],
        en: 'Compare government mandi, private buyer, and local market prices before selling. If prices are trending up and you have safe storage, waiting a few days may improve profit. Avoid long storage if moisture is high or crop quality may fall.',
        hi: 'बेचने से पहले सरकारी मंडी, निजी खरीदार और स्थानीय बाजार के भाव की तुलना करें। यदि भाव ऊपर जा रहे हैं और सुरक्षित भंडारण उपलब्ध है, तो कुछ दिन इंतजार करने से मुनाफा बढ़ सकता है। नमी अधिक हो या गुणवत्ता घटने का खतरा हो तो लंबे भंडारण से बचें।'
    },
    crop: {
        keywords: ['crop', 'season', 'variety', 'sowing', 'harvest', 'फसल', 'मौसम', 'किस्म', 'बुवाई', 'कटाई'],
        en: 'Choose crops based on soil type, water availability, season, and market demand. For loamy soil in Gujarat, groundnut, cotton, wheat, and maize are good options. Use certified seeds and follow recommended spacing for better yield.',
        hi: 'फसल का चुनाव मिट्टी के प्रकार, पानी उपलब्धता, मौसम और बाजार मांग के आधार पर करें। गुजरात की दोमट मिट्टी में मूंगफली, कपास, गेहूं और मक्का अच्छे विकल्प हैं। बेहतर पैदावार के लिए प्रमाणित बीज और अनुशंसित दूरी अपनाएं।'
    }
};

const briefingData = {
    en: [
        { icon: 'fa-cloud-sun', color: '#42A5F5', label: 'Weather', value: '32°C', meta: 'Partly cloudy · 20% rain' },
        { icon: 'fa-seedling', color: '#2E7D32', label: 'Crop Stage', value: 'Day 37', meta: 'Vegetative · Groundnut' },
        { icon: 'fa-droplet', color: '#0288D1', label: 'Soil Moisture', value: '62%', meta: 'Optimal range' },
        { icon: 'fa-indian-rupee-sign', color: '#F9A825', label: 'Mandi Price', value: '₹5,840', meta: 'Groundnut / quintal' }
    ],
    hi: [
        { icon: 'fa-cloud-sun', color: '#42A5F5', label: 'मौसम', value: '32°C', meta: 'आंशिक बादल · 20% बारिश' },
        { icon: 'fa-seedling', color: '#2E7D32', label: 'फसल चरण', value: 'दिन 37', meta: 'वानस्पतिक · मूंगफली' },
        { icon: 'fa-droplet', color: '#0288D1', label: 'मिट्टी नमी', value: '62%', meta: 'उपयुक्त सीमा' },
        { icon: 'fa-indian-rupee-sign', color: '#F9A825', label: 'मंडी भाव', value: '₹5,840', meta: 'मूंगफली / क्विंटल' }
    ]
};

const insightCards = {
    en: [
        { type: 'warning', icon: 'fa-bug', title: 'Pest Watch', text: 'Aphid pressure is rising in vegetative groundnut. Inspect undersides of leaves this morning.', action: 'Ask about pest control', prompt: 'How can I control pests in groundnut?' },
        { type: 'success', icon: 'fa-droplet', title: 'Irrigation Window', text: 'Topsoil is drying. A light morning irrigation will keep pods developing without waterlogging.', action: 'Ask about watering', prompt: 'How much water does groundnut need now?' },
        { type: 'info', icon: 'fa-flask', title: 'Nutrient Tip', text: 'Avoid extra nitrogen now. Plan gypsum around flowering for better pod fill.', action: 'Ask about fertilizer', prompt: 'When should I apply fertilizer?' },
        { type: 'warning', icon: 'fa-cloud-showers-heavy', title: 'Rain Alert', text: '20% rain chance today. Delay spraying if clouds build after noon.', action: 'Ask about weather plan', prompt: 'Should I irrigate before rain?' }
    ],
    hi: [
        { type: 'warning', icon: 'fa-bug', title: 'कीट निगरानी', text: 'वानस्पतिक मूंगफली में एफिड दबाव बढ़ रहा है। सुबह पत्तियों के नीचे जांचें।', action: 'कीट नियंत्रण पूछें', prompt: 'मूंगफली में कीट कैसे नियंत्रित करें?' },
        { type: 'success', icon: 'fa-droplet', title: 'सिंचाई समय', text: 'ऊपरी मिट्टी सूख रही है। सुबह हल्की सिंचाई फली विकास के लिए उपयुक्त है।', action: 'पानी के बारे में पूछें', prompt: 'मूंगफली को अभी कितना पानी चाहिए?' },
        { type: 'info', icon: 'fa-flask', title: 'पोषक सुझाव', text: 'अभी अतिरिक्त नाइट्रोजन न डालें। फूल आने पर जिप्सम की योजना बनाएं।', action: 'उर्वरक पूछें', prompt: 'उर्वरक कब डालना चाहिए?' },
        { type: 'warning', icon: 'fa-cloud-showers-heavy', title: 'बारिश चेतावनी', text: 'आज 20% बारिश की संभावना। दोपहर बाद बादल बढ़ें तो छिड़काव रोकें।', action: 'मौसम योजना पूछें', prompt: 'बारिश से पहले सिंचाई करनी चाहिए?' }
    ]
};

const priorityActions = {
    en: [
        { level: 'high', title: 'Scout for aphids', desc: 'Check 10 plants across the field before 9 AM.', prompt: 'How can I control pests in groundnut?' },
        { level: 'medium', title: 'Light irrigation', desc: 'Apply a short morning watering if top 5 cm soil is dry.', prompt: 'How much water does groundnut need now?' },
        { level: 'medium', title: 'Hold chemical spray', desc: 'Rain chance later today — delay pesticide if clouds build.', prompt: 'Should I irrigate before rain?' },
        { level: 'low', title: 'Log farm expense', desc: 'Record yesterday’s seed and labour cost in the calendar tracker.', prompt: 'What should I do for my crop today?' }
    ],
    hi: [
        { level: 'high', title: 'एफिड जांच', desc: 'सुबह 9 बजे से पहले खेत में 10 पौधों की जांच करें।', prompt: 'मूंगफली में कीट कैसे नियंत्रित करें?' },
        { level: 'medium', title: 'हल्की सिंचाई', desc: 'ऊपरी 5 सेमी मिट्टी सूखी हो तो सुबह छोटी सिंचाई करें।', prompt: 'मूंगफली को अभी कितना पानी चाहिए?' },
        { level: 'medium', title: 'रसायन छिड़काव रोकें', desc: 'आज बाद में बारिश हो सकती है — बादल बढ़ें तो कीटनाशक रोकें।', prompt: 'बारिश से पहले सिंचाई करनी चाहिए?' },
        { level: 'low', title: 'खर्च दर्ज करें', desc: 'कल के बीज और मजदूरी खर्च को कैलेंडर ट्रैकर में लिखें।', prompt: 'आज फसल के लिए क्या करना चाहिए?' }
    ]
};

const insightFeed = {
    en: [
        { icon: 'fa-cloud-sun', text: 'Gujarat forecast: 32°C, partly cloudy, light breeze 12 km/h.', time: 'Just now' },
        { icon: 'fa-chart-line', text: 'Groundnut mandi average rose 1.4% this week to ₹5,840/qtl.', time: '1 hour ago' },
        { icon: 'fa-seedling', text: 'Vegetative stage day 37 — canopy closing. Watch for leaf spots.', time: '2 hours ago' },
        { icon: 'fa-droplet', text: 'Soil moisture at 62%. Optimal band is 55–70% for this stage.', time: '3 hours ago' },
        { icon: 'fa-bug', text: 'Regional advisory: thrips activity increasing in Saurashtra belt.', time: '5 hours ago' },
        { icon: 'fa-lightbulb', text: 'Pro tip: rotate crops next season to break pest cycles and fix nitrogen.', time: 'Yesterday' }
    ],
    hi: [
        { icon: 'fa-cloud-sun', text: 'गुजरात पूर्वानुमान: 32°C, आंशिक बादल, हवा 12 किमी/घंटा।', time: 'अभी' },
        { icon: 'fa-chart-line', text: 'मूंगफली मंडी औसत इस सप्ताह 1.4% बढ़कर ₹5,840/क्विंटल।', time: '1 घंटे पहले' },
        { icon: 'fa-seedling', text: 'वानस्पतिक चरण दिन 37 — छतरी बंद हो रही है। पत्ती धब्बा देखें।', time: '2 घंटे पहले' },
        { icon: 'fa-droplet', text: 'मिट्टी नमी 62%। इस चरण के लिए उपयुक्त सीमा 55–70% है।', time: '3 घंटे पहले' },
        { icon: 'fa-bug', text: 'क्षेत्रीय सलाह: सौराष्ट्र पट्टी में थ्रिप्स गतिविधि बढ़ रही है।', time: '5 घंटे पहले' },
        { icon: 'fa-lightbulb', text: 'सुझाव: अगले मौसम में फसल चक्र बदलें ताकि कीट चक्र टूटे।', time: 'कल' }
    ]
};

let activeCategory = 'crop';

function getLang() {
    return window.currentLanguage || localStorage.getItem('language') || 'en';
}

function initAIAdvisor() {
    renderDailyBriefing();
    renderInsightCards();
    renderPriorityActions();
    renderInsightFeed();
    renderCategories();
    renderSuggestions();
    setupChatEvents();
    setupCommandCenterEvents();
    updateWelcomeTime();
}

function renderDailyBriefing() {
    const container = document.getElementById('dailyBriefingGrid');
    if (!container) return;

    const items = briefingData[getLang()] || briefingData.en;
    container.innerHTML = items.map(item => `
        <article class="briefing-item">
            <div class="briefing-item-icon" style="background-color: ${item.color}">
                <i class="fa-solid ${item.icon}"></i>
            </div>
            <span class="briefing-item-label">${item.label}</span>
            <strong class="briefing-item-value">${item.value}</strong>
            <span class="briefing-item-meta">${item.meta}</span>
        </article>
    `).join('');
}

function renderInsightCards() {
    const container = document.getElementById('insightsGrid');
    if (!container) return;

    const cards = insightCards[getLang()] || insightCards.en;
    container.innerHTML = cards.map((card, index) => `
        <article class="insight-card ${card.type}" data-prompt="${escapeAttr(card.prompt)}" data-index="${index}">
            <div class="insight-card-header">
                <div class="insight-card-icon"><i class="fa-solid ${card.icon}"></i></div>
                <h3 class="insight-card-title">${card.title}</h3>
            </div>
            <p class="insight-card-text">${card.text}</p>
            <span class="insight-card-action">${card.action} →</span>
        </article>
    `).join('');

    container.querySelectorAll('.insight-card').forEach(card => {
        card.addEventListener('click', () => {
            setInputValue(card.dataset.prompt);
            sendMessage();
        });
    });
}

function renderPriorityActions() {
    const container = document.getElementById('priorityActionsList');
    if (!container) return;

    const actions = priorityActions[getLang()] || priorityActions.en;
    container.innerHTML = actions.map((action, i) => `
        <button class="priority-item" type="button" data-prompt="${escapeAttr(action.prompt)}">
            <span class="priority-badge ${action.level}">${i + 1}</span>
            <div class="priority-content">
                <h3 class="priority-title">${action.title}</h3>
                <p class="priority-desc">${action.desc}</p>
            </div>
        </button>
    `).join('');

    container.querySelectorAll('.priority-item').forEach(btn => {
        btn.addEventListener('click', () => {
            setInputValue(btn.dataset.prompt);
            sendMessage();
        });
    });
}

function renderInsightFeed() {
    const container = document.getElementById('insightFeedList');
    if (!container) return;

    const items = insightFeed[getLang()] || insightFeed.en;
    container.innerHTML = items.map(item => `
        <article class="feed-item">
            <div class="feed-item-icon"><i class="fa-solid ${item.icon}"></i></div>
            <div class="feed-item-content">
                <p class="feed-item-text">${item.text}</p>
                <span class="feed-item-time">${item.time}</span>
            </div>
        </article>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('categoryPills') || document.getElementById('categoryList');
    if (!container) return;

    const language = getLang();
    const categoryTranslations = window.I18N?.[language] || window.I18N?.en || {};

    container.innerHTML = aiCategories.map(category => `
        <button class="category-pill${category.key === activeCategory ? ' active' : ''}" data-category="${category.key}" data-prompt="${escapeAttr(category.prompt)}">
            <i class="fa-solid ${category.icon}"></i>
            <span>${categoryTranslations[category.labelKey] || category.labelKey}</span>
        </button>
    `).join('');

    container.querySelectorAll('.category-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.category;
            renderCategories();
            setInputValue(btn.dataset.prompt);
        });
    });
}

function renderSuggestions() {
    const container = document.getElementById('suggestionChips');
    if (!container) return;

    const questions = quickQuestions[getLang()] || quickQuestions.en;

    container.innerHTML = questions.map(question => `
        <button class="suggestion-chip" type="button">${question}</button>
    `).join('');

    container.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            setInputValue(chip.textContent.trim());
            sendMessage();
        });
    });
}

function setupCommandCenterEvents() {
    const refreshBtn = document.getElementById('refreshBriefingBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            renderDailyBriefing();
            renderInsightCards();
            renderPriorityActions();
            renderInsightFeed();
            if (window.showToast) {
                window.showToast(getLang() === 'hi' ? 'ब्रीफिंग अपडेट हो गई' : 'Briefing refreshed', 'success');
            }
        });
    }

    const updateContextBtn = document.getElementById('updateContextBtn');
    if (updateContextBtn) {
        updateContextBtn.addEventListener('click', () => {
            window.location.href = 'crop-calendar.html';
        });
    }
}

function setupChatEvents() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearChatBtn');
    const voiceBtn = document.getElementById('voiceInputBtn');
    const attachBtn = document.getElementById('attachBtn');

    if (input) {
        input.addEventListener('input', () => {
            autoResizeInput();
            if (sendBtn) sendBtn.disabled = input.value.trim().length === 0;
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    if (voiceBtn) voiceBtn.addEventListener('click', startChatVoiceInput);
    if (attachBtn) attachBtn.addEventListener('click', showPhotoAdviceMessage);

    document.querySelectorAll('.quick-action-item').forEach(btn => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    if (!input || !input.value.trim()) return;

    const question = input.value.trim();
    addMessage(question, 'user');
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;
    autoResizeInput();

    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(generateAdvice(question), 'ai');
    }, 700);
}

function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const message = document.createElement('div');
    message.className = `message ${sender}-message`;
    message.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid ${sender === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">${formatMessageText(text, sender === 'ai')}</div>
            <span class="message-time">${formatTime(new Date())}</span>
        </div>
    `;

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

function generateAdvice(question) {
    const lower = question.toLowerCase();
    const language = getLang();

    const matched = Object.values(adviceLibrary).find(item =>
        item.keywords.some(keyword => lower.includes(keyword.toLowerCase()))
    ) || adviceLibrary[activeCategory] || adviceLibrary.crop;

    const intro = language === 'hi'
        ? '<strong>मेरी सलाह:</strong> '
        : '<strong>My advice:</strong> ';
    const followUp = language === 'hi'
        ? '<br><br><strong>अगला कदम:</strong> यदि समस्या गंभीर है, तो फोटो के साथ Disease Detection पेज पर जांच करें या स्थानीय कृषि विशेषज्ञ से सलाह लें।'
        : '<br><br><strong>Next step:</strong> If the issue is severe, use the Disease Detection page with a clear photo or consult a local agriculture expert.';

    return `${intro}${matched[language] || matched.en}${followUp}`;
}

function showTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const typing = document.createElement('div');
    typing.className = 'message ai-message typing-message';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-content">
            <div class="message-bubble typing-bubble">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

function clearChat() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    messages.querySelectorAll('.message:not(.welcome-message)').forEach(message => message.remove());
}

function setInputValue(value) {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    if (!input) return;

    input.value = value;
    input.focus();
    autoResizeInput();
    if (sendBtn) sendBtn.disabled = input.value.trim().length === 0;
}

function autoResizeInput() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
}

function startChatVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        addMessage(getLang() === 'hi'
            ? 'आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता। कृपया टाइप करें।'
            : 'Your browser does not support voice input. Please type your question.', 'ai');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLang() === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
    };

    recognition.onerror = () => {
        addMessage(getLang() === 'hi'
            ? 'वॉइस इनपुट में समस्या आई। कृपया दोबारा प्रयास करें।'
            : 'Voice input had a problem. Please try again.', 'ai');
    };

    recognition.start();
}

function showPhotoAdviceMessage() {
    addMessage(getLang() === 'hi'
        ? 'फोटो से रोग पहचान के लिए Disease Detection पेज का उपयोग करें। वहां साफ पत्ती या पौधे की फोटो अपलोड करें।'
        : 'For photo-based diagnosis, please use the Disease Detection page and upload a clear leaf or plant image.', 'ai');
}

function handleQuickAction(action) {
    const prompts = {
        'today-tasks': 'What should I do for my crop today?',
        weather: 'How should I plan farming work based on weather?',
        market: 'Should I sell my crop now or wait?',
        disease: 'How do I check if my plant has disease?',
        soil: 'How can I improve my soil health?'
    };
    setInputValue(prompts[action] || prompts['today-tasks']);
    sendMessage();
}

function updateWelcomeTime() {
    const timeEl = document.getElementById('welcomeTime');
    if (timeEl) timeEl.textContent = formatTime(new Date());
}

function formatMessageText(text, trusted = false) {
    if (trusted && text.includes('<')) return text;
    return text.split('\n').filter(Boolean).map(line => `<p>${escapeHTML(line)}</p>`).join('');
}

function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttr(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

window.addEventListener('languageChanged', () => {
    if (document.querySelector('.ai-cc-layout') || document.querySelector('.ai-layout')) {
        renderDailyBriefing();
        renderInsightCards();
        renderPriorityActions();
        renderInsightFeed();
        renderCategories();
        renderSuggestions();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.ai-cc-layout') || document.querySelector('.ai-layout')) {
        initAIAdvisor();
    }
});
