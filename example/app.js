const CardLib = require('CardLib');

CardLib.create(
    require('./json/template.json'),
    require('./json/values.json'),
    (ctx) => {
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#00bfff";
        ctx.beginPath();
        ctx.arc(256, 256, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
).then(
    card => require('fs').writeFileSync('image/out.png', card)
).catch(console.log);
