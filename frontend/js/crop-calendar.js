/**
 * Smart Agriculture Assistant
 * Crop Calendar - Task Management & Timeline
 */

// ============================================
// Crop Data
// ============================================

const cropData = {
    groundnut: {
        name: 'Groundnut',
        icon: '🥜',
        totalDays: 120,
        stages: [
            { name: 'Sowing', day: 1, icon: 'fa-seedling' },
            { name: 'Germination', day: 15, icon: 'fa-seedling' },
            { name: 'Vegetative', day: 37, icon: 'fa-leaf' },
            { name: 'Flowering', day: 60, icon: 'fa-sun' },
            { name: 'Pod Formation', day: 90, icon: 'fa-circle-dot' },
            { name: 'Harvesting', day: 120, icon: 'fa-tractor' }
        ],
        tasks: [
            { day: 1, title: 'Sowing', desc: 'Sow seeds at proper depth (5-7 cm)', priority: 'high', category: 'sowing', time: '06:00' },
            { day: 15, title: 'Germination Check', desc: 'Check for germination and fill gaps', priority: 'high', category: 'monitoring', time: '08:00' },
            { day: 30, title: 'First Weeding', desc: 'Remove weeds manually or with weeder', priority: 'medium', category: 'maintenance', time: '07:00' },
            { day: 37, title: 'Irrigate the field (Light)', desc: 'Check soil moisture before applying water', priority: 'high', category: 'irrigation', time: '06:00' },
            { day: 37, title: 'Inspect crop for pests', desc: 'Look for Aphids or Thrips on leaves', priority: 'medium', category: 'monitoring', time: '10:00' },
            { day: 45, title: 'Fertilizer Application', desc: 'Apply Gypsum for better pod development', priority: 'high', category: 'fertilizer', time: '08:00' },
            { day: 60, title: 'Earthing Up', desc: 'Earth up soil around plants for pegging', priority: 'medium', category: 'maintenance', time: '07:00' },
            { day: 75, title: 'Second Weeding', desc: 'Remove any new weed growth', priority: 'low', category: 'maintenance', time: '07:00' },
            { day: 90, title: 'Monitor Pod Development', desc: 'Check pod filling and health', priority: 'medium', category: 'monitoring', time: '09:00' },
            { day: 110, title: 'Stop Irrigation', desc: 'Stop watering before harvest', priority: 'high', category: 'irrigation', time: '08:00' },
            { day: 120, title: 'Harvest', desc: 'Harvest when leaves turn yellow', priority: 'high', category: 'harvest', time: '06:00' }
        ]
    }
};

// ============================================
// State
// ============================================

let activeCrop = (() => {
    try {
        return JSON.parse(localStorage.getItem('activeCrop')) || {
            name: 'groundnut',
            sowingDate: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
            completedTasks: ['task_remove_weeds']
        };
    } catch {
        return {
            name: 'groundnut',
            sowingDate: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
            completedTasks: ['task_remove_weeds']
        };
    }
})();

// Calendar Insights State (for smart features)
let calendarInsights = (() => {
    try {
        return JSON.parse(localStorage.getItem('cropCalendarInsights')) || {
            notificationsEnabled: false,
            expenses: [],
            weatherAdjustmentsApplied: false,
            yieldInputs: { area: 2, health: 82, plants: 95000 }
        };
    } catch {
        return {
            notificationsEnabled: false,
            expenses: [],
            weatherAdjustmentsApplied: false,
            yieldInputs: { area: 2, health: 82, plants: 95000 }
        };
    }
})();

// ============================================
// Initialize
// ============================================

function initCropCalendar() {
    calculateCurrentDay();
    renderJourney();
    renderTimeline();
    renderWeekStrip();
    renderTasks();
    setupActionButtons();

    // Initialize smart features
    initSmartNotifications();
    initExpenseTracker();
    initWeatherAdjustments();
    initYieldPredictor();

    // Listen for language changes to re-render dynamic content
    window.addEventListener('languageChanged', () => {
        renderNotificationStatus();
        renderExpenses();
        renderWeatherAdjustments();
        calculateYieldPrediction();
        renderJourney();
        renderTasks();
    });
}

// ============================================
// Calculate Current Day
// ============================================

