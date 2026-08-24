const detectSoilBtn = document.getElementById("detectSoilBtn");
const soilImageInput = document.getElementById("soilImageInput");
const soilAIStatus = document.getElementById("soilAIStatus");

detectSoilBtn.addEventListener("click", () => {
    soilImageInput.click();
});

soilImageInput.addEventListener("change", async () => {

    const file = soilImageInput.files[0];

    if (!file) return;

    soilAIStatus.textContent = "🔍 Analyzing soil image...";
    detectSoilBtn.disabled = true;

    try {

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            "http://127.0.0.1:8000/predict-soil",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Detection failed");
        }

        // Update soil type in the report
        const soilTypeElement =
            document.getElementById("soilType");

        if (soilTypeElement) {
            soilTypeElement.textContent = result.soil_type;
        }

        soilAIStatus.textContent =
            `✅ ${result.soil_type} detected (${result.confidence}% confidence)`;

    } catch (error) {

        console.error(error);

        soilAIStatus.textContent =
            "❌ Unable to detect soil. Please try again.";

    } finally {

        detectSoilBtn.disabled = false;
    }
});
