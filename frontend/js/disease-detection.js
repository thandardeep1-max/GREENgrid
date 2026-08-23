// ============================================================
// GREENgrid - Plant Disease Detection
// FastAPI + MobileNetV2
// ============================================================
console.log("🔥 NEW GREENgrid disease-detection.js LOADED");
const API_URL = "http://127.0.0.1:8000/predict";

// Elements
const fileInput = document.getElementById("fileInput");
const uploadZone = document.getElementById("uploadZone");

const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");

const removeImage = document.getElementById("removeImage");
const analyzeBtn = document.getElementById("analyzeBtn");

const processingSection = document.getElementById("processingSection");
const progressBar = document.getElementById("progressBar");

const resultsSection = document.getElementById("resultsSection");
const resultImage = document.getElementById("resultImage");

const newScanBtn = document.getElementById("newScanBtn");


// ============================================================
// Store selected image
// ============================================================

let selectedFile = null;


// ============================================================
// File Selection
// ============================================================

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    handleImage(file);
});


// ============================================================
// Handle Image
// ============================================================

function handleImage(file) {

    // Check image
    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {

        alert("Image size must be less than 5 MB.");

        return;
    }

    selectedFile = file;

    // Create preview
    const imageURL = URL.createObjectURL(file);

    previewImage.src = imageURL;

    // Show preview
    uploadZone.classList.add("hidden");
    imagePreview.classList.remove("hidden");

    // Hide old results
    resultsSection.classList.add("hidden");
}


// ============================================================
// Remove Image
// ============================================================

removeImage.addEventListener("click", function () {

    selectedFile = null;

    fileInput.value = "";

    previewImage.src = "";

    imagePreview.classList.add("hidden");

    uploadZone.classList.remove("hidden");

    processingSection.classList.add("hidden");

    resultsSection.classList.add("hidden");
});


// ============================================================
// Analyze Disease
// ============================================================

analyzeBtn.addEventListener("click", async function () {

    if (!selectedFile) {

        alert("Please select an image first.");

        return;
    }

    // Hide upload section
    imagePreview.classList.add("hidden");

    // Show processing
    processingSection.classList.remove("hidden");

    // Reset progress
    progressBar.style.width = "0%";

    // Fake progress animation
    let progress = 0;

    const progressInterval = setInterval(() => {

        if (progress < 90) {

            progress += 10;

            progressBar.style.width = progress + "%";
        }

    }, 150);


    try {

        // ====================================================
        // Create FormData
        // ====================================================

        const formData = new FormData();

        formData.append("file", selectedFile);


        // ====================================================
        // Send image to FastAPI
        // ====================================================

        const response = await fetch(API_URL, {

            method: "POST",

            body: formData

        });


        // ====================================================
        // Check API response
        // ====================================================

        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.detail || "Disease detection failed."
            );
        }


        // ====================================================
        // Read JSON
        // ====================================================

        const data = await response.json();

        console.log("API Response:", data);


        // ====================================================
        // Complete progress
        // ====================================================

        clearInterval(progressInterval);

        progressBar.style.width = "100%";


        // Small delay so animation completes
        await new Promise(resolve => setTimeout(resolve, 400));


        // ====================================================
        // Display Result
        // ====================================================

        displayDiseaseResult(data);


    } catch (error) {

        clearInterval(progressInterval);

        console.error("Disease Detection Error:", error);

        alert(
            "Unable to detect disease.\n\n" +
            error.message
        );

        // Restore preview
        processingSection.classList.add("hidden");

        imagePreview.classList.remove("hidden");
    }

});

// ============================================================
// Disease Information Database
// ============================================================