function calculateCurrentDay() {
    const sowingDate = new Date(activeCrop.sowingDate);
    const today = new Date();
    const diffTime = Math.abs(today - sowingDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    activeCrop.currentDay = diffDays;

    // Find current stage
    const crop = cropData[activeCrop.name];
    if (crop) {
        for (let i = crop.stages.length - 1; i >= 0; i--) {
            if (diffDays >= crop.stages[i].day) {
                activeCrop.currentStage = crop.stages[i].name;
                activeCrop.currentStageIndex = i;
                break;
            }
        }

        // Day within current stage
        const currentStage = crop.stages[activeCrop.currentStageIndex];
        const nextStage = crop.stages[activeCrop.currentStageIndex + 1];
        const stageStartDay = currentStage.day;
        const stageEndDay = nextStage ? nextStage.day - 1 : crop.totalDays;
        activeCrop.dayInStage = diffDays - stageStartDay + 1;
        activeCrop.stageStartDay = stageStartDay;
        activeCrop.stageEndDay = stageEndDay;
    }

    // Update display
    updateProgressDisplay();
    updateStatsDisplay();
}

// ============================================
// Update Progress Display
// ============================================

function updateProgressDisplay() {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    // Progress percentage
    const progress = Math.min((activeCrop.currentDay / crop.totalDays) * 100, 100);

    // Progress bar
    const progressBar = document.querySelector('.timeline-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

    // Progress ring
    const progressFill = document.querySelector('.progress-ring-fill');
    if (progressFill) {
        const circumference = 2 * Math.PI * 54; // 339.29
        const offset = circumference * (1 - progress / 100);
        progressFill.style.strokeDashoffset = offset;
    }

    // Progress day text
    const dayDisplay = document.querySelector('.progress-day');
    if (dayDisplay) {
        dayDisplay.textContent = `Day ${activeCrop.currentDay} of ${crop.totalDays}`;
    }

    // Progress percentage text
    const pctDisplay = document.querySelector('.progress-pct');
    if (pctDisplay) {
        pctDisplay.textContent = `${Math.round(progress)}%`;
    }

    // Stage track fill (legacy - for old timeline)
    const stageTrackFill = document.getElementById('stageTrackFill');
    if (stageTrackFill) {
        const stageProgress = (activeCrop.currentStageIndex / (crop.stages.length - 1)) * 100;
        stageTrackFill.style.width = `${stageProgress}%`;
    }

    // Journey progress fill (new Growth Journey)
    const journeyTrackFill = document.getElementById('journeyTrackFill');
    if (journeyTrackFill) {
        const stageProgress = (activeCrop.currentStageIndex / (crop.stages.length - 1)) * 100;
        journeyTrackFill.style.width = `${stageProgress}%`;
    }

    // Journey progress summary text
    const journeyProgressText = document.getElementById('journeyProgressText');
    if (journeyProgressText) {
        journeyProgressText.textContent = `Day ${activeCrop.currentDay} of ${crop.totalDays} — ${Math.round(progress)}%`;
    }

    // Journey progress bar (the horizontal bar in summary)
    const journeyProgressFill = document.getElementById('journeyProgressFill');
    if (journeyProgressFill) {
        journeyProgressFill.style.width = `${progress}%`;
    }

    // Update journey progress bar aria-valuenow
    const journeyProgressBar = document.querySelector('.journey-progress-bar');
    if (journeyProgressBar) {
        journeyProgressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
}

// ============================================
// Update Stats Display
// ============================================

function updateStatsDisplay() {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    const daysRemaining = crop.totalDays - activeCrop.currentDay;
    const todayTasks = crop.tasks.filter(task => task.day === activeCrop.currentDay);
    const remainingTasks = todayTasks.filter(task => !isTaskCompleted(task.title));
    const currentStageDay = activeCrop.dayInStage || 1;

    const daysEl = document.getElementById('daysRemaining');
    if (daysEl) daysEl.textContent = daysRemaining;

    const tasksEl = document.getElementById('tasksRemaining');
    if (tasksEl) tasksEl.textContent = remainingTasks.length;

    const stageDayEl = document.getElementById('currentStageDay');
    if (stageDayEl) stageDayEl.textContent = currentStageDay;

    // Current date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const locale = window.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        dateEl.textContent = new Date().toLocaleDateString(locale, options);
    }

    // Update task count badge
    const badge = document.getElementById('tasksRemainingBadge');
    if (badge) {
        badge.textContent = `${remainingTasks.length} Task${remainingTasks.length !== 1 ? 's' : ''} Remaining`;
    }
}

// ============================================
// Render Timeline (Stage Steps)
// ============================================

function renderTimeline() {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    // Update stage steps visual state
    document.querySelectorAll('.stage-step').forEach((step, index) => {
        step.classList.remove('completed', 'current', 'upcoming');
        if (index < activeCrop.currentStageIndex) {
            step.classList.add('completed');
        } else if (index === activeCrop.currentStageIndex) {
            step.classList.add('current');
        } else {
            step.classList.add('upcoming');
        }
    });
}

// ============================================
// Render Growth Journey
// ============================================

function renderJourney() {
    const crop = cropData[activeCrop.name];
    const journeySteps = document.getElementById('journeySteps');
    if (!crop || !journeySteps) return;

    journeySteps.innerHTML = '';

    crop.stages.forEach((stage, index) => {
        const status = getStageStatus(index);
        const isCurrent = index === activeCrop.currentStageIndex;
        const isSelected = index === (activeCrop.selectedStageIndex ?? activeCrop.currentStageIndex);
        const stageKey = getStageLangKey(stage.name);
        const statusLabel = getStageStatusLabel(status);
        const stageName = getTranslation(stageKey, stage.name);

        const item = document.createElement('li');
        item.className = `journey-step ${status}${isSelected ? ' selected' : ''}`;
        item.setAttribute('role', 'listitem');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'journey-step-btn';
        button.setAttribute('aria-current', isCurrent ? 'step' : 'false');
        button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        button.setAttribute('aria-label', `${stageName}, Day ${stage.day}, ${statusLabel}`);
        button.addEventListener('click', () => selectStage(index));

        button.innerHTML = `
            <span class="journey-step-marker" aria-hidden="true">
                <i class="fa-solid ${stage.icon} journey-step-icon"></i>
            </span>
            <span class="journey-step-content">
                <span class="journey-step-label">${stageName}</span>
                <span class="journey-step-day">Day ${stage.day}</span>
                <span class="journey-status">${statusLabel}</span>
            </span>
        `;

        item.appendChild(button);
        journeySteps.appendChild(item);
    });

    updateProgressDisplay();
    selectStage(activeCrop.selectedStageIndex ?? activeCrop.currentStageIndex, false);
}

function getStageStatus(index) {
    if (index < activeCrop.currentStageIndex) return 'completed';
    if (index === activeCrop.currentStageIndex) return 'current';
    return 'upcoming';
}

function getStageStatusLabel(status) {
    const labels = {
        completed: getTranslation('stage_status_completed', 'Completed'),
        current: getTranslation('stage_status_current', 'Current Stage'),
        upcoming: getTranslation('stage_status_upcoming', 'Upcoming')
    };
    return labels[status] || status;
}

function getStageLangKey(stageName) {
    const map = {
        Sowing: 'stage_sowing',
        Germination: 'stage_germination',
        Vegetative: 'stage_vegetative',
        Flowering: 'stage_flowering',
        'Pod Formation': 'stage_pod',
        Harvesting: 'stage_harvest'
    };
    return map[stageName] || `stage_${stageName.toLowerCase().replace(/\s+/g, '_')}`;
}

function selectStage(index, shouldFocus = true) {
    const crop = cropData[activeCrop.name];
    const panel = document.getElementById('journeyInfoPanel');
    const body = document.getElementById('infoPanelBody');
    const title = document.getElementById('infoPanelTitle');
    if (!crop || !panel || !body) return;

    const stage = crop.stages[index];
    if (!stage) return;

    activeCrop.selectedStageIndex = index;

    document.querySelectorAll('.journey-step').forEach((step, stepIndex) => {
        step.classList.toggle('selected', stepIndex === index);
        const button = step.querySelector('.journey-step-btn');
        if (button) button.setAttribute('aria-pressed', stepIndex === index ? 'true' : 'false');
    });

    const nextStage = crop.stages[index + 1];
    const stageEnd = nextStage ? nextStage.day - 1 : crop.totalDays;
    const stageTasks = crop.tasks.filter(task => task.day >= stage.day && task.day <= stageEnd);
    const focusItems = getStageFocusItems(stage, stageTasks);
    const stageName = getTranslation(getStageLangKey(stage.name), stage.name);
    const isActualCurrent = index === activeCrop.currentStageIndex;

    if (title) {
        title.textContent = `${stageName} • Day ${stage.day}`;
    }

    body.innerHTML = `
        <div class="stage-info-copy">
            <p class="stage-info-desc">${getStageDescription(stage, stageEnd)}</p>
            <div class="stage-info-meta" aria-label="Stage status and duration">
                <span class="stage-info-chip"><i class="fa-solid fa-calendar-day"></i> Day ${stage.day}${stageEnd !== stage.day ? `–${stageEnd}` : ''}</span>
                <span class="stage-info-chip"><i class="fa-solid ${isActualCurrent ? 'fa-location-dot' : 'fa-circle-check'}"></i> ${isActualCurrent ? getTranslation('stage_status_current', 'Current Stage') : getStageStatusLabel(getStageStatus(index))}</span>
            </div>
            <h5>${getTranslation('focus_areas', 'Focus areas')}</h5>
            <ul class="stage-focus-list">
                ${focusItems.map(item => `
                    <li class="stage-focus-item">
                        <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
                        <span>${item.text}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <aside class="stage-next-card" aria-label="Next stage">
            <span class="stage-next-label">${nextStage ? getTranslation('next_stage', 'Next Stage') : getTranslation('final_stage', 'Final Stage')}</span>
            <strong class="stage-next-title">${nextStage ? getTranslation(getStageLangKey(nextStage.name), nextStage.name) : getTranslation('harvest_ready', 'Harvest Ready')}</strong>
            <p class="stage-next-desc">${nextStage ? `Begins on Day ${nextStage.day}. ${getStageDescription(nextStage, crop.stages[index + 2]?.day ? crop.stages[index + 2].day - 1 : crop.totalDays)}` : getTranslation('final_stage_desc', 'Complete remaining checks and prepare for post-harvest handling.')}</p>
        </aside>
    `;

    panel.classList.add('active');
    if (shouldFocus) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeInfoPanel() {
    const panel = document.getElementById('journeyInfoPanel');
    if (panel) panel.classList.remove('active');
}

function getStageDescription(stage, stageEnd) {
    const key = `stage_desc_${stage.name.toLowerCase().replace(/\s+/g, '_')}`;
    const fallback = `${stage.name} runs from Day ${stage.day} to Day ${stageEnd}. Follow scheduled tasks and monitor crop condition regularly.`;
    return getTranslation(key, fallback);
}

function getStageFocusItems(stage, tasks) {
    const categoryIconMap = {
        irrigation: 'fa-droplet',
        fertilizer: 'fa-flask',
        monitoring: 'fa-bug',
        maintenance: 'fa-leaf',
        sowing: 'fa-seedling',
        harvest: 'fa-tractor'
    };

    const items = tasks.slice(0, 3).map(task => ({
        icon: categoryIconMap[task.category] || 'fa-circle-check',
        text: `${getTaskTitle(task)} — Day ${task.day}`
    }));

    if (!items.length) {
        items.push({ icon: 'fa-magnifying-glass', text: getTranslation('focus_regular_inspection', 'Inspect crop health and soil moisture regularly') });
    }

    return items;
}

// ============================================
// Render Week Strip
// ============================================

function renderWeekStrip() {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    const weekContainer = document.getElementById('weekDays');
    if (!weekContainer) return;

    const currentDay = activeCrop.currentDay;
    const weekStart = Math.max(1, currentDay - 2); // Show current day +/- 2 days
    const weekEnd = Math.min(crop.totalDays, weekStart + 6);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    weekContainer.innerHTML = '';

    for (let day = weekStart; day <= weekEnd; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + (day - currentDay));

        // Find stage for this day
        let stageName = '';
        for (let i = crop.stages.length - 1; i >= 0; i--) {
            if (day >= crop.stages[i].day) {
                stageName = crop.stages[i].name;
                break;
            }
        }

        // Check if any tasks for this day
        const tasksForDay = crop.tasks.filter(t => t.day === day);
        const hasTasks = tasksForDay.length > 0;
        const isCompleted = day < currentDay;
        const isCurrent = day === currentDay;

        const dayCard = document.createElement('div');
        dayCard.className = `week-day-card${isCurrent ? ' active' : ''}${isCompleted ? ' completed' : ''}`;
        dayCard.setAttribute('role', 'listitem');
        dayCard.setAttribute('tabindex', '0');
        dayCard.onclick = () => selectDay(day);
        dayCard.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') selectDay(day); };

        dayCard.innerHTML = `
            <span class="week-day-name">${weekDays[date.getDay()]}</span>
            <span class="week-day-number">${date.getDate()}</span>
            <span class="week-day-stage">${hasTasks ? '<i class="fa-solid fa-check-circle"></i>' : ''} ${stageName}</span>
        `;

        weekContainer.appendChild(dayCard);
    }
}

// ============================================
// Render Tasks
// ============================================

function renderTasks() {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    // Get today's tasks - primary filter
    let tasksToShow = crop.tasks.filter(task => task.day === activeCrop.currentDay);

    // Fallback: if no exact-day tasks, show tasks in current stage range
    if (tasksToShow.length === 0 && activeCrop.currentStageIndex !== undefined) {
        const currentStage = crop.stages[activeCrop.currentStageIndex];
        const nextStage = crop.stages[activeCrop.currentStageIndex + 1];
        const stageEnd = nextStage ? nextStage.day - 1 : crop.totalDays;
        tasksToShow = crop.tasks.filter(task => task.day >= currentStage.day && task.day <= stageEnd);
    }

    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('taskEmptyState');
    const todayTasksTitle = document.getElementById('todayTasksTitle');
    if (!taskList) return;

    taskList.innerHTML = '';

    // Weather adjustments for task modifications
    const weatherAdjustments = getWeatherAdjustments();
    const hasHeavyRain = weatherAdjustments.some(a => a.critical && (a.title.includes('rain') || a.title.includes('Rain') || a.title.includes('बारिश')));

    if (tasksToShow.length === 0) {
        taskList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        if (todayTasksTitle) {
            todayTasksTitle.textContent = getTranslation('today_tasks_dynamic', `Today's Tasks (Day ${activeCrop.currentDay})`);
        }
    } else {
        taskList.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (todayTasksTitle) {
            todayTasksTitle.textContent = getTranslation('today_tasks_dynamic', `Today's Tasks (Day ${activeCrop.currentDay})`);
        }

        tasksToShow.forEach((task, index) => {
            const taskId = `task_${task.title.toLowerCase().replace(/\s+/g, '_').replace(/\(|\)/g, '')}`;
            const isCompleted = isTaskCompleted(task.title);

            // Check for weather advisories on this task
            const weatherAdvisory = getTaskWeatherAdvisory(task, hasHeavyRain);

            const taskCard = document.createElement('article');
            taskCard.className = `task-card${isCompleted ? ' completed' : ''}${weatherAdvisory ? ' has-weather-advisory' : ''}`;
            taskCard.dataset.taskId = taskId;

            const categoryLabels = {
                irrigation: 'Irrigation',
                monitoring: 'Monitoring',
                maintenance: 'Maintenance',
                fertilizer: 'Fertilizer',
                sowing: 'Sowing',
                harvest: 'Harvest'
            };

            const categoryIcons = {
                irrigation: 'fa-droplet',
                monitoring: 'fa-bug',
                maintenance: 'fa-leaf',
                fertilizer: 'fa-flask',
                sowing: 'fa-seedling',
                harvest: 'fa-tractor'
            };

            taskCard.innerHTML = `
                <div class="task-card-checkbox">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" class="checkbox" id="task${index + 1}" ${isCompleted ? 'checked' : ''} aria-label="${getTranslation('mark_complete', 'Mark as complete')}: ${getTaskTitle(task)}">
                        <span class="checkbox-custom" aria-hidden="true"></span>
                    </label>
                </div>
                <div class="task-card-content">
                    <header class="task-card-header">
                        <h4 class="task-card-title" data-lang="${getLangKey(task.title)}">${getTaskTitle(task)}</h4>
                        ${!isCompleted ? `<span class="priority-chip priority-${task.priority}" data-lang="priority_${task.priority}">${getTranslation(`priority_${task.priority}`, task.priority.charAt(0).toUpperCase() + task.priority.slice(1))} Priority</span>` : ''}
                    </header>
                    <p class="task-card-desc" data-lang="${getLangKey(task.title)}_desc">${task.desc}</p>
                    ${weatherAdvisory ? `
                        <div class="task-weather-advisory ${weatherAdvisory.critical ? 'critical' : ''}" role="alert">
                            <i class="fa-solid ${weatherAdvisory.icon}" aria-hidden="true"></i>
                            <span>${weatherAdvisory.text}</span>
                        </div>
                    ` : ''}
                    <footer class="task-card-meta">
                        <span class="task-category" data-category="${task.category}">
                            <i class="fa-solid ${categoryIcons[task.category] || 'fa-circle'}" aria-hidden="true"></i>
                            <span data-lang="category_${task.category}">${categoryLabels[task.category] || task.category}</span>
                        </span>
                        <time class="task-time" datetime="${task.time}">${formatTime(task.time)}${isCompleted ? ' • ' + getTranslation('done', 'Done') : ''}</time>
                    </footer>
                </div>
            `;

            taskList.appendChild(taskCard);
        });
    }

    // Re-setup listeners for new checkboxes
    setupTaskListeners();

    // Update task count badge
    updateStatsDisplay();

    // Apply translations
    if (window.applyTranslations) {
        window.applyTranslations();
    }
}

