const gaugeNeedle = {
    id: "gaugeNeedle",
    afterDatasetDraw(chart) {
        const {
            ctx,
            data,
            chartArea: { width, height },
        } = chart;

        ctx.save();

        const minValue = data.datasets[0].minValue;
        const value = data.datasets[0].value;
        const span = data.datasets[0].data.reduce((a, b) => a + b, 0);

        const totalAngle = data.datasets[0].circumference;
        const startingAngle = -Math.PI / 2 - (Math.PI * (totalAngle / 2)) / 180;
        const angle =
            startingAngle +
            ((Math.PI * totalAngle) / 180) * ((value - minValue) / span);

        const dotx = width / 2;
        const doty = 0.6 * height;

        // Needle
        ctx.translate(dotx, doty);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -0.015 * width);
        ctx.lineTo(height * 0.45, 0);
        ctx.lineTo(0, 0.015 * width);
        ctx.fillStyle = "#444";
        ctx.fill();
        ctx.rotate(-angle);

        // Needle dot
        ctx.beginPath();
        ctx.arc(0, 0, 0.02 * width, 0, 2 * Math.PI);
        ctx.fill();

        // Text
        ctx.font = `${width * 0.085}px Helvetica`;
        ctx.fillStyle = "#444";
        ctx.textAlign = "center";
        ctx.fillText(value + " " + data.datasets[0].units, 0, 0.2 * height);
        ctx.restore();
    },
};

const myData = {
    datasets: [
        {
            data: [20, 10, 70],
            backgroundColor: ["red", "green", "orange"],
            minValue: 0,
            units: "ppm",
            value: 20,
            borderColor: "white",
            borderWidth: 3,
            cutout: "80%",
            circumference: 250,
            rotation: 235,
        },
    ],
};

const myGauge = document.getElementById("gauge-field1");
const piopo = new Chart(myGauge, {
    type: "doughnut",
    data: myData,
    options: {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: "",
                },
            },
        },
    },
    plugins: [gaugeNeedle],
});