const diseaseInfo = {

    "Powdery mildew": {
        description:
            "Powdery mildew is a fungal disease that appears as white or gray powder-like growth on plant leaves and other surfaces. Severe infections can reduce photosynthesis and plant growth.",

        symptoms: [
            "White or gray powdery patches on leaves",
            "Yellowing or browning of affected leaves",
            "Leaves may curl or become distorted",
            "Reduced plant growth and vigor"
        ],

        causes: [
            "Fungal infection",
            "Warm days with humid conditions",
            "Poor air circulation",
            "Dense plant growth"
        ],

        treatment: [
            "Remove severely infected leaves",
            "Improve air circulation around the plants",
            "Apply an appropriate fungicide according to its label",
            "Avoid excessive nitrogen fertilization"
        ],

        prevention: [
            "Maintain proper spacing between plants",
            "Provide good air circulation",
            "Avoid excessive irrigation",
            "Remove infected plant material promptly"
        ]
    },


    "Early blight": {
        description:
            "Early blight is a fungal disease that commonly affects leaves and stems. It produces dark spots with concentric rings and can reduce photosynthesis and crop yield.",

        symptoms: [
            "Dark circular spots on older leaves",
            "Concentric ring patterns within lesions",
            "Yellowing around infected areas",
            "Premature leaf drop"
        ],

        causes: [
            "Fungal infection",
            "Warm and humid conditions",
            "Wet foliage",
            "Infected crop debris"
        ],

        treatment: [
            "Remove severely infected leaves",
            "Apply an appropriate fungicide according to the label",
            "Improve air circulation",
            "Remove infected plant debris"
        ],

        prevention: [
            "Practice crop rotation",
            "Avoid overhead irrigation",
            "Keep foliage dry when possible",
            "Use healthy planting material"
        ]
    },


    "Late blight": {
        description:
            "Late blight is a serious disease caused by a fungus-like pathogen. It can rapidly damage leaves, stems and fruits under cool and wet conditions.",

        symptoms: [
            "Dark water-soaked lesions on leaves",
            "Rapid browning of infected tissue",
            "White growth may appear under leaves",
            "Fruit may develop dark, firm lesions"
        ],

        causes: [
            "Phytophthora infection",
            "Cool and wet weather",
            "High humidity",
            "Extended leaf wetness"
        ],

        treatment: [
            "Remove severely infected plant material",
            "Apply an appropriate fungicide according to the label",
            "Improve field ventilation",
            "Avoid working with wet plants"
        ],

        prevention: [
            "Use disease-resistant varieties where available",
            "Avoid overhead irrigation",
            "Maintain proper plant spacing",
            "Remove infected crop debris"
        ]
    },


    "Bacterial spot": {
        description:
            "Bacterial spot is a bacterial disease that causes small dark lesions on leaves, stems and fruits. Severe infections can reduce plant growth and crop quality.",

        symptoms: [
            "Small dark spots on leaves",
            "Yellow halos around lesions",
            "Spots on fruits",
            "Leaf yellowing and drop"
        ],

        causes: [
            "Bacterial infection",
            "Warm and humid weather",
            "Rain splash",
            "Contaminated plant material"
        ],

        treatment: [
            "Remove heavily infected plant material",
            "Avoid working with plants when foliage is wet",
            "Use an appropriate bactericide according to the label",
            "Improve field sanitation"
        ],

        prevention: [
            "Use certified healthy seeds",
            "Avoid overhead irrigation",
            "Practice crop rotation",
            "Remove infected plant debris"
        ]
    }

};

// ============================================================
// Update Disease Information
// ============================================================