function getTaskTitle(task) {
    const key = getLangKey(task.title);
    return getTranslation(key, task.title);
}

function getTaskWeatherAdvisory(task, hasHeavyRain) {
    if (!hasHeavyRain) return null;

    const lang = window.currentLanguage || localStorage.getItem('language') || 'en';

    if (task.category === 'irrigation') {
        return {
            icon: 'fa-cloud-showers-heavy',
            text: lang === 'hi' ? 'भारी बारिश की संभावना — सिंचाई स्थगित करें' : 'Heavy rain likely — skip irrigation today',
            critical: true
        };
    }
    if (task.category === 'fertilizer') {
        return {
            icon: 'fa-flask',
            text: lang === 'hi' ? '85% बारिश संभावना — उर्वरक 2 दिन बाद डालें' : '85% rain chance — delay fertilizer 2 days',
            critical: true
        };
    }
    return null;
}

// Helper to get i18n key from task title
function getLangKey(title) {
    const map = {
        'Irrigate the field (Light)': 'task_irrigation',
        'Inspect crop for pests': 'task_inspect',
        'Remove weeds': 'task_weeding',
        'Sowing': 'stage_sowing',
        'Germination Check': 'task_germination_check',
        'First Weeding': 'task_first_weeding',
        'Fertilizer Application': 'task_fertilizer',
        'Earthing Up': 'task_earthing_up',
        'Second Weeding': 'task_second_weeding',
        'Monitor Pod Development': 'task_monitor_pod',
        'Stop Irrigation': 'task_stop_irrigation',
        'Harvest': 'stage_harvest'
    };
    return map[title] || 'task_' + title.toLowerCase().replace(/\s+/g, '_');
}

