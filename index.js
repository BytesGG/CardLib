const Canvas = require('canvas');

module.exports.create = async (template, values, consumer) => {
    //  Check nulls
    if (typeof template != 'object') throw 'Template must be of type \'object\'';
    if (typeof values != 'object') throw 'Values must be of type \'object\'';

    //  Validate size
    if (typeof template.width != 'number') throw 'Width must be of type \'number\'';
    if (typeof template.height != 'number') throw 'Width must be of type \'number\'';

    if (template.width <= 0) throw 'Width must be more than 0';
    if (template.height <= 0) throw 'Height must be more than 0';

    //  Create
    let canvas = Canvas.createCanvas(template.width, template.height);
    let ctx = canvas.getContext('2d');

    //  If fonts exists and is object, read and register
    if (typeof template.fonts == 'object') {
        for (let font in template.fonts) {
            Canvas.registerFont(template.fonts[font], {
                'family': font
            });
        }
    }

    //  If panels exists and is array
    if (Array.isArray(template.panels)) {
        ctx.save();

        for (let panel of template.panels) {
            let x = panel.x || 0;
            let y = panel.y || 0;

            let width = panel.width || 0;
            let height = panel.height || 0;

            //  If color specified and width/height bigger than 0, draw rect
            if (width > 0 && height > 0 && /^#([0-9a-f]{3}){1,2}$/.test(panel.color)) {
                ctx.fillStyle = panel.color;
                ctx.fillRect(x, y, width, height);
            }

            if (panel.hasOwnProperty('url')) {
                //  Replace placeholders
                panel.url = panel.url.replace(
                    /(%[a-zA-Z]+%)/g,
                    id => values[id.substring(1, id.length - 1)] || "?"
                )

                //  If valid url
                if (typeof panel.url == 'string') {
                    let i = await Canvas.loadImage(panel.url);

                    if (width == 0 && height == 0) {
                        width = i.width;
                        height = i.height;
                    }

                    if (panel.centered) {
                        x -= width / 2;
                        y -= height / 2;
                    }

                    ctx.drawImage(i, x, y, width, height);
                }
            }
        }

        ctx.restore();
    }

    if (Array.isArray(template.text)) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';

        let size = 10;
        let family = 'sans-serif';
        let changed = true;

        for (let text of template.text) {
            if (typeof text.x != 'number') continue;
            if (typeof text.y != 'number') continue;
            if (!text.hasOwnProperty('value')) continue;

            if (Number.isInteger(text.size)) {
                size = text.size;
                changed = true;
            }

            if (typeof text.family == 'string') {
                family = text.family;
                changed = true;
            }

            if (changed) {
                ctx.font = size + 'px ' + family;
                changed = false;
            }

            if (/^#([0-9a-f]{3}){1,2}$/.test(text.color)) {
                ctx.fillStyle = text.color;
            }

            if (text.hasOwnProperty('centered')) {
                ctx.textAlign = text.centered ? 'center' : 'left';
            }

            ctx.fillText(
                text.value.replace(
                    /(%[a-zA-Z]+%)/g,
                    id => values[id.substring(1, id.length - 1)] || "?"
                ),
                text.x,
                text.y
            );
        }

        ctx.restore();
    }

    if (typeof consumer == 'function') {
        consumer(ctx);
    }

    return canvas.toBuffer('image/png');
}