function updateDiseaseInformation(disease) {

    const info = diseaseInfo[disease];

    // If disease is not in our database
    if (!info) {

        console.warn(
            "No information available for:",
            disease
        );

        return;
    }


    // About Disease
    const description =
        document.querySelector(
            ".disease-section-content"
        );

    if (description) {
        description.textContent =
            info.description;
    }


    // Symptoms
    const sections =
        document.querySelectorAll(
            ".disease-section"
        );

    // Symptoms section
    const symptomsList =
        sections[1]?.querySelector(
            ".disease-list"
        );

    if (symptomsList) {

        symptomsList.innerHTML = "";

        info.symptoms.forEach(symptom => {

            const li =
                document.createElement("li");

            li.textContent = symptom;

            symptomsList.appendChild(li);
        });
    }


    // Causes section
    const causesList =
        sections[2]?.querySelector(
            ".disease-list"
        );

    if (causesList) {

        causesList.innerHTML = "";

        info.causes.forEach(cause => {

            const li =
                document.createElement("li");

            li.textContent = cause;

            causesList.appendChild(li);
        });
    }


    // Treatment
    const treatmentContainer =
        document.querySelector(
            ".treatment-steps"
        );

    if (treatmentContainer) {

        treatmentContainer.innerHTML = "";

        info.treatment.forEach(
            (step, index) => {

                const div =
                    document.createElement("div");

                div.className =
                    "treatment-step";

                div.innerHTML = `
                    <div class="treatment-step-number">
                        ${index + 1}
                    </div>

                    <div class="treatment-step-content">
                        <strong>
                            Step ${index + 1}
                        </strong>

                        <p>
                            ${step}
                        </p>
                    </div>
                `;

                treatmentContainer.appendChild(div);
            }
        );
    }


    // Prevention
    const preventionList =
        document.querySelector(
            ".prevention-list"
        );

    if (preventionList) {

        preventionList.innerHTML = "";

        info.prevention.forEach(
            tip => {

                const li =
                    document.createElement("li");

                li.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    <span>${tip}</span>
                `;

                preventionList.appendChild(li);
            }
        );
    }
}

// ============================================================
// Display Disease Result
// ============================================================

function displayDiseaseResult(data) {

    console.log("Disease result:", data);

    // Hide processing
    processingSection.classList.add("hidden");

    // Show results
    resultsSection.classList.remove("hidden");


    // ========================================================
    // Extract API data
    // ========================================================

    const prediction = data.prediction;

    const crop = prediction.crop || "Unknown Crop";

    const disease = prediction.disease || "Unknown Disease";

    const formattedDisease =
    formatDiseaseName(disease);

updateDiseaseInformation(formattedDisease);

    const confidence = Number(
        prediction.confidence || 0
    );


    // ========================================================
    // Show uploaded image
    // ========================================================

    resultImage.src = previewImage.src;


    // ========================================================
    // Disease name
    // ========================================================

    const diseaseName =
        document.querySelector(".disease-name");

    diseaseName.textContent =
        formatDiseaseName(disease);


    // ========================================================
    // Crop + scientific name
    // ========================================================

    const scientificName =
        document.querySelector(".disease-scientific");

    scientificName.textContent =
        "Detected crop: " + formatCropName(crop);


    // ========================================================
    // Confidence
    // ========================================================

    const confidenceValue =
        document.querySelector(
            ".disease-confidence strong"
        );

    confidenceValue.textContent =
        confidence.toFixed(2) + "%";


    // ========================================================
    // Severity
    // ========================================================

    updateSeverity(confidence, disease);


    // Scroll to results
    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// Format Disease Name
// ============================================================

function formatDiseaseName(disease) {

    if (!disease) {
        return "Unknown Disease";
    }

    // Remove crop prefix
    if (disease.includes("___")) {

        disease = disease.split("___")[1];
    }

    // Replace underscores
    disease = disease.replaceAll("_", " ");

    // Remove extra spaces
    disease = disease.replace(/\s+/g, " ");

    return disease.trim();
}


// ============================================================
// Format Crop Name
// ============================================================

function formatCropName(crop) {

    if (!crop) {
        return "Unknown Crop";
    }

    crop = crop.replaceAll("_", " ");

    return crop.trim();
}


// ============================================================
// Severity
// ============================================================

function updateSeverity(confidence, disease) {

    const badge =
        document.querySelector(".disease-badge");

    const icon =
        badge.querySelector("i");

    const text =
        badge.querySelector("span");


    // Healthy plant
    if (
        disease.toLowerCase().includes("healthy")
    ) {

        badge.className =
            "disease-badge severity-low";

        icon.className =
            "fa-solid fa-circle-check";

        text.textContent =
            "Healthy Plant";

        return;
    }


    // Disease severity
    if (confidence >= 90) {

        badge.className =
            "disease-badge severity-high";

        icon.className =
            "fa-solid fa-triangle-exclamation";

        text.textContent =
            "High Confidence";

    } else if (confidence >= 70) {

        badge.className =
            "disease-badge severity-medium";

        icon.className =
            "fa-solid fa-circle-exclamation";

        text.textContent =
            "Medium Confidence";

    } else {

        badge.className =
            "disease-badge severity-low";

        icon.className =
            "fa-solid fa-circle-question";

        text.textContent =
            "Low Confidence";
    }
}


// ============================================================
// New Scan
// ============================================================

newScanBtn.addEventListener("click", function () {

    selectedFile = null;

    fileInput.value = "";

    previewImage.src = "";

    resultImage.src = "";

    resultsSection.classList.add("hidden");

    processingSection.classList.add("hidden");

    imagePreview.classList.add("hidden");

    uploadZone.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