// Helper to get i18n key from task title
function getLangKey(title) {
    const map = {
        'Irrigate the field (Light)': 'task_irrigation',
        'Inspect crop for pests': 'task_inspect',
        'Remove weeds': 'task_weeding',
        'Sowing': 'stage_sowing',
        'Germination Check': 'task_germination_check',
        'First Weeding': 'task_first_weeding',
        'Fertilizer Application': 'task_fertilizer',
        'Earthing Up': 'task_earthing_up',
        'Second Weeding': 'task_second_weeding',
        'Monitor Pod Development': 'task_monitor_pod',
        'Stop Irrigation': 'task_stop_irrigation',
        'Harvest': 'stage_harvest'
    };
    return map[title] || 'task_' + title.toLowerCase().replace(/\s+/g, '_');
}

// ============================================
// Check if Task is Completed
// ============================================

function isTaskCompleted(taskTitle) {
    const taskId = `task_${taskTitle.toLowerCase().replace(/\s+/g, '_').replace(/\(|\)/g, '')}`;
    return activeCrop.completedTasks && activeCrop.completedTasks.includes(taskId);
}

// ============================================
// Setup Task Listeners
// ============================================

function setupTaskListeners() {
    document.querySelectorAll('.task-card input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskCard = e.target.closest('.task-card');
            const taskTitle = taskCard.querySelector('.task-card-title').textContent;
            const taskId = `task_${taskTitle.toLowerCase().replace(/\s+/g, '_').replace(/\(|\)/g, '')}`;

            if (e.target.checked) {
                taskCard.classList.add('completed');
                if (!activeCrop.completedTasks) activeCrop.completedTasks = [];
                activeCrop.completedTasks.push(taskId);
            } else {
                taskCard.classList.remove('completed');
                activeCrop.completedTasks = activeCrop.completedTasks.filter(id => id !== taskId);
            }

            // Save to storage
            localStorage.setItem('activeCrop', JSON.stringify(activeCrop));

            // Update badge and stats
            updateStatsDisplay();
            updateProgressDisplay();

            // Update week strip completion state
            renderWeekStrip();
        });
    });
}

