const CardLib = require('../index.js');

CardLib.create(
    require('./json/template.json'),
    require('./json/values.json'),
    (ctx) => {
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#4287f5";
        ctx.beginPath();
        ctx.arc(48, 512 - 48, 22, 0, Math.PI * 2);
        ctx.stroke();
    }
).then(
    card => require('fs').writeFileSync('image/out.png', card)
).catch(console.log);