// ============================================
// Setup Action Buttons
// ============================================

function setupActionButtons() {
    // Mark all done
    const markAllBtn = document.getElementById('markAllDoneBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            const crop = cropData[activeCrop.name];
            if (!crop) return;

            const todayTasks = crop.tasks.filter(task => task.day === activeCrop.currentDay);
            todayTasks.forEach(task => {
                const taskId = `task_${task.title.toLowerCase().replace(/\s+/g, '_').replace(/\(|\)/g, '')}`;
                if (!activeCrop.completedTasks) activeCrop.completedTasks = [];
                if (!activeCrop.completedTasks.includes(taskId)) {
                    activeCrop.completedTasks.push(taskId);
                }
            });

            localStorage.setItem('activeCrop', JSON.stringify(activeCrop));
            renderTasks();
            updateStatsDisplay();
            updateProgressDisplay();
            renderWeekStrip();

            window.showToast('All tasks marked as completed!', 'success');
        });
    }
}

// ============================================
// Select Day on Timeline
// ============================================

function selectDay(day) {
    const crop = cropData[activeCrop.name];
    if (!crop) return;

    const tasksForDay = crop.tasks.filter(task => task.day === day);

    if (tasksForDay.length > 0) {
        const taskList = tasksForDay.map(t => `• ${t.title}`).join('\n');
        window.showToast(`Day ${day} Tasks:\n${taskList}`, 'info');
    } else {
        window.showToast(`No specific tasks scheduled for Day ${day}`, 'info');
    }
}

// ============================================
// Add New Crop
// ============================================

function addNewCrop() {
    window.showToast('Crop selection feature coming soon!', 'info');
}

// ============================================
// Smart Features - Helpers
// ============================================

function saveCalendarInsights() {
    localStorage.setItem('cropCalendarInsights', JSON.stringify(calendarInsights));
}

function getTranslation(key, fallback) {
    const language = window.currentLanguage || localStorage.getItem('language') || 'en';
    return window.I18N?.[language]?.[key] || window.I18N?.en?.[key] || fallback;
}

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getNextTask() {
    const crop = cropData[activeCrop.name];
    if (!crop) return null;
    return crop.tasks.find(task => task.day >= activeCrop.currentDay && !isTaskCompleted(task.title)) || crop.tasks.find(task => task.day >= activeCrop.currentDay) || null;
}

// ============================================
// Smart Notifications
// ============================================

function initSmartNotifications() {
    renderNotificationStatus();

    const toggleBtn = document.getElementById('notificationToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSmartNotifications);
    }
}

function toggleSmartNotifications() {
    if (calendarInsights.notificationsEnabled) {
        calendarInsights.notificationsEnabled = false;
        saveCalendarInsights();
        renderNotificationStatus();
        window.showToast('Smart notifications disabled', 'info');
        return;
    }

    if (!('Notification' in window)) {
        // Enable in-app fallback notifications
        enableNotifications();
        window.showToast('Browser notifications not supported. In-app reminders enabled.', 'warning');
        return;
    }

    if (Notification.permission === 'granted') {
        enableNotifications();
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                enableNotifications();
            } else {
                window.showToast('Notification permission was not granted', 'warning');
                renderNotificationStatus();
            }
        });
    } else {
        window.showToast('Notifications are blocked in your browser settings', 'warning');
    }
}

function enableNotifications() {
    calendarInsights.notificationsEnabled = true;
    saveCalendarInsights();
    renderNotificationStatus();

    const nextTask = getNextTask();
    const message = nextTask ? `${nextTask.title} at ${formatTime(nextTask.time)}` : 'No upcoming tasks';
    window.showToast(`Smart notifications enabled: ${message}`, 'success');
}

function renderNotificationStatus() {
    const indicator = document.getElementById('notificationIndicator');
    const statusText = document.getElementById('notificationStatusText');
    const toggleBtn = document.getElementById('notificationToggleBtn');
    const nextText = document.getElementById('nextNotificationText');
    const nextTask = getNextTask();

    if (indicator) {
        indicator.classList.toggle('enabled', calendarInsights.notificationsEnabled);
        indicator.classList.toggle('disabled', !calendarInsights.notificationsEnabled);
    }

    if (statusText) {
        statusText.textContent = calendarInsights.notificationsEnabled
            ? getTranslation('notifications_enabled', 'Notifications Enabled')
            : getTranslation('notifications_disabled', 'Notifications Disabled');
    }

    if (toggleBtn) {
        const icon = calendarInsights.notificationsEnabled ? 'fa-bell-slash' : 'fa-bell';
        const label = calendarInsights.notificationsEnabled
            ? getTranslation('disable_notifications', 'Disable Notifications')
            : getTranslation('enable_notifications', 'Enable Notifications');
        toggleBtn.innerHTML = `<i class="fa-solid ${icon}"></i> ${label}`;
    }

    if (nextText) {
        nextText.textContent = nextTask
            ? `Day ${nextTask.day}: ${nextTask.title} • ${formatTime(nextTask.time)}`
            : 'No upcoming task reminders';
    }
}

// ============================================
// Expense & Input Tracker
// ============================================

function initExpenseTracker() {
    renderExpenses();

    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', addExpenseItem);
    }
}

function addExpenseItem(event) {
    event.preventDefault();

    const nameInput = document.getElementById('expenseInputName');
    const typeInput = document.getElementById('expenseInputType');
    const amountInput = document.getElementById('expenseInputAmount');

    const name = nameInput?.value.trim();
    const type = typeInput?.value;
    const amount = parseFloat(amountInput?.value || '0');

    if (!name || !type || amount <= 0) {
        window.showToast('Please enter a valid expense name, type and amount', 'warning');
        return;
    }

    calendarInsights.expenses.unshift({
        id: Date.now().toString(),
        name,
        type,
        amount,
        date: new Date().toISOString()
    });

    saveCalendarInsights();
    renderExpenses();
    event.target.reset();
    window.showToast('Expense added successfully', 'success');
}

function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;

    expenseList.innerHTML = '';

    if (!calendarInsights.expenses.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-expense-state';
        empty.textContent = getTranslation('no_expenses_yet', 'No expenses recorded yet');
        expenseList.appendChild(empty);
    } else {
        calendarInsights.expenses.slice(0, 5).forEach(expense => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.setAttribute('role', 'listitem');

            const info = document.createElement('div');
            info.className = 'expense-item-info';

            const name = document.createElement('span');
            name.className = 'expense-item-name';
            name.textContent = expense.name;

            const meta = document.createElement('span');
            meta.className = 'expense-item-meta';
            const type = document.createElement('span');
            type.className = 'expense-item-type';
            type.textContent = getExpenseTypeLabel(expense.type);
            const date = document.createElement('span');
            date.textContent = new Date(expense.date).toLocaleDateString(window.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric' });
            meta.append(type, date);

            info.append(name, meta);

            const amount = document.createElement('strong');
            amount.className = 'expense-item-amount';
            amount.textContent = formatCurrency(expense.amount);

            item.append(info, amount);
            expenseList.appendChild(item);
        });
    }

    const totals = calculateExpenseTotals();
    const totalEl = document.getElementById('totalExpense');
    const acreEl = document.getElementById('costPerAcre');
    if (totalEl) totalEl.textContent = formatCurrency(totals.total);
    if (acreEl) acreEl.textContent = formatCurrency(totals.perAcre);
}

function calculateExpenseTotals() {
    const total = calendarInsights.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const area = Number(calendarInsights.yieldInputs?.area || 1) || 1;
    return { total, perAcre: total / area };
}

function getExpenseTypeLabel(type) {
    const typeKey = `type_${type}`;
    const fallback = type.charAt(0).toUpperCase() + type.slice(1);
    return getTranslation(typeKey, fallback);
}

// ============================================
// Weather-Based Task Adjustments
// ============================================

function initWeatherAdjustments() {
    renderWeatherAdjustments();

    const applyBtn = document.getElementById('applyWeatherAdjustmentsBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyWeatherAdjustments);
    }
}

function getWeatherAdjustments() {
    const language = window.currentLanguage || localStorage.getItem('language') || 'en';
    if (language === 'hi') {
        return [
            { icon: 'fa-cloud-showers-heavy', title: 'भारी बारिश की संभावना', desc: 'आज सिंचाई रोकें और खेत की जल निकासी जांचें।', critical: true },
            { icon: 'fa-flask', title: 'उर्वरक रोकें', desc: '85% बारिश संभावना के कारण उर्वरक 2 दिन बाद डालें।', critical: true },
            { icon: 'fa-wind', title: 'स्प्रे के लिए सुरक्षित', desc: 'हवा 12 km/h है, छिड़काव सुबह जल्दी करें।', critical: false }
        ];
    }

    return [
        { icon: 'fa-cloud-showers-heavy', title: 'Heavy rain likely', desc: 'Skip irrigation today and check field drainage channels.', critical: true },
        { icon: 'fa-flask', title: 'Delay fertilizer', desc: 'Rain chance is 85%, apply fertilizer after 2 dry days.', critical: true },
        { icon: 'fa-wind', title: 'Safe spray window', desc: 'Wind is 12 km/h; spray only in the early morning.', critical: false }
    ];
}

function renderWeatherAdjustments() {
    const list = document.getElementById('weatherAdjustmentsList');
    const status = document.getElementById('weatherAdjustmentStatus');
    const applyBtn = document.getElementById('applyWeatherAdjustmentsBtn');
    if (!list) return;

    list.innerHTML = getWeatherAdjustments().map(item => `
        <div class="adjustment-item${item.critical ? ' critical' : ''}" role="listitem">
            <div class="adjustment-icon"><i class="fa-solid ${item.icon}"></i></div>
            <div class="adjustment-content">
                <h5 class="adjustment-title">${item.title}</h5>
                <p class="adjustment-desc">${item.desc}</p>
            </div>
        </div>
    `).join('');

    if (status) {
        status.style.display = calendarInsights.weatherAdjustmentsApplied ? 'flex' : 'none';
    }

    if (applyBtn) {
        applyBtn.disabled = calendarInsights.weatherAdjustmentsApplied;
        applyBtn.style.opacity = calendarInsights.weatherAdjustmentsApplied ? '0.7' : '1';
    }
}

function applyWeatherAdjustments() {
    calendarInsights.weatherAdjustmentsApplied = true;
    saveCalendarInsights();
    renderWeatherAdjustments();
    window.showToast('Weather adjustments applied to today\'s plan', 'success');
}

// ============================================
// Yield Predictor
// ============================================

function initYieldPredictor() {
    const areaInput = document.getElementById('yieldAreaInput');
    const healthInput = document.getElementById('yieldHealthInput');
    const plantsInput = document.getElementById('yieldPlantsInput');

    if (areaInput) areaInput.value = calendarInsights.yieldInputs.area;
    if (healthInput) healthInput.value = calendarInsights.yieldInputs.health;
    if (plantsInput) plantsInput.value = calendarInsights.yieldInputs.plants;

    [areaInput, healthInput, plantsInput].forEach(input => {
        if (input) input.addEventListener('input', calculateYieldPrediction);
    });

    calculateYieldPrediction();
}

function calculateYieldPrediction() {
    const areaInput = document.getElementById('yieldAreaInput');
    const healthInput = document.getElementById('yieldHealthInput');
    const plantsInput = document.getElementById('yieldPlantsInput');
    const healthValue = document.getElementById('yieldHealthValue');

    const area = Math.max(parseFloat(areaInput?.value || '0') || 0, 0.1);
    const health = Math.max(Math.min(parseFloat(healthInput?.value || '0') || 0, 100), 0);
    const plants = Math.max(parseFloat(plantsInput?.value || '0') || 0, 1000);

    calendarInsights.yieldInputs = { area, health, plants };
    saveCalendarInsights();

    if (healthValue) healthValue.textContent = `${Math.round(health)}%`;

    // Conservative groundnut estimate: plant count x 12g average pod weight x health factor.
    const kgPerAcre = (plants * 0.012 * (health / 100));
    const totalKg = kgPerAcre * area;
    const totalQuintals = totalKg / 100;
    const mandiPricePerQuintal = 5250;
    const revenue = totalQuintals * mandiPricePerQuintal;
    const confidence = Math.min(95, Math.max(45, Math.round(health * 0.75 + 20)));

    const yieldEl = document.getElementById('predictedYield');
    const revenueEl = document.getElementById('predictedRevenue');
    const confidenceFill = document.getElementById('yieldConfidence');
    const confidenceText = document.getElementById('yieldConfidenceText');
    const meterFill = document.querySelector('.yield-meter-fill');

    if (yieldEl) yieldEl.textContent = `${totalQuintals.toFixed(1)} Qtl`;
    if (revenueEl) revenueEl.textContent = formatCurrency(Math.round(revenue));
    if (confidenceFill) confidenceFill.style.width = `${confidence}%`;
    if (confidenceText) confidenceText.textContent = `${confidence}%`;
    if (meterFill) {
        const progress = Math.min((totalQuintals / (area * 18)) * 100, 100);
        const circumference = 2 * Math.PI * 54;
        meterFill.style.strokeDashoffset = circumference * (1 - progress / 100);
    }

    renderExpenses();
}

// ============================================
// Helper: Format Time
// ============================================

function formatTime(time24) {
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.timeline-container') || document.querySelector('.crop-hero')) {
        initCropCalendar();
    }

    // Add crop button
    const addCropBtn = document.getElementById('addCropBtn');
    if (addCropBtn) {
        addCropBtn.addEventListener('click', addNewCrop);
    }
});

// Make functions globally accessible
window.selectDay = selectDay;
window.addNewCrop = addNewCrop;